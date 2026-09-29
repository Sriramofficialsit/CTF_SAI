const http = require('node:http')
const fs = require('node:fs')
const path = require('node:path')

const PORT = Number(process.env.PORT) || 3000
const publicDir = path.join(__dirname, 'public')

const fragments = {
  '/products': { param: 'item', value: 'arc-01', shard: 'IODR{cl1ent_', title: 'Catalog preview cached', issue: 'The product preview endpoint trusts a client-supplied item reference.' },
  '/orders': { param: 'orderId', value: '1042', shard: 'r0utes_', title: 'Order receipt recovered', issue: 'The receipt lookup has no ownership check on its predictable order ID.' },
  '/account': { param: 'user', value: 'guest', shard: 'leak_t00_', title: 'Guest account context restored', issue: 'An account context is selected directly from a query parameter.' },
  '/support': { param: 'ticket', value: 'IODR-7', shard: 'much}', title: 'Support attachment indexed', issue: 'The attachment route exposes data for an enumerable ticket value.' }
}

function send(res, status, body, type = 'text/html; charset=utf-8') {
  res.writeHead(status, { 'Content-Type': type, 'X-Content-Type-Options': 'nosniff' })
  res.end(body)
}

function flagPage(entry) {
  return `<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>${entry.title} · IODR</title><link rel="stylesheet" href="/styles.css"></head><body class="dark-page"><header class="simple-header"><a class="brand" href="/">VULN<span>MARKET</span><i>™</i></a><span>IODR / route exercise</span></header><main class="shard-card"><p class="eyebrow">UNAUTHENTICATED RESOURCE RESPONSE</p><h1>${entry.title}</h1><p>${entry.issue}</p><div class="flag-shard"><span>Recovered fragment</span><code>${entry.shard}</code></div><a class="button" href="/">Return to storefront →</a></main></body></html>`
}

const server = http.createServer((req, res) => {
  const url = new URL(req.url, `http://${req.headers.host || 'localhost'}`)
  const challenge = fragments[url.pathname]
  if (challenge && url.searchParams.get(challenge.param) === challenge.value) return send(res, 200, flagPage(challenge))

  let file = url.pathname === '/' ? 'index.html' : url.pathname.slice(1)
  if (url.pathname === '/product') file = 'product.html'
  const safePath = path.normalize(path.join(publicDir, file))
  if (!safePath.startsWith(publicDir)) return send(res, 403, 'Forbidden', 'text/plain; charset=utf-8')

  fs.readFile(safePath, (error, data) => {
    if (error) return send(res, error.code === 'ENOENT' ? 404 : 500, error.code === 'ENOENT' ? 'Not found' : 'Server error', 'text/plain; charset=utf-8')
    const extension = path.extname(safePath)
    const type = extension === '.css' ? 'text/css; charset=utf-8' : extension === '.js' ? 'application/javascript; charset=utf-8' : 'text/html; charset=utf-8'
    send(res, 200, data, type)
  })
})

server.listen(PORT, () => console.log(`IODR Node HTML lab running at http://localhost:${PORT}`))
