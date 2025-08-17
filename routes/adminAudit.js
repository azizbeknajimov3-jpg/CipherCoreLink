// routes/adminAudit.js
// Qo'shish: server.js ichida `app.use('/admin', require('./routes/adminAudit'))`

const express = require('express');
const router = express.Router();
const AuditLog = require('../models/AuditLog');
const User = require('../models/User'); // agar User modeli alohida faylda bo'lsa
const authMiddleware = require('../middleware/auth'); // agar auth middleware alohida faylda bo'lsa

// Admin role tekshiruvchi middleware (agar serverda requireRole mavjud bo'lmasa)
function requireAdmin(req, res, next) {
  if (!req.user) return res.status(401).json({ error: 'not authenticated' });
  if (req.user.role !== 'admin') return res.status(403).json({ error: 'admin only' });
  next();
}

/**
 GET /admin/audit?limit=100&page=1
 - returns latest audit logs with user handle populated
*/
router.get('/audit', authMiddleware, requireAdmin, async (req, res) => {
  try {
    const limit = Math.min(parseInt(req.query.limit || '100', 10), 1000);
    const page = Math.max(parseInt(req.query.page || '1', 10), 1);
    const skip = (page - 1) * limit;

    const total = await AuditLog.countDocuments();
    const rows = await AuditLog.find({})
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean();

    // Populate user handles (lightweight)
    const userIds = [...new Set(rows.map(r => String(r.userId)).filter(Boolean))];
    const users = await User.find({ _id: { $in: userIds } }).select('handle').lean();
    const userMap = {};
    users.forEach(u => { userMap[String(u._id)] = u.handle; });

    const payload = rows.map(r => ({
      id: r._id,
      userId: r.userId,
      userHandle: userMap[String(r.userId)] || null,
      action: r.action,
      meta: r.meta,
      createdAt: r.createdAt
    }));

    res.json({ ok: true, total, page, limit, items: payload });
  } catch (e) {
    console.error('admin/audit error', e);
    res.status(500).json({ error: 'failed to fetch audit logs', details: e.message });
  }
});

module.exports = router;