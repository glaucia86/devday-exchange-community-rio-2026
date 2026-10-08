import test from 'node:test';
import assert from 'node:assert/strict';
import { mockDecision } from '../../apps/decisions/src/domain/service-desk.ts';

// Caracteriza o defeito atual da Alô, TI. A tarefa Cloud deve fazer este
// arquivo passar sem editá-lo. A CI espera a falha da correção da rede
// enquanto o produto ainda reutiliza o texto de serviço desconhecido.

test('relato incompleto continua pedindo esclarecimento', () => {
  const decision = mockDecision('ambiguous', false);
  assert.equal(decision.team, 'human');
  assert.equal(decision.source, 'mock');
  assert.match(decision.explanation, /qual serviço falhou/);
});

test('correção da rede não reaproveita o texto de serviço desconhecido', () => {
  const decision = mockDecision('network', true);
  assert.equal(decision.source, 'mock');
  assert.equal(decision.team, 'human');
  assert.match(decision.explanation, /voltou/);
  assert.doesNotMatch(decision.explanation, /qual serviço falhou/);
  for (const [name, value, max] of [
    ['probability', decision.probability, 1],
    ['confidence', decision.confidence, 1],
    ['score', decision.score, 2],
  ] as const) {
    assert.equal(Number.isFinite(value), true, name);
    assert.ok(value >= 0 && value <= max, name);
  }
});

test('a queda da rede, antes da correção, continua em infraestrutura', () => {
  const decision = mockDecision('network', false);
  assert.equal(decision.team, 'infrastructure');
  assert.match(decision.explanation, /Infraestrutura/);
});

test('o acesso sem correção continua em acessos', () => {
  assert.equal(mockDecision('access', false).team, 'access');
});
