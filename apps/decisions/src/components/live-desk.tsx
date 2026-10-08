'use client';
import { useEffect, useRef, useState } from 'react';
import { Mic, MicOff, ShieldCheck, Sparkles, LoaderCircle, ArrowRight } from 'lucide-react';
import { canCreate, createDesk, deskReducer, TEAMS, type DeskEvent, type DeskState, type Team } from '../domain/service-desk';
import { type LiveEvent, type TranscriptLine } from '../domain/live-contract';
import { interfaceContext, applyVoiceCommand, type CommandLogEntry, type VoiceEffect } from '../domain/voice-commands';
import { beginConfirmationWatch, confirmationInFlight, idleActivity, idleConfirmation, noteActivity, noteAssistantAudible, planInsightSpeech, type ActivityClock, type ConfirmationWatch } from '../domain/monitoring';
import { planCancelledAnalysis, planEditedAnalysisTurn } from '../domain/live-turn';
import { watchAssistantAudio } from '../client/assistant-audio';
import { LiveBrowser } from '../client/live-browser';
import MonitoringNote from './monitoring-note';

const QUIET_MS = 900;

export default function LiveDesk(){
 const [state,setState]=useState(()=>createDesk(1,'live'));
 const current=useRef(state);
 const [enabled,setEnabled]=useState<boolean|null>(null);
 const [token,setToken]=useState('');
 const [consent,setConsent]=useState(false);
 const [connection,setConnection]=useState<'idle'|'connecting'|'active'|'closing'>('idle');
 const [notice,setNotice]=useState('');
 const [failure,setFailure]=useState('');
 const [lines,setLines]=useState<TranscriptLine[]>([]);
 const [log,setLog]=useState<CommandLogEntry[]>([]);
 const transcript=useRef<TranscriptLine[]>([]);
 const [seconds,setSeconds]=useState(0);
 const audio=useRef<HTMLAudioElement>(null);
 const live=useRef<LiveBrowser|null>(null);
 const mounted=useRef(true);
 const pending=useRef<AbortController|null>(null);
 const inflight=useRef<{callId:string;revision:number;session:number}|null>(null);
 const seenCalls=useRef(new Set<string>());
 const delegations=useRef(new Set<string>());
 const generation=useRef(0);
 const activity=useRef<ActivityClock>(idleActivity());
 const confirmationWatch=useRef<ConfirmationWatch>(idleConfirmation());
 const assistantAudible=useRef(false);
 const audioCtx=useRef<AudioContext|null>(null);
 const insightSaid=useRef('');
 const insightTimer=useRef<ReturnType<typeof setTimeout>|null>(null);
 function commit(next:DeskState){current.current=next;if(mounted.current)setState(next);}
 function apply(event:DeskEvent){commit(deskReducer(current.current,event));}
 function pushLog(effect:VoiceEffect,id:string){setLog(prev=>[{id,name:effect.command,ok:effect.ok,summary:effect.summary},...prev].slice(0,12));}
 function stamp(kind:'user_speech'|'assistant_audio_end'|'tool_output',at=Date.now()){activity.current=noteActivity(activity.current,kind,at);}
 function resetSpeechClock(){activity.current=idleActivity();confirmationWatch.current=idleConfirmation();assistantAudible.current=false;}
 function releaseInflight(){
  const job=inflight.current;inflight.current=null;
  pending.current?.abort();pending.current=null;
  if(current.current.status==='analyzing')apply({type:'FAILED',session:current.current.session,revision:current.current.revision});
  return job;
 }
 function abandonInflight(reason:string){
  const job=releaseInflight();
  if(!job)return;
  stamp('tool_output');
  live.current?.sendTurn(planCancelledAnalysis(job.callId,reason));
 }
 function invalidate(value:string){
  const job=releaseInflight();
  apply({type:'EDIT',value});
  const events=planEditedAnalysisTurn({callId:job?.callId??null,reason:'O relato foi editado. A análise anterior foi descartada.',context:interfaceContext(current.current)});
  if(events.some(event=>event.type==='response.item.create'))stamp('tool_output');
  live.current?.sendTurn(events);
 }
 function blockedInsight(){return confirmationInFlight(confirmationWatch.current,assistantAudible.current,activity.current.assistantAudioEndedAt);}
 function beginSpokenConfirmation(){confirmationWatch.current=beginConfirmationWatch(Date.now(),assistantAudible.current);}
 function armInsight(text:string){
  if(!text||insightSaid.current===text)return;
  const epoch=generation.current;
  const tick=()=>{
   if(insightTimer.current)clearTimeout(insightTimer.current);
   insightTimer.current=setTimeout(()=>{
    if(!mounted.current||epoch!==generation.current||insightSaid.current===text)return;
    const plan=planInsightSpeech({insight:text,alreadySaid:insightSaid.current===text,sessionActive:!!live.current?.active,now:Date.now(),activity:activity.current,confirmationInFlight:blockedInsight(),requiredQuietMs:QUIET_MS});
    if(plan==='wait'){tick();return;}
    if(plan!=='speak')return;
    insightSaid.current=text;
    live.current?.send('Diga agora esta observação de monitoramento. Deixe claro que são registros de demonstração, não um painel real: '+text,null,false);
   },QUIET_MS);
  };
  tick();
 }
 useEffect(()=>{
  mounted.current=true;
  const abort=new AbortController();
  fetch('/api/live',{signal:abort.signal}).then(r=>r.json()).then(data=>{if(mounted.current)setEnabled(data.enabled===true);}).catch(()=>{if(mounted.current)setEnabled(false);});
  return()=>{mounted.current=false;generation.current++;abort.abort();pending.current?.abort();if(insightTimer.current)clearTimeout(insightTimer.current);void audioCtx.current?.close();void live.current?.stop();};
 },[]);
 useEffect(()=>{
  const element=audio.current,context=audioCtx.current;
  if(connection!=='active'||!element||!context)return;
  return watchAssistantAudio(element,context,next=>{
   if(next===assistantAudible.current)return;
   const at=Date.now();
   const noted=noteAssistantAudible(confirmationWatch.current,next,at);
   confirmationWatch.current=noted.watch;
   assistantAudible.current=next;
   if(noted.audioEndedAt)stamp('assistant_audio_end',noted.audioEndedAt);
  });
 },[connection]);
 async function analyze(callId:string|null){
  const client=live.current,snapshot=current.current,epoch=generation.current;
  if(!client?.active||snapshot.status!=='analyzing'||!snapshot.draftText.trim()||snapshot.ticket)return;
  pending.current?.abort();const controller=new AbortController();pending.current=controller;
  if(callId)inflight.current={callId,revision:snapshot.revision,session:snapshot.session};
  setFailure('');
  client.send('Analisando o relato. Nenhum ticket foi criado.',null,false);
  try{
   const result=await client.request({action:'decide',sessionId:client.id,revision:snapshot.revision,text:snapshot.draftText,transcript:transcript.current.slice(-30)},controller.signal);
   if(controller.signal.aborted||epoch!==generation.current||current.current.session!==snapshot.session||current.current.revision!==snapshot.revision||result.sessionId!==client.id||result.revision!==snapshot.revision)return;
   apply({type:'RESOLVED',session:snapshot.session,revision:snapshot.revision,result:result.result});
   const explanation=current.current.analysis?.explanation??'Análise concluída. Nenhum ticket foi criado.';
   if(callId){stamp('tool_output');client.submitToolOutput(callId,JSON.stringify({ok:true,comando:'analisar',resumo:explanation,ticket:null,equipe:current.current.analysis?.team??null}));}
   else client.send(explanation,null,false);
  }catch(e){
   if(controller.signal.aborted||epoch!==generation.current)return;
   apply({type:'FAILED',session:snapshot.session,revision:snapshot.revision});
   setFailure(e instanceof Error?e.message:'A análise falhou.');
   if(callId){stamp('tool_output');client.submitToolOutput(callId,JSON.stringify({ok:false,comando:'analisar',erro:'analise_falhou',resumo:'A análise falhou. Nenhum ticket foi criado.',ticket:null}));}
   else client.send('A análise falhou. Nenhuma sugestão ou ticket foi confirmado.',null,false);
  }finally{if(pending.current===controller)pending.current=null;if(callId&&inflight.current?.callId===callId)inflight.current=null;}
 }
 function onTool(event:Extract<LiveEvent,{type:'response.function_call'}>,epoch:number){
  if(seenCalls.current.has(event.callId))return;
  seenCalls.current.add(event.callId);
  if(seenCalls.current.size>40){setNotice('Limite de comandos atingido.');void stop();return;}
  const interrupts=event.name==='registrar_relato'||event.name==='corrigir_relato'||event.name==='recomecar';
  if(interrupts)abandonInflight('O relato mudou durante a análise. Nenhum ticket foi criado.');
  const effect=applyVoiceCommand(current.current,{name:event.name,arguments:event.arguments});
  if(effect.command==='recomecar'){insightSaid.current='';if(insightTimer.current)clearTimeout(insightTimer.current);resetSpeechClock();}
  commit(effect.state);
  if(mounted.current&&epoch===generation.current)pushLog(effect,event.callId);
  const client=live.current;
  client?.send(interfaceContext(effect.state),null,true);
  if(effect.followup==='analyze'){void analyze(event.callId);return;}
  stamp('tool_output');
  client?.submitToolOutput(event.callId,effect.output,!inflight.current);
  if(effect.announceInsight&&effect.state.insight&&epoch===generation.current){beginSpokenConfirmation();armInsight(effect.state.insight.text);}
 }
 function eventReceived(event:LiveEvent,epoch:number){
  if(!mounted.current||epoch!==generation.current)return;
  if(event.type==='session.started'){setConnection('active');setNotice('Microfone ativo. Fale um comando: registrar, corrigir, analisar, confirmar ou recomeçar.');live.current?.send(interfaceContext(current.current),null,true);return;}
  if(event.type==='session.usage.updated'||event.type==='session.closed'){if(event.usage)setSeconds(event.usage.seconds);return;}
  if(event.type==='session.input_transcript.delta'||event.type==='session.output_transcript.delta'){
   const role=event.type==='session.input_transcript.delta'?'user':'assistant';
   if(role==='user')stamp('user_speech');
   const next=transcript.current.map(line=>({...line}));
   if(next.at(-1)?.role===role)next[next.length-1].text+=event.delta;else next.push({role,text:event.delta});
   if(next.reduce((sum,line)=>sum+line.text.length,0)>8000){setNotice('Limite de transcrição atingido. Encerrando.');void stop();return;}
   transcript.current=next;setLines(next);
   return;
  }
  if(event.type==='session.delegation.created'){
   const id=event.delegation.id;
   if(delegations.current.has(id))return;
   delegations.current.add(id);
   if(delegations.current.size>40){setNotice('Limite de delegações atingido.');void stop();return;}
   return;
  }
  if(event.type==='response.function_call')onTool(event,epoch);
 }
 async function start(){
  if(connection!=='idle'||!enabled||!consent||token.length<32||!audio.current)return;
  if(!audioCtx.current||audioCtx.current.state==='closed')audioCtx.current=new AudioContext();
  void audioCtx.current.resume();
  setConnection('connecting');setFailure('');setNotice('Solicitando acesso ao microfone…');
  const epoch=++generation.current;
  if(insightTimer.current)clearTimeout(insightTimer.current);
  insightSaid.current='';
  apply({type:'RESET'});transcript.current=[];setLines([]);setLog([]);delegations.current.clear();seenCalls.current.clear();inflight.current=null;resetSpeechClock();setSeconds(0);
  const client=new LiveBrowser({token,audio:audio.current,onEvent:event=>eventReceived(event,epoch),
   onNotice:text=>{if(mounted.current&&epoch===generation.current)setNotice(text);},
   onEnded:()=>{if(mounted.current&&epoch===generation.current){setConnection('idle');pending.current?.abort();pending.current=null;inflight.current=null;}}});
  live.current=client;
  try{await client.start();}
  catch(e){if(mounted.current&&epoch===generation.current)setFailure(e instanceof Error?e.message:'Falha na conexão.');await client.stop();}
 }
 async function stop(){
  setConnection('closing');abandonInflight('A conversa foi encerrada. Nenhum ticket novo foi criado.');
  await live.current?.stop();if(mounted.current)setConnection('idle');
 }
 function confirm(){
  if(!canCreate(current.current))return;
  apply({type:'CREATE'});
  const ticket=current.current.ticket,insight=current.current.insight;
  if(ticket)live.current?.send('A pessoa confirmou na tela. Ticket '+ticket.id+' criado apenas nesta demo, para '+TEAMS[ticket.team]+'. Nenhum sistema externo recebeu um ticket. Não anuncie o monitoramento; a aplicação fala isso em seguida.',null,false);
  if(insight){beginSpokenConfirmation();armInsight(insight.text);}
 }
 function analyzeFromButton(){
  if(connection!=='active'||!current.current.draftText.trim()||current.current.ticket||current.current.status==='analyzing')return;
  apply({type:'ANALYZE'});
  void analyze(null);
 }
 return <section className="live-lab" aria-label="OpenAI ao vivo">
  <div className="panel-heading"><div><span className="step-label">GPT-LIVE + DECISIONS</span><h2>Conversa real, ticket simulado</h2></div><span className="example-badge">INTEGRAÇÃO EXPERIMENTAL</span></div>
  <p>O áudio do microfone e o relato serão enviados à OpenAI. GPT-Live conversa e pede funções; o aplicativo executa os mesmos passos dos botões. Decisions sugere a equipe. Use somente dados fictícios. A chave da OpenAI fica no servidor.</p>
  <p className="notice">Código integrado, ainda sem ensaio com a API e áudio reais. Voz: bossa. Sessões de voz e análises têm custo separado. Limite local: dois minutos por conversa. Se o microfone ou a API não estiverem disponíveis, use a aba Simulado: o monitoramento aparece na tela depois do ticket.</p>
  {enabled===false&&<p role="status" className="notice">Ao vivo desativado no servidor. Plano B: aba Simulado, sem microfone. Ativação exige configuração segura, acesso aos modelos e autorização de custo.</p>}
  <div className="live-access">
   <label htmlFor="demo-token">Código de acesso da demo local (não é a chave OpenAI)</label>
   <input id="demo-token" type="password" autoComplete="off" value={token} maxLength={256} disabled={connection!=='idle'} onChange={e=>setToken(e.target.value)}/>
   <label className="review-check"><input type="checkbox" checked={consent} disabled={connection!=='idle'} onChange={e=>setConsent(e.target.checked)}/><span>Entendi o envio de áudio e texto à OpenAI e estou autorizada a usar a API com custo nesta demo.</span></label>
   <div className="input-actions"><button className="primary" disabled={!enabled||!consent||token.length<32||connection!=='idle'} onClick={()=>void start()}>{connection==='connecting'?<LoaderCircle size={16} className="spin"/>:<Mic size={16}/>}Iniciar conversa real</button><button className="text-button" disabled={connection==='idle'||connection==='closing'} onClick={()=>void stop()}><MicOff size={16}/>Encerrar conversa</button><span>{Math.ceil(seconds)} s informados pela API</span></div>
   <audio ref={audio} autoPlay controls aria-label="Áudio da conversa OpenAI"/>
   <p role="status">{notice}</p>{failure&&<p role="alert" className="notice error">{failure}</p>}
  </div>
  <section className="command-log" aria-live="polite" aria-label="Comandos executados pela voz">
   <div className="panel-heading"><h3>Comandos da voz</h3><span>{log[0]?log[0].name:'aguardando fala'}</span></div>
   {log.length===0?<p>Nenhum comando ainda. O modelo pode registrar, corrigir, analisar, confirmar ou recomeçar. A transcrição sozinha não altera o relato.</p>:<ol>{log.map(entry=><li key={entry.id}><code>{entry.name}</code><span>{entry.ok?'feito':'recusado'}</span><span>{entry.summary}</span></li>)}</ol>}
  </section>
  <div className="workspace-grid">
   <section className="conversation" id="conversation" tabIndex={-1} aria-label="Transcrição ao vivo"><div className="panel-heading"><h3>O que foi dito</h3><span>{connection==='active'?'Microfone ativo':connection==='connecting'?'Conectando':connection==='closing'?'Encerrando':'Microfone desligado'}</span></div>
    <div className="transcript" aria-live="polite">{lines.length===0?<p>A transcrição aparece após iniciar a conversa.</p>:lines.map((line,i)=><article className={'message '+line.role} key={i}><div className="message-label">{line.role==='user'?'PESSOA SOLICITANTE':'GPT-LIVE'}</div><p>{line.text}</p></article>)}</div>
    <div className="input-area"><label htmlFor="live-incident">Relato atual ao vivo <span>versão {state.reportVersion}</span></label><textarea id="live-incident" value={state.draftText} maxLength={8000} rows={5} disabled={!!state.ticket||connection==='connecting'||connection==='closing'} onChange={e=>invalidate(e.target.value)}/><p className="input-caption">O relato muda quando o modelo registra ou corrige, ou quando você edita este campo. Uma interrupção não cancela uma análise; uma correção descarta o resultado antigo.</p><button className="primary" disabled={connection!=='active'||!state.draftText.trim()||state.status==='analyzing'||!!state.ticket} onClick={analyzeFromButton}><Sparkles size={15}/>Analisar com Decisions <ArrowRight size={15}/></button></div>
   </section>
   <aside className="decision-panel" aria-label="Revisão ao vivo"><div className="panel-heading"><h3>Revisão humana</h3><ShieldCheck size={20}/></div><div className="decision-content">
    <div className="suggestion"><span className="example-badge">{state.analysis?'OPENAI · DECISIONS':'SEM ANÁLISE'}</span><h3>{state.analysis?TEAMS[state.analysis.team]:'Aguardando relato'}</h3><p>{state.analysis?.explanation??'Nenhuma sugestão foi aplicada.'}</p>{state.analysis&&<p>Contexto: {state.analysis.probability.toFixed(2)} · Confiança da escolha: {state.analysis.confidence.toFixed(2)} · Impacto: {state.analysis.score.toFixed(2)} / 2 (não é prioridade)</p>}</div>
    {state.ticket?<div className="ticket-created"><p>TICKET SIMULADO</p><h3>{state.ticket.id}</h3><h4>{state.ticket.title}</h4><p>{state.ticket.description}</p><strong>{TEAMS[state.ticket.team]}</strong><p>Nenhum sistema externo recebeu este ticket.</p><MonitoringNote insight={state.insight} history={state.history}/></div>:<div className="ticket-draft"><label htmlFor="live-title">Título do ticket ao vivo</label><input id="live-title" maxLength={200} value={state.title} onChange={e=>apply({type:'TITLE',value:e.target.value})}/><label htmlFor="live-team">Equipe sugerida ao vivo</label><select id="live-team" value={state.team} disabled={state.status!=='review'} onChange={e=>apply({type:'TEAM',value:e.target.value as Team})}>{Object.entries(TEAMS).map(([id,label])=><option key={id} value={id}>{label}</option>)}</select><label className="review-check"><input type="checkbox" checked={state.reviewed} disabled={state.status!=='review'} onChange={e=>apply({type:'REVIEW',checked:e.target.checked})}/><span>Revisei este relato ao vivo e a equipe.</span></label><button className="create-button" disabled={!canCreate(state)} onClick={confirm}>Confirmar ticket simulado ao vivo</button></div>}
    {state.notice&&<p className="notice" role="status">{state.notice}</p>}
   </div></aside>
  </div>
 </section>;
}
