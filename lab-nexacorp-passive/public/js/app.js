// Top-level tabs (Target Site / Attacker Toolkit)
document.querySelectorAll('.top-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    document.querySelectorAll('.top-btn').forEach(b => b.classList.remove('active'));
    document.querySelectorAll('.top-content').forEach(c => c.classList.remove('active'));
    btn.classList.add('active');
    document.getElementById('top-' + btn.dataset.top).classList.add('active');
  });
});

// Sub-tabs within each top-level tab
document.querySelectorAll('.subtabs').forEach(group => {
  const name = group.dataset.group;
  group.querySelectorAll('.sub-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      group.querySelectorAll('.sub-btn').forEach(b => b.classList.remove('active'));
      document.querySelectorAll('.sub-content[data-group="' + name + '"]').forEach(c => c.classList.remove('active'));
      btn.classList.add('active');
      document.getElementById('sub-' + btn.dataset.sub).classList.add('active');
    });
  });
});

// WHOIS tool
document.getElementById('whois-form').addEventListener('submit', async (e) => {
  e.preventDefault();
  const domain = e.target.domain.value;
  const out = document.getElementById('whois-output');
  out.textContent = 'Querying...';
  const res = await fetch('/api/whois?domain=' + encodeURIComponent(domain));
  const data = await res.json();
  out.textContent = data.raw;
});

// DNS tool
document.getElementById('dns-form').addEventListener('submit', async (e) => {
  e.preventDefault();
  const domain = e.target.domain.value;
  const out = document.getElementById('dns-output');
  out.textContent = 'Querying...';
  const res = await fetch('/api/dns?domain=' + encodeURIComponent(domain));
  const data = await res.json();
  out.textContent = data.raw;
});

// Careers

// ---------- helpers ----------
const esc = s => String(s == null ? '' : s).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const initials = n => n.split(' ').map(w => w[0]).join('').slice(0, 2);

// ---------- Job Seeking Portal ----------
const shuffle = arr => { const a = arr.slice(); for (let i = a.length - 1; i > 0; i--) { const k = Math.floor(Math.random() * (i + 1)); [a[i], a[k]] = [a[k], a[i]]; } return a; };
async function loadJobs(q = '') {
  const jobs = shuffle(await (await fetch('/api/jobs?q=' + encodeURIComponent(q))).json());
  document.getElementById('jobs-count').textContent = jobs.length + ' job' + (jobs.length === 1 ? '' : 's') + (q ? ' matching "' + q + '"' : '');
  document.getElementById('jobs-list').innerHTML = jobs.map(x => `
    <div class="card rd-post job-row" tabindex="0" role="button" aria-expanded="false">
      <div class="rd-main"><h3>${esc(x.title)}</h3>
      <div class="meta">${esc(x.company)} &middot; ${esc(x.location)} &middot; ${esc(x.type)} &middot; Posted ${esc(x.posted)}</div>
      <p class="rd-body" hidden>${esc(x.body)}</p></div><span class="rd-chev">&#9662;</span>
    </div>`).join('') || '<p class="hint">No jobs found.</p>';
}
function toggleRow(row) {
  const body = row.querySelector('.rd-body');
  body.hidden = !body.hidden;
  row.setAttribute('aria-expanded', String(!body.hidden));
  row.classList.toggle('open', !body.hidden);
}
const jobsList = document.getElementById('jobs-list');
jobsList.addEventListener('click', e => { const r = e.target.closest('.job-row'); if (r) toggleRow(r); });
jobsList.addEventListener('keydown', e => { if (e.key === 'Enter') { const r = e.target.closest('.job-row'); if (r) toggleRow(r); } });
document.getElementById('jobs-form').addEventListener('submit', e => { e.preventDefault(); loadJobs(e.target.q.value); });
// Reshuffle and reset each time the tab is selected
document.querySelector('.sub-btn[data-sub="jobs"]').addEventListener('click', () => { document.querySelector('#jobs-form input').value = ''; loadJobs(); });
loadJobs();

