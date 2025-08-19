const express = require("express");
const router = express.Router();
const AIMonetization = require("../services/AIMonetization");

// ✅ AI avtomatik daromad taqsimlash
router.post("/:id/distribute", async (req, res) => {
  try {
    const projectId = req.params.id;
    await AIMonetization.distributeRevenue(projectId);
    res.json({ message: "Revenue distributed successfully" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;