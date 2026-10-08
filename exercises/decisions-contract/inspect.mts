// Exercício offline: importa somente funções puras; não chama servidor ou modelo.
import { readFileSync } from 'node:fs';
import { buildDecisionRequest, parseDecision } from '../../apps/decisions/src/domain/live-contract.ts';
import { createDesk, deskReducer, canCreate } from '../../apps/decisions/src/domain/service-desk.ts';

let fixture: unknown;
try {
  const file = process.argv[2] ?? new URL('./fixtures/completo.json', import.meta.url);
  fixture = JSON.parse(readFileSync(file, 'utf8'));
} catch {
  console.error('ARQUIVO_INVALIDO: confira o caminho e a sintaxe JSON da fixture.');
  process.exit(1);
}
try {
  const report = 'O portal mostra erro 500 para toda a equipe, sem alternativa.';
  const request = buildDecisionRequest(report, []);
  const decision = parseDecision(fixture);
  let state = deskReducer(createDesk(1, 'live'), { type: 'EDIT', value: report });
  state = deskReducer(state, { type: 'TITLE', value: 'Portal indisponível' });
  state = deskReducer(state, { type: 'ANALYZE' });
  state = deskReducer(state, { type: 'RESOLVED', session: state.session, revision: state.revision, result: decision });
  const before = canCreate(state);
  state = deskReducer(state, { type: 'REVIEW', checked: true });
  console.log(JSON.stringify({
    mode: 'fixture local; nenhuma API foi chamada',
    questions: request.questions.map(question => `${question.type}:${question.name}`),
    team: decision.team,
    score: decision.score,
    canCreateBeforeReview: before,
    canCreateAfterReview: canCreate(state),
    ticketCreated: state.ticket !== null,
  }, null, 2));
} catch (error) {
  console.error('CONTRATO_REJEITADO: ' + (error instanceof Error ? error.message : 'resposta inválida'));
  process.exitCode = 1;
}
