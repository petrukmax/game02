// Minimal static server for the prototype. No dependencies.
// Usage: node server.cjs [port]
const http = require('http');
const fs = require('fs');
const path = require('path');

const root = path.resolve(__dirname);
const port = Number(process.argv[2] || process.env.PORT || 8124);
const types = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.png': 'image/png',
  '.webp': 'image/webp',
};

http
  .createServer((req, res) => {
    let pathname = '/';
    try {
      pathname = decodeURIComponent((req.url || '/').split('?')[0]);
    } catch {
      res.writeHead(400);
      res.end('bad request');
      return;
    }
    if (pathname === '/') pathname = '/index.html';
    const file = path.resolve(root, `.${pathname}`);
    if (file !== root && !file.startsWith(root + path.sep)) {
      res.writeHead(403);
      res.end('forbidden');
      return;
    }
    fs.readFile(file, (error, data) => {
      if (error) {
        res.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' });
        res.end('not found');
        return;
      }
      res.writeHead(200, {
        'Content-Type': types[path.extname(file).toLowerCase()] || 'application/octet-stream',
        'Cache-Control': 'no-cache',
      });
      res.end(data);
    });
  })
  .listen(port, '127.0.0.1', () => {
    console.log(`Ashen Crown: http://127.0.0.1:${port}/`);
  });
