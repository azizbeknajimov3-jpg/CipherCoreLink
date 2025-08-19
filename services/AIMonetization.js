const Project = require("../modelda/Project");
const User = require("../modelda/User");

class AIMonetization {
  // AI tomonidan avtomatik daromad taqsimlash
  static async distributeRevenue(projectId) {
    const project = await Project.findById(projectId);
    if (!project || project.revenuePool <= 0) return;

    const total = project.revenuePool;

    let ownerShare = 0;
    let userShare = 0;

    if (project.monetizationMode === "none") {
      return; // Daromad to'planadi, lekin tarqatilmaydi
    } else if (project.monetizationMode === "direct") {
      ownerShare = total;
    } else if (project.monetizationMode === "aiManaged") {
      ownerShare = total * 0.8;
      userShare = total * 0.2;
    } else if (project.monetizationMode === "customRules") {
      project.customRules.forEach(rule => {
        if (rule.target === "owner") ownerShare = total * (rule.percentage / 100);
        // kelajakda boshqa targetlar qo‘shilishi mumkin
      });
    }

    await User.updateOne({ _id: project.owner }, { $inc: { balanceCct: ownerShare } });

    // Foydalanuvchi share taqsimlash (agar mavjud bo‘lsa)
    if (userShare > 0) {
      // misol uchun: AI tomonidan avtomatik foydalanuvchilarga tarqatish
      const allUsers = await User.find().limit(10); // demo uchun 10 ta foydalanuvchi
      const perUser = userShare / allUsers.length;
      for (const u of allUsers) {
        await User.updateOne({ _id: u._id }, { $inc: { balanceCct: perUser } });
      }
    }

    project.revenuePool = 0;
    project.lastDistributed = new Date();
    await project.save();
  }
}

module.exports = AIMonetization;