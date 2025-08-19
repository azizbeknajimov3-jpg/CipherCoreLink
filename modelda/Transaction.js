const mongoose = require("mongoose");

const transactionSchema = new mongoose.Schema(
  {
    project: { type: mongoose.Schema.Types.ObjectId, ref: "Project", required: true },

    // user yoki buyer – ikkalasini ham qo‘llash mumkin
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: false },
    buyer: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: false }, // guest ham bo‘lishi mumkin

    // transaction turi
    type: { type: String, enum: ["deposit", "withdraw", "revenue", "payment"], required: true },

    amount: { type: Number, required: true }, // minor units (tanga/tiyin)
    currency: { type: String, default: "USD" },

    provider: { type: String, enum: ["internal", "stripe", "yookassa"], default: "internal" },
    providerPaymentId: { type: String },

    status: { type: String, enum: ["pending", "succeeded", "failed", "refunded"], default: "pending" },

    // nazorat ma’lumotlari
    buyerFingerprint: { type: String },
    buyerIP: { type: String },
    buyerCountry: { type: String },
    userAgent: { type: String },

    // agar real mahsulot bo‘lsa — delivery
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