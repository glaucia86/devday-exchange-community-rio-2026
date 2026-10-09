'use client';
import { useEffect, useReducer, useRef, useState, type CSSProperties } from 'react';
import { ArrowDown, ArrowRight, ArrowUpRight, AudioLines, Check, CheckCheck, ChevronDown, CircleHelp, Code2, FileText, Headphones, Info, LoaderCircle, LockKeyhole, MessageSquareText, Play, Radio, RotateCcw, ShieldCheck, Sparkles, Ticket, Volume2, VolumeX, X } from 'lucide-react';
import { canCreate, createDesk, deskReducer, mockDecision, SCENARIOS, TEAMS, type ScenarioId, type Team } from '../domain/service-desk';

import { Confetti, TicketId } from './celebrate';
import LiveDesk from './live-desk';
import MonitoringNote from './monitoring-note';
import SignalBackdrop from './signal-backdrop';
import { getSpokenReply } from '../domain/spoken-reply';

const FLOW = [['Relato',MessageSquareText],['Decisions sugere',Sparkles],['Você revisa',ShieldCheck],['Ticket criado',Ticket]] as const;
function flowStep(state:{status:string;reviewed:boolean}){
  if(state.status==='created')return 4;
  if(state.status==='review')return state.reviewed?3:2;
  return state.status==='ready'?0:1;
}
const STATUS = {ready:'Pronto para começar','needs-analysis':'Relato recebido',analyzing:'Analisando o relato',review:'Pronto para revisar',clarify:'Precisamos esclarecer',unsupported:'Texto livre não analisado',created:'Ticket criado',error:'Tente novamente'};
export default function ServiceDesk(){
  const [state,dispatch]=useReducer(deskReducer,undefined,()=>createDesk());
  const [sound,setSound]=useState(false);
  const [speaking,setSpeaking]=useState(false);
  const [voiceNotice,setVoiceNotice]=useState('');
  const [showLive,setShowLive]=useState(false);
  const [stage,setStage]=useState(false);
  const [showDetails,setShowDetails]=useState(false);
  const [simulateFailure,setSimulateFailure]=useState(false);
  const [voiceReady,setVoiceReady]=useState(false);
  const spoken=useRef('');
  const liveVoiceLevel=useRef(0);
  const end=useRef<HTMLDivElement>(null);
  const incident=useRef<HTMLTextAreaElement>(null);
  useEffect(()=>{
    if(!('speechSynthesis' in window))return;
    const check=()=>setVoiceReady(window.speechSynthesis.getVoices().some(v=>v.localService&&v.lang.startsWith('pt')));
    check();window.speechSynthesis.addEventListener('voiceschanged',check);
    return()=>{window.speechSynthesis.removeEventListener('voiceschanged',check);window.speechSynthesis.cancel();};
  },[]);
  useEffect(()=>{
    if(state.status!=='analyzing')return;
    const {session,revision,scenario,corrected}=state;
    const timer=window.setTimeout(()=>dispatch(simulateFailure?{type:'FAILED',session,revision}:{type:'RESOLVED',session,revision,result:mockDecision(scenario,corrected)}),900);
    return()=>window.clearTimeout(timer);
  },[state.status,state.session,state.revision,state.scenario,state.corrected,simulateFailure]);
  useEffect(()=>{end.current?.scrollIntoView({behavior:'instant',block:'nearest'});},[state.messages.length]);
  useEffect(()=>{
    if(!sound||!('speechSynthesis' in window))return;
    const reply=getSpokenReply(state,spoken.current); if(!reply)return;
    window.speechSynthesis.cancel();
    const voice=window.speechSynthesis.getVoices().find(v=>v.localService&&v.lang.startsWith('pt'));
    if(!voice){setVoiceNotice('Nenhuma voz local em português está disponível. A transcrição continua funcionando.');return;}
    spoken.current=reply.key;setVoiceNotice('');
    const speech=new SpeechSynthesisUtterance(reply.text);speech.lang='pt-BR';speech.voice=voice;speech.rate=1;
    speech.onstart=()=>setSpeaking(true);speech.onend=()=>setSpeaking(false);speech.onerror=()=>{setSpeaking(false);setVoiceNotice('A reprodução de voz não ficou disponível. Continue pela transcrição.');};
    window.speechSynthesis.speak(speech);
    return()=>{window.speechSynthesis.cancel();setSpeaking(false);};
  },[state.messages,state.revision,state.session,state.status,sound,voiceReady]);
  function stopAudio(){if('speechSynthesis' in window)window.speechSynthesis.cancel();setSpeaking(false);}
  function replay(id:ScenarioId){stopAudio();spoken.current='';dispatch({type:'REPLAY',scenario:id});}
  function reset(){stopAudio();spoken.current='';dispatch({type:'RESET'});setVoiceNotice('');}
  function editReport(){stopAudio();const field=incident.current;if(!field||field.disabled)return;field.focus();field.select();}
  const active=state.status!=='ready';
  const unsupported=state.status==='unsupported';
  const locked=state.ticket?'Ticket já criado. Use Recomeçar para outro relato.':undefined;
  const step=showLive?0:flowStep(state);
  return <><SignalBackdrop voiceLevel={liveVoiceLevel}/><main className={stage?'stage':undefined}>
    <a className="skip" href="#conversation">Pular para a conversa</a>
    <header className="topbar">
      <a className="brand" href="/" aria-label="Alô, TI, início"><span className="brand-mark"><AudioLines size={23}/></span><span>Alô,<span className="brand-light"> TI</span></span></a>
      <div className="event-name"><span className="tiny-square"/>DEV<span className="event-slash">/</span>DAY EXCHANGE <span className="city">RIO 2026</span></div>
      <a className="docs-link" href="https://developers.openai.com/api/docs/guides/decisions" target="_blank" rel="noreferrer">Documentação <ArrowUpRight size={15}/></a>
    </header>
    <section className="intro">
      <div><p className="eyebrow"><span/>LAB / DECISIONS API</p><h1>Uma conversa.<br/><span>O próximo passo.</span></h1><p className="intro-copy">Do relato à equipe certa. Acompanhe a decisão,<br className="desktop-break"/> ajuste o contexto e confirme cada encaminhamento.</p><ol className="flow-pills" aria-label="Fluxo da demo">{FLOW.map(([label,Icon],i)=>{const n=i+1;const phase=n<step?'done':n===step?'current':'';return <li key={label} className={phase} aria-current={phase==='current'?'step':undefined}><Icon size={14}/>{label}</li>;})}</ol></div>
      <div className="intro-note"><span className="note-icon"><ShieldCheck size={22}/></span><p>A inteligência sugere.<br/><strong>Você decide.</strong></p><span className="note-rule"/></div>
    </section>
    <div className="workspace-label"><span><span className="status-dot"/>SERVICE DESK FICTÍCIO</span><span>FEITO PARA EXPLORAR, CORRIGIR E APRENDER</span></div>
    <section className="workspace" aria-label="Laboratório Alô, TI">
      <div className="workspace-toolbar">
        <div className="mode-switch"><button className={!showLive?"mode-selected":""} onClick={()=>setShowLive(false)}><Radio size={14}/>Simulado</button><button className={showLive?"mode-selected":""} onClick={()=>{stopAudio();setSound(false);setShowLive(!showLive);}} aria-expanded={showLive}><LockKeyhole size={13}/>OpenAI ao vivo <ChevronDown size={13}/></button></div>
        {!showLive&&<div className="toolbar-actions"><button onClick={()=>setStage(!stage)} aria-pressed={stage}><span>{stage?'Palco ligado':'Modo palco'}</span></button><button onClick={()=>{stopAudio();setSound(!sound);}} aria-pressed={sound} title="Reprodução com voz local do dispositivo, quando disponível">{sound?<Volume2 size={17}/>:<VolumeX size={17}/>}<span>{sound?'Som ligado':'Som desligado'}</span></button><button onClick={reset}><RotateCcw size={16}/><span>Recomeçar</span></button></div>}
      </div>
      {showLive&&<LiveDesk onInputLevel={level=>{liveVoiceLevel.current=level;}}/>}
      {!showLive&&<div className="workspace-grid">
        <section className="conversation" id="conversation" tabIndex={-1} aria-label="Conversa e transcrição">
          <div className="panel-heading"><div><span className="step-label">01 / O RELATO</span><h2>Vamos conversar</h2></div><span className={'conversation-state '+(speaking?'speaking ':'')+(unsupported?'attention':'')}>{speaking?<AudioLines size={14}/>:<span className="small-dot"/>}{speaking?'Reproduzindo voz local':STATUS[state.status]}</span></div>
          {!active?<div className="welcome">
            <div className="voice-symbol" aria-hidden="true"><i/><i/><i/><i/><i/><i/><i/></div>
            <h3>Toda solução começa<br/>com um bom relato.</h3><p>Escolha um cenário para acompanhar uma conversa.<br/>Você pode corrigir os detalhes antes de seguir.</p>
            <button className="primary start" onClick={()=>replay('access')}><Play size={17} fill="currentColor"/>Explorar cenário<ArrowRight size={17}/></button>
            <span className="welcome-caption">Escolha um relato para ver a equipe sugerida.</span>
          </div>:<div className="transcript" aria-label="Transcrição do cenário" aria-live="polite" aria-relevant="additions">
            {state.messages.map(message=>{const attention=unsupported&&message.id===state.messages.at(-1)?.id;return <article className={'message '+message.role+(attention?' attention':'')} key={`${state.session}-${message.id}`}><div className="message-label">{message.role==='assistant'?<Headphones size={13}/>:<MessageSquareText size={13}/>}<span>{message.role==='assistant'?'ALÔ, TI':'PESSOA SOLICITANTE'}</span></div><p>{message.text}</p></article>;})}
            {state.status==='analyzing'&&<div className="thinking"><LoaderCircle size={15} className="spin"/>Analisando o relato…</div>}
            <div ref={end}/>
          </div>}
          {active&&<div className="input-area"><label htmlFor="incident">Relato atual <span>versão {state.reportVersion}</span></label><textarea id="incident" ref={incident} value={state.draftText} rows={3} disabled={!!state.ticket} title={locked} onChange={e=>dispatch({type:'EDIT',value:e.target.value})}/><div className="input-actions"><div className="edit-actions"><button className="text-button" disabled={!!state.ticket} title={locked??'Abre o relato atual para você editar'} onClick={editReport}>Corrigir o relato <ArrowRight size={14}/></button><button className="text-button" disabled={state.corrected||!!state.ticket} title={locked??'Insere um exemplo pronto do palco, separado do que você escrever'} onClick={()=>{stopAudio();dispatch({type:'CORRECT'});}}>Simular uma correção <ArrowRight size={14}/></button></div><button className="primary" disabled={state.status==='analyzing'||!state.draftText.trim()||!!state.ticket} title={locked} onClick={()=>dispatch({type:'ANALYZE'})}>{state.status==='analyzing'?<LoaderCircle size={15} className="spin"/>:<Sparkles size={15}/>}Analisar relato</button></div><p className="input-caption">{state.ticket?'Ticket criado. Use Recomeçar para abrir outro relato.':'Edite o relato e analise de novo. Simular uma correção insere um exemplo pronto, separado do que você escrever.'}</p></div>}
          <div className="scenarios"><span className="scenarios-label">OUTROS RELATOS</span><div>{(Object.entries(SCENARIOS) as [ScenarioId,typeof SCENARIOS[ScenarioId]][]).map(([id,scenario])=><button key={id} onClick={()=>replay(id)} className={active&&state.scenario===id?'selected':''}><span>{scenario.label}</span><ArrowUpRight size={13}/></button>)}</div></div>
        </section>
        <aside className="decision-panel" aria-label="Análise e revisão do ticket">
          <div className="panel-heading"><div><span className="step-label">02 / O ENCAMINHAMENTO</span><h2>Um passo de cada vez</h2></div><span className="panel-symbol"><Ticket size={19}/></span></div>
          <div className="decision-content">
            <div key={state.analysis?`${state.session}-${state.revision}`:'empty'} className={'suggestion '+(state.analysis?'has-result':'')+(unsupported?' unsupported':'')}><div className="suggestion-heading"><span>{unsupported?'SEM ENCAMINHAMENTO':'EQUIPE SUGERIDA'}</span>{state.analysis||unsupported?null:<CircleHelp size={15}/>}</div><h3>{state.analysis?TEAMS[state.analysis.team]:unsupported?'Nenhuma equipe sugerida':'Ainda estamos ouvindo'}</h3><p>{state.analysis?state.analysis.explanation:unsupported?(state.messages.at(-1)?.text??''):'A sugestão aparece depois que o relato estiver pronto para análise.'}</p>{state.analysis&&<div className="confidence"><span>Confiança</span><span className="confidence-track"><i style={{'--value':Math.min(1,Math.max(0,state.analysis.confidence))} as CSSProperties}/></span><strong>{Math.round(state.analysis.confidence*100)}%</strong></div>}{state.analysis&&<div className="human-reminder"><ShieldCheck size={13}/>A revisão humana continua necessária</div>}</div>
            <div className="flow-connector"><ArrowDown size={16}/></div>
            {state.ticket?<div className="ticket-created"><Confetti/><span className="ticket-check"><CheckCheck size={25}/></span><p className="step-label">TICKET SIMULADO CRIADO</p><TicketId id={state.ticket.id}/><h4>{state.ticket.title}</h4><p>{state.ticket.description}</p><div><span>Equipe confirmada</span><strong>{TEAMS[state.ticket.team]}</strong></div><div><span>Origem</span><strong>Demo local · versão {state.ticket.revision}</strong></div><p className="ticket-footnote">Nenhum sistema externo recebeu este ticket.</p><MonitoringNote insight={state.insight} history={state.history}/></div>:<div className="ticket-draft"><div className="draft-heading"><span><FileText size={16}/>Prévia do ticket</span><span className="draft-badge">RASCUNHO</span></div><label htmlFor="ticket-title">Título</label><input id="ticket-title" value={state.title} placeholder="O que precisa ser resolvido?" disabled={!active} onChange={e=>dispatch({type:'TITLE',value:e.target.value})}/><label htmlFor="ticket-team">Equipe responsável</label><select id="ticket-team" value={state.team} disabled={state.status!=='review'} onChange={e=>dispatch({type:'TEAM',value:e.target.value as Team})}>{Object.entries(TEAMS).map(([id,label])=><option value={id} key={id}>{label}</option>)}</select><label className="review-check"><input type="checkbox" checked={state.reviewed} disabled={state.status!=='review'} onChange={e=>dispatch({type:'REVIEW',checked:e.target.checked})}/><span>Revisei o relato e a equipe responsável.</span></label><button className="create-button" disabled={!canCreate(state)} onClick={()=>dispatch({type:'CREATE'})}><Check size={16}/>Confirmar e criar ticket simulado</button><p className="draft-caption"><LockKeyhole size={11}/>Nada é criado sem a sua confirmação.</p></div>}
            {!!state.notice&&<p className={'notice '+(state.status==='error'?'error':unsupported?'attention':'')} role="status">{state.notice}</p>}
          </div>
        </aside>
      </div>
      }
      <div className="workspace-footer"><span><ShieldCheck size={14}/>Dados fictícios. Decisões visíveis. Controle humano.</span><button onClick={()=>setShowDetails(!showDetails)} aria-expanded={showDetails}><Code2 size={15}/>Por trás da decisão<ChevronDown size={13}/></button></div>
      {showDetails&&!showLive&&<section className="technical"><div><h3>O contrato, sem mistério</h3><p>Uma probabilidade, uma escolha e uma pontuação. Estes números são exemplos fixos, não medidas obtidas de um modelo.</p><ul><li><code>predicate</code> Há contexto suficiente?</li><li><code>choice</code> Qual equipe deve revisar?</li><li><code>score</code> Qual impacto foi descrito, de 0 a 2?</li></ul><p>O score pode ser fracionário. Ele não é uma prioridade operacional.</p><label className="review-check"><input type="checkbox" checked={simulateFailure} onChange={e=>setSimulateFailure(e.target.checked)}/>Simular falha na próxima análise</label></div><pre aria-label="Resposta de exemplo">{JSON.stringify(state.analysis?{source:'fixture',session:state.session,revision:state.revision,answers:[{type:'predicate',name:'contexto',probability:state.analysis.probability},{type:'choice',name:'equipe',choice:state.analysis.team,confidence:state.analysis.confidence},{type:'score',name:'impacto',score:state.analysis.score,confidence:state.analysis.confidence}]}:{source:'fixture',status:'Aguardando relato'},null,2)}</pre></section>}
    </section>
    {(voiceNotice||(sound&&!voiceReady))&&<p className="audio-note" role="status"><Info size={14}/>{voiceNotice||'Ative uma voz local em português no dispositivo para ouvir o cenário. O modo simulado não usa áudio OpenAI.'}</p>}
    <footer className="site-footer"><p>Um experimento para aprender fazendo.<br/><span>DevDay Exchange Community · Rio de Janeiro, 2026</span></p><p>Modo simulado: respostas preparadas, sem modelo e sem microfone.<br/><span>Material da comunidade. Este não é um produto oficial da OpenAI.</span></p></footer>
  </main></>;
}
