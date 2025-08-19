const express = require("express");
const Project = require("../modelda/Project");

const router = express.Router();

// GET /leaderboard
router.get("/", async (req, res) => {
  try {
    // Barcha loyihalarni auditoriya va daromad bo‘yicha sortlash
    const projects = await Project.find({})
      .sort({ totalRevenue: -1, audienceSize: -1 })
      .lean();

    // Rank qo‘shish
    const rankedProjects = projects.map((proj, index) => ({
      rank: index + 1,
      projectId: proj._id,
      name: proj.name,
      owner: proj.owner,
      audienceSize: proj.audienceSize || 0,
      totalRevenue: proj.totalRevenue || 0,
      monetizationMode: proj.monetizationMode,
      createdAt: proj.createdAt,
    }));

    res.json({ success: true, leaderboard: rankedProjects });
  } catch (err) {
    console.error("Leaderboard error:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

module.exports = router;