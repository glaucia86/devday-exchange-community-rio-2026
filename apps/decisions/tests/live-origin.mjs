import assert from 'node:assert/strict';
import { spawn } from 'node:child_process';
import { once } from 'node:events';
import { existsSync } from 'node:fs';
import { request as httpRequest } from 'node:http';
import { createServer } from 'node:net';
import { fileURLToPath } from 'node:url';
import { test } from 'node:test';

const token = 'test-only-demo-access-token-not-a-real-secret';
const forbidden = 'A demonstração ao vivo aceita somente acesso local de mesma origem.';

function freePort() {
  return new Promise((resolve, reject) => {
    const server = createServer();
    server.listen(0, '127.0.0.1', () => {
      const address = server.address();
      const port = address && typeof address === 'object' ? address.port : 0;
      server.close(() => resolve(port));
    });
    server.on('error', reject);
  });
}

function post(port, { hostname = '127.0.0.1', host, origin }) {
  const body = JSON.stringify({ action: 'ping' });
  return new Promise((resolve, reject) => {
    const req = httpRequest({
      hostname, port, path: '/api/live', method: 'POST',
      headers: {
        Host: host,
        Origin: origin,
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
        'Content-Length': Buffer.byteLength(body),
      },
    }, (res) => {
      const chunks = [];
      res.on('data', (chunk) => chunks.push(chunk));
      res.on('end', () => resolve({ status: res.statusCode, body: Buffer.concat(chunks).toString() }));
    });
    req.on('error', reject);
    req.end(body);
  });
}

test('next start accepts 127.0.0.1 and localhost without weakening loopback checks', async (t) => {
  assert.equal(existsSync(new URL('../.next/BUILD_ID', import.meta.url)), true, 'rode npm run build antes deste teste');
  const port = await freePort();
  const child = spawn(process.execPath, ['node_modules/next/dist/bin/next', 'start', '--hostname', '127.0.0.1', '--port', String(port)], {
    cwd: fileURLToPath(new URL('..', import.meta.url)),
    env: {
      ...process.env,
      MESA_LIVE_ENABLED: 'true',
      OPENAI_API_KEY: 'test-only-fake-key',
      MESA_LIVE_ACCESS_TOKEN: token,
      NEXT_TELEMETRY_DISABLED: '1',
    },
    stdio: ['ignore', 'pipe', 'pipe'],
  });
  let logs = '';
  child.stdout.on('data', (chunk) => { logs += chunk; });
  child.stderr.on('data', (chunk) => { logs += chunk; });
  t.after(async () => {
    child.kill('SIGTERM');
    await Promise.race([once(child, 'exit'), new Promise((resolve) => setTimeout(resolve, 2000))]);
    if (child.exitCode === null) child.kill('SIGKILL');
  });

  const deadline = Date.now() + 30000;
  let ready = false;
  while (Date.now() < deadline) {
    try {
      const response = await fetch(`http://127.0.0.1:${port}/`);
      if (response.status < 500) { ready = true; break; }
    } catch { /* server still booting */ }
    await new Promise((resolve) => setTimeout(resolve, 200));
  }
  assert.equal(ready, true, logs);

  const loopback = await post(port, { host: `127.0.0.1:${port}`, origin: `http://127.0.0.1:${port}` });
  assert.equal(loopback.status, 400, loopback.body);
  assert.equal(loopback.body.includes(forbidden), false);

  const localhost = await post(port, { hostname: 'localhost', host: `localhost:${port}`, origin: `http://localhost:${port}` });
  assert.equal(localhost.status, 400, localhost.body);
  assert.equal(localhost.body.includes(forbidden), false);

  const mixed = await post(port, { host: `127.0.0.1:${port}`, origin: `http://localhost:${port}` });
  assert.equal(mixed.status, 403);
  assert.equal(mixed.body.includes(forbidden), true);

  const publicHost = await post(port, { host: `public.example:${port}`, origin: `http://public.example:${port}` });
  assert.equal(publicHost.status, 403);
  assert.equal(publicHost.body.includes(forbidden), true);
});
