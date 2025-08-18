const express = require("express");
const router = express.Router();
const Token = require("../models/Token");
const TxLog = require("../models/TxLog");
const TokenPriceEngine = require("../services/ai/TokenPriceEngine");

// Create token
router.post("/create", async (req, res) => {
  try {
    const { creatorId, symbol, name, supply, lockCct } = req.body;
    if (!creatorId || !symbol || !supply || !lockCct)
      return res.status(400).json({ ok:false, error:"missing" });

    if (Number(lockCct) !== Number(supply))
      return res.status(400).json({ ok:false, error:"lock must equal supply for PEG_1_1_CCT" });

    const existing = await Token.findOne({ symbol });
    if (existing) return res.status(400).json({ ok:false, error:"symbol_exists" });

    const t = await Token.create({ creatorId, symbol, name, supply, lockedCct: lockCct, mode:"PEG_1_1_CCT", priceCct:1.0 });
    await TxLog.create({ type:"TOKEN_CREATE", details:{ symbol, supply, lockCct, creatorId }});
    res.json({ ok:true, token: t });
  } catch (e) {
    console.error("token.create err", e);
    res.status(500).json({ ok:false, error:e.message });
  }
});

// Get price
router.get("/:symbol/price", async (req, res) => {
  try {
    const symbol = req.params.symbol;
    const price = await TokenPriceEngine.quote(symbol);
    res.json({ ok:true, symbol, priceCct: price });
  } catch (e) {
    res.status(500).json({ ok:false, error:e.message });
  }
});

module.exports = router;
