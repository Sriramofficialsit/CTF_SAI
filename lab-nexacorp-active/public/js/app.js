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

// Target info
fetch('/api/target').then(r => r.json()).then(t => {
  document.getElementById('ti-host').textContent = t.host;
  document.getElementById('ti-ip').textContent = t.ip;
});

function renderScanResults(data) {
  const out = document.getElementById('scan-output');
  if (data.error) { out.textContent = 'Error: ' + data.error; return; }
  if (!data.results.length) {
    out.textContent = `Scanned ports ${data.scanned.start}-${data.scanned.end}: no responsive ports found.`;
    return;
  }
  const lines = [`Scanned ports ${data.scanned.start}-${data.scanned.end}:`, ''];
  data.results.forEach(r => {
    lines.push(`${String(r.port).padEnd(6)} ${r.status.toUpperCase().padEnd(8)} ${r.service || ''}`);
  });
  out.textContent = lines.join('\n');
}

document.getElementById('preset-common').addEventListener('click', async () => {
  document.getElementById('scan-output').textContent = 'Scanning...';
  const res = await fetch('/api/scan?preset=common');
  renderScanResults(await res.json());
});

document.getElementById('scan-range-form').addEventListener('submit', async (e) => {
  e.preventDefault();
  const start = e.target.start.value;
  const end = e.target.end.value;
  document.getElementById('scan-output').textContent = 'Scanning...';
  const res = await fetch(`/api/scan?start=${encodeURIComponent(start)}&end=${encodeURIComponent(end)}`);
  renderScanResults(await res.json());
});

// Banner grabber
let sshSession = null;
document.getElementById('connect-form').addEventListener('submit', async (e) => {
  e.preventDefault();
  const port = e.target.port.value;
  const out = document.getElementById('connect-output');
  const sshPanel = document.getElementById('ssh-panel');
  sshPanel.hidden = true;
  document.getElementById('ssh-shell').hidden = true;
  document.getElementById('ssh-msg').textContent = '';
  document.getElementById('ssh-login-form').reset();
  sshSession = null;
  out.textContent = 'Connecting...';
  const res = await fetch('/api/connect?port=' + encodeURIComponent(port));
  const data = await res.json();
  out.textContent = data.connected
    ? `Connected to port ${port} (${data.service})\n\n${data.banner}`
    : data.message;
  if (data.connected && data.sshLogin) sshPanel.hidden = false;
});

document.getElementById('ssh-login-form').addEventListener('submit', async (e) => {
  e.preventDefault();
  const username = e.target.username.value, password = e.target.password.value;
  const msg = document.getElementById('ssh-msg');
  msg.textContent = 'Connecting...';
  const res = await fetch('/api/ssh/login', {
    method: 'POST', headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username, password })
  });
  const data = await res.json();
  if (!data.ok) { msg.textContent = data.message; return; }
  sshSession = data.session;
  msg.textContent = `Login successful. Files in home directory:`;
  const shell = document.getElementById('ssh-shell');
  shell.hidden = false;
  document.getElementById('ssh-files').innerHTML = data.files.map(f =>
    `<div class="card file-row" data-file="${f}" tabindex="0" role="button">${f}</div>`).join('');
});

document.getElementById('ssh-files').addEventListener('click', async (e) => {
  const row = e.target.closest('.file-row');
  if (!row || !sshSession) return;
  const view = document.getElementById('ssh-cat');
  view.hidden = false;
  view.textContent = 'Reading file...';
  const res = await fetch('/api/ssh/cat?file=' + encodeURIComponent(row.dataset.file), { headers: { 'x-session': sshSession } });
  const data = await res.json();
  view.textContent = data.content || data.error;
});
document.getElementById('ssh-files').addEventListener('keydown', (e) => {
  if (e.key === 'Enter') e.target.closest('.file-row')?.dispatchEvent(new Event('click', { bubbles: true }));
});
