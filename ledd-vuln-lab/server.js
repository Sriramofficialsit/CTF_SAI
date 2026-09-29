const express = require("express");
const path    = require("path");
const fs      = require("fs");
const os      = require("os");

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ─── Credentials (stored in the exposed .bak file) ──────────────────────────
const ADMIN = { username: "ledd_admin", password: "LEDD@secure2024" };
const FLAG  = "FLAG{CVE_2020_11738_CWE22_ch41ned_w1th_CWE798}";

// ─── Block direct .bak file requests ────────────────────────────────────────
// Simulates the web-server ACL that admins think protects the backup file.
// The vulnerable plugin endpoint bypasses this entirely.
app.get(/\.bak$/, (req, res) => {
  res.status(403).type("text/html").send(`
    <html><head><title>403 Forbidden</title></head>
    <body style="font-family:sans-serif;padding:40px">
      <h1>403 Forbidden</h1>
      <p>You don't have permission to access this resource on this server.</p>
      <hr><address>Apache/2.4.41 (Ubuntu)</address>
    </body></html>`);
});

// ─── Static files ────────────────────────────────────────────────────────────
app.use(express.static(path.join(__dirname, "public")));

// ─── WordPress-style URL routes ──────────────────────────────────────────────
app.get("/portal/wp-login.php", (req, res) =>
  res.sendFile(path.join(__dirname, "views", "wp-login.html")));

app.get(["/portal/wp-admin", "/portal/wp-admin/"], (req, res) =>
  res.redirect("/portal/wp-login.php?redirect_to=%2Fportal%2Fwp-admin%2F"));

app.get("/portal/wp-admin/dashboard", (req, res) =>
  res.sendFile(path.join(__dirname, "views", "wp-dashboard.html")));

// ─── robots.txt – a breadcrumb for diligent students ─────────────────────────
app.get("/portal/robots.txt", (req, res) =>
  res.type("text/plain").send(
`User-agent: *
Disallow: /portal/wp-admin/
Disallow: /portal/wp-content/
Disallow: /portal/wp-includes/
Disallow: /portal/xmlrpc.php
Disallow: /portal/wp-config.php
`));

// ─── Login endpoint ───────────────────────────────────────────────────────────
app.post("/api/login", (req, res) => {
  const { log: username, pwd: password } = req.body;
  if (!username || !password)
    return res.status(400).json({ success: false, message: "Both fields are required." });

  if (
    username.trim().toLowerCase() === ADMIN.username.toLowerCase() &&
    password.trim() === ADMIN.password
  ) {
    return res.json({
      success: true,
      message: `Welcome back, ${username}.`,
      flag: FLAG
    });
  }
  res.status(401).json({ success: false, message: "ERROR: The username or password you entered is incorrect. Lost your password?" });
});

// ─── THE VULNERABLE ENDPOINT ─────────────────────────────────────────────────
// Models CVE-2020-11738 (Duplicator ≤ 1.3.26)
// CWE-22: Path Traversal — the 'file' parameter is joined to basePath
// without verifying the resolved path stays within basePath.
// Attack: ?action=duplicator_download&file=../../../../wp-config.php.bak
// Patched in 1.3.28 by adding: if (!realFilePath.startsWith(basePath)) → reject
app.get("/portal/wp-admin/admin-ajax.php", (req, res) => {
  const action = (req.query.action || "").toLowerCase();
  const file   =  req.query.file   || "";

  if (!["duplicator_download", "duplicator_init"].includes(action))
    return res.status(400).send("0");

  if (!file)
    return res.status(400).send("0");

  // Simulated DUPLICATOR_SSDIR_PATH constant (where plugin stores packages)
  const basePath = path.join(
    __dirname, "public", "portal", "wp-content", "plugins", "duplicator", "ssdir"
  );

  // VULNERABLE LINE: path.join does resolve ../ — no containment check follows
  const filePath = path.join(basePath, file);

  // ← patched version would add this check:
  // if (!filePath.startsWith(basePath + path.sep)) return res.status(403).send("0");

  if (!fs.existsSync(filePath))
    return res.status(404).type("text/html").send("<b>Error: source file is missing.</b>");

  res.setHeader("Content-Type", "application/octet-stream");
  res.setHeader("Content-Disposition", `attachment; filename="${path.basename(filePath)}"`);
  res.sendFile(filePath);
});

// ─── Start ───────────────────────────────────────────────────────────────────
const PORT = process.env.PORT || 3001;
app.listen(PORT, "0.0.0.0", () => {
  console.log("\n=== LEDD Corp Vulnerability Lab ===");
  console.log(`Listening on port ${PORT}`);
  console.log("\nReachable at:");
  console.log(`  http://localhost:${PORT}/portal`);
  for (const ifaces of Object.values(os.networkInterfaces())) {
    for (const i of ifaces) {
      if (i.family === "IPv4" && !i.internal)
        console.log(`  http://${i.address}:${PORT}  ← share with students`);
    }
  }
  console.log(`\nFLAG : ${FLAG}`);
  console.log(`CREDS: ${ADMIN.username} / ${ADMIN.password}`);
  console.log("===================================\n");
});
