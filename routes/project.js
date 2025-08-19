const express = require("express");
const Project = require("../modelda/Project");
const User = require("../modelda/User");
const RevenueEngine = require("../services/ai/RevenueEngine");

const router = express.Router();

// ✅ Loyihani yaratish
router.post("/create", async (req, res) => {
  try {
    const { name, description, monetizationMode, customRules } = req.body;

    const project = new Project({
      owner: req.user._id, // foydalanuvchi token orqali aniqlanadi
      name,
      description,
      monetizationMode,
      customRules: monetizationMode === "customRules" ? customRules || [] : [],
    });

    await project.save();
    res.status(201).json(project);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ✅ Auditoriya va daromadni yangilash
router.post("/:id/update-metrics", async (req, res) => {
  try {
    const { audienceSize, revenue } = req.body;

    const project = await Project.findById(req.params.id);
    if (!project) return res.status(404).json({ error: "Project not found" });

    if (audienceSize) project.audienceSize += audienceSize; 
    if (revenue) {
      project.totalRevenue += revenue; 
      project.revenuePool += revenue; 
    }

    await project.save();
    res.json(project);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ✅ Revenue taqsimlash (AI yoki customRules bo‘yicha)
router.post("/:id/distribute", async (req, res) => {
  try {
    const project = await Project.findById(req.params.id);
    if (!project) return res.status(404).json({ error: "Project not found" });

    const amount = project.revenuePool;
    if (amount <= 0) return res.status(400).json({ error: "No revenue to distribute" });

    await RevenueEngine.distributeRevenue(project._id, amount);

    project.revenuePool = 0;
    project.lastDistributed = Date.now();
    await project.save();

    res.json({ message: "Revenue distributed successfully" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ✅ Hamma loyihalarni daromad va auditoriya bo‘yicha tartiblab olish (leaderboard)
router.get("/leaderboard", async (req, res) => {
  try {
    const projects = await Project.find()
      .populate("owner", "username") // egasini ko‘rsatish
      .sort({ totalRevenue: -1, audienceSize: -1 })
      .limit(50); 

    const rankedProjects = projects.map((proj, index) => ({
      rank: index + 1,
      projectId: proj._id,
      name: proj.name,
      owner: proj.owner.username,
      audienceSize: proj.audienceSize || 0,
      totalRevenue: proj.totalRevenue || 0,
      monetizationMode: proj.monetizationMode,
      createdAt: proj.createdAt,
    }));

    res.json({ success: true, leaderboard: rankedProjects });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
  