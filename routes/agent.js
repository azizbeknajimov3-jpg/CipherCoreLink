// routes/agent.js
const express = require('express');
const router = express.Router();
const AgentManager = require('../core/agentManager');
const auth = require('../middleware/auth');
const audit = require('../utils/audit');

// Configure allowed commands conservatively
const allowed = ['git','node','npm','docker-compose','docker','ls','cat','echo']; // minimal example

const agent = new AgentManager({
  services: { repoBaseDir: '/var/ciphercore/repos', dockerComposePath: '/var/ciphercore' },
  allowedCommands: allowed,
  llmOptions: { /* pass through env based options if needed */ }
});

// Only admin/dev
router.post('/execute', auth, async (req, res) => {
  if (!req.user || (req.user.role !== 'admin' && req.user.role !== 'dev')) {
    return res.status(403).json({ error: 'dev/admin only' });
  }
  try {
    const { commandText } = req.body || {};
    if (!commandText) return res.status(400).json({ error: 'commandText required' });

    const out = await agent.handleAIAction(req.user, commandText);
    res.json(out);
  } catch (e) {
    console.error('agent execute error', e);
    res.status(500).json({ error: e.message || e });
  }
});

module.exports = router;