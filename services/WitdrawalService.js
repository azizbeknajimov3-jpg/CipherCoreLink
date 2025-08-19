const User = require("../modelda/User");

class WithdrawalService {
  // AI tomonidan avtomatik withdrawal tekshirish va amalga oshirish
  static async requestWithdrawal(userId, amount) {
    const user = await User.findById(userId);
    if (!user) throw new Error("Foydalanuvchi topilmadi");

    if (user.balanceCct < amount) {
      throw new Error("Balansda yetarli mablag‘ yo‘q");
    }

    // Limit tekshirish (agar bo‘lsa)
    if (process.env.WITHDRAW_LIMIT && amount > process.env.WITHDRAW_LIMIT) {
      throw new Error(`Yechib olish limiti: ${process.env.WITHDRAW_LIMIT} CCT`);
    }

    // AI avtomatik tasdiqlaydi (demo uchun console.log)
    console.log(`AI tasdiqladi: ${user.username} ${amount} CCT yechib oldi`);

    // Balansdan ayirish
    user.balanceCct -= amount;
    await user.save();

    return {
      success: true,
      message: `Siz muvaffaqiyatli ${amount} CCT yechib oldingiz`
    };
  }
}

module.exports = WithdrawalService;