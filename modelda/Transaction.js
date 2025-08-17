// models/Transaction.js
const mongoose = require("mongoose");

const transactionSchema = new mongoose.Schema(
  {
    project: { type: mongoose.Schema.Types.ObjectId, ref: "Project", required: true },
    buyer: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: false }, // guest ham bo‘lishi mumkin
    amount: { type: Number, required: true }, // minor units: tiyin/cent
    currency: { type: String, default: "USD" },
    provider: { type: String, enum: ["internal", "stripe", "yookassa"], required: true },
    providerPaymentId: { type: String }, // Stripe payment_intent id…
    status: { type: String, enum: ["pending", "succeeded", "failed", "refunded"], default: "pending" },

    // nazorat: kim, qayerdan
    buyerFingerprint: { type: String }, // device fingerprint (ixtiyoriy)
    buyerIP: { type: String },
    buyerCountry: { type: String },
    userAgent: { type: String },

    // agar real mahsulot bo‘lsa — yetkazib berish metama’lumotlari (logistika foydalanuvchida)
    delivery: {
      type: new mongoose.Schema(
        {
          type: { type: String, enum: ["none", "virtual", "real"], default: "virtual" },
          addressHash: { type: String }, // maxfiylik uchun hash
          note: { type: String },
          status: { type: String, enum: ["n/a", "queued", "shipped", "delivered", "failed"], default: "n/a" },
        },
        { _id: false }
      ),
      default: {},
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Transaction", transactionSchema);