const Token = require("../../models/Token");

class TokenPriceEngine {
  static async updatePrice(symbol) {
    const token = await Token.findOne({ symbol });
    if (!token) return;

    const basePrice = token.lockCct / token.supply;
    const volatility = (Math.random() - 0.5) * 0.02;
    const newPrice = Math.max(0.0001, basePrice * (1 + volatility));

    token.lastPrice = token.price;
    token.price = newPrice;
    token.lastUpdated = new Date();

    await token.save();
    return token.price;
  }

  static async tickAll() {
    const tokens = await Token.find();
    for (const token of tokens) {
      await this.updatePrice(token.symbol);
    }
  }
}

module.exports = TokenPriceEngine;
