import { readFileSync } from 'node:fs';

const read = (path) => readFileSync(path, 'utf8');
const lab = read('labs/codex-cli/README.md');
const guia = read('docs/guia-apresentadora.md');
const roteiro = read('docs/roteiro-de-palco.md');
const refs = read('docs/referencias.md');
const prep = read('scripts/prepare-stage.mjs');
const programacao = read('docs/programacao.md');
let errors = 0;

function fail(message) {
  console.error(message);
  errors += 1;
}

for (const [name, text] of [
  ['labs/codex-cli/README.md', lab],
  ['docs/guia-apresentadora.md', guia],
  ['docs/roteiro-de-palco.md', roteiro],
  ['docs/referencias.md', refs],
  ['scripts/prepare-stage.mjs', prep],
  ['docs/programacao.md', programacao],
]) {
  if (text.includes('codex -m gpt-5.4-mini')) fail(`${name} ainda recomenda codex -m gpt-5.4-mini`);
}

const cli = guia.split('## Codex CLI')[1]?.split('## Codex Cloud')[0] ?? '';
if (!cli) fail('docs/guia-apresentadora.md sem a seção Codex CLI');
for (const needle of [
  'gpt-6-luna',
  '-s workspace-write',
  '/voice',
  '/agents',
  'node --version',
  'GRAVAÇÃO',
  'codex-cli 0.161.0',
  'Trust this folder?',
  'allow_login_shell=false',
]) {
  if (!cli.includes(needle)) fail(`guia, seção Codex CLI, sem: ${needle}`);
}
if (cli.includes('8/18') || cli.includes('rio-codex-cli') || cli.includes('18 critérios')) {
  fail('a seção Codex CLI do guia ainda descreve o encaminhador como demo de palco');
}

for (const needle of ['gpt-6-luna', '/voice', '/agents', 'node --version', 'workspace-write', 'GRAVAÇÃO', 'Trust this folder?']) {
  if (!lab.includes(needle)) fail(`labs/codex-cli/README.md sem: ${needle}`);
}
if (!lab.includes('não entra neste bloco')) fail('o LAB do CLI não afasta o encaminhador do bloco');
if (lab.includes('ACCEPTANCE')) fail('o LAB do CLI ainda conduz o verificador de 18 casos');

const cliRow = roteiro.split('**Codex CLI**')[1]?.split('**Codex Cloud**')[0] ?? '';
for (const needle of ['gpt-6-luna', '/voice', 'node --version', 'GRAVAÇÃO']) {
  if (!cliRow.includes(needle)) fail(`linha Codex CLI do roteiro sem: ${needle}`);
}
if (cliRow.includes('18 critérios') || cliRow.includes('A senha falhou')) {
  fail('a linha Codex CLI do roteiro ainda usa o starter do encaminhador');
}

for (const needle of [
  'https://openai.com/index/devday-2026-recap/',
  'https://github.com/openai/codex/releases/tag/rust-v0.161.0',
  'https://github.com/openai/codex/blob/rust-v0.161.0/codex-rs/tui/src/slash_command.rs',
  'https://developers.openai.com/codex/noninteractive.md',
  'https://developers.openai.com/codex/cli/slash-commands',
]) {
  if (!refs.includes(needle) || !lab.includes(needle)) fail(`fonte ausente no LAB ou nas referências: ${needle}`);
}

for (const needle of ['gpt-6-luna', 'workspace-write', 'node --version', 'allow_login_shell=false']) {
  if (!prep.includes(needle)) fail(`scripts/prepare-stage.mjs sem: ${needle}`);
}

if (!programacao.includes('/voice') || programacao.includes('CLI e Cloud podem reutilizar o mesmo exercício')) {
  fail('docs/programacao.md ainda manda o CLI repetir o exercício do Cloud');
}

if (errors) process.exitCode = 1;
else console.log('Roteiro do Codex CLI: fatos do palco conferidos. URLs externas não foram buscadas.');
