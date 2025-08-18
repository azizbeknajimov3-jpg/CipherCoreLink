const PolicyEngine = require("./PolicyEngine");
const TokenPriceEngine = require("./TokenPriceEngine");
const TokenSupervisor = require("./TokenSupervisor");
const TreasuryManager = require("./TreasuryManager");
const TxLog = require("../../models/TxLog");
const Token = require("../../models/Token");

let isTicking = false;

module.exports = {
  async init() {
    console.log("[AIController] init");
  },

  async tick() {
    if (isTicking) return;
    isTicking = true;
    try {
      const policy = PolicyEngine.load();
      const tokens = await Token.find({});
      for (const tk of tokens) {
        const signals = { netBuySell: 0, utilizationDelta: 0 };
        await TokenPriceEngine.quote(tk.symbol, signals);
        await TokenSupervisor.review(tk.symbol, { liquidityCct: tk.lockedCct, volatility7d: 0.05 });
      }
      const t = await TreasuryManager.get();
      await TreasuryManager.circuitBreakerIfNeeded(0);
      await TxLog.create({ type: "AI_TICK", details: { time: new Date(), tokenCount: tokens.length }});
    } catch (e) {
      console.error("[AIController.tick] error:", e);
      await TxLog.create({ type: "AI_ERROR", details: { error: e.message }});
    } finally {
      isTicking = false;
    }
  },

  async status() {
    const t = await TreasuryManager.get();
    const tokens = await Token.find({}).select("symbol mode priceCct supply lockedCct");
    return { treasury: t, tokens };
  }
};
