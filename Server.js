const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');

const app = express();
app.use(cors());
app.use(express.json());

/** ===== In-memory state (swap with DB later) ===== */
const users = [
  { id: 'u-admin', handle: 'admin', role: 'admin' },
  { id: 'u-dev',   handle: 'dev',   role: 'dev' },
  { id: 'u-user',  handle: 'user',  role: 'user' },
];
const tokens = {
  'admin:admin': 't-admin',
  'dev:dev': 't-dev',
  'user:user': 't-user'
};

const projects = [];   // { id, name, ownerId, status, price }
const purchases = [];  // { userId, projectId }

/** ===== Auth helpers ===== */
function auth(req, res, next) {
  const t = req.headers['authorization'];
  const user =
    t === 'Bearer t-admin' ? users[0] :
    t === 'Bearer t-dev'   ? users[1] :
    t === 'Bearer t-user'  ? users[2] : null;
  if (!user) return res.status(401).json({ error: 'unauthorized' });
  req.user = user;
  next();
}
function requireAdmin(req, res, next) {
  if (req.user.role !== 'admin') return res.status(403).json({ error: 'admin only' });
  next();
}

/** ===== API ===== */
// Health
app.get('/_/health', (_req, res) => res.json({ status: 'ok', ts: Date.now() }));

// Login
app.post('/auth/login', (req, res) => {
  const { handle, password } = req.body || {};
  const token = tokens[`${handle}:${password}`];
  if (!token) return res.status(401).json({ error: 'bad creds (try admin/admin, dev/dev, user/user)' });
  res.json({ token });
});

// Create project (dev/admin)
app.post('/projects', auth, (req, res) => {
  if (req.user.role === 'user') return res.status(403).json({ error: 'dev/admin only' });
  const { name } = req.body || {};
  if (!name) return res.status(400).json({ error: 'name required' });
  const id = `p-${projects.length + 1}`;
  const project = { id, name, ownerId: req.user.id, status: 'draft', price: null };
  projects.push(project);
  res.json(project);
});

// Admin sets price (publishes)
app.post('/admin/prices/:projectId', auth, requireAdmin, (req, res) => {
  const p = projects.find(x => x.id === req.params.projectId);
  if (!p) return res.status(404).json({ error: 'project not found' });
  const { price } = req.body || {};
  if (typeof price !== 'number') return res.status(400).json({ error: 'price number required' });
  p.price = price;
  p.status = 'active';
  res.json({ ok: true, project: p });
});

// Marketplace list
app.get('/projects', (req, res) => {
  res.json(projects.filter(p => p.status === 'active'));
});

// Purchase (mock payment)
app.post('/purchase', auth, (req, res) => {
  const { projectId } = req.body || {};
  const p = projects.find(x => x.id === projectId && x.status === 'active');
  if (!p) return res.status(404).json({ error: 'project not purchasable' });
  purchases.push({ userId: req.user.id, projectId });
  res.json({ ok: true, purchased: { projectId, price: p.price } });
});

// Premium-gated sample endpoint (requires purchase of p-1)
app.get('/sample/premium', auth, (req, res) => {
  const allowed = purchases.some(x => x.userId === req.user.id && x.projectId === 'p-1');
  if (!allowed) return res.status(402).json({ error: 'premium required (buy project p-1 first)' });
  res.json({ message: 'Welcome to CipherCorelink premium content for project p-1! 🎉' });
});

// Policy bundle for future agents
app.get('/policy/bundle', (_req, res) => {
  res.json({
    version: 'v1',
    dns: { primary: '127.0.0.1', doh: 'https://localhost/dns-query' },
    rules: [
      { match: 'telegram.org', gate: 'premium:p-1' },
      { match: 'youtube.com', gate: 'premium:p-1' },
      { match: '*', gate: 'allow' }
    ]
  });
});

/** ===== Simple file-based projects list (optional helper) ===== */
const PROJECTS_DIR = path.join(__dirname, 'projects');
if (!fs.existsSync(PROJECTS_DIR)) fs.mkdirSync(PROJECTS_DIR, { recursive: true });

app.get('/projects/files', (req, res) => {
  try {
    const list = fs.readdirSync(PROJECTS_DIR).map(n => ({ name: n }));
    res.json(list);
  } catch (e) {
    res.status(500).json({ error: 'failed reading projects dir', details: e.message });
  }
});

/** ===== Simple UI ===== */
const PUBLIC_DIR = path.join(__dirname, 'public');
if (!fs.existsSync(PUBLIC_DIR)) fs.mkdirSync(PUBLIC_DIR, { recursive: true });
app.use(express.static(PUBLIC_DIR));

// Default route
app.get('/', (req,res) => res.sendFile(path.join(PUBLIC_DIR, 'index.html')));

/** ===== Start server ===== */
const PORT = process.env.PORT ? parseInt(process.env.PORT) : 3000;
app.listen(PORT, () => {
  console.log(`CipherCorelink server running at http://localhost:${PORT}`);
});

// server.js ichida (tegishli joylarga qo‘shish)
const audit = require('./utils/audit');

// signup misoli
app.post('/auth/signup', async (req, res) => {
  try {
    const { handle, password } = req.body;
    const user = await User.create({ handle, password });
    const token = jwt.sign({ id: user._id }, JWT_SECRET);
    await audit(user, 'signup', { handle });
    res.json({ token });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// login misoli
app.post('/auth/login', async (req, res) => {
  const { handle, password } = req.body;
  const user = await User.findOne({ handle });
  if (!user) return res.status(400).json({ error: 'Not found' });
  if (!(await user.comparePassword(password))) return res.status(400).json({ error: 'Invalid password' });
  const token = jwt.sign({ id: user._id }, JWT_SECRET);
  await audit(user, 'login');
  res.json({ token });
});

// project yaratish misoli
app.post('/projects', authMiddleware, async (req, res) => {
  const p = await Project.create({ owner: req.user.id, ...req.body });
  await audit(req.user, 'create_project', { projectId: p._id });
  res.json(p);
});

// purchase misoli
app.post('/purchase', authMiddleware, async (req, res) => {
  const { projectId } = req.body;
  await audit(req.user, 'purchase', { projectId });
  res.send("Purchased successfully!");
});

// premium misoli
app.get('/sample/premium', authMiddleware, async (req, res) => {
  await audit(req.user, 'access_premium');
  res.json({ content: "Premium content!" });
});
// server.js (tepasida authMiddleware va boshqa narsalar import qilingan faraz qilinadi)
const adminAuditRoutes = require('./routes/adminAudit');
app.use('/admin', adminAuditRoutes);
// server.js (tegishli joyga)
app.use('/auth', require('./routes/auth'));
app.use('/ai', require('./routes/ai')); // AI command endpoint
// eʼtibor: /ai route ichida auth middleware ishlaydi