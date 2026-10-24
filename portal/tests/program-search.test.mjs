import test from 'node:test';
import assert from 'node:assert/strict';
import { matchesProgram } from '../src/home/program-search.mjs';

test('finds a demo by title regardless of case and surrounding spaces', () => {
  assert.equal(matchesProgram('Codex CLI', 'Glaucia Lemos', '  CODEX cli  '), true);
  assert.equal(matchesProgram('Dots', 'Glaucia Lemos', 'Codex'), false);
});

test('finds a presenter and accepts searches without accents', () => {
  assert.equal(matchesProgram('Demonstração', 'Glaucia Lemos', 'demonstracao'), true);
  assert.equal(matchesProgram('Codex CLI', 'Glaucia Lemos', 'glaucia'), true);
});

test('empty searches restore every demo and unknown queries match nothing', () => {
  assert.equal(matchesProgram('Dots', 'Glaucia Lemos', '   '), true);
  assert.equal(matchesProgram('Dots', 'Glaucia Lemos', 'zzzz-inexistente'), false);
});
