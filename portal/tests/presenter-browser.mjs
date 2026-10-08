import assert from 'node:assert/strict';
import { createServer } from 'node:http';
import { readFile } from 'node:fs/promises';
import { chromium } from 'playwright';

// This standalone fixture is never imported by the production build.
// It uses only synthetic data and refuses every non-loopback request.
const html = `<!doctype html><html lang="pt-BR"><meta charset="utf-8"><meta name="viewport" content="width=device-width">
<title>Fixture de teste da apresentadora</title><body>
<main><h1>Fixture: área da apresentadora</h1>
<section data-presenter-root>
<p data-config-note>Aguardando configuração.</p>
<div data-login-region><button type="button" data-login disabled>Entrar com GitHub</button></div>
<p data-status role="status" aria-live="polite" tabindex="-1">Aguardando configuração.</p>
<p data-error role="alert" hidden></p>
<form data-editor hidden autocomplete="off">
<label for="presenter-notes">Anotações privadas</label>
<p id="presenter-note-help">Texto fictício de teste.</p>
<textarea id="presenter-notes" data-content maxlength="16000" aria-describedby="presenter-note-help presenter-note-count"></textarea>
<p id="presenter-note-count" data-counter></p><button type="submit" data-save disabled>Salvar notas</button>
</form><button type="button" data-logout hidden>Sair e limpar esta tela</button>
</section></main>
<script type="module">
import { mountPresenter } from '/src/presenter/view.mjs';
const mode = new URL(location.href).searchParams.get('mode');
const OWNER = { uid: 'test-presenter-owner', signInProvider: 'github.com' };
let emit = async () => {};
let resolveRead;
const calls = { saves: 0, reads: 0, logins: 0 };
const gateway = {
  subscribeAuth(next) { emit = next; return () => {}; },
  async signIn() {
    calls.logins++;
    if (mode === 'popup') throw { code: 'auth/popup-blocked', credential: 'FAKE_RAW_CREDENTIAL' };
    await emit(mode === 'denied' ? { uid: 'test-other', signInProvider: 'github.com' } : OWNER);
  },
  async signOut() { await emit(null); },
  async loadNote() {
    calls.reads++;
    if (mode === 'slow') return new Promise((resolve) => { resolveRead = resolve; });
    if (mode === 'load-error') throw { code: 'unavailable' };
    return { content: 'Nota sintética da fixture.' };
  },
  async saveNote() {
    calls.saves++;
    if (mode === 'save-error') throw { code: 'unavailable' };
  },
  async dispose() {},
};
const mounted = mountPresenter(document.querySelector('[data-presenter-root]'), {
  config: { enabled: mode !== 'disabled', presenterUid: 'test-presenter-owner' }, gateway,
});
window.fixture = { calls, emit, finishRead: () => resolveRead?.({ content: 'Resposta fictícia atrasada' }), mounted };
window.fixtureReady = true;
</script></body></html>`;

const allowedFiles = new Map([
  ['/src/presenter/view.mjs', new URL('../src/presenter/view.mjs', import.meta.url)],
  ['/src/presenter/controller.mjs', new URL('../src/presenter/controller.mjs', import.meta.url)],
]);
const server = createServer(async (request, response) => {
  const path = new URL(request.url, 'http://127.0.0.1').pathname;
  response.setHeader('Cache-Control', 'no-store');
  if (path === '/') { response.setHeader('Content-Type', 'text/html; charset=utf-8'); response.end(html); return; }
  if (!allowedFiles.has(path)) { response.writeHead(404); response.end(); return; }
  try {
    response.setHeader('Content-Type', 'application/javascript');
    response.end(await readFile(allowedFiles.get(path)));
  } catch { response.writeHead(500); response.end(); }
});
await new Promise((resolve) => server.listen(0, '127.0.0.1', resolve));
const origin = `http://127.0.0.1:${server.address().port}`;
let browser;
try {
  browser = await chromium.launch();
  const scenario = async (name, mode, run) => {
    const context = await browser.newContext({ viewport: { width: 390, height: 844 } });
    const externalRequests = [];
    await context.route('**/*', (route) => {
      if (new URL(route.request().url()).origin !== origin) { externalRequests.push(route.request().url()); return route.abort(); }
      return route.continue();
    });
    const page = await context.newPage();
    page.setDefaultTimeout(8000);
    await page.goto(`${origin}/?mode=${mode}`);
    await page.waitForFunction(() => window.fixtureReady === true);
    try {
      await run(page);
      assert.equal(externalRequests.length, 0, 'Fixture não deve tentar chamadas externas.');
      console.log(`PASS presenter fixture: ${name}`);
    } finally { await context.close(); }
  };
  await scenario('configuração pronta habilita login', '', async (page) => {
    assert.equal(await page.locator('[data-login]').isEnabled(), true);
    assert.equal(await page.locator('[data-editor]').isVisible(), false);
    assert.equal(await page.evaluate(() => window.fixture.calls.reads), 0);
  });
  await scenario('configuração ausente bloqueia login', 'disabled', async (page) => {
    assert.equal(await page.locator('[data-login]').isDisabled(), true);
    assert.equal(await page.locator('[data-config-note]').isVisible(), true);
    assert.equal(await page.locator('[data-editor]').isVisible(), false);
  });
  await scenario('login, teclado, edição e salvamento explícito', '', async (page) => {
    await page.locator('[data-login]').focus();
    await page.keyboard.press('Enter');
    await page.locator('[data-editor]').waitFor({ state: 'visible' });
    assert.equal(await page.locator('[data-content]').evaluate((el) => el === document.activeElement), true);
    await page.locator('[data-content]').fill('Edição fictícia feita no teste.');
    assert.equal(await page.evaluate(() => window.fixture.calls.saves), 0);
    assert.equal(await page.locator('[data-save]').isEnabled(), true);
    await page.locator('[data-save]').click();
    await page.waitForFunction(() => window.fixture.calls.saves === 1);
    await page.waitForFunction(() => document.querySelector('[data-status]').textContent.includes('salvas'));
    assert.equal(await page.locator('[data-save]').isDisabled(), true);
    await page.locator('[data-logout]').click();
    assert.equal(await page.locator('[data-content]').inputValue(), '');
    assert.equal(await page.locator('[data-editor]').isVisible(), false);
    assert.equal(await page.locator('[data-login]').evaluate((el) => el === document.activeElement), true);
  });
  await scenario('conta não proprietária nunca abre editor', 'denied', async (page) => {
    await page.locator('[data-login]').click();
    await page.locator('[data-error]').waitFor({ state: 'visible' });
    assert.equal(await page.locator('[data-editor]').isVisible(), false);
    assert.equal(await page.evaluate(() => window.fixture.calls.reads), 0);
  });
  await scenario('popup bloqueado tem mensagem sem credencial', 'popup', async (page) => {
    await page.locator('[data-login]').click();
    await page.locator('[data-error]').waitFor({ state: 'visible' });
    assert.match(await page.locator('[data-error]').innerText(), /popup|janela/i);
    assert.doesNotMatch(await page.locator('body').innerText(), /FAKE_RAW_CREDENTIAL/);
  });
  await scenario('falha de leitura não abre editor vazio gravável', 'load-error', async (page) => {
    await page.locator('[data-login]').click();
    await page.locator('[data-error]').waitFor({ state: 'visible' });
    assert.equal(await page.locator('[data-editor]').isVisible(), false);
    assert.equal(await page.evaluate(() => window.fixture.calls.saves), 0);
  });
  await scenario('erro de escrita preserva rascunho', 'save-error', async (page) => {
    await page.locator('[data-login]').click();
    await page.locator('[data-content]').fill('Rascunho fictício preservado.');
    await page.locator('[data-save]').click();
    await page.locator('[data-error]').waitFor({ state: 'visible' });
    assert.equal(await page.locator('[data-content]').inputValue(), 'Rascunho fictício preservado.');
    assert.equal(await page.locator('[data-save]').isEnabled(), true);
  });
  await scenario('leitura atrasada é descartada ao sair', 'slow', async (page) => {
    await page.locator('[data-login]').click();
    await page.waitForFunction(() => window.fixture.calls.reads === 1);
    await page.locator('[data-logout]').click();
    await page.evaluate(() => window.fixture.finishRead());
    assert.equal(await page.locator('[data-content]').inputValue(), '');
    assert.equal(await page.locator('[data-editor]').isVisible(), false);
  });
  await scenario('texto HTML continua texto no editor', '', async (page) => {
    await page.locator('[data-login]').click();
    await page.locator('[data-content]').fill('<img src=x onerror="window.fixtureInjection=true">');
    assert.equal(await page.locator('[data-presenter-root] img').count(), 0);
    assert.equal(await page.evaluate(() => window.fixtureInjection), undefined);
    assert.equal(await page.evaluate(() => localStorage.length + sessionStorage.length), 0);
  });
  await scenario('recarregar encerra estado apenas em memória', '', async (page) => {
    await page.locator('[data-login]').click();
    await page.locator('[data-editor]').waitFor({ state: 'visible' });
    await page.reload();
    await page.waitForFunction(() => window.fixtureReady === true);
    assert.equal(await page.locator('[data-content]').inputValue(), '');
    assert.equal(await page.locator('[data-editor]').isVisible(), false);
    assert.equal(await page.evaluate(() => window.fixture.calls.reads), 0);
  });
} finally {
  await browser?.close();
  await new Promise((resolve) => server.close(resolve));
}
