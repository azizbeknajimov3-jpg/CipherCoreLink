// routes/ai.js
// AI command endpoint: admin or dev can send commands to AI manager
const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth'); // token middleware
const requireRole = require('../middleware/requireRole');
const AIManager = require('../core/aiManager'); // oldindan yaratgan core/aiManager.js
const audit = require('../utils/audit');

// instantiate AIManager with services (optional)
const services = {}; // you can inject services: { projectsService, paymentService, ... }
const ai = new AIManager(services);

// Admin/dev can call AI to perform actions
router.post('/command', auth, async (req, res) => {
  try {
    // Only dev or admin allowed to run potentially destructive commands
    if (req.user.role !== 'admin' && req.user.role !== 'dev') {
      return res.status(403).json({ error: 'dev/admin only' });
    }

    const { command, params } = req.body || {};
    if (!command) return res.status(400).json({ error: 'command required' });

    // For demo: AIManager.handleCommand is synchronous. In prod this might be async (LLM call)
    const result = await Promise.resolve(ai.handleCommand(command, params));

    // Record audit
    await audit(req.user, 'ai_command', { command, params, result: typeof result === 'string' ? result.slice(0,200) : result });

    res.json({ ok: true, result });
  } catch (e) {
    console.error('ai command error', e);
    res.status(500).json({ error: 'ai failed', details: e.message });
  }
});

module.exports = router;