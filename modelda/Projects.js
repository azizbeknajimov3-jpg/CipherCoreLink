// models/Project.js
const mongoose = require("mongoose");

const projectSchema = new mongoose.Schema(
  {
    owner: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    name: { type: String, required: true, trim: true },
    description: { type: String },
    // foydalanuvchining real kartasi/payment account’i bilan bog‘lanish
    paymentProvider: { type: String, enum: ["stripe", "yookassa", "none"], default: "none" },
    providerAccountId: { type: String, default: null }, // masalan Stripe Connect account id
    isVirtualOnly: { type: Boolean, default: true },    // WWW’dagi loyiha sotilmaydi
    active: { type: Boolean, default: true },
    meta: { type: Object, default: {} },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Project", projectSchema);