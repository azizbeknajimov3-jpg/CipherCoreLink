const express = require("express");
const router = express.Router();
const AIProjectGenerator = require("../services/AIProjectGenerator");

// ✅ AI avtomatik loyiha yaratish
router.post("/create", async (req, res) => {
  try {
    const { ownerId, namePrefix, descriptionPrefix } = req.body;
    const project = await AIProjectGenerator.createAutomaticProject({ ownerId, namePrefix, descriptionPrefix });
    res.status(201).json(project);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ✅ AI avtomatik metrics yangilash
router.post("/:id/update-metrics", async (req, res) => {
  try {
    const projectId = req.params.id;
    const { audienceIncrease, revenueIncrease } = req.body;
    const project = await AIProjectGenerator.updateMetrics(projectId, { audienceIncrease, revenueIncrease });
    res.json(project);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;