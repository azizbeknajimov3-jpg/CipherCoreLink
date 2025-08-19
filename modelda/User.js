const mongoose = require("mongoose")

const UserSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  email: { type: String, required: true, unique: true },
  passwordHash: { type: String, required: true },

  balanceCct: { type: Number, default: 0 },   // foydalanuvchi CCT balansi
  balanceFiat: { type: Number, default: 0 },  // real pul balansi (USD, UZS, va hokazo)
}, { timestamps: true })

module.exports = mongoose.model("User", UserSchema)