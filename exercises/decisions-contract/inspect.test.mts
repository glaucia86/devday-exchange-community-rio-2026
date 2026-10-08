import test from 'node:test';
import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const root = fileURLToPath(new URL('../../', import.meta.url));
const run = (name: string) => spawnSync(process.execPath, ['exercises/decisions-contract/inspect.mts', `exercises/decisions-contract/fixtures/${name}.json`], { cwd: root, encoding: 'utf8' });
test('complete fixture preserves fractional score and requires human confirmation', () => {
  const result = run('completo');
  assert.equal(result.status, 0, result.stderr);
  const value = JSON.parse(result.stdout);
  assert.equal(value.mode, 'fixture local; nenhuma API foi chamada');
  assert.deepEqual(value.questions, ['predicate:contexto', 'choice:equipe', 'score:impacto']);
  assert.equal(value.team, 'applications');
  assert.equal(value.score, 1.25);
  assert.equal(value.canCreateBeforeReview, false);
  assert.equal(value.canCreateAfterReview, true);
  assert.equal(value.ticketCreated, false);
});
test('insufficient context keeps ticket blocked even after review', () => {
  const result = run('incerto');
  assert.equal(result.status, 0, result.stderr);
  const value = JSON.parse(result.stdout);
  assert.equal(value.team, 'human');
  assert.equal(value.canCreateBeforeReview, false);
  assert.equal(value.canCreateAfterReview, false);
});
test('refused answer is rejected with a controlled error', () => {
  const result = run('recusado');
  assert.equal(result.status, 1);
  assert.match(result.stderr, /CONTRATO_REJEITADO/);
  assert.doesNotMatch(result.stderr, /at file:/);
});
test('unknown team is rejected instead of becoming a ticket', () => {
  const result = run('equipe-invalida');
  assert.equal(result.status, 1);
  assert.match(result.stderr, /CONTRATO_REJEITADO/);
});
test('missing file is diagnosed without being reported as a successful decision', () => {
  const result = run('arquivo-que-nao-existe');
  assert.equal(result.status, 1);
  assert.match(result.stderr, /ARQUIVO_INVALIDO/);
  assert.equal(result.stdout, '');
});
