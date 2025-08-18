const mongoose = require("mongoose");

const TokenSchema = new mongoose.Schema({
  symbol: { type: String, unique: true, index: true, required: true },
  name: { type: String },
  creatorId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  mode: { type: String, enum: ["PEG_1_1_CCT","PEG_SPREAD","BOUNDED_FLOAT","FLOAT_AI","AUCTION_LAUNCH"], default: "PEG_1_1_CCT" },
  lockedCct: { type: Number, default: 0 },
  supply: { type: Number, default: 0 },
  priceCct: { type: Number, default: 1.0 },
  params: { type: Object, default: {} },
  createdAt: { type: Date, default: Date.now },
  lastModeChangeAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model("Token", TokenSchema);
