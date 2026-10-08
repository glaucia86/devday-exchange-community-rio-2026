import { rehearseVoiceScript, syntheticToolEvent } from '../src/domain/voice-commands.ts';

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
  && script.unsafe.state.ticket === null;
if (!ok) {
  console.error('O ensaio offline não bateu com o fechamento esperado.');
  process.exit(1);
}
console.log('Ensaio offline concluído. Nenhum áudio e nenhuma chamada OpenAI.');
