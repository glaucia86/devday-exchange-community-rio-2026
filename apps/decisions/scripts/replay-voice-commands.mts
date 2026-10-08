import { rehearseVoiceScript, syntheticToolEvent } from '../src/domain/voice-commands.ts';
import { planCancelledAnalysis, planEditedAnalysisTurn } from '../src/domain/live-turn.ts';
import { beginConfirmationWatch, confirmationInFlight, idleActivity, noteActivity, noteAssistantAudible, planInsightSpeech } from '../src/domain/monitoring.ts';

const script = rehearseVoiceScript();
const events = [
  syntheticToolEvent('registrar_relato', { texto: 'A rede da sala de reunião cai durante as chamadas. O restante do escritório funciona.', titulo: 'Rede da sala' }),
  syntheticToolEvent('corrigir_relato', { texto: 'A rede cai para o time todo e ninguém consegue trabalhar. Não há alternativa.' }),
  syntheticToolEvent('analisar', {}),
  syntheticToolEvent('confirmar_ticket', { confirmacao_explicita: false }),
  syntheticToolEvent('confirmar_ticket', { confirmacao_explicita: true }),
  syntheticToolEvent('recomecar', {}),
  syntheticToolEvent('executar_shell', { comando: 'rm -rf /' }),
];
console.log('Eventos sintéticos de response.output_item.done (não é a API Realtime):');
for (const event of events) console.log(JSON.stringify(event));
console.log('');
for (const step of script.steps) console.log(`${step.ok ? 'feito' : 'recusado'}  ${step.command}  ${step.summary}`);
const insight = script.confirmed.state.insight?.text ?? '';
console.log('');
console.log(insight);
const editedTurn = planEditedAnalysisTurn({ callId: 'call_analisar', reason: 'O relato foi editado. A análise anterior foi descartada.', context: 'contexto' });
const voiceCancel = planCancelledAnalysis('call_analisar', 'O relato mudou durante a análise.');
const sentAt = 5_000;
let watch = beginConfirmationWatch(sentAt, false);
let activity = noteActivity(idleActivity(), 'tool_output', sentAt);
const duringConfirmation = planInsightSpeech({
  insight, alreadySaid: false, sessionActive: true, now: sentAt + 2_000, activity,
  confirmationInFlight: confirmationInFlight(watch, false, activity.assistantAudioEndedAt), requiredQuietMs: 900,
});
watch = noteAssistantAudible(watch, true, sentAt + 2_200).watch;
const ended = noteAssistantAudible(watch, false, sentAt + 3_000);
watch = ended.watch;
activity = noteActivity(activity, 'assistant_audio_end', ended.audioEndedAt ?? 0);
const afterAudio = planInsightSpeech({
  insight, alreadySaid: false, sessionActive: true, now: sentAt + 3_000, activity, confirmationInFlight: confirmationInFlight(watch, false, activity.assistantAudioEndedAt), requiredQuietMs: 900,
});
const spoken = planInsightSpeech({
  insight, alreadySaid: false, sessionActive: true, now: sentAt + 3_900, activity, confirmationInFlight: false, requiredQuietMs: 900,
});
const repeated = planInsightSpeech({
  insight, alreadySaid: true, sessionActive: true, now: sentAt + 6_000, activity, confirmationInFlight: false, requiredQuietMs: 900,
});
const ok = script.registered.ok
  && script.corrected.ok
  && script.analyzed.followup === 'analyze'
  && script.refused.state.ticket === null
  && script.confirmed.state.ticket?.id === 'DEMO-0001'
  && /terceiro problema de Infraestrutura/.test(insight)
  && /demonstração/.test(insight)
  && script.reset.state.insight === null
  && script.reset.state.history.length === script.confirmed.state.history.length
  && script.unsafe.ok === false
  && script.unsafe.state.ticket === null
  && editedTurn.filter(event => event.type === 'response.create').length === 1
  && editedTurn.some(event => event.type === 'response.item.create' && /resultado_descartado/.test(event.item.output))
  && voiceCancel.every(event => event.type !== 'response.create')
  && duringConfirmation === 'wait'
  && afterAudio === 'wait'
  && spoken === 'speak'
  && repeated === 'skip';
if (!ok) {
  console.error('O ensaio offline não bateu com o fechamento esperado.');
  process.exit(1);
}
console.log('Ensaio offline concluído. Nenhum áudio e nenhuma chamada OpenAI.');
