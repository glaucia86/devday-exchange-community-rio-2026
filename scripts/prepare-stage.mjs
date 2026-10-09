import { spawnSync } from 'node:child_process';
import { readdirSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const minimum = '24.12.0';
const maximum = '24.21.0';

function parseVersion(value) {
  return String(value).replace(/^v/, '').split('.').map((part) => Number(part) || 0);
}

function compareVersions(left, right) {
  const current = parseVersion(left);
  const required = parseVersion(right);
  for (let index = 0; index < 3; index += 1) {
    if (current[index] > required[index]) return 1;
    if (current[index] < required[index]) return -1;
  }
  return 0;
}

export function nodeSatisfies(version, floor = minimum, ceiling = maximum) {
  return compareVersions(version, floor) >= 0 && compareVersions(version, ceiling) <= 0;
}

function fail(message) {
  console.error(message);
  process.exit(1);
}

function run(command, args, cwd) {
  const result = spawnSync(command, args, {
    cwd,
    stdio: 'inherit',
    env: { ...process.env, NEXT_TELEMETRY_DISABLED: '1' },
  });
  if (result.error) fail(result.error.message);
  if (result.status !== 0) process.exit(result.status ?? 1);
}

function main() {
  const version = process.versions.node;
  if (compareVersions(version, minimum) < 0) {
    fail(`Node.js ${version} é anterior a ${minimum}. A faixa aceita é ${minimum} a ${maximum}. O arquivo .nvmrc recomenda ${maximum}.`);
  }
  if (compareVersions(version, maximum) > 0) {
    fail(`Node.js ${version} é posterior a ${maximum}. A faixa aceita é ${minimum} a ${maximum}. O arquivo .nvmrc recomenda ${maximum}.`);
  }
  console.log(`Node.js ${version} está na faixa ${minimum} a ${maximum}. O arquivo .nvmrc recomenda ${maximum}.`);
  const npm = process.platform === 'win32' ? 'npm.cmd' : 'npm';
  const decisions = resolve(root, 'apps/decisions');
  run(npm, ['ci', '--ignore-scripts'], decisions);

  const decisionTests = readdirSync(resolve(decisions, 'tests'))
    .filter((name) => name.endsWith('.test.mts'))
    .sort()
    .map((name) => `apps/decisions/tests/${name}`);
  const suites = [
    ['exercises/ticket-router/starter/router.test.mjs'],
    ['exercises/ticket-router/solution/router.test.mjs'],
    decisionTests,
    ['exercises/ticket-router/review-candidate/router.test.mjs', 'exercises/decisions-contract/inspect.test.mts'],
  ];
  for (const files of suites) run(process.execPath, ['--test', ...files], root);
  run(process.execPath, ['scripts/check-workshop-examples.mjs'], root);
  run(process.execPath, ['scripts/check-cli-stage.mjs'], root);
  run(npm, ['run', 'build'], decisions);
  console.log(`
Build pronta para o palco.
Na pasta apps/decisions, execute:
  ${npm} start
Abra http://127.0.0.1:3000

Use esta build no encontro, com ${npm} start: http://127.0.0.1:3000/triagem para a Triagem ao vivo (Decisions) e http://127.0.0.1:3000 para a Alô, TI. npm run dev reescreve next-env.d.ts; esse arquivo é gerado e não entra no Git.
O bloco do Codex CLI edita o fonte. Antes desse relógio, pare este processo e, na pasta apps/decisions, execute ${npm} run dev. Ao terminar o bloco, volte a ${npm} start. A build deste script não inclui a edição do agente.
Antes de Dots, Codex ou voz, confira o ensaio em docs/roteiro-de-palco.md.
Se for usar o Codex CLI:
  ${npm} install -g @openai/codex@0.161.0
  codex --version
  codex login status
  Na pasta apps/decisions:
  codex -m gpt-6-luna -s workspace-write -a on-request
  Se aparecer Trust this folder?, confira o caminho antes de aceitar.
  Dentro do agente, peça node --version e espere v24.21.0, a versão recomendada em .nvmrc.
  Se vier outra versão, saia com /quit e reabra com -c allow_login_shell=false.
`);
}

const entry = process.argv[1] ? resolve(process.argv[1]) : '';
if (entry === fileURLToPath(import.meta.url)) main();
