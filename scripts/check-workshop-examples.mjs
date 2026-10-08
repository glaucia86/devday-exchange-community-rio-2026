import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const root = fileURLToPath(new URL('../', import.meta.url));
for (const [directory, expectedFailures] of [['starter', 10], ['review-candidate', 2], ['solution', 0]]) {
  const result = spawnSync(process.execPath, ['exercises/ticket-router/verify.mjs', `exercises/ticket-router/${directory}/router.mjs`], { cwd: root, encoding: 'utf8' });
  assert.equal(result.error, undefined);
  assert.equal(result.status, expectedFailures ? 1 : 0, result.stdout + result.stderr);
  const line = result.stdout.split('\n').find(value => value.startsWith('ACCEPTANCE '));
  assert.ok(line, 'The exercise must fail on assertions, not on a missing file or syntax error: ' + result.stderr);
  assert.deepEqual(JSON.parse(line.slice(11)), { total: 18, passed: 18 - expectedFailures, failed: expectedFailures });
  console.log(`${directory}: ${18 - expectedFailures}/18; ${expectedFailures ? 'expected teaching failures confirmed' : 'all acceptance cases passed'}`);
}
