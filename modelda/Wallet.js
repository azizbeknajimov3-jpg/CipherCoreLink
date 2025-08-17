// models/Wallet.js
const mongoose = require("mongoose");

const walletSchema = new mongoose.Schema(
  {
    ownerType: { type: String, enum: ["platform", "user", "project"], required: true },
    ownerRef: { type: String, required: true }, // "platform" bo'lsa "ciphercorelink", user/project _id bo'lsa o'sha id
    balance: { type: Number, default: 0 }, // minor units (cent/tiyin)
    currency: { type: String, default: "USD" },
    ledger: [
      {
        type: new mongoose.Schema(
          {
            txType: { type: String, enum: ["credit", "debit"], required: true },
            amount: { type: Number, required: true },
            reason: { type: String },
            refTxId: { type: String }, // Transaction._id yoki provider id
          },
          { _id: false, timestamps: true }
        ),
      },
    ],
  },
  { timestamps: true }
);

walletSchema.index({ ownerType: 1, ownerRef: 1 }, { unique: true });

module.exports = mongoose.model("Wallet", walletSchema);