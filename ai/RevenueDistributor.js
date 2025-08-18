const Token = require("../../models/Token");
const User = require("../../models/User");

class RevenueDistributor {
  static async distribute(totalCct) {
    const users = await User.find();
    if (users.length === 0) return;

    const totalWeight = users.reduce((sum, u) => sum + (u.audienceScore || 1), 0);
    for (const user of users) {
      const share = (user.audienceScore || 1) / totalWeight;
      const amount = totalCct * share;
      user.balanceCct = (user.balanceCct || 0) + amount;
      await user.save();
    }
  }
}

module.exports = RevenueDistributor;
