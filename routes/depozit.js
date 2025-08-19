const express = require("express");
const DepositService = require("../services/DepositService");
const router = express.Router();

// Pul qo‘shish endpointi
router.post("/", async (req, res) => {
  try {
    const { userId, amount } = req.body;

    if (!userId || !amount) {
      return res.status(400).json({ error: "userId va amount kerak" });
    }

    const result = await DepositService.addDeposit(userId, amount);

    res.json(result);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

module.exports = router;