'use client';
import { useEffect, useRef, useState } from 'react';
import { Mic, MicOff, ShieldCheck, Sparkles, LoaderCircle, ArrowRight } from 'lucide-react';
import { canCreate, createDesk, deskReducer, TEAMS, type DeskEvent, type Team } from '../domain/service-desk';
import { type LiveEvent, type TranscriptLine } from '../domain/live-contract';
import { LiveBrowser } from '../client/live-browser';

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
 const transcript=useRef<TranscriptLine[]>([]);
 const [seconds,setSeconds]=useState(0);
 const audio=useRef<HTMLAudioElement>(null);
 const live=useRef<LiveBrowser|null>(null);
 const mounted=useRef(true);
 const pending=useRef<AbortController|null>(null);
 const delegations=useRef(new Set<string>());
 const generation=useRef(0);
 function apply(event:DeskEvent){current.current=deskReducer(current.current,event);if(mounted.current)setState(current.current);}
 function invalidate(value:string){
  pending.current?.abort();pending.current=null;
  apply({type:'EDIT',value});
  live.current?.send('O relato foi atualizado; descarte a sugestão anterior. Aguarde nova análise e revisão humana.',null,true);
 }
 useEffect(()=>{
  mounted.current=true;
  const abort=new AbortController();
  fetch('/api/live',{signal:abort.signal}).then(r=>r.json()).then(data=>{if(mounted.current)setEnabled(data.enabled===true);}).catch(()=>{if(mounted.current)setEnabled(false);});
  return()=>{mounted.current=false;generation.current++;abort.abort();pending.current?.abort();void live.current?.stop();};
 },[]);
 async function analyze(delegationId:string|null=null){
  const client=live.current,snapshot=current.current,epoch=generation.current;
  if(!client?.active||!snapshot.draftText.trim()||snapshot.ticket||snapshot.status==='analyzing')return;
  pending.current?.abort();const controller=new AbortController();pending.current=controller;
  apply({type:'ANALYZE'});setFailure('');
  try{
   const result=await client.request({action:'decide',sessionId:client.id,revision:snapshot.revision,text:snapshot.draftText,transcript:transcript.current.slice(-30)},controller.signal);
   if(controller.signal.aborted||epoch!==generation.current||current.current.session!==snapshot.session||current.current.revision!==snapshot.revision||result.sessionId!==client.id||result.revision!==snapshot.revision)return;
   apply({type:'RESOLVED',session:snapshot.session,revision:snapshot.revision,result:result.result});
   if(current.current.analysis)client.send(current.current.analysis.explanation,delegationId);
  }catch(e){
   if(controller.signal.aborted||epoch!==generation.current)return;
   apply({type:'FAILED',session:snapshot.session,revision:snapshot.revision});
   setFailure(e instanceof Error?e.message:'A análise falhou.');
   client.send('A análise falhou. Nenhuma sugestão ou ticket foi confirmado.',delegationId);
  }finally{if(pending.current===controller)pending.current=null;}
 }
 function eventReceived(event:LiveEvent,epoch:number){
  if(!mounted.current||epoch!==generation.current)return;
  if(event.type==='session.started'){setConnection('active');setNotice('Microfone ativo. Use somente relatos fictícios.');return;}
  if(event.type==='session.usage.updated'||event.type==='session.closed'){if(event.usage)setSeconds(event.usage.seconds);return;}
  if(event.type==='session.input_transcript.delta'||event.type==='session.output_transcript.delta'){
   const role=event.type==='session.input_transcript.delta'?'user':'assistant';
   const next=transcript.current.map(line=>({...line}));
   if(next.at(-1)?.role===role)next[next.length-1].text+=event.delta;else next.push({role,text:event.delta});
   if(next.reduce((sum,line)=>sum+line.text.length,0)>8000){setNotice('Limite de transcrição atingido. Encerrando.');void stop();return;}
   transcript.current=next;setLines(next);
   if(role==='user'){
    invalidate(next.filter(line=>line.role==='user').map(line=>line.text).join('\n'));
    if(!current.current.title)apply({type:'TITLE',value:'Relato de suporte por voz'});
   }
   return;
  }
  if(event.type==='session.delegation.created'){
   const id=event.delegation.id;
   if(delegations.current.has(id))return;
   delegations.current.add(id);
   if(delegations.current.size>40){setNotice('Limite de delegações atingido.');void stop();return;}
   if(current.current.status==='analyzing'||!current.current.draftText.trim()){
    live.current?.send('Aguarde o relato atual e a análise em andamento. Não há novo resultado.',id,true);return;
   }
   void analyze(id);
  }
 }
 async function start(){
  if(connection!=='idle'||!enabled||!consent||token.length<32||!audio.current)return;
  setConnection('connecting');setFailure('');setNotice('Solicitando acesso ao microfone…');
  const epoch=++generation.current;
  apply({type:'RESET'});transcript.current=[];setLines([]);delegations.current.clear();setSeconds(0);
  const client=new LiveBrowser({token,audio:audio.current,onEvent:event=>eventReceived(event,epoch),
   onNotice:text=>{if(mounted.current&&epoch===generation.current)setNotice(text);},
   onEnded:()=>{if(mounted.current&&epoch===generation.current){setConnection('idle');pending.current?.abort();pending.current=null;}}});
  live.current=client;
  try{await client.start();}
  catch(e){if(mounted.current&&epoch===generation.current)setFailure(e instanceof Error?e.message:'Falha na conexão.');await client.stop();}
 }
 async function stop(){
  setConnection('closing');pending.current?.abort();pending.current=null;
  if(current.current.status==='analyzing')apply({type:'FAILED',session:current.current.session,revision:current.current.revision});
  await live.current?.stop();if(mounted.current)setConnection('idle');
 }
 function confirm(){
  if(!canCreate(current.current))return;
  apply({type:'CREATE'});
  if(current.current.ticket)live.current?.send('A pessoa confirmou na tela. Ticket DEMO-0001 criado apenas nesta demo, para '+TEAMS[current.current.ticket.team]+'. Nenhum sistema externo recebeu um ticket.');
 }
 return <section className="live-lab" aria-label="OpenAI ao vivo">
  <div className="panel-heading"><div><span className="step-label">GPT-LIVE + DECISIONS</span><h2>Conversa real, ticket simulado</h2></div><span className="example-badge">INTEGRAÇÃO EXPERIMENTAL</span></div>
  <p>O áudio do microfone e o relato serão enviados à OpenAI. GPT-Live conversa; Decisions sugere o encaminhamento. Use somente dados fictícios. A chave da OpenAI fica no servidor.</p>
  <p className="notice">Código integrado, ainda sem ensaio com a API e áudio reais. Sessões de voz e análises têm custo separado. Limite local: dois minutos por conversa; isso não substitui um limite de gasto na conta.</p>
  {enabled===false&&<p role="status" className="notice">Ao vivo desativado no servidor. O modo simulado continua disponível. Ativação exige configuração segura, acesso aos modelos e autorização de custo.</p>}
  <div className="live-access">
   <label htmlFor="demo-token">Código de acesso da demo local (não é a chave OpenAI)</label>
   <input id="demo-token" type="password" autoComplete="off" value={token} maxLength={256} disabled={connection!=='idle'} onChange={e=>setToken(e.target.value)}/>
   <label className="review-check"><input type="checkbox" checked={consent} disabled={connection!=='idle'} onChange={e=>setConsent(e.target.checked)}/><span>Entendi o envio de áudio e texto à OpenAI e estou autorizada a usar a API com custo nesta demo.</span></label>
   <div className="input-actions"><button className="primary" disabled={!enabled||!consent||token.length<32||connection!=='idle'} onClick={()=>void start()}>{connection==='connecting'?<LoaderCircle size={16} className="spin"/>:<Mic size={16}/>}Iniciar conversa real</button><button className="text-button" disabled={connection==='idle'||connection==='closing'} onClick={()=>void stop()}><MicOff size={16}/>Encerrar conversa</button><span>{Math.ceil(seconds)} s informados pela API</span></div>
   <audio ref={audio} autoPlay controls aria-label="Áudio da conversa OpenAI"/>
   <p role="status">{notice}</p>{failure&&<p role="alert" className="notice error">{failure}</p>}
  </div>
  <div className="workspace-grid">
   <section className="conversation" aria-label="Transcrição ao vivo"><div className="panel-heading"><h3>O que foi dito</h3><span>{connection==='active'?'Microfone ativo':connection==='connecting'?'Conectando':connection==='closing'?'Encerrando':'Microfone desligado'}</span></div>
    <div className="transcript" aria-live="polite">{lines.length===0?<p>A transcrição aparece após iniciar a conversa.</p>:lines.map((line,i)=><article className={'message '+line.role} key={i}><div className="message-label">{line.role==='user'?'PESSOA SOLICITANTE':'GPT-LIVE'}</div><p>{line.text}</p></article>)}</div>
    <div className="input-area"><label htmlFor="live-incident">Relato atual ao vivo <span>versão {state.revision}</span></label><textarea id="live-incident" value={state.draftText} maxLength={8000} rows={5} disabled={!!state.ticket||connection==='connecting'||connection==='closing'} onChange={e=>invalidate(e.target.value)}/><p className="input-caption">A fala chega em fragmentos. Novos detalhes invalidam a análise e a confirmação anteriores. Revise o texto completo antes de confirmar.</p><button className="primary" disabled={connection!=='active'||!state.draftText.trim()||state.status==='analyzing'||!!state.ticket} onClick={()=>void analyze()}><Sparkles size={15}/>Analisar com Decisions <ArrowRight size={15}/></button></div>
   </section>
   <aside className="decision-panel" aria-label="Revisão ao vivo"><div className="panel-heading"><h3>Revisão humana</h3><ShieldCheck size={20}/></div><div className="decision-content">
    <div className="suggestion"><span className="example-badge">{state.analysis?'OPENAI · DECISIONS':'SEM ANÁLISE'}</span><h3>{state.analysis?TEAMS[state.analysis.team]:'Aguardando relato'}</h3><p>{state.analysis?.explanation??'Nenhuma sugestão foi aplicada.'}</p>{state.analysis&&<p>Contexto: {state.analysis.probability.toFixed(2)} · Confiança da escolha: {state.analysis.confidence.toFixed(2)} · Impacto: {state.analysis.score.toFixed(2)} / 2 (não é prioridade)</p>}</div>
    {state.ticket?<div className="ticket-created"><p>TICKET SIMULADO</p><h3>{state.ticket.id}</h3><h4>{state.ticket.title}</h4><p>{state.ticket.description}</p><strong>{TEAMS[state.ticket.team]}</strong><p>Nenhum sistema externo recebeu este ticket.</p></div>:<div className="ticket-draft"><label htmlFor="live-title">Título do ticket ao vivo</label><input id="live-title" maxLength={200} value={state.title} onChange={e=>apply({type:'TITLE',value:e.target.value})}/><label htmlFor="live-team">Equipe sugerida ao vivo</label><select id="live-team" value={state.team} disabled={state.status!=='review'} onChange={e=>apply({type:'TEAM',value:e.target.value as Team})}>{Object.entries(TEAMS).map(([id,label])=><option key={id} value={id}>{label}</option>)}</select><label className="review-check"><input type="checkbox" checked={state.reviewed} disabled={state.status!=='review'} onChange={e=>apply({type:'REVIEW',checked:e.target.checked})}/><span>Revisei este relato ao vivo e a equipe.</span></label><button className="create-button" disabled={!canCreate(state)} onClick={confirm}>Confirmar ticket simulado ao vivo</button></div>}
    {state.notice&&<p className="notice" role="status">{state.notice}</p>}
   </div></aside>
  </div>
 </section>;
}
