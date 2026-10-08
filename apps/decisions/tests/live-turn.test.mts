import test from 'node:test';
import assert from 'node:assert/strict';
import { planCancelledAnalysis, planEditedAnalysisTurn } from '../src/domain/live-turn.ts';
import { beginConfirmationWatch, confirmationInFlight, idleActivity, noteActivity, noteAssistantAudible, planInsightSpeech } from '../src/domain/monitoring.ts';

const reason = 'O relato foi editado. A análise anterior foi descartada.';
const stale = 'Sugestão da Decisions: Infraestrutura. Revise o relato e confirme na tela.';

test('edit during a pending analysis resumes the delegated turn once', () => {
  const events = planEditedAnalysisTurn({ callId: 'call_analisar', reason, context: 'Contexto da interface, relato novo.' });
  assert.deepEqual(events.map(event => event.type), ['session.thinking.append', 'response.item.create', 'response.create']);
  assert.equal(events.filter(event => event.type === 'response.create').length, 1);
  const output = events.find(event => event.type === 'response.item.create');
  assert.equal(output?.type, 'response.item.create');
  if (output?.type !== 'response.item.create') return;
  assert.equal(output.item.call_id, 'call_analisar');
  assert.match(output.item.output, /resultado_descartado/);
  assert.equal(output.item.output.includes(stale), false);
  assert.equal(output.item.output.includes('Infraestrutura'), false);
  const thinking = events[0];
  assert.equal(thinking.type, 'session.thinking.append');
  const idle = planEditedAnalysisTurn({ callId: null, reason, context: 'sem análise pendente' });
  assert.equal(idle.some(event => event.type === 'response.create'), false);
  const voice = planCancelledAnalysis('call_analisar', 'O relato mudou durante a análise. Nenhum ticket foi criado.');
  assert.equal(voice.some(event => event.type === 'response.create'), false);
  assert.equal(voice.filter(event => event.type === 'response.item.create').length, 1);
});

test('monitoring insight waits while a confirmation is in flight and then speaks once', () => {
  const insight = 'Notei que este é o terceiro problema de Infraestrutura nesta semana, nos registros de demonstração.';
  const sent = 5_000;
  let watch = beginConfirmationWatch(sent, false);
  let activity = noteActivity(noteActivity(idleActivity(), 'tool_output', sent), 'assistant_audio_end', 1_000);
  const blocked = () => confirmationInFlight(watch, false, activity.assistantAudioEndedAt);
  assert.equal(blocked(), true);
  assert.equal(planInsightSpeech({ insight, alreadySaid: false, sessionActive: true, now: sent + 2_000, activity, confirmationInFlight: blocked(), requiredQuietMs: 900 }), 'wait');
  assert.equal(planInsightSpeech({ insight, alreadySaid: false, sessionActive: true, now: 9_000, activity: idleActivity(), confirmationInFlight: false, requiredQuietMs: 900 }), 'wait');
  watch = noteAssistantAudible(watch, true, sent + 2_100).watch;
  assert.equal(confirmationInFlight(watch, true, activity.assistantAudioEndedAt), true);
  const ended = noteAssistantAudible(watch, false, sent + 3_000);
  watch = ended.watch;
  activity = noteActivity(activity, 'assistant_audio_end', ended.audioEndedAt ?? 0);
  assert.equal(confirmationInFlight(watch, false, activity.assistantAudioEndedAt), false);
  assert.equal(planInsightSpeech({ insight, alreadySaid: false, sessionActive: true, now: sent + 3_000, activity, confirmationInFlight: false, requiredQuietMs: 900 }), 'wait');
  activity = noteActivity(activity, 'user_speech', sent + 3_400);
  assert.equal(planInsightSpeech({ insight, alreadySaid: false, sessionActive: true, now: sent + 4_000, activity, confirmationInFlight: false, requiredQuietMs: 900 }), 'wait');
  assert.equal(planInsightSpeech({ insight, alreadySaid: false, sessionActive: true, now: sent + 4_300, activity, confirmationInFlight: false, requiredQuietMs: 900 }), 'speak');
  assert.equal(planInsightSpeech({ insight, alreadySaid: true, sessionActive: true, now: sent + 8_000, activity, confirmationInFlight: false, requiredQuietMs: 900 }), 'skip');
});

test('confirmation watch completes when audio already audible at send time ends', () => {
  const sent = 5_000;
  let watch = beginConfirmationWatch(sent, true);
  assert.equal(confirmationInFlight(watch, true, 0), true);

  const ended = noteAssistantAudible(watch, false, sent + 1_000);
  watch = ended.watch;
  assert.equal(watch.heardSinceSend, true);
  assert.equal(watch.sawSilenceAfterSend, true);
  assert.equal(confirmationInFlight(watch, false, ended.audioEndedAt ?? 0), false);
});
