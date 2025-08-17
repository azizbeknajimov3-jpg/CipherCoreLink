// core/agentManager.js
const { exec } = require('child_process');
const path = require('path');
const fs = require('fs/promises');
const AIManager = require('./aiManager');
const audit = require('../utils/audit');
const Crypto = require('../utils/crypto');

const DEFAULT_TIMEOUT_MS = 30_000; // 30s

class AgentManager {
  /**
   * services: { repoBaseDir, dockerComposePath, gitRemote, ... }
   */
  constructor({ services = {}, allowedCommands = [], llmOptions = {} } = {}) {
    this.services = services;
    this.allowedCommands = new Set(allowedCommands); // whitelist of allowed shell commands (names)
    this.ai = new AIManager(llmOptions);
    this.crypto = Crypto;
  }

  // Run a shell command but only if it's allowed (whitelist by base command)
  runCommand(command, opts = {}) {
    const timeout = opts.timeout || DEFAULT_TIMEOUT_MS;
    // Extract base command (first token)
    const base = (command || '').split(/\s+/)[0];
    if (!this.isCommandAllowed(base)) {
      return Promise.reject(new Error(`Command "${base}" is not allowed by policy`));
    }

    return new Promise((resolve, reject) => {
      const proc = exec(command, { timeout, maxBuffer: 10 * 1024 * 1024 }, (err, stdout, stderr) => {
        if (err) {
          const out = { ok: false, error: err.message, stdout, stderr };
          return reject(out);
        }
        resolve({ ok: true, stdout, stderr });
      });

      // optional streaming log - can pipe to logger
      if (proc.stdout) proc.stdout.on('data', d => console.log('[cmd stdout]', d.toString()));
      if (proc.stderr) proc.stderr.on('data', d => console.warn('[cmd stderr]', d.toString()));
    });
  }

  isCommandAllowed(baseCmd) {
    // allow node / npm / docker / git etc only if whitelisted
    if (this.allowedCommands.size === 0) return false; // default deny
    return this.allowedCommands.has(baseCmd);
  }

  // Git operations: clone -> commit -> push (simple; assumes credentials via git remote or SSH agent)
  async gitClone(repoUrl, destDir) {
    const dest = path.resolve(this.services.repoBaseDir || '.', destDir || `repo-${Date.now()}`);
    await fs.mkdir(dest, { recursive: true });
    const cmd = `git clone ${repoUrl} ${dest}`;
    const res = await this.runCommand(cmd, { timeout: 60_000 });
    await audit(null, 'git_clone', { repoUrl, dest, result: res.ok });
    return { dest, res };
  }

  async gitCommitAndPush(repoDir, message = 'agent commit') {
    const repoPath = path.resolve(repoDir);
    // Basic sequence: git add -A; git commit -m ...; git push
    // NOTE: ensure git remote auth is already configured on the server (SSH keys or token)
    try {
      await this.runCommand(`git -C ${repoPath} add -A`);
      await this.runCommand(`git -C ${repoPath} commit -m "${this._escapeCommitMessage(message)}" || true`);
      const push = await this.runCommand(`git -C ${repoPath} push`);
      await audit(null, 'git_push', { repoPath, ok: true });
      return push;
    } catch (e) {
      await audit(null, 'git_push', { repoPath, ok: false, error: e.message || e });
      throw e;
    }
  }

  _escapeCommitMessage(m) {
    return String(m).replace(/"/g, '\\"');
  }

  // Simple Docker Compose deploy (assumes docker-compose installed and compose file present)
  async deployDocker(composeDir) {
    const dir = path.resolve(composeDir || this.services.dockerComposePath || '.');
    try {
      const up = await this.runCommand(`docker-compose -f ${dir}/docker-compose.yml up -d --build`, { timeout: 120_000 });
      await audit(null, 'deploy_docker', { dir, ok: true });
      return up;
    } catch (e) {
      await audit(null, 'deploy_docker', { dir, ok: false, error: e });
      throw e;
    }
  }

  // High-level: process an AI-generated action string and map to concrete ops
  async handleAIAction(user, commandText, params = {}) {
    // Ask LLM for plan (optional): the AIManager can be used to expand the command into steps
    const plan = await this.ai.handleCommand(commandText, params);

    // For demonstration - we accept simple structured responses like:
    // { actions: [ { type: 'git_clone', repo: '...', dest: '...' }, { type: 'deploy', dir: '...' } ] }
    // In real world: use JSON schema or toolformer pattern for LLM output to be machine-readable.
    let parsed;
    try {
      parsed = JSON.parse(plan);
    } catch (e) {
      // fallback: log and save textual plan; do not execute unstructured output automatically
      await audit(user, 'ai_plan_unstructured', { commandText, plan: String(plan).slice(0,1000) });
      return { ok: false, error: 'AI returned unstructured plan. Manual review required.', plan };
    }

    // Execute structured actions sequentially with policy checks
    const results = [];
    for (const action of parsed.actions || []) {
      if (action.type === 'git_clone') {
        // whitelist check for cloning allowed repos? you decide policy
        const r = await this.gitClone(action.repo, action.dest || undefined);
        results.push({ action, result: r });
      } else if (action.type === 'git_commit_push') {
        const r = await this.gitCommitAndPush(action.repoDir, action.message);
        results.push({ action, result: r });
      } else if (action.type === 'deploy_docker') {
        const r = await this.deployDocker(action.dir);
        results.push({ action, result: r });
      } else if (action.type === 'run_command') {
        // Only run if base command whitelisted
        const r = await this.runCommand(action.command, { timeout: action.timeout || DEFAULT_TIMEOUT_MS });
        results.push({ action, result: r });
      } else {
        results.push({ action, result: { ok: false, error: 'unknown action type' }});
      }
    }

    await audit(user, 'ai_execute_plan', { commandText, parsed, summaryCount: results.length });
    return { ok: true, plan: parsed, results };
  }

  // Encryption helpers using Crypto utils
  async encryptString(plaintext, passphrase) {
    return this.crypto.encryptString(plaintext, passphrase);
  }
  async decryptString(ciphertextBase64, passphrase) {
    return this.crypto.decryptString(ciphertextBase64, passphrase);
  }
}

module.exports = AgentManager;