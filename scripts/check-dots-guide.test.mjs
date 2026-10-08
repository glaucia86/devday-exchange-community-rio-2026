import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

const read = (path) => readFile(path, 'utf8');

function section(text, start, end) {
  const from = text.indexOf(start);
  assert.notEqual(from, -1, start);
  const to = text.indexOf(end, from + start.length);
  assert.notEqual(to, -1, end);
  return text.slice(from, to);
}

test('o cenário de Dots vigia as páginas públicas deste repositório', async () => {
  const cenario = await read('labs/01-dots/cenario.md');
  assert.match(cenario, /https:\/\/github\.com\/glaucia86\/devday-exchange-community-rio-2026\/issues/);
  assert.match(cenario, /https:\/\/github\.com\/glaucia86\/devday-exchange-community-rio-2026\/pulls/);
  assert.match(cenario, /responsabilidade contínua/);
  assert.match(cenario, /o que mudou/);
  assert.match(cenario, /id="exemplo-de-revisao"/);
  assert.doesNotMatch(cenario, /Aurora/);
  assert.doesNotMatch(cenario, /A-10[123]/);
});

test('o LAB ensina a criar, achar, esperar e não reutilizar histórico', async () => {
  const lab = await read('labs/01-dots/README.md');
  assert.match(lab, /Passo a passo/);
  assert.match(lab, /Leve para casa/);
  assert.match(lab, /https:\/\/learn\.chatgpt\.com\/docs\/dots\/getting-started/);
  assert.match(lab, /https:\/\/learn\.chatgpt\.com\/docs\/dots\/tasks-and-memory/);
  assert.match(lab, /https:\/\/learn\.chatgpt\.com\/docs\/dots\/controls/);
  assert.match(lab, /https:\/\/chatgpt\.com\/dots\//);
  assert.match(lab, /New chat/);
  assert.match(lab, /20 a 45 segundos/);
  assert.match(lab, /8 de outubro de 2026/);
  assert.match(lab, /rótulos podem variar/);
  assert.match(lab, /Delete/);
  assert.match(lab, /histórico/i);
  assert.match(lab, /ainda não foi ensaiad/);
  assert.doesNotMatch(lab, /procure dots/i);
  assert.doesNotMatch(lab, /botão de enviar/i);
  assert.doesNotMatch(lab, /nunca foi ensaiado/i);
  assert.doesNotMatch(lab, /empresa fictícia Aurora/);
});

test('o palco de Dots cabe em 2–3 minutos, com estado preparado, ao vivo e plano B', async () => {
  const guia = await read('docs/guia-apresentadora.md');
  const dots = section(guia, '## Dots\n', '## Codex CLI');
  assert.match(dots, /2–3 minutos/);
  assert.match(dots, /Estado preparado/);
  assert.match(dots, /Ao vivo/);
  assert.match(dots, /Plano B · relatório preparado/);
  assert.match(dots, /20 a 45 segundos/);
  assert.match(dots, /8 de outubro de 2026/);
  assert.match(dots, /chatgpt\.com\/dots\//);
  assert.match(dots, /New chat/);
  assert.match(dots, /não libera este bloco/);
  assert.match(dots, /Leve para casa/);
  assert.doesNotMatch(dots, /6–8 minutos/);
  assert.doesNotMatch(dots, /A-102/);
  assert.doesNotMatch(dots, /Aurora/);
  assert.doesNotMatch(dots, /botão de enviar/i);
  assert.match(guia, /## Codex CLI/);
  assert.match(guia, /## Codex Cloud/);
});

test('o roteiro não libera Dots com o ensaio do cenário antigo', async () => {
  const roteiro = await read('docs/roteiro-de-palco.md');
  const row = roteiro.split('\n').find((line) => line.startsWith('| **Dots**'));
  assert.ok(row, 'linha de Dots ausente');
  assert.match(row, /Plano B · relatório preparado/);
  assert.match(row, /8 de outubro de 2026/);
  assert.match(row, /não libera este bloco/);
  assert.match(row, /chatgpt\.com\/dots\//);
  assert.doesNotMatch(row, /A-102/);
  assert.match(roteiro, /codex-cli 0\.161\.0/);
});

test('a validação registra o ensaio único e o cenário novo sem ensaio', async () => {
  const validacao = await read('docs/validacao.md');
  const readme = await read('README.md');
  for (const text of [validacao, readme]) {
    assert.match(text, /Cenário antigo executado uma vez em 8 de outubro de 2026/);
    assert.match(text, /o cenário novo ainda não foi ensaiado/);
    assert.doesNotMatch(text, /\| Dots, Codex CLI e Codex Cloud \| Guias disponíveis; ensaio dos fluxos reais pendente \|/);
    assert.doesNotMatch(text, /\| Dots \/ Codex CLI \/ Codex Cloud \| Guias disponíveis; fluxos nos produtos ainda não ensaiados \|/);
  }
  assert.match(validacao, /id="dots-ensaio-2026-10-08"/);
  assert.match(validacao, /ainda não foi ensaiado/);
  assert.match(readme, /scripts\/check-dots-guide\.test\.mjs/);
});
