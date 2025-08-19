const mongoose = require("mongoose")

const ProjectSchema = new mongoose.Schema({
  owner: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  name: { type: String, required: true },
  monetizationMode: { type: String, enum: ["direct","aiManaged","customRules"], default: "direct" },
  customRules: [{ target: String, percentage: Number }],
  revenuePool: { type: Number, default: 0 },
  lastDistributed: { type: Date, default: Date.now }
}, { timestamps: true })

module.exports = mongoose.model("Project", ProjectSchema)