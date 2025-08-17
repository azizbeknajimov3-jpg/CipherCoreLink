// middleware/requireRole.js
// Usage: app.use('/admin', authMiddleware, requireRole('admin'))
module.exports = function requireRole(role) {
  return (req, res, next) => {
    if (!req.user) return res.status(401).json({ error: 'not authenticated' });
    if (req.user.role !== role) return res.status(403).json({ error: `requires ${role} role` });
    next();
  };
};