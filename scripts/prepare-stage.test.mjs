import test from 'node:test';
import assert from 'node:assert/strict';
import { nodeSatisfies } from './prepare-stage.mjs';

test('aceita Node dentro da faixa 24.12.0 a 24.21.0', () => {
  assert.equal(nodeSatisfies('24.12.0'), true);
  assert.equal(nodeSatisfies('v24.12.0'), true);
  assert.equal(nodeSatisfies('24.19.0'), true);
  assert.equal(nodeSatisfies('24.21.0'), true);
  assert.equal(nodeSatisfies('v24.21.0'), true);
});

test('recusa Node anterior a 24.12.0', () => {
  assert.equal(nodeSatisfies('24.11.9'), false);
  assert.equal(nodeSatisfies('22.23.3'), false);
  assert.equal(nodeSatisfies('22.18.0'), false);
  assert.equal(nodeSatisfies('22.17.1'), false);
  assert.equal(nodeSatisfies('20.20.2'), false);
  assert.equal(nodeSatisfies('20.9.0'), false);
  assert.equal(nodeSatisfies('20.0.0'), false);
});

test('recusa Node posterior a 24.21.0', () => {
  assert.equal(nodeSatisfies('24.21.1'), false);
  assert.equal(nodeSatisfies('24.22.0'), false);
  assert.equal(nodeSatisfies('v25.0.0'), false);
  assert.equal(nodeSatisfies('26.0.0'), false);
});
