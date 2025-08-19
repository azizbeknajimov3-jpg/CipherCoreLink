// models/User.js
const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    username: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
    },
    password: {
      type: String,
      required: true,
    },
    role: {
      type: String,
      enum: ["user", "admin"],
      default: "user",
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("User", userSchema);
const mongoose = require("mongoose")

const UserSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  email: { type: String, required: true, unique: true },
  passwordHash: { type: String, required: true },

  balanceCct: { type: Number, default: 0 },   // foydalanuvchi CCT balansi
  balanceFiat: { type: Number, default: 0 },  // real pul balansi (USD, UZS, va hokazo)
}, { timestamps: true })

module.exports = mongoose.model("User", UserSchema)