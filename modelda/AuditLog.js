// models/AuditLog.js
const mongoose = require('mongoose');

const auditSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  action: { type: String, required: true },   // Masalan: 'signup', 'login', 'purchase'
  meta: mongoose.Schema.Types.Mixed,          // Qo‘shimcha ma’lumot (JSON)
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('AuditLog', auditSchema);