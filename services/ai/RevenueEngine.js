const Project = require("../../modelda/Project")
const User = require("../../modelda/User")

class RevenueEngine {
  static async distribute(projectId) {
    const p = await Project.findById(projectId)
    if (!p || p.revenuePool <= 0) return
    const total = p.revenuePool
    let ownerShare = 0, userShare = 0
    if (p.monetizationMode === "direct") {
      ownerShare = total
    } else if (p.monetizationMode === "aiManaged") {
      ownerShare = total * 0.8
      userShare = total * 0.2
    } else if (p.monetizationMode === "customRules") {
      p.customRules.forEach(r => {
        if (r.target === "owner") ownerShare = total * (r.percentage / 100)
        // future: other targets
      })
    }
    await User.updateOne({ _id: p.owner }, { $inc: { balanceCct: ownerShare } })
    p.revenuePool = 0
    p.lastDistributed = new Date()
    await p.save()
  }
}

module.exports = RevenueEngine
if (project.monetizationMode === "none") {
  // Daromad to‘planadi, lekin hech kimga tarqatilmaydi
  return;
}