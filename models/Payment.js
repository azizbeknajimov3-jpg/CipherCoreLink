const mongoose = require("mongoose");

const paymentSchema = new mongoose.Schema(
  {
    project: { type: mongoose.Schema.Types.ObjectId, ref: "Project", required: true },
    buyer: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    amount: { type: Number, required: true }, // tiyin/cent
    currency: { type: String, default: "USD" },
    provider: { type: String, enum: ["internal", "stripe", "yookassa"], required: true },
    providerPaymentId: { type: String },
    status: { type: String, enum: ["pending", "succeeded", "failed", "refunded"], default: "pending" },
    buyerFingerprint: { type: String },
    buyerIP: { type: String },
    buyerCountry: { type: String },
    userAgent: { type: String },
    delivery: {
      type: new mongoose.Schema(
        {
          type: { type: String, enum: ["none", "virtual", "real"], default: "virtual" },
          addressHash: { type: String },
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

module.exports = mongoose.model("Payment", paymentSchema);