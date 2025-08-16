const express = require('express');
const fs = require('fs');
const path = require('path');
const app = express();
app.use(express.json());

const PROJECTS_DIR = path.join(__dirname, 'projects');
const USERS_DIR = path.join(__dirname, 'users');

// In-memory users (demo)
const users = [
  { id: 'u-admin', handle: 'admin', role: 'admin' },
  { id: 'u-dev', handle: 'dev', role: 'dev' },
  { id: 'u-user', handle: 'user', role: 'user' },
];

// Simple Auth
function auth(req, res, next) {
  const token = req.headers['authorization'];
  const user = token === 'Bearer t-admin' ? users[0] :
               token === 'Bearer t-dev' ? users[1] :
               token === 'Bearer t-user' ? users[2] : null;
  if(!user) return res.status(401).json({error:'unauthorized'});
  req.user = user;
  next();
}

// Routes
app.get('/', (req,res)=> res.send('CipherCorelink server running!'));

// Create Project (dev/admin)
app.post('/projects', auth, (req,res)=>{
  if(req.user.role==='user') return res.status(403).json({error:'dev/admin only'});
  const { name } = req.body;
  const projectId = `p-${Date.now()}`;
  const projectPath = path.join(PROJECTS_DIR, projectId + '_' + name);
  fs.mkdirSync(projectPath, { recursive:true });
  fs.writeFileSync(path.join(projectPath,'config.json'), JSON.stringify({id:projectId, name, ownerId:req.user.id, status:'draft'},null,2));
  fs.writeFileSync(path.join(projectPath,'server.js'), "// placeholder for project server");
  res.json({ok:true, id:projectId, name});
});

// List Projects
app.get('/projects', (req,res)=>{
  const projects = fs.readdirSync(PROJECTS_DIR);
  res.json(projects);
});

// Start server
app.listen(3000, ()=>console.log('CipherCorelink minimal server running on port 3000'));
