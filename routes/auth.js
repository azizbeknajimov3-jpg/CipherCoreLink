// routes/auth.js
// Signup / Login / Current user
const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const audit = require('../utils/audit');

const JWT_SECRET = process.env.JWT_SECRET || 'devsecret';
const JWT_EXPIRES = process.env.JWT_EXPIRES_IN || '7d';

// Signup
router.post('/signup', async (req, res) => {
  try {
    const { handle, password, role } = req.body || {};
    if (!handle || !password) return res.status(400).json({ error: 'handle & password required' });

    const exists = await User.findOne({ handle });
    if (exists) return res.status(400).json({ error: 'handle already taken' });

    const user = await User.createWithPassword(handle, password, role || 'user');
    const token = jwt.sign({ id: user._id.toString(), handle: user.handle, role: user.role }, JWT_SECRET, { expiresIn: JWT_EXPIRES });

    await audit(user, 'signup', { handle });
    res.json({ ok: true, token, user: { id: user._id, handle: user.handle, role: user.role } });
  } catch (e) {
    console.error('signup error', e);
    res.status(500).json({ error: 'signup failed', details: e.message });
  }
});

// Login
router.post('/login', async (req, res) => {
  try {
    const { handle, password } = req.body || {};
    if (!handle || !password) return res.status(400).json({ error: 'handle & password required' });

    const user = await User.findOne({ handle });
    if (!user) return res.status(401).json({ error: 'invalid credentials' });

    const ok = await user.comparePassword(password);
    if (!ok) return res.status(401).json({ error: 'invalid credentials' });

    const token = jwt.sign({ id: user._id.toString(), handle: user.handle, role: user.role }, JWT_SECRET, { expiresIn: JWT_EXPIRES });

    await audit(user, 'login', {});
    res.json({ ok: true, token, user: { id: user._id, handle: user.handle, role: user.role } });
  } catch (e) {
    console.error('login error', e);
    res.status(500).json({ error: 'login failed', details: e.message });
  }
});

// Whoami / current user (token required)
router.get('/me', async (req, res) => {
  try {
    const auth = req.headers['authorization'];
    if (!auth) return res.status(401).json({ error: 'no token' });
    const parts = auth.split(' ');
    if (parts.length !== 2 || parts[0] !== 'Bearer') return res.status(401).json({ error: 'malformed token' });

    const payload = jwt.verify(parts[1], JWT_SECRET);
    const user = await User.findById(payload.id).select('-passwordHash').lean();
    if (!user) return res.status(401).json({ error: 'user not found' });

    res.json({ ok: true, user });
  } catch (e) {
    return res.status(401).json({ error: 'invalid token', details: e.message });
  }
});

module.exports = router;