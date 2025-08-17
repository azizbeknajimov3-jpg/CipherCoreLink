// routes/webhooks.js
const express = require("express");
const Transaction = require("../models/Transaction");
const Wallet = require("../models/Wallet");
const Project = require("../models/Project");

const router = express.Router();

// Stripe webhook (simple variant; prod’da signature verification shart!)
router.post("/stripe", express.raw({ type: "application/json" }), async (req, res) => {
  try {
    const event = JSON.parse(req.body.toString());

    if (event.type === "payment_intent.succeeded") {
      const intent = event.data.object;
      const tx = await Transaction.findOne({ providerPaymentId: intent.id });
      if (tx && tx.status !== "succeeded") {
        tx.status = "succeeded";
        await tx.save();

        const project = await Project.findById(tx.project);

        // Project wallet credit
        const pw = await Wallet.findOneAndUpdate(
          { ownerType: "project", ownerRef: String(project._id) },
          {
            $inc: { balance: tx.amount },
            $push: { ledger: { txType: "credit", amount: tx.amount, reason: "payment_succeeded", refTxId: tx._id } },
          },
          { new: true }
        );

        // Platform fee (agar STRIPE_APP_FEE bor bo'lsa)
        const platform = await Wallet.findOneAndUpdate(
          { ownerType: "platform", ownerRef: "ciphercorelink" },
          {
            $setOnInsert: { currency: tx.currency },
          },
          { upsert: true, new: true }
        );
        // Balans platform daromadini webhookdan hisoblasangiz ham bo'ladi (app_fee)
      }
    }

    res.json({ received: true });
  } catch (e) {
    res.status(400).json({ message: "❌ Webhook error", error: e.message });
  }
});

module.exports = router;