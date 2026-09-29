const express = require("express");
const path = require("path");
const os = require("os");
const corpus = require("./data/corpus.json");
const employees = require("./data/employees.json");

const app = express();
app.use(express.json());
app.use(express.static(path.join(__dirname, "public")));

// --- Dork query parser -----------------------------------------------
// Supports: site:, filetype:, intitle:, inurl:, intext:, plus free-text terms.
function parseQuery(raw) {
  const operators = { site: null, filetype: null, intitle: [], inurl: [], intext: [] };
  const freeTerms = [];
  const tokens = raw.match(/(?:[^\s"]+|"[^"]*")+/g) || [];

  for (let tok of tokens) {
    tok = tok.replace(/^"(.*)"$/, "$1");
    const m = tok.match(/^(site|filetype|intitle|inurl|intext):(.+)$/i);
    if (m) {
      const key = m[1].toLowerCase();
      const val = m[2].toLowerCase();
      if (key === "site") operators.site = val;
      else if (key === "filetype") operators.filetype = val;
      else operators[key].push(val);
    } else if (tok.trim()) {
      freeTerms.push(tok.toLowerCase());
    }
  }
  return { operators, freeTerms };
}

function matches(doc, { operators, freeTerms }) {
  if (operators.site && !doc.domain.toLowerCase().includes(operators.site)) return false;
  // filetype: is only honored when paired with a site: operator in the same query —
  // it should never narrow results on its own.
  if (operators.filetype) {
    if (!operators.site) return false;
    if (doc.filetype.toLowerCase() !== operators.filetype) return false;
  }

  const title = doc.title.toLowerCase();
  const url = doc.url.toLowerCase();
  const text = (doc.title + " " + doc.snippet + " " + doc.content).toLowerCase();

  for (const t of operators.intitle) if (!title.includes(t)) return false;
  for (const u of operators.inurl) if (!url.includes(u)) return false;
  for (const c of operators.intext) if (!text.includes(c)) return false;

  for (const term of freeTerms) {
    if (!text.includes(term)) return false;
  }
  return true;
}

app.get("/api/search", (req, res) => {
  const q = (req.query.q || "").trim();
  if (!q) return res.json({ query: q, results: [] });

  const parsed = parseQuery(q);
  const results = corpus
    .filter((doc) => matches(doc, parsed))
    .map((doc) => ({
      id: doc.id,
      url: doc.url,
      title: doc.title,
      snippet: doc.snippet,
      filetype: doc.filetype,
    }));

  res.json({ query: q, count: results.length, results });
});

// Resolve a browsed URL to a document, without exposing the full corpus client-side.
app.get("/api/resolve", (req, res) => {
  const raw = (req.query.url || "").toLowerCase().replace(/^https?:\/\//, "").replace(/\/$/, "");
  const doc = corpus.find(
    (d) => d.url.toLowerCase().replace(/^https?:\/\//, "").replace(/\/$/, "") === raw
  );
  if (!doc) return res.status(404).json({ found: false });
  res.json({ found: true, id: doc.id, filetype: doc.filetype, pdfFile: doc.pdfFile || null });
});

app.get("/api/page/:id", (req, res) => {
  const doc = corpus.find((d) => d.id === req.params.id);
  if (!doc) return res.status(404).json({ error: "Not found" });
  if (doc.filetype === "pdf") {
    return res.json({ redirectToFile: `/files/${doc.pdfFile}` });
  }
  res.json({ title: doc.title, url: doc.url, content: doc.content });
});

app.post("/api/login", (req, res) => {
  const { employeeId, password } = req.body || {};
  if (!employeeId || !password) {
    return res.status(400).json({ success: false, message: "Both fields are required." });
  }
  const emp = employees.find(
    (e) => e.id.toLowerCase() === String(employeeId).trim().toLowerCase()
  );
  if (emp && password.trim().toUpperCase() === emp.id.toUpperCase()) {
    return res.json({
      success: true,
      message: `Welcome, ${emp.name}.`,
      flag: "FLAG{d0rk1ng_th3_w3b_l1k3_a_pr0}",
    });
  }
  res.status(401).json({ success: false, message: "Invalid Employee ID or password." });
});

const PORT = process.env.PORT || 3000;
const HOST = "0.0.0.0"; // listen on all network interfaces, not just localhost

app.listen(PORT, HOST, () => {
  console.log(`Velunox dork lab is listening on ${HOST}:${PORT}`);
  console.log("Reachable at:");
  console.log(`  - http://localhost:${PORT}  (this machine only)`);

  const interfaces = os.networkInterfaces();
  for (const name of Object.keys(interfaces)) {
    for (const iface of interfaces[name]) {
      if (iface.family === "IPv4" && !iface.internal) {
        console.log(`  - http://${iface.address}:${PORT}  (LAN - share this with students)`);
      }
    }
  }
});
