import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { runBugTest } from '../labs/codex-cloud/run-bug-test.mjs';

export function section(markdown, start, end) {
  const from = markdown.indexOf(start);
  if (from < 0) return '';
  const after = from + start.length;
  const until = end ? markdown.indexOf(end, after) : -1;
  return until < 0 ? markdown.slice(from) : markdown.slice(from, until);
}

export function cloudGuideProblems(files) {
  const problems = [];
  const lab = files.lab ?? '';
  const required = [
    'Choose environment',
    'Codex Cloud (Legacy)',
    '3 minutos',
    'GRAVADO ANTES',
    'apps/decisions/src/domain/service-desk.ts',
    'glaucia86/devday-exchange-community-rio-2026',
    'bug-rede.test.mts',
    'Fork',
    'https://learn.chatgpt.com/docs/environments/cloud-environments',
    'https://developers.openai.com/codex/cloud',
    'https://learn.chatgpt.com/docs/environments/cloud-environment',
    'Rótulos podem variar',
    'Work in',
    'qual serviço falhou',
  ];
  for (const phrase of required) {
    if (!lab.includes(phrase)) problems.push(`LAB sem: ${phrase}`);
  }
  for (const phrase of ['rio-codex-cloud', 'cpSync', 'Upload files', 'exercises/ticket-router']) {
    if (lab.includes(phrase)) problems.push(`LAB ainda aponta para o caminho antigo: ${phrase}`);
  }

  const guide = section(files.guide ?? '', '## Codex Cloud', '## Decisions API');
  if (!guide) problems.push('guia sem a seção Codex Cloud');
  for (const phrase of ['3 minutos', 'GRAVADO ANTES', 'bug-rede.test.mts', 'glaucia86/devday-exchange-community-rio-2026']) {
    if (guide && !guide.includes(phrase)) problems.push(`guia Cloud sem: ${phrase}`);
  }
  if (guide.includes('router.test.mjs') || guide.includes('16/18')) problems.push('guia Cloud ainda descreve o encaminhador');

  const stageRow = (files.stage ?? '').split('\n').find((line) => line.includes('**Codex Cloud**')) ?? '';
  if (!stageRow) problems.push('roteiro sem a linha Codex Cloud');
  if (stageRow.includes('16/18')) problems.push('roteiro Cloud ainda diz 16/18');
  for (const phrase of ['3 minutos', 'GRAVADO ANTES', 'bug-rede.test.mts']) {
    if (stageRow && !stageRow.includes(phrase)) problems.push(`roteiro Cloud sem: ${phrase}`);
  }

  const readme = files.readme ?? '';
  if (!readme.includes('sem criar outro repositório')) problems.push('README não diz que o Cloud dispensa outro repositório');
  if (readme.includes('candidata defeituosa no Cloud')) problems.push('README ainda descreve a candidata do encaminhador no Cloud');

  const program = files.program ?? '';
  if (!program.includes('O Cloud usa um ajuste na Alô, TI')) problems.push('programação ainda junta Cloud e encaminhador');
  return problems;
}

export function bugStillReproduces(result) {
  const text = `${result.stdout ?? ''}${result.stderr ?? ''}`;
  if (result.status === 0) return { ok: false, reason: 'o teste do LAB passou; o defeito da rede não está mais no produto' };
  if (!text.includes('# fail 1') || !text.includes('# pass 3')) {
    return { ok: false, reason: 'a falha deixou de ser exatamente o teste da correção da rede' };
  }
  if (!text.includes('not ok') || !text.includes('correção da rede não reaproveita')) {
    return { ok: false, reason: 'não encontrei a asserção da correção da rede' };
  }
  if (!text.includes('qual serviço falhou')) return { ok: false, reason: 'a saída não mostra a explicação de serviço desconhecido' };
  if (/Cannot find module|SyntaxError/.test(text)) return { ok: false, reason: 'o teste quebrou ao carregar, em vez de falhar na explicação' };
  return { ok: true, reason: 'defeito da rede ainda reproduzido' };
}

function read(path) {
  return readFileSync(new URL(path, import.meta.url), 'utf8');
}

export function problemsInRepo() {
  return cloudGuideProblems({
    lab: read('../labs/codex-cloud/README.md'),
    guide: read('../docs/guia-apresentadora.md'),
    stage: read('../docs/roteiro-de-palco.md'),
    readme: read('../README.md'),
    program: read('../docs/programacao.md'),
  });
}

function main() {
  const problems = problemsInRepo();
  const bug = bugStillReproduces(runBugTest());
  if (!bug.ok) problems.push(bug.reason);
  if (problems.length) {
    for (const problem of problems) console.error(problem);
    process.exitCode = 1;
    return;
  }
  console.log(`${bug.reason}. Roteiro do Codex Cloud conferido. Código 0 deste script significa que o defeito ainda existe e os textos batem.`);
}

if (process.argv[1] && fileURLToPath(import.meta.url) === process.argv[1]) main();
