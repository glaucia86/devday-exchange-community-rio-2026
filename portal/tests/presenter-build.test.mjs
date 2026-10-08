import test from 'node:test';
import assert from 'node:assert/strict';
import { readdir, readFile } from 'node:fs/promises';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';

const dist = fileURLToPath(new URL('../dist/', import.meta.url));

test('shell estático não inclui notas, habilitação ou indexação da área privada', async () => {
  const html = await readFile(join(dist, 'apresentadora/index.html'), 'utf8');
  assert.match(html, /Área da apresentadora/);
  assert.match(html, /Configuração pendente/);
  assert.match(html, /name="robots"[^>]*content="noindex, nofollow"/);
  assert.match(html, /data-pagefind-ignore/);
  assert.match(html, /<button[^>]*data-login[^>]*disabled/);
  assert.match(html, /<form[^>]*data-editor[^>]*hidden/);
  assert.match(html, /<textarea\b[^>]*>\s*<\/textarea>/);
  assert.doesNotMatch(html, /contenteditable|type="password"/);
});

test('fixture, notas sintéticas e tokens de teste não entram nos artefatos publicados', async () => {
  const forbidden = [
    'Nota sintética da fixture.', 'Roteiro fictício de teste.',
    'FAKE_RAW_TOKEN', 'FAKE_RAW_CREDENTIAL', 'FAKE_CREDENTIAL',
    'window.fixture', 'test-presenter-owner',
  ];
  async function walk(directory) {
    for (const entry of await readdir(directory, { withFileTypes: true })) {
      const path = join(directory, entry.name);
      if (entry.isDirectory()) await walk(path);
      else {
        const bytes = await readFile(path);
        for (const value of forbidden) assert.equal(bytes.includes(Buffer.from(value)), false, `Conteúdo de teste não pode estar em ${path}`);
      }
    }
  }
  await walk(dist);
});
