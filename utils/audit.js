// utils/audit.js
const AuditLog = require('../models/AuditLog');

async function audit(user, action, meta = {}) {
  try {
    await AuditLog.create({
      userId: user._id,
      action,
      meta
    });
  } catch (err) {
    console.error("Audit log yozishda xato:", err);
  }
}

module.exports = audit;