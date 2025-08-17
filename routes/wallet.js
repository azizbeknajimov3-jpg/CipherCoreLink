// routes/wallet.js
const express = require("express");
const auth = require("../middleware/auth");
const Wallet = require("../models/Wallet");

const router = express.Router();

// Mening (foydalanuvchi) walletim
router.get("/me", auth, async (req, res) => {
  const w = await Wallet.findOne({ ownerType: "user", ownerRef: String(req.user.id) });
  res.json(w || { balance: 0, currency: "USD" });
});

// Platform wallet (admin ko'radi)
router.get("/platform", auth, async (req, res) => {
  if (req.user.role !== "admin") return res.status(403).json({ message: "❌ Forbidden" });
  const w = await Wallet.findOne({ ownerType: "platform", ownerRef: "ciphercorelink" });
  res.json(w || { balance: 0, currency: "USD" });
});

module.exports = router;