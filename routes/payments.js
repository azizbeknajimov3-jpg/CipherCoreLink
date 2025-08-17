// routes/payments.js
const express = require("express");
const auth = require("../middleware/auth");
const requireRole = require("../middleware/role");
const Project = require("../models/Project");
const Transaction = require("../models/Transaction");
const Wallet = require("../models/Wallet");
const payments = require("../utils/payments");

const router = express.Router();

// Project yaratish + provider account biriktirish
router.post("/projects", auth, async (req, res) => {
  try {
    const { name, description, provider = "none" } = req.body;

    let providerAccountId = null;
    if (provider !== "none") {
      const acc = await payments.ensureProviderAccount({ provider, userId: req.user.id });
      providerAccountId = acc.accountId;
    }

    const project = await Project.create({
      owner: req.user.id,
      name,
      description,
      paymentProvider: provider,
      providerAccountId,
    });

    // project wallet
    await Wallet.findOneAndUpdate(
      { ownerType: "project", ownerRef: String(project._id) },
      { $setOnInsert: { balance: 0 } },
      { upsert: true, new: true }
    );

    res.status(201).json({ message: "✅ Project created", project });
  } catch (e) {
    res.status(500).json({ message: "❌ Server error", error: e.message });
  }
});

// To'lovni boshlash (virtual mahsulot/premium/token)
router.post("/checkout/:projectId", async (req, res) => {
  try {
    const { amount, currency = "USD" } = req.body;
    const project = await Project.findById(req.params.projectId);
    if (!project || !project.active) return res.status(404).json({ message: "❌ Project not found" });

    const intent = await payments.createPaymentIntent({
      provider: project.paymentProvider === "none" ? "internal" : project.paymentProvider,
      amount: Number(amount),
      currency,
      project,
    });

    const trx = await Transaction.create({
      project: project._id,
      buyer: req.user?.id || null,
      amount: Number(amount),
      currency,
      provider: project.paymentProvider === "none" ? "internal" : project.paymentProvider,
      providerPaymentId: intent.id,
      status: "pending",
      buyerIP: req.headers["x-forwarded-for"]?.split(",")[0] || req.socket.remoteAddress,
      buyerCountry: req.headers["cf-ipcountry"] || req.headers["x-country"] || "unknown",
      userAgent: req.headers["user-agent"],
      delivery: { type: "virtual", status: "n/a" },
    });

    res.json({ message: "✅ Payment initiated", payment: intent, transactionId: trx._id });
  } catch (e) {
    res.status(500).json({ message: "❌ Server error", error: e.message });
  }
});

// Admin — barcha tranzaksiyalarni ko‘rish
router.get("/transactions", auth, requireRole(["admin"]), async (_req, res) => {
  const list = await Transaction.find().sort({ createdAt: -1 }).limit(200).populate("project", "name owner");
  res.json(list);
});

module.exports = router;