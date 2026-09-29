const content = document.getElementById("content");
const addressBar = document.getElementById("address-bar");
const goBtn = document.getElementById("go-btn");
const backBtn = document.getElementById("back-btn");

const PORTAL_HOST = "portal-access.velunox-internal.test";
const SEARCH_HOST = "searchit.test";

const SITE_NAMES = {
  "velunox.test": "Velunox Technologies",
  "brightloop.test": "BrightLoop",
  "gridtech-solutions.test": "GridTech Solutions",
  "foodieplace.test": "FoodiePlace",
  "techtalk-forum.test": "TechTalk Forum",
  "newswire-daily.test": "Newswire Daily",
};

const TABS = ["All", "Shopping", "Images", "Videos", "News", "Forums", "More", "Tools"];

let history = [];

function normalize(raw) {
  return raw.trim().replace(/^https?:\/\//i, "").replace(/\/$/, "");
}

function setAddress(url, push = true) {
  addressBar.value = url;
  if (push) history.push(url);
}

function escapeHtml(str) {
  return String(str).replace(/[&<>"']/g, (c) => ({
    "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;",
  }[c]));
}

// Deterministic hue from a domain string, for the favicon circle.
function domainColor(domain) {
  let hash = 0;
  for (let i = 0; i < domain.length; i++) hash = domain.charCodeAt(i) + ((hash << 5) - hash);
  return `hsl(${hash % 360}, 55%, 45%)`;
}

function faviconHtml(domain) {
  const letter = (SITE_NAMES[domain] || domain).charAt(0).toUpperCase();
  return `<span class="favicon" style="background:${domainColor(domain)}">${letter}</span>`;
}

// Breadcrumb-style path: "domain.test > folder > file.pdf" instead of a raw URL.
function breadcrumb(url) {
  const noScheme = url.replace(/^https?:\/\//i, "").replace(/\/$/, "");
  return escapeHtml(noScheme.split("/").join(" \u203a "));
}

// Bold the free-text query terms inside a snippet, like a real search engine does.
function highlightTerms(text, terms) {
  let out = escapeHtml(text);
  terms.forEach((t) => {
    if (!t) return;
    const re = new RegExp(`(${t.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")})`, "ig");
    out = out.replace(re, "<b>$1</b>");
  });
  return out;
}

function extractFreeTerms(query) {
  return (query.match(/(?:[^\s"]+|"[^"]*")+/g) || [])
    .map((t) => t.replace(/^"(.*)"$/, "$1"))
    .filter((t) => !/^(site|filetype|intitle|inurl|intext):/i.test(t));
}

// Persistent top search bar + tab row, used on the results page so
// re-searching doesn't require going back to a separate start page.
function searchHeaderHtml(query) {
  return `
    <div class="search-top">
      <div class="search-top-box">
        <span class="search-icon-left">&#128269;</span>
        <input id="top-search-input" type="text" value="${escapeHtml(query)}" autocomplete="off" />
        <span class="search-icon">&#127908;</span>
        <span class="search-icon">&#128247;</span>
      </div>
    </div>
    <div class="tabs-row">
      ${TABS.map((t, i) => `<span class="tab-item${i === 0 ? " active" : ""}">${t}</span>`).join("")}
    </div>`;
}

function wireSearchHeader() {
  const input = document.getElementById("top-search-input");
  if (!input) return;
  input.addEventListener("keydown", (e) => {
    if (e.key === "Enter") {
      const q = input.value.trim();
      if (q) navigate(`https://${SEARCH_HOST}/search?q=${encodeURIComponent(q)}`);
    }
  });
}

function renderHome(push = true) {
  if (push) setAddress("searchit://home");
  content.className = "search-mode";
  content.innerHTML = `
    <div class="search-home">
      <div class="logo"><span>S</span><span>e</span><span>a</span><span>r</span><span>c</span><span>h</span><span>It</span></div>
      <form id="search-form">
        <input id="search-input" type="text" autocomplete="off" placeholder="Search the web" />
      </form>
      <button id="search-btn">SearchIt Search</button>
    </div>`;
  const form = document.getElementById("search-form");
  const doSearch = () => {
    const q = document.getElementById("search-input").value.trim();
    if (q) navigate(`https://${SEARCH_HOST}/search?q=${encodeURIComponent(q)}`);
  };
  form.addEventListener("submit", (e) => { e.preventDefault(); doSearch(); });
  document.getElementById("search-btn").addEventListener("click", doSearch);
}

async function renderResults(query, push = true) {
  if (push) setAddress(`https://${SEARCH_HOST}/search?q=${encodeURIComponent(query)}`);
  content.className = "search-mode";
  content.innerHTML = searchHeaderHtml(query) + `<div class="results-list"><div class="results-header">Searching\u2026</div></div>`;
  wireSearchHeader();

  const res = await fetch(`/api/search?q=${encodeURIComponent(query)}`);
  const data = await res.json();
  const freeTerms = extractFreeTerms(query);
  const seconds = (0.18 + Math.random() * 0.3).toFixed(2);

  const list = document.querySelector(".results-list");
  if (!data.results.length) {
    list.innerHTML = `<div class="results-header">No results found for <b>${escapeHtml(query)}</b>.</div>`;
    return;
  }

  const rows = data.results.map((r) => {
    const domain = r.url.replace(/^https?:\/\//i, "").split("/")[0];
    return `
    <div class="result">
      <div class="r-top">
        ${faviconHtml(domain)}
        <div>
          <div class="r-sitename">${escapeHtml(SITE_NAMES[domain] || domain)}</div>
          <div class="r-url">${breadcrumb(r.url)}${r.filetype === "pdf" ? '<span class="r-filetype-tag">PDF</span>' : ""}</div>
        </div>
      </div>
      <a class="r-title" data-url="${escapeHtml(r.url)}">${escapeHtml(r.title)}</a>
      <div class="r-snippet">${highlightTerms(r.snippet, freeTerms)}</div>
    </div>`;
  }).join("");

  list.innerHTML = `
    <div class="results-header">About ${data.count} results (${seconds} seconds)</div>
    ${rows}`;

  list.querySelectorAll(".r-title").forEach((el) => {
    el.addEventListener("click", () => navigate(el.dataset.url));
  });
}

async function renderPageByUrl(url, push = true) {
  content.className = "";
  const resolveRes = await fetch(`/api/resolve?url=${encodeURIComponent(url)}`);
  const resolved = await resolveRes.json();
  if (!resolved.found) {
    if (push) setAddress(url);
    content.innerHTML = `<div class="not-found">This site can't be reached.</div>`;
    return;
  }
  if (resolved.filetype === "pdf") {
    // Real navigation to the actual PDF file being served
    window.location.href = `/files/${resolved.pdfFile}`;
    return;
  }
  const res = await fetch(`/api/page/${resolved.id}`);
  const data = await res.json();
  if (push) setAddress(data.url);
  content.innerHTML = `<div class="page-view">${data.content}</div>`;
}

function renderPortal(push = true) {
  content.className = "";
  if (push) setAddress(`https://${PORTAL_HOST}/login`);
  content.innerHTML = `
    <div class="portal-box">
      <h2>Employee Access Portal</h2>
      <p style="font-size:13px;color:#666;">Internal use only</p>
      <input id="emp-id" type="text" placeholder="Employee ID" autocomplete="off" />
      <input id="emp-pass" type="password" placeholder="Password" autocomplete="off" />
      <button id="login-btn">Log In</button>
      <div id="portal-msg" class="portal-msg"></div>
    </div>`;
  document.getElementById("login-btn").addEventListener("click", async () => {
    const employeeId = document.getElementById("emp-id").value;
    const password = document.getElementById("emp-pass").value;
    const res = await fetch("/api/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ employeeId, password }),
    });
    const data = await res.json();
    const msg = document.getElementById("portal-msg");
    if (data.success) {
      msg.className = "portal-msg success";
      msg.innerHTML = `${escapeHtml(data.message)}<div class="flag-box">${escapeHtml(data.flag)}</div>`;
    } else {
      msg.className = "portal-msg error";
      msg.textContent = data.message;
    }
  });
}

function navigate(rawUrl, push = true) {
  const norm = normalize(rawUrl);
  if (norm === "" || norm === "searchit://home".replace(/^https?:\/\//i, "")) {
    return renderHome(push);
  }
  if (norm.startsWith(SEARCH_HOST + "/search")) {
    const q = new URL(rawUrl.startsWith("http") ? rawUrl : "https://" + rawUrl).searchParams.get("q") || "";
    return renderResults(q, push);
  }
  if (norm.startsWith(PORTAL_HOST)) {
    return renderPortal(push);
  }
  return renderPageByUrl(rawUrl, push);
}

goBtn.addEventListener("click", () => {
  const val = addressBar.value.trim();
  if (val === "searchit://home") return renderHome();
  navigate(val);
});
addressBar.addEventListener("keydown", (e) => {
  if (e.key === "Enter") goBtn.click();
});
backBtn.addEventListener("click", () => {
  if (history.length > 1) {
    history.pop();
    const prev = history.pop();
    navigate(prev);
  } else {
    renderHome();
  }
});

renderHome(false);
setAddress("searchit://home");
