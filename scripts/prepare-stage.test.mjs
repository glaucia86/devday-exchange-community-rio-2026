import test from 'node:test';
import assert from 'node:assert/strict';
import { nodeSatisfies } from './prepare-stage.mjs';

test('aceita Node 24.21.0 e posteriores', () => {
  assert.equal(nodeSatisfies('24.21.0'), true);
  assert.equal(nodeSatisfies('v24.21.0'), true);
  assert.equal(nodeSatisfies('24.21.1'), true);
  assert.equal(nodeSatisfies('24.22.0'), true);
  assert.equal(nodeSatisfies('25.0.0'), true);
});

test('recusa Node anterior a 24.21.0', () => {
  assert.equal(nodeSatisfies('24.20.9'), false);
  assert.equal(nodeSatisfies('22.18.0'), false);
  assert.equal(nodeSatisfies('22.14.0'), false);
  assert.equal(nodeSatisfies('20.19.0'), false);
});