// ---------- Professional Network (LinkUp) ----------
async function loadPeople(q = '') {
  document.getElementById('people-detail').hidden = true;
  const list = document.getElementById('people-list'); list.hidden = false;
  const people = await (await fetch('/api/people?q=' + encodeURIComponent(q))).json();
  list.innerHTML = people.map(p => `
    <div class="card li-card" data-id="${esc(p.id)}" tabindex="0" role="button">
      <div class="avatar">${esc(initials(p.name))}</div>
      <div><h3>${esc(p.name)}</h3><div>${esc(p.headline)}</div><div class="meta">${esc(p.location)}</div></div>
    </div>`).join('') || '<p class="hint">No results. Try a different name or company.</p>';
}
async function showProfile(id) {
  const p = await (await fetch('/api/people/' + encodeURIComponent(id))).json();
  document.getElementById('people-list').hidden = true;
  const d = document.getElementById('people-detail'); d.hidden = false;
  d.innerHTML = `<button class="sub-btn" id="people-back">&larr; Back to results</button>
    <div class="li-banner"></div>
    <div class="avatar big">${esc(initials(p.name))}</div>
    <h2>${esc(p.name)}</h2><div>${esc(p.headline)}</div><div class="meta">${esc(p.location)}</div>
    <h3>About</h3><p>${esc(p.about)}</p>
    ${p.experience.length ? '<h3>Experience</h3><ul>' + p.experience.map(x => '<li>' + esc(x) + '</li>').join('') + '</ul>' : ''}
    ${p.skills.length ? '<h3>Skills</h3><p>' + p.skills.map(esc).join(' &middot; ') + '</p>' : ''}
    ${p.contact ? '<h3>Contact info</h3><p>' + esc(p.contact) + '</p>' : ''}`;
  document.getElementById('people-back').addEventListener('click', () => loadPeople(document.querySelector('#people-form input').value));
}
document.getElementById('people-form').addEventListener('submit', e => { e.preventDefault(); loadPeople(e.target.q.value); });
document.getElementById('people-list').addEventListener('click', e => { const c = e.target.closest('.li-card'); if (c) showProfile(c.dataset.id); });
document.getElementById('people-list').addEventListener('keydown', e => { if (e.key === 'Enter') { const c = e.target.closest('.li-card'); if (c) showProfile(c.dataset.id); } });
loadPeople();

// ---------- Public Paste Archive (thread style, expands in place) ----------
const pasteCache = {};
async function loadPastes(q = '') {
  const pastes = shuffle(await (await fetch('/api/pastes?q=' + encodeURIComponent(q))).json());
  document.getElementById('pastes-list').innerHTML = pastes.map(p => `
    <div class="card rd-post paste-row" data-id="${esc(p.id)}" tabindex="0" role="button" aria-expanded="false">
      <div class="rd-votes"><span>&#9650;</span><b>${Math.max(1, Math.round(p.views / 12))}</b><span>&#9660;</span></div>
      <div class="rd-main"><h3>${esc(p.title)}</h3>
      <div class="meta">Posted by ${esc(p.author)} &middot; ${esc(p.date)} &middot; ${esc(p.syntax)} &middot; ${esc(p.views)} views</div>
      <pre class="rd-body" hidden></pre></div>
    </div>`).join('') || '<p class="hint">No pastes found.</p>';
}
async function togglePaste(row) {
  const body = row.querySelector('.rd-body');
  if (body.hidden) {
    const id = row.dataset.id;
    if (!pasteCache[id]) pasteCache[id] = (await (await fetch('/api/pastes/' + encodeURIComponent(id))).json()).body;
    body.textContent = pasteCache[id];
  }
  toggleRow(row);
}
const pastesList = document.getElementById('pastes-list');
pastesList.addEventListener('click', e => { const r = e.target.closest('.paste-row'); if (r) togglePaste(r); });
pastesList.addEventListener('keydown', e => { if (e.key === 'Enter') { const r = e.target.closest('.paste-row'); if (r) togglePaste(r); } });
document.getElementById('pastes-form').addEventListener('submit', e => { e.preventDefault(); loadPastes(e.target.q.value); });
document.querySelector('.sub-btn[data-sub="leaks"]').addEventListener('click', () => { document.querySelector('#pastes-form input').value = ''; loadPastes(); });
loadPastes();

