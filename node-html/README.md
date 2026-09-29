# IODR Node + HTML lab

This is the plain Node.js/HTML version of the storefront. It uses no React and no external npm packages.

## Run

```bash
cd node-html
node server.js
```

Open `http://localhost:3000`.

## CTF flow

Open `/product?sku=arc-01`, then follow the inventory preview clue. The flag is split across these real Node server responses:

1. `/products?item=arc-01`
2. `/orders?orderId=1042`
3. `/account?user=guest`
4. `/support?ticket=IODR-7`

This is intentionally vulnerable training code. Keep it local and do not deploy it or connect it to real services/data.
