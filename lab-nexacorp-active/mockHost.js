// Simulated host. The IP is inside RFC 5737's documentation range
// (TEST-NET-1, 203.0.113.0/24) and the hostname uses the reserved .test TLD,
// so nothing here can ever resolve to or collide with a real machine.

const TARGET_HOST = 'staging.nexacorp.test';
const TARGET_IP = '203.0.113.42';

// Only ports listed here respond as "open". Everything else in a scanned
// range comes back closed/filtered. Note the interesting port (31337) is
// intentionally outside the common 1-1024 / top-1000 range, so a scan
// limited to "common ports" will miss it - teaches why a full range sweep
// sometimes matters.
const PORT_MAP = {
  80: {
    status: 'open',
    service: 'http',
    banner: 'HTTP/1.1 200 OK\nServer: nginx/1.18.0\nContent-Type: text/html\n\n<!-- Under construction -->'
  },
  443: {
    status: 'open',
    service: 'https',
    banner: 'HTTP/1.1 200 OK\nServer: nginx/1.18.0 (SSL)\nContent-Type: text/html\n\n<!-- Under construction -->'
  },
  22: {
    status: 'open',
    service: 'ssh',
    banner: 'SSH-2.0-OpenSSH_7.4\nLogin required.'
  },
  3306: {
    status: 'closed',
    service: 'mysql'
  },
  21: {
    status: 'open',
    service: 'ftp',
    // Decoy: looks juicy (anonymous login, old-looking banner) but is a dead end.
    banner: '220 RelayFTP 1.2 (2014) ready.\n220 Anonymous login enabled.\n220 Note: this banner is a known decoy left over from a pentest demo - nothing here is the real target.'
  },
  8080: {
    status: 'open',
    service: 'http-alt',
    // Confirms the careers-page/leak lead from the passive lab (Jenkins, outdated),
    // but does NOT contain the flag - it's a lead toward a future exploitation module.
    banner: 'HTTP/1.1 200 OK\nServer: Jetty (Jenkins)\nX-Jenkins: 2.19.1\n\nJenkins - staging build server. Login required.'
  },
  31337: {
    status: 'open',
    service: 'unknown',
    // The actual objective: a non-obvious port outside common scan ranges.
    // Leads to SSH (port 22) rather than containing the flag itself.
    banner: 'Welcome to the NexaCorp internal diagnostics service.\nThis port should not be reachable from outside the corporate network.\n\n[legacy note left by ops]\nbackup account still enabled on this host - opsbackup / B4ckup#2026\nremove before next audit.'
  }
};

const SSH_CREDS = { username: 'opsbackup', password: 'B4ckup#2026' };
const SSH_FILES = {
  'backup.txt': 'Nightly backup log\n-------------------\nOK  2026-06-20 02:00\nOK  2026-06-21 02:00\nOK  2026-06-22 02:00\n\nFLAG{ssh_backup_account_left_enabled}',
  'notes.txt': 'reminder: rotate the backup account password, someone left it as-is for months.'
};

module.exports = { TARGET_HOST, TARGET_IP, PORT_MAP, SSH_CREDS, SSH_FILES };
