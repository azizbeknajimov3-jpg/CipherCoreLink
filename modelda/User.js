// modelda/User.js
const mongoose = require("mongoose");

const UserSchema = new mongoose.Schema(
  {
    username: { type: String, required: true, unique: true },
    email: { type: String, required: true, unique: true },
    passwordHash: { type: String, required: true },

    // Balanslar
    balanceCct: { type: Number, default: 0 },   // ichki token balans (CCT)
    balanceFiat: { type: Number, default: 0 },  // real pul balansi (USD, UZS va h.k.)

    // Foydalanuvchi loyihalari
    projects: [{ type: mongoose.Schema.Types.ObjectId, ref: "Project" }],

    // Tranzaksiyalar tarixi
    transactions: [{ type: mongoose.Schema.Types.ObjectId, ref: "Transaction" }],

    // Rol va huquqlar
    role: { type: String, enum: ["user", "creator", "admin"], default: "user" },

    // Foydalanuvchi profili
    profile: {
      fullName: { type: String },
      avatarUrl: { type: String },
      bio: { type: String },
      country: { type: String },
    },

    // AI va tizimga oid sozlamalar
    settings: {
      language: { type: String, default: "en" },
      notifications: { type: Boolean, default: true },
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("User", UserSchema);