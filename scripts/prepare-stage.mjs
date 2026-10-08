import { spawnSync } from 'node:child_process';
import { readdirSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const minimum = '24.21.0';

export function nodeSatisfies(version, required = minimum) {
  const parse = (value) => value.replace(/^v/, '').split('.').map((part) => Number(part) || 0);
  const current = parse(version);
  const floor = parse(required);
  for (let index = 0; index < 3; index += 1) {
    if (current[index] > floor[index]) return true;
    if (current[index] < floor[index]) return false;
  }
  return true;
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
  if (!nodeSatisfies(process.versions.node)) {
    fail(`Node.js ${process.versions.node} é anterior a ${minimum}. O arquivo .nvmrc pede ${minimum}.`);
  }
  console.log(`Node.js ${process.versions.node} atende a ${minimum}.`);
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

Use esta build no encontro, com ${npm} start, para a Alô, TI da camada que sempre funciona e para o Decisions. npm run dev reescreve next-env.d.ts; esse arquivo é gerado e não entra no Git.
O bloco do Codex CLI edita o fonte. Antes desse relógio, pare este processo e, na pasta apps/decisions, execute ${npm} run dev. Ao terminar o bloco, volte a ${npm} start. A build deste script não inclui a edição do agente.
Antes de Dots, Codex ou voz, confira o ensaio em docs/roteiro-de-palco.md.
Se for usar o Codex CLI:
  ${npm} install -g @openai/codex@0.161.0
  codex --version
  codex login status
  Na pasta apps/decisions:
  codex -m gpt-6-luna -s workspace-write -a on-request
  Se aparecer Trust this folder?, confira o caminho antes de aceitar.
  Dentro do agente, peça node --version e espere v24.21.0 ou posterior.
  Se vier outra versão, saia com /quit e reabra com -c allow_login_shell=false.
`);
}

const entry = process.argv[1] ? resolve(process.argv[1]) : '';
if (entry === fileURLToPath(import.meta.url)) main();
