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
const Project = require("../modelda/Project");
const User = require("../modelda/User");

class RevenueEngine {
  static async distribute(projectId) {
    const project = await Project.findById(projectId);
    if (!project || project.revenuePool <= 0) return;

    const total = project.revenuePool;
    let ownerShare = 0;

    if (project.monetizationMode === "none") {
      return; // Daromad to'planadi, lekin tarqatilmaydi
    } else if (project.monetizationMode === "direct") {
      ownerShare = total;
    } else if (project.monetizationMode === "aiManaged") {
      ownerShare = total * 0.8;
      const userShare = total * 0.2;
      await User.updateOne({ _id: project.owner }, { $inc: { balanceCct: userShare } });
    } else if (project.monetizationMode === "customRules") {
      project.customRules.forEach(r => {
        if (r.target === "owner") ownerShare = total * (r.percentage / 100);
      });
    }

    await User.updateOne({ _id: project.owner }, { $inc: { balanceCct: ownerShare } });
    project.revenuePool = 0;
    project.lastDistributed = new Date();
    await project.save();
  }
}

module.exports = RevenueEngine;