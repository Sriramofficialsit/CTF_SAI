const express = require('express');
const path = require('path');
const { TARGET_HOST, TARGET_IP, PORT_MAP, SSH_CREDS, SSH_FILES } = require('./mockHost');

const app = express();
const PORT = process.env.PORT || 3002;

const MAX_SCAN_SPAN = 65535;
const crypto = require('crypto');
const FLAG = 'FLAG{ssh_backup_account_left_enabled}';
const sshSessions = new Set();

app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'views', 'index.html'));
});

app.get('/api/target', (req, res) => {
  res.json({ host: TARGET_HOST, ip: TARGET_IP });
});

// ---------- Built-in "port scanner" tool ----------
// Query params: start, end (inclusive), or preset=common (top well-known ports)
app.get('/api/scan', (req, res) => {
  let start = parseInt(req.query.start, 10);
  let end = parseInt(req.query.end, 10);

  if (req.query.preset === 'common') {
    start = 1;
    end = 1024;
  }

  if (!Number.isFinite(start) || !Number.isFinite(end) || start < 1 || end > 65535 || start > end) {
    return res.status(400).json({ error: 'Invalid port range. Use 1-65535, start <= end.' });
  }
  if (end - start > MAX_SCAN_SPAN) {
    return res.status(400).json({ error: 'Range too large.' });
  }

  const results = [];
  for (let port = start; port <= end; port++) {
    const entry = PORT_MAP[port];
    if (entry) {
      results.push({ port, status: entry.status, service: entry.status === 'open' ? entry.service : undefined });
    }
  }
  // Ports with no entry at all are simply omitted (filtered/no response),
  // mirroring how a real scan report only lists ports that answered.
  res.json({ scanned: { start, end }, results });
});

// ---------- Built-in "banner grabber" / connect tool ----------
app.get('/api/connect', (req, res) => {
  const port = parseInt(req.query.port, 10);
  if (!Number.isFinite(port) || port < 1 || port > 65535) {
    return res.status(400).json({ error: 'Invalid port.' });
  }
  const entry = PORT_MAP[port];
  if (!entry || entry.status !== 'open') {
    return res.json({ connected: false, message: `Connection to port ${port} refused or timed out.` });
  }
  if (port === 22) {
    return res.json({ connected: true, service: entry.service, banner: entry.banner, sshLogin: true });
  }
  res.json({ connected: true, service: entry.service, banner: entry.banner });
});

// ---------- SSH login simulation (port 22 only) ----------
app.post('/api/ssh/login', (req, res) => {
  const { username, password } = req.body || {};
  if (username === SSH_CREDS.username && password === SSH_CREDS.password) {
    const token = crypto.randomBytes(12).toString('hex');
    sshSessions.add(token);
    return res.json({ ok: true, session: token, files: Object.keys(SSH_FILES) });
  }
  res.json({ ok: false, message: 'Permission denied (password).' });
});

app.get('/api/ssh/cat', (req, res) => {
  if (!sshSessions.has(req.get('x-session'))) return res.status(401).json({ error: 'Not authenticated.' });
  const name = String(req.query.file || '');
  if (!SSH_FILES[name]) return res.status(404).json({ error: `cat: ${name}: No such file or directory` });
  res.json({ file: name, content: SSH_FILES[name] });
});

// ---------- Flag submission ----------
app.post('/api/submit', (req, res) => {
  const answer = String((req.body && req.body.answer) || '').trim();
  if (answer === FLAG) {
    return res.json({ correct: true, flag: FLAG });
  }
  res.json({ correct: false, message: 'Not the flag yet - check every open port carefully, not just the interesting-looking ones.' });
});

app.listen(PORT, () => {
  console.log(`NexaCorp Recon Console (active recon lab) running at http://localhost:${PORT}`);
});