// ---------- Simulated browser (Target Site tab) ----------
let session = null;
const bv = document.getElementById('browser-view'), home = document.getElementById('site-home'), addr = document.getElementById('addr-input');

function parseAddr(raw) {
  raw = raw.trim().replace(/^https?:\/\//i, '');
  const i = raw.indexOf('/');
  return { host: (i < 0 ? raw : raw.slice(0, i)).toLowerCase(), path: i < 0 ? '/' : raw.slice(i) };
}
async function go(raw) {
  const { host, path } = parseAddr(raw);
  addr.value = 'http://' + host + path;
  const res = await fetch('/api/browse?host=' + encodeURIComponent(host) + '&path=' + encodeURIComponent(path), { headers: session ? { 'x-session': session } : {} });
  render(await res.json(), host);
}
function link(host, path, text) { return `<a href="#" class="nav" data-go="${esc(host + path)}">${esc(text)}</a>`; }
function render(p, host) {
  home.hidden = p.type !== 'site'; bv.hidden = p.type === 'site';
  if (p.type === 'site') return;
  let html = '';
  if (p.type === 'error') html = `<h2>${p.code ? esc(p.code) + ' ' : ''}${p.code === 404 ? 'Not Found' : 'Cannot reach this page'}</h2><p class="hint">${esc(p.message)}</p>`;
  else if (p.type === 'login') html = `<h2>Sign in to ${esc(p.product)}</h2>
    <form id="login-form" class="tool-form" style="flex-direction:column;max-width:320px">
      <input name="username" placeholder="Username" autocomplete="off" required>
      <input name="password" type="password" placeholder="Password" required>
      <button type="submit">Sign in</button></form>
      <div id="login-msg" class="hint"></div>${p.version ? `<div class="meta">${esc(p.product)} ${esc(p.version)}</div>` : ''}`;
  else if (p.type === 'dashboard') html = `<h2>Jenkins &middot; Dashboard</h2><div class="card-list">` +
    p.jobs.map(x => `<div class="card">${link(host, '/job/' + x.name, x.name)}<div class="meta">${esc(x.status)}</div></div>`).join('') + '</div>';
  else if (p.type === 'job') html = `<h2>${esc(p.name)}</h2>${link(host, '/', '\u2190 Dashboard')}<div class="card-list">` +
    p.builds.map(n => `<div class="card">Build #${n} &middot; ${link(host, '/job/' + p.name + '/' + n + '/console', 'Console output')}</div>`).join('') + '</div>';
  else if (p.type === 'console') html = `<h2>${esc(p.name)} #${p.build} &middot; Console</h2>${link(host, '/job/' + p.name, '\u2190 Back')}<pre class="terminal-output" style="margin-top:12px">${esc(p.text)}</pre>`;
  bv.innerHTML = html;
  const lf = document.getElementById('login-form');
  if (lf) lf.addEventListener('submit', async e => {
    e.preventDefault();
    const r = await (await fetch('/api/login', { method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ host, username: lf.username.value, password: lf.password.value }) })).json();
    if (r.ok) { session = r.session; go(host + '/'); } else document.getElementById('login-msg').textContent = r.message;
  });
}
bv.addEventListener('click', e => { const a = e.target.closest('a.nav'); if (a) { e.preventDefault(); go(a.dataset.go); } });
document.getElementById('addr-form').addEventListener('submit', e => { e.preventDefault(); go(addr.value); });
document.getElementById('addr-home').addEventListener('click', () => go('nexacorp.test/'));
