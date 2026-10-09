import { chromium } from 'playwright';
import assert from 'node:assert/strict';
import { test, before, after } from 'node:test';

const baseURL = process.env.TRIAGE_BASE_URL ?? 'http://127.0.0.1:3000';
let browser;
before(async () => {
  browser = await chromium.launch(process.env.CHROMIUM_PATH ? { executablePath: process.env.CHROMIUM_PATH } : {});
});
after(async () => { await browser?.close(); });

async function fixture(t) {
  const context = await browser.newContext({ serviceWorkers: 'block', viewport: { width: 1440, height: 1000 } });
  t.after(() => context.close());
  const page = await context.newPage();
  const errors = [];
  page.on('pageerror', error => errors.push(error.message));
  t.after(() => assert.deepEqual(errors, [], 'no uncaught application errors'));
  await context.addInitScript(() => {
    window.__triage = { channels: [], stopped: 0, playCalls: 0, blockPlay: false, ignoreAbort: false, settled: 0 };
    const fixture = window.__triage;
    Object.defineProperty(navigator.mediaDevices, 'getUserMedia', { configurable: true, value: async () => {
      const track = { enabled: true, stop() { fixture.stopped++; } };
      return { getTracks: () => [track], getAudioTracks: () => [track] };
    } });
    window.AudioContext = class {
      state = 'running';
      async resume() {}
      async close() { this.state = 'closed'; }
    };
    Object.defineProperty(HTMLMediaElement.prototype, 'play', { configurable: true, value: async function () {
      fixture.playCalls++;
      if (fixture.blockPlay) throw new DOMException('Fixture blocks autoplay', 'NotAllowedError');
    } });
    Object.defineProperty(HTMLMediaElement.prototype, 'pause', { configurable: true, value() {} });
    window.RTCPeerConnection = class {
      iceGatheringState = 'complete';
      connectionState = 'connected';
      localDescription = null;
      createDataChannel() {
        const channel = { readyState: 'open', sent: [], send(data) { this.sent.push(JSON.parse(data)); }, close() { this.readyState = 'closed'; this.onclose?.(); } };
        fixture.channels.push(channel);
        this.channel = channel;
        return channel;
      }
      addTrack() {}
      async createOffer() { return { type: 'offer', sdp: 'v=0\r\nfixture-offer' }; }
      async setLocalDescription(value) { this.localDescription = value; }
      async setRemoteDescription() {
        this.ontrack?.({ streams: [new MediaStream()] });
        this.channel.onmessage?.({ data: JSON.stringify({ type: 'session.started' }) });
      }
      close() { this.connectionState = 'closed'; }
    };
    // Optional hostile transport: cancellation may not stop an already delivered response.
    const nativeFetch = window.fetch.bind(window);
    window.fetch = async (url, options) => {
      const deciding = options?.body && JSON.parse(options.body).action === 'decide';
      try { return await nativeFetch(url, deciding && fixture.ignoreAbort ? { ...options, signal: undefined } : options); }
      finally { if (deciding) fixture.settled++; }
    };
    window.__emitTriage = (event, index = fixture.channels.length - 1) => fixture.channels[index].onmessage?.({ data: JSON.stringify(event) });
  });
  const calls = [];
  const decisions = [];
  let starts = 0;
  await context.route('**/*', async route => {
    const request = route.request();
    const url = new URL(request.url());
    if (url.origin !== new URL(baseURL).origin) return route.abort('blockedbyclient');
    if (url.pathname !== '/api/live') return url.pathname.startsWith('/api/') ? route.abort('blockedbyclient') : route.continue();
    if (request.method() === 'GET') return route.fulfill({ json: { enabled: true } });
    const body = request.postDataJSON();
    calls.push(body);
    if (body.action === 'start') return route.fulfill({ json: { sessionId: `fixture_${++starts}`, sdp: 'v=0\r\nfixture-answer' } });
    if (body.action === 'close') return route.fulfill({ json: { confirmed: true } });
    assert.equal(body.action, 'decide');
    const response = await new Promise(resolve => decisions.push({ body, resolve }));
    try { await route.fulfill(response); } catch { /* A canceled browser request may no longer accept its fixture response. */ }
  });
  await page.goto(baseURL + '/triagem');
  await page.getByLabel('Código de acesso da demo local').fill('test-only-browser-access-code-not-a-secret');
  await page.getByLabel('Entendi o envio de áudio e texto').check();
  const start = async () => {
    await page.getByRole('button', { name: /Iniciar triagem ao vivo|Retomar triagem/ }).click();
    await page.getByRole('button', { name: 'Pausar', exact: true }).waitFor();
  };
  await start();
  const emit = event => page.evaluate(event => window.__emitTriage(event), event);
  const hear = delta => emit({ type: 'session.input_transcript.delta', delta });
  const delegate = id => emit({ type: 'session.delegation.created', delegation: { id } });
  const waitDecision = async index => {
    // Wait for the actual transport boundary, not a fixed response delay.
    const deadline = Date.now() + 5000;
    while (!decisions[index] && Date.now() < deadline) await new Promise(resolve => setTimeout(resolve, 10));
    assert.ok(decisions[index], 'the classification request reached the fixture');
    return decisions[index];
  };
  const complete = (index, status = 200) => decisions[index].resolve(status === 200 ? {
    json: { sessionId: decisions[index].body.sessionId, revision: decisions[index].body.revision, result: { source: 'openai', team: 'infrastructure', probability: .95, confidence: .9, score: 1.2, explanation: 'Dados fictícios.' } }
  } : { status, json: { error: status === 429 ? 'Limite fictício.' : 'Falha fictícia.' } });
  const flush = () => page.evaluate(() => new Promise(resolve => requestAnimationFrame(() => requestAnimationFrame(resolve))));
  return { page, calls, decisions, start, emit, hear, delegate, waitDecision, complete, flush };
}

for (const status of [200, 429]) {
  test(`classification ${status} preserves speech arriving after the captured report`, async t => {
    const f = await fixture(t);
    await f.hear('A VPN caiu. Registra.');
    await f.delegate('report_a');
    const request = await f.waitDecision(0);
    assert.equal(request.body.text, 'A VPN caiu');
    await f.hear(' O portal mostra erro 500.');
    f.complete(0, status);
    if (status === 200) await f.page.locator('#board .tri-card').waitFor();
    else await f.page.getByRole('region', { name: 'Fila aguardando classificação' }).waitFor();
    assert.match(await f.page.getByRole('region', { name: 'Legenda ao vivo' }).innerText(), /O portal mostra erro 500\./);
    const report = status === 200 ? f.page.locator('#board .tri-card p') : f.page.locator('.tri-queue li');
    assert.equal(await report.innerText(), 'A VPN caiu');
  });
}
