import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const root = fileURLToPath(new URL('../..', import.meta.url));
const testArgs = ['--test', 'labs/codex-cloud/bug-rede.test.mts'];

export function typeStripArgs(features = process.features) {
  return features?.typescript ? [] : ['--experimental-strip-types'];
}

function spawnTest(extraArgs) {
  const env = { ...process.env };
  delete env.NODE_TEST_CONTEXT;
  return spawnSync(process.execPath, [...extraArgs, ...testArgs], { cwd: root, encoding: 'utf8', env });
}

export function runBugTest() {
  const first = spawnTest(typeStripArgs());
  const text = `${first.stdout ?? ''}${first.stderr ?? ''}`;
  const needsFlag = first.status !== 0
    && !text.includes('correção da rede')
    && /ERR_UNKNOWN_FILE_EXTENSION|not supported|Unexpected token/.test(text)
    && typeStripArgs().length === 0;
  return needsFlag ? spawnTest(['--experimental-strip-types']) : first;
}

if (process.argv[1] && fileURLToPath(import.meta.url) === process.argv[1]) {
  const result = runBugTest();
  process.stdout.write(result.stdout ?? '');
  process.stderr.write(result.stderr ?? '');
  process.exit(result.status ?? 1);
}
