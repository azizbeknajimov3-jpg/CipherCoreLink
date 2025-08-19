const User = require("../modelda/User");

class DepositService {
  // Foydalanuvchiga balans qo‘shish
  static async addDeposit(userId, amount) {
    if (amount <= 0) throw new Error("Summani to‘g‘ri kiriting");

    const user = await User.findById(userId);
    if (!user) throw new Error("Foydalanuvchi topilmadi");

    user.balanceCct += amount;
    await user.save();

    return { success: true, message: "Deposit muvaffaqiyatli qo‘shildi", newBalance: user.balanceCct };
  }
}

module.exports = DepositService;