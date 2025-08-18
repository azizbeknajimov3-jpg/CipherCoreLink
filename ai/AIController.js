const PolicyEngine = require("./PolicyEngine");
const TokenPriceEngine = require("./TokenPriceEngine");
const RevenueDistributor = require("./RevenueDistributor");

class AIController {
  static async init() {
    this.policy = PolicyEngine.loadPolicy();
    console.log("[AIController] initialized");
  }

  static async tick() {
    await TokenPriceEngine.tickAll();
    const budget = this.policy.revenue?.monthlyBudget || 0;
    if (budget > 0) {
      await RevenueDistributor.distribute(budget);
    }
  }
}

module.exports = AIController;
