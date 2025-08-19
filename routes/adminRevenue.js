const express = require("express");
const router = express.Router();
const Project = require("../modelda/Project");
const User = require("../modelda/User");

// Admin uchun daromad taqsimlash
router.post("/distribute/:id", async (req, res) => {
  try {
    const project = await Project.findById(req.params.id);
    if (!project) return res.status(404).json({ error: "Project not found" });

    const distribution = req.body; // { userId: percentage, platform: percentage, ... }
    const total = project.revenuePool;

    for (let key in distribution) {
      const share = (total * distribution[key]) / 100;
      if (key === "platform") {
        await User.findByIdAndUpdate(process.env.ADMIN_ACCOUNT_ID, { $inc: { balanceCct: share } });
      } else {
        await User.findByIdAndUpdate(key, { $inc: { balanceCct: share } });
      }
    }

    project.revenuePool = 0;
    await project.save();
    res.json({ message: "Revenue distributed successfully", project });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;