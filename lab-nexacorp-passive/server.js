const express = require('express');
const path = require('path');
const { WHOIS_DB, DNS_ZONES, JOB_POSTINGS, PEOPLE, PASTES, STAGING } = require('./mockData');

const app = express();
const PORT = process.env.PORT || 3001;

app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

const crypto = require('crypto');
const sessions = new Set();

function normalize(s) {
  return String(s || '').trim().toLowerCase().replace(/[.\s]+$/, '');
}

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'views', 'index.html'));
});

// ---------- Built-in "whois" tool ----------
app.get('/api/whois', (req, res) => {
  const domain = normalize(req.query.domain).replace(/^https?:\/\//, '');
  const record = WHOIS_DB[domain];
  if (!record) {
    return res.json({ found: false, raw: `No match for "${req.query.domain || ''}".` });
  }
  const raw = [
    `Domain Name: ${record.domain}`,
    `Registrar: ${record.registrar}`,
    `Registrant Organization: ${record.registrantOrg}`,
    `Registrant Email: ${record.registrantEmail}`,
    `Creation Date: ${record.createdDate}`,
    `Updated Date: ${record.updatedDate}`,
    `Registry Expiry Date: ${record.expiryDate}`,
    `Domain Status: ${record.status}`,
    ...record.nameServers.map(ns => `Name Server: ${ns.toUpperCase()}`)
  ].join('\n');
  res.json({ found: true, raw });
});

// ---------- Built-in "dig / DNS zone" tool ----------
app.get('/api/dns', (req, res) => {
  const domain = normalize(req.query.domain).replace(/^https?:\/\//, '');
  const zone = DNS_ZONES[domain];
  if (!zone) {
    return res.json({ found: false, raw: `;; connection timed out; no servers could be reached for ${req.query.domain || ''}` });
  }
  const raw = zone.map(r => `${r.name.padEnd(26)} IN  ${r.type.padEnd(6)} ${r.value}`).join('\n');
  res.json({ found: true, raw });
});

// ---------- Searchable content endpoints ----------
function search(list, q, fields) {
  const t = String(q || '').trim().toLowerCase();
  if (!t) return list;
  return list.filter(x => fields.some(f => String(x[f] || '').toLowerCase().includes(t)));
}
app.get('/api/jobs', (req, res) => res.json(search(JOB_POSTINGS, req.query.q, ['company', 'title', 'location', 'body'])));
app.get('/api/people', (req, res) => {
  const list = search(PEOPLE, req.query.q, ['name', 'headline', 'company', 'location', 'about']);
  // Contact details are only returned for a single profile view, not in search results.
  res.json(list.map(({ contact, experience, ...p }) => p));
});
app.get('/api/people/:id', (req, res) => {
  const p = PEOPLE.find(x => x.id === req.params.id);
  if (!p) return res.status(404).json({ error: 'Profile not found' });
  res.json(p);
});
app.get('/api/pastes', (req, res) => res.json(search(PASTES, req.query.q, ['title', 'author']).map(({ body, ...p }) => p)));
app.get('/api/pastes/:id', (req, res) => {
  const p = PASTES.find(x => x.id === req.params.id);
  if (!p) return res.status(404).json({ error: 'Paste not found' });
  res.json(p);
});

// ---------- Simulated browser ----------
const HOSTS = {
  'nexacorp.test': { type: 'site' },
  'www.nexacorp.test': { type: 'site' },
  'mail.nexacorp.test': { type: 'login', product: 'NexaCorp Webmail', version: '' },
  'vpn.nexacorp.test': { type: 'error', code: 403, message: 'Access restricted to the corporate network.' },
  'ns1.nexacorp.test': { type: 'error', code: 0, message: 'Connection refused.' },
  'ns2.nexacorp.test': { type: 'error', code: 0, message: 'Connection refused.' }
};

function consoleFor(job, n) {
  const head = `Started by timer\nRunning as SYSTEM\nBuilding in workspace /var/jenkins/workspace/${job}\n`;
  if (job === 'customer-portal-deploy' && n === 214) {
    return head + `[Pipeline] sh\n+ docker build -t portal:214 .\nSuccessfully built 7f3a9c1e2b44\n[Pipeline] withEnv\n+ export DEPLOY_TOKEN=${STAGING.flag}\n+ ./deploy.sh staging\nDeploy complete.\nFinished: SUCCESS`;
  }
  return head + `[Pipeline] sh\n+ ./run.sh ${n}\nDone.\nFinished: ${job === 'nightly-cleanup' ? 'FAILURE' : 'SUCCESS'}`;
}

app.get('/api/browse', (req, res) => {
  const host = normalize(req.query.host);
  const path = String(req.query.path || '/').replace(/\/+$/, '') || '/';
  if (host === STAGING.host) {
    if (!sessions.has(req.get('x-session'))) return res.json({ type: 'login', product: 'Jenkins', version: '2.263.1' });
    if (path === '/') return res.json({ type: 'dashboard', jobs: Object.entries(STAGING.jobs).map(([name, j]) => ({ name, status: j.status })) });
    let m = path.match(/^\/job\/([\w-]+)$/);
    if (m && STAGING.jobs[m[1]]) return res.json({ type: 'job', name: m[1], builds: STAGING.jobs[m[1]].builds });
    m = path.match(/^\/job\/([\w-]+)\/(\d+)\/console$/);
    if (m && STAGING.jobs[m[1]] && STAGING.jobs[m[1]].builds.includes(Number(m[2]))) {
      return res.json({ type: 'console', name: m[1], build: Number(m[2]), text: consoleFor(m[1], Number(m[2])) });
    }
    return res.json({ type: 'error', code: 404, message: 'Not Found' });
  }
  const h = HOSTS[host];
  if (!h) return res.json({ type: 'error', code: 0, message: `Server not found: ${req.query.host || ''} could not be resolved.` });
  res.json(h);
});

app.post('/api/login', (req, res) => {
  const { host, username, password } = req.body || {};
  if (normalize(host) === STAGING.host && username === STAGING.user && password === STAGING.pass) {
    const token = crypto.randomBytes(12).toString('hex');
    sessions.add(token);
    return res.json({ ok: true, session: token });
  }
  res.json({ ok: false, message: 'Invalid username or password.' });
});

app.listen(PORT, () => {
  console.log(`NexaCorp Recon Lab running at http://localhost:${PORT}`);
});
