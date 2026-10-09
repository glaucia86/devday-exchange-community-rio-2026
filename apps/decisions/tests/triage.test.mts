import test from 'node:test';
import assert from 'node:assert/strict';
import type { Decision } from '../src/domain/service-desk.ts';
import { addCard, boardSummary, cardAnnouncement, columnCounts, createTriage, enqueue, hear, noteCall, pendingReport, resolveReview, restoreTriage, topTeam, urgencyLabel } from '../src/domain/triage.ts';

const decision = (team: Decision['team'], confidence = .9, score = 1.2): Decision =>
  ({ team, probability: .95, confidence, score, explanation: '', source: 'openai' });

test('the report is the speech heard since the last card, without the spoken command', () => {
  let state = hear(createTriage(), 'A VPN da filial cai a cada dez minutos ');
  state = hear(state, 'e o financeiro parou. Registra esse chamado.');
  assert.equal(pendingReport(state), 'A VPN da filial cai a cada dez minutos e o financeiro parou');
  assert.equal(pendingReport(hear(createTriage(), 'próximo chamado')), 'próximo chamado', 'a lone command is kept so it is never silently empty');
  assert.equal(pendingReport(createTriage()), '');
});

test('only a trailing spoken command is removed, preserving verbs inside the report', () => {
  for (const command of ['Registra.', 'Registre esse chamado.', 'Registrar!', 'Classifica.', 'Classifique esse chamado.', 'Classificar.', 'Próximo chamado.', 'OK, registra esse chamado.']) {
    const report = 'Não consigo registrar ponto no portal desde as 9h';
    assert.equal(pendingReport(hear(createTriage(), `${report}. ${command}`)), report, command);
  }
  for (const report of ['Não consigo registrar ponto no portal desde as 9h.', 'O sistema classifica pedidos incorretamente.', 'Preciso de ajuda para registrar', 'O portal registra ponto.', 'Registra logs mas não confirma o ponto.']) {
    assert.equal(pendingReport(hear(createTriage(), report)), report);
  }
});

test('a card clears the heard text and keeps ids increasing', () => {
  let state = hear(createTriage(), 'Esqueci a senha do portal.');
  state = addCard(state, pendingReport(state), decision('access'), 1);
  state = addCard(hear(state, 'Erro 500 no sistema interno.'), 'Erro 500 no sistema interno.', decision('applications'), 2);
  assert.deepEqual(state.cards.map(card => card.id), [1, 2]);
  assert.equal(state.heard, '');
  assert.equal(state.last?.team, 'applications');
});

test('a completed card consumes only the speech captured before classification', () => {
  const captured = hear(createTriage(), 'A VPN caiu. Registra.');
  const latest = hear(captured, ' O portal mostra erro 500.');
  const next = addCard(latest, pendingReport(captured), decision('infrastructure'), 1, 'heard', captured.heard);
  assert.equal(next.cards[0].text, 'A VPN caiu');
  assert.equal(next.heard, ' O portal mostra erro 500.');
});

test('a rate limit queues the captured report without consuming later speech', () => {
  const captured = hear(createTriage(), 'A VPN caiu. Registra.');
  const latest = hear(captured, ' O portal mostra erro 500.');
  const next = enqueue(latest, captured.heard);
  assert.deepEqual(next.queue, ['A VPN caiu']);
  assert.equal(next.heard, ' O portal mostra erro 500.');
});

test('calls are counted separately from cards, so failures still show in the budget', () => {
  const state = noteCall(noteCall(createTriage()));
  assert.equal(state.calls, 2);
  assert.equal(state.cards.length, 0);
});

test('only human-review cards can be routed by a person, and never back to review', () => {
  let state = addCard(createTriage(), 'Não funciona.', decision('human', .4, .3), 1);
  state = addCard(state, 'Senha expirada.', decision('access'), 2);
  state = resolveReview(state, 1, 'infrastructure');
  state = resolveReview(state, 2, 'applications');
  assert.equal(state.cards[0].team, 'infrastructure');
  assert.equal(state.cards[0].decidedBy, 'human');
  assert.equal(state.cards[0].suggested, 'human');
  assert.equal(state.cards[1].team, 'access', 'a card decided by Decisions is not rerouted by the review control');
  assert.equal(resolveReview(state, 1, 'human'), state);
});

test('counts, top team and urgency labels follow the board', () => {
  let state = createTriage();
  assert.equal(topTeam(state), null);
  state = addCard(state, 'a', decision('access'), 1);
  state = addCard(state, 'b', decision('access'), 2);
  state = addCard(state, 'c', decision('human', .3), 3);
  assert.deepEqual(columnCounts(state), { access: 2, applications: 0, infrastructure: 0, human: 1 });
  assert.equal(topTeam(state), 'access');
  assert.deepEqual([0, .6, 1.6].map(urgencyLabel), ['Orientação', 'Degradado', 'Bloqueado']);
});

test('announcements never claim a team for review cards', () => {
  const state = addCard(addCard(createTriage(), 'x', decision('human', .3), 1), 'y', decision('infrastructure'), 2);
  assert.match(cardAnnouncement(state.cards[0]), /Revisão humana/);
  assert.match(cardAnnouncement(state.cards[1]), /Infraestrutura/);
  assert.match(cardAnnouncement(state.cards[1]), /fictícios/);
});

test('a rate-limited report waits in the queue and becomes a card later without eating new speech', () => {
  let state = enqueue(hear(createTriage(), 'A VPN da filial caiu. Registra.'));
  assert.deepEqual(state.queue, ['A VPN da filial caiu']);
  assert.equal(state.heard, '');
  assert.equal(enqueue(state), state, 'nothing heard, nothing queued');
  state = hear(state, 'Impressora do RH');
  state = addCard(state, 'A VPN da filial caiu', decision('infrastructure'), 1, 'queue');
  assert.deepEqual(state.queue, []);
  assert.equal(state.heard, 'Impressora do RH');
  assert.equal(state.cards[0].team, 'infrastructure');
  assert.match(boardSummary(enqueue(state)), /1 relatos na fila/);
});

test('a saved board is restored, and anything malformed is dropped', () => {
  const saved = addCard(createTriage(), 'Senha expirada.', decision('access'), 1);
  const restored = restoreTriage(JSON.parse(JSON.stringify({ cards: saved.cards, queue: ['x', 3, ''], calls: 4 })));
  assert.equal(restored.cards.length, 1);
  assert.deepEqual(restored.queue, ['x']);
  assert.equal(restored.calls, 4);
  assert.equal(restored.heard, '');
  assert.deepEqual(restoreTriage({ cards: [{ id: 1, team: 'root' }], calls: -1 }), createTriage());
  assert.deepEqual(restoreTriage('lixo'), createTriage());
});

test('the board summary stays short enough for one context append', () => {
  let state = createTriage();
  for (let i = 0; i < 40; i++) state = addCard(state, 'Relato muito longo '.repeat(20), decision('applications'), i);
  const summary = boardSummary(state);
  assert.ok(summary.length <= 1500, `summary has ${summary.length} chars`);
  assert.match(summary, /40 chamados/);
  assert.match(summary, /#40/, 'the newest cards come first');
});
