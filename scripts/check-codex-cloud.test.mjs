import test from 'node:test';
import assert from 'node:assert/strict';
import { bugStillReproduces, cloudGuideProblems, problemsInRepo } from './check-codex-cloud.mjs';
import { bugTestArgs, runBugTest, typeStripArgs } from '../labs/codex-cloud/run-bug-test.mjs';

const good = {
  lab: [
    'Choose environment', 'Codex Cloud (Legacy)', '3 minutos', 'GRAVADO ANTES',
    'apps/decisions/src/domain/service-desk.ts', 'glaucia86/devday-exchange-community-rio-2026',
    'bug-rede.test.mts', 'Fork', 'Rótulos podem variar', 'Work in', 'qual serviço falhou',
    'https://learn.chatgpt.com/docs/environments/cloud-environments',
    'https://developers.openai.com/codex/cloud',
    'https://learn.chatgpt.com/docs/environments/cloud-environment',
  ].join('\n'),
  guide: '## Codex Cloud\n3 minutos GRAVADO ANTES bug-rede.test.mts glaucia86/devday-exchange-community-rio-2026\n## Decisions API\nrouter.test.mjs',
  stage: '| **Codex Cloud** | bug-rede.test.mts | Aos 3 minutos, letreiro GRAVADO ANTES |',
  readme: 'O Cloud revisa um ajuste sem criar outro repositório.',
  program: 'O Cloud usa um ajuste na Alô, TI.',
};

test('aceita um roteiro mínimo do Cloud e ignora o CLI fora da seção', () => {
  assert.deepEqual(cloudGuideProblems(good), []);
});

test('recusa o caminho antigo e um guia que ainda fala no encaminhador', () => {
  const problems = cloudGuideProblems({
    ...good,
    lab: good.lab + '\nrio-codex-cloud',
    guide: '## Codex Cloud\n16/18 router.test.mjs\n## Decisions API',
  });
  assert.ok(problems.some((problem) => problem.includes('rio-codex-cloud')));
  assert.ok(problems.some((problem) => problem.includes('encaminhador')));
});

const specReport = [
  '✔ relato incompleto continua pedindo esclarecimento (1.2ms)',
  '✖ correção da rede não reaproveita o texto de serviço desconhecido (0.7ms)',
  '✔ a queda da rede, antes da correção, continua em infraestrutura (0.1ms)',
  '✔ o acesso sem correção continua em acessos (0.1ms)',
  'ℹ tests 4',
  'ℹ pass 3',
  'ℹ fail 1',
  '✖ failing tests:',
  '✖ correção da rede não reaproveita o texto de serviço desconhecido (0.7ms)',
  "'É preciso esclarecer qual serviço falhou, quem foi afetado e se há uma alternativa antes de encaminhar.'",
].join('\n');

test('só a falha da correção da rede conta como o defeito esperado', () => {
  assert.equal(bugStillReproduces({
    status: 1,
    stdout: '# pass 3\n# fail 1\nnot ok 2 - correção da rede não reaproveita\nqual serviço falhou\n',
    stderr: '',
  }).ok, true);
  assert.equal(bugStillReproduces({ status: 1, stdout: specReport, stderr: '' }).ok, true);
  assert.equal(bugStillReproduces({ status: 0, stdout: '# pass 4\n# fail 0\n', stderr: '' }).ok, false);
  assert.equal(bugStillReproduces({ status: 1, stdout: 'Cannot find module\n', stderr: '' }).ok, false);
  assert.equal(bugStillReproduces({
    status: 1,
    stdout: '# pass 3\n# fail 1\nnot ok 2 - outro teste\nqual serviço falhou\n',
    stderr: '',
  }).ok, false);
  assert.equal(bugStillReproduces({
    status: 1,
    stdout: '# pass 2\n# fail 2\nnot ok 2 - correção da rede não reaproveita\nqual serviço falhou\n',
    stderr: '',
  }).ok, false);
});

test('o teste do defeito pede o relatório TAP', () => {
  assert.ok(bugTestArgs({ typescript: true }).includes('--test-reporter=tap'));
});

test('Node sem remoção de tipos pede o flag experimental', () => {
  assert.deepEqual(typeStripArgs({ typescript: false }), ['--experimental-strip-types']);
  assert.deepEqual(typeStripArgs({ typescript: true }), []);
});

test('os documentos atuais e o defeito da rede passam no verificador', () => {
  assert.deepEqual(problemsInRepo(), []);
  const verdict = bugStillReproduces(runBugTest());
  assert.equal(verdict.ok, true, verdict.reason);
});
