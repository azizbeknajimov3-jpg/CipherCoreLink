const mongoose = require("mongoose");

const ProjectSchema = new mongoose.Schema(
  {
    owner: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    name: { type: String, required: true },
    description: { type: String },

    monetizationMode: {
      type: String,
      enum: ["direct", "aiManaged", "customRules"],
      default: "direct",
    },

    // Auditoriya soni (obunachilar, foydalanuvchilar va h.k.)
    audienceSize: { type: Number, default: 0 },

    // Loyihadan tushgan jami daromad
    totalRevenue: { type: Number, default: 0 },

    // Custom taqsimlash qoidalari
    customRules: [{ target: String, percentage: Number }],

    // AI boshqaradigan revenue pool
    revenuePool: { type: Number, default: 0 },

    // Oxirgi taqsimlangan vaqt
    lastDistributed: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Project", ProjectSchema);