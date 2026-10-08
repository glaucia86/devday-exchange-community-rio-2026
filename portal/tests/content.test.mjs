import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdtemp, cp, readFile, writeFile, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { resolve } from 'node:path';
import { loadPortalContent, rewriteLink } from '../scripts/content.mjs';

const repoRoot = resolve(import.meta.dirname, '../..');
const basePath = '/devday-exchange-community-rio-2026/';
const manifest = [
  { route: 'labs/dots/', sourcePath: 'labs/01-dots/README.md' },
  { route: 'labs/dots/cenario/', sourcePath: 'labs/01-dots/cenario.md' },
  { route: 'prepare-se/', sourcePath: 'README.md', sections: ['preparacao', 'validar', 'checklist'] },
];
test('routes relative documents and root sections with the project base', () => {
  assert.equal(rewriteLink('cenario.md#relatos', 'labs/01-dots/README.md', manifest, basePath), basePath + 'labs/dots/cenario/#relatos');
  assert.equal(rewriteLink('../../README.md#preparacao', 'labs/01-dots/README.md', manifest, basePath), basePath + 'prepare-se/#preparacao');
  assert.equal(rewriteLink('../../README.md', 'labs/01-dots/README.md', manifest, basePath), basePath);
});
test('preserves external links and routes source files to GitHub', () => {
  assert.equal(rewriteLink('https://example.org/a?q=1#x', 'README.md', manifest, basePath), 'https://example.org/a?q=1#x');
  assert.equal(rewriteLink('../../apps/decisions/src/domain/service-desk.ts', 'labs/01-dots/README.md', manifest, basePath), 'https://github.com/glaucia86/devday-exchange-community-rio-2026/blob/main/apps/decisions/src/domain/service-desk.ts');
  assert.equal(rewriteLink('../../exercises/ticket-router/', 'labs/01-dots/README.md', manifest, basePath), 'https://github.com/glaucia86/devday-exchange-community-rio-2026/tree/main/exercises/ticket-router/');
});
test('rejects unsafe protocols and repository escapes', () => {
  assert.throws(() => rewriteLink('javascript:alert(1)', 'README.md', manifest, basePath));
  assert.throws(() => rewriteLink('../../../private.md', 'labs/01-dots/README.md', manifest, basePath));
});
test('loads four independent labs and the complete material map', async () => {
  const { pages, home } = await loadPortalContent({ repoRoot, basePath });
  assert.deepEqual(home.labs.map(l => l.title), ['Dots', 'Codex CLI', 'Codex Cloud', 'Decisions API']);
  assert.equal(home.labs.length, 4);
  for (const route of ['prepare-se/', 'labs/dots/', 'labs/dots/cenario/', 'labs/codex-cli/', 'labs/codex-cloud/', 'labs/decisions/', 'alo-ti/', 'materiais/programacao/', 'materiais/referencias/', 'materiais/validacao/', 'materiais/guia-apresentadora/', 'materiais/integracao-live/', 'exercicio/']) {
    assert.ok(pages.some(p => p.route === route), route);
  }
  assert.equal(home.author.name, 'Glaucia Lemos');
  assert.match(home.author.photo, /^https:\/\/avatars\.githubusercontent\.com\//);
  assert.ok(home.author.socials.some(s => s.label === 'LinkedIn'));
  assert.match(home.event.details, /24 de outubro de 2026/);
  assert.match(home.event.details, /09h00 às 14h30/);
  const prep = pages.find(p => p.route === 'prepare-se/');
  assert.match(prep.markdown, /id="preparacao"/);
  assert.match(prep.markdown, /npm --version/);
  assert.match(prep.markdown, /<details>/);
  assert.match(prep.markdown, /<details>[\s\S]*npm\.cmd[\s\S]*<\/details>/);
  assert.ok(pages.every(p => p.sourcePath && p.title && p.markdown));
});
test('source changes are reflected and required sections cannot silently disappear', async () => {
  const folder = await mkdtemp(resolve(tmpdir(), 'devday-content-'));
  try {
    for (const path of ['README.md', 'labs', 'docs', 'apps/decisions/README.md', 'exercises/ticket-router']) {
      await cp(resolve(repoRoot, path), resolve(folder, path), { recursive: true });
    }
    const source = resolve(folder, 'labs/01-dots/README.md');
    await writeFile(source, (await readFile(source, 'utf8')).replace('Transformar uma intenção', 'Alteração canônica comprovada: transformar uma intenção'));
    const output = await loadPortalContent({ repoRoot: folder, basePath });
    assert.match(output.pages.find(p => p.route === 'labs/dots/').markdown, /Alteração canônica comprovada/);
    const readme = resolve(folder, 'README.md');
    await writeFile(readme, (await readFile(readme, 'utf8')).replace('<a id="preparacao"></a>', ''));
    await assert.rejects(loadPortalContent({ repoRoot: folder, basePath }), /preparacao/);
  } finally { await rm(folder, { recursive: true, force: true }); }
});
test('local demo starts with the canonical clone instructions', async () => {
  const {pages}=await loadPortalContent({repoRoot,basePath});
  const guide=pages.find(p=>p.route==='alo-ti/');
  assert.match(guide.markdown,/git clone --branch main/);
  assert.match(guide.markdown,/cd devday-exchange-community-rio-2026/);
  assert.equal(guide.sourcePath,'README.md');
  assert.ok(pages.some(p=>p.route==='alo-ti/referencia/'&&p.sourcePath==='apps/decisions/README.md'));
});
test('the consumer workflow covers the application README source', async () => {
  const workflow=await readFile(resolve(repoRoot,'.github/workflows/check-portal.yml'),'utf8');
  const paths=workflow.match(/paths:\s*\[([^\n]+)\]/)?.[1]??'';
  assert.match(paths,/'apps\/decisions\/README\.md'/);
});
test('the home demo overview follows its canonical Markdown', async () => {
  const {home}=await loadPortalContent({repoRoot,basePath});
  assert.match(home.local.description,/service desk fictício/);
  assert.match(home.local.notice,/fixtures e estado em memória/);
  assert.equal(home.local.steps.length,5);
  assert.match(home.local.steps.join(' '),/revisão humana/);
});
