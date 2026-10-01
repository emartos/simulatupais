import { createServer } from 'node:http';
import { readFile, stat } from 'node:fs/promises';
import { resolve, extname, sep } from 'node:path';
import { brotliCompressSync, constants as zlibConstants, gzipSync } from 'node:zlib';
const root = resolve('dist');
const port = Number(process.env.PORT || 5173);
const host = process.env.HOST || '127.0.0.1';
const mime = { '.html':'text/html; charset=utf-8', '.js':'text/javascript; charset=utf-8', '.css':'text/css; charset=utf-8', '.json':'application/json; charset=utf-8', '.svg':'image/svg+xml', '.map':'application/json' };
const compressible = new Set(['.html','.js','.css','.json','.svg']);
const server = createServer(async (req,res) => {
  if (req.method !== 'GET' && req.method !== 'HEAD') { res.writeHead(405); return res.end(); }
  try {
    const url = new URL(req.url || '/', 'http://localhost');
    const path = resolve(root, '.' + decodeURIComponent(url.pathname === '/' ? '/index.html' : url.pathname));
    if (path !== root && !path.startsWith(root + sep)) { res.writeHead(403); return res.end(); }
    const info = await stat(path);
    if (!info.isFile()) { res.writeHead(404); return res.end(); }
    const headers = {
      'Content-Type': mime[extname(path)] || 'application/octet-stream',
      'Cache-Control': 'no-cache', 'X-Content-Type-Options': 'nosniff',
      'Referrer-Policy':'no-referrer',
      'Content-Security-Policy': "default-src 'self'; script-src 'self'; worker-src 'self'; style-src 'self' 'unsafe-inline'; img-src 'self' data:; connect-src 'self'; object-src 'none'; base-uri 'self'; frame-ancestors 'none'"
    };
    const body = await readFile(path);
    const encoding = req.headers['accept-encoding'] || '';
    let responseBody = body;
    if (compressible.has(extname(path)) && /\bbr\b/.test(encoding)) {
      responseBody = brotliCompressSync(body, { params: { [zlibConstants.BROTLI_PARAM_QUALITY]: 4 } });
      headers['Content-Encoding'] = 'br';
      headers.Vary = 'Accept-Encoding';
    } else if (compressible.has(extname(path)) && /\bgzip\b/.test(encoding)) {
      responseBody = gzipSync(body);
      headers['Content-Encoding'] = 'gzip';
      headers.Vary = 'Accept-Encoding';
    }
    headers['Content-Length'] = String(responseBody.length);
    res.writeHead(200, headers);
    res.end(req.method === 'HEAD' ? undefined : responseBody);
  } catch { res.writeHead(404); res.end('No encontrado'); }
});
server.on('error', e => { console.error(e.message); process.exit(1); });
server.listen(port, host, () => console.log(`Simula tu país: http://${host}:${server.address().port}\nCtrl+C para detener. Sin API, usuarios ni servicios externos.`));
