'use client';
import { useEffect, useRef, useState, type CSSProperties } from 'react';
import { AnimatePresence, LayoutGroup, MotionConfig, motion } from 'motion/react';
import NumberFlow from '@number-flow/react';
import { ArrowLeft, AudioLines, Braces, Crown, LoaderCircle, Mic, MicOff, ShieldCheck, Sparkles, Trophy, UserCheck, Volume2, VolumeX } from 'lucide-react';
import { TEAMS, type Team } from '../domain/service-desk';
import { addCard, boardSummary, cardAnnouncement, COLUMNS, columnCounts, createTriage, hear, noteCall, pendingReport, resolveReview, topTeam, urgencyLabel, type TriageState } from '../domain/triage';
import type { LiveEvent } from '../domain/live-contract';
import { LiveBrowser } from '../client/live-browser';
import { Confetti } from './celebrate';
import SignalBackdrop from './signal-backdrop';
import { ColumnIcon, ConfidenceRing, FlowRail, UrgencyIcon, type FlowStage } from './triage-visuals';

const MAX_DELEGATIONS = 60;
const PLACED_MS = 2400;
const SPRING = { type: 'spring', stiffness: 360, damping: 30 } as const;
const COLUMN_HINT: Record<Team, string> = {
  access: 'Senha, login e identidade',
  applications: 'Sistemas internos e erros',
  infrastructure: 'Rede e conectividade',
  human: 'Pouco contexto ou baixa confiança',
};

export default function TriageBoard(){
 const [board,setBoard]=useState<TriageState>(createTriage);
 const current=useRef(board);
 const [enabled,setEnabled]=useState<boolean|null>(null);
 const [token,setToken]=useState('');
 const [consent,setConsent]=useState(false);
 const [connection,setConnection]=useState<'idle'|'connecting'|'active'|'closing'>('idle');
 const [notice,setNotice]=useState('');
 const [failure,setFailure]=useState('');
 const [seconds,setSeconds]=useState(0);
 const [assistant,setAssistant]=useState('');
 const [classifying,setClassifying]=useState(false);
 const [finished,setFinished]=useState(false);
 const [showJson,setShowJson]=useState(false);
 const [stage,setStage]=useState<FlowStage>('idle');
 const [flying,setFlying]=useState<{id:number;text:string}|null>(null);
 const [micMuted,setMicMuted]=useState(false);
 const [voiceMuted,setVoiceMuted]=useState(false);
 const stageTimer=useRef<ReturnType<typeof setTimeout>|null>(null);
 const audio=useRef<HTMLAudioElement>(null);
 const audioCtx=useRef<AudioContext|null>(null);
 const live=useRef<LiveBrowser|null>(null);
 const level=useRef(0);
 const mounted=useRef(true);
 const busy=useRef(false);
 const delegations=useRef(new Set<string>());
 const generation=useRef(0);
 function commit(next:TriageState){current.current=next;if(mounted.current)setBoard(next);}
 function settle(next:FlowStage,after=0){
  if(stageTimer.current)clearTimeout(stageTimer.current);
  if(after)stageTimer.current=setTimeout(()=>{if(mounted.current)setStage(next);},after);
  else setStage(next);
 }
 useEffect(()=>{
  mounted.current=true;
  const abort=new AbortController();
  fetch('/api/live',{signal:abort.signal}).then(r=>r.json()).then(data=>{if(mounted.current)setEnabled(data.enabled===true);}).catch(()=>{if(mounted.current)setEnabled(false);});
  return()=>{mounted.current=false;generation.current++;abort.abort();if(stageTimer.current)clearTimeout(stageTimer.current);void audioCtx.current?.close();void live.current?.stop();};
 },[]);
 async function classify(delegationId:string|null){
  const client=live.current,epoch=generation.current;
  if(!client?.active)return;
  const text=pendingReport(current.current);
  if(!text){client.send('Ainda não ouvi um relato novo. Peça para a apresentadora descrever o problema antes de registrar.',delegationId,false);return;}
  if(busy.current){client.send('Ainda estou classificando o chamado anterior. Já volto com o resultado.',delegationId,false);return;}
  busy.current=true;setClassifying(true);setFailure('');
  commit(noteCall(current.current));
  setFlying({id:(current.current.cards.at(-1)?.id??0)+1,text});settle('deciding');
  try{
   const result=await client.request({action:'decide',sessionId:client.id,revision:current.current.calls,text,transcript:[]});
   if(epoch!==generation.current||!mounted.current)return;
   const next=addCard(current.current,text,result.result,Date.now());
   // Same render as the new card, so the shared layoutId animates the flight.
   setFlying(null);commit(next);
   settle('placed');settle('listening',PLACED_MS);
   client.send(cardAnnouncement(next.cards.at(-1)!),delegationId,false);
   client.send(boardSummary(next),null,true);
  }catch(e){
   if(epoch!==generation.current)return;
   const message=e instanceof Error?e.message:'A classificação falhou.';
   setFailure(message);setFlying(null);settle('listening');
   client.send('A classificação falhou e nenhum cartão foi criado. '+message,delegationId,false);
  }finally{busy.current=false;if(mounted.current)setClassifying(false);}
 }
 function eventReceived(event:LiveEvent,epoch:number){
  if(!mounted.current||epoch!==generation.current)return;
  if(event.type==='session.started'){
   setConnection('active');settle('listening');setNotice('Microfone ativo. Repita o relato da plateia e diga “registra” para classificar.');
   live.current?.send(boardSummary(current.current),null,true);
   live.current?.send('Cumprimente a sala em uma frase e diga que a triagem ao vivo está pronta para o primeiro relato.',null,false);
   return;
  }
  if(event.type==='session.usage.updated'||event.type==='session.closed'){if(event.usage)setSeconds(event.usage.seconds);return;}
  if(event.type==='session.input_transcript.delta'){commit(hear(current.current,event.delta));return;}
  if(event.type==='session.output_transcript.delta'){setAssistant(prev=>(prev+event.delta).slice(-280));return;}
  if(event.type==='session.delegation.created'){
   const id=event.delegation.id;
   if(delegations.current.has(id))return;
   delegations.current.add(id);
   if(delegations.current.size>MAX_DELEGATIONS){setNotice('Limite de pedidos de classificação atingido.');void stop();return;}
   setAssistant('');settle('delegated');
   void classify(id);
  }
 }
 async function start(){
  if(connection!=='idle'||!enabled||!consent||token.length<32||!audio.current)return;
  if(!audioCtx.current||audioCtx.current.state==='closed')audioCtx.current=new AudioContext();
  void audioCtx.current.resume();
  const epoch=++generation.current;
  setConnection('connecting');setFailure('');setFinished(false);setSeconds(0);setAssistant('');setNotice('Solicitando acesso ao microfone…');
  setMicMuted(false);setVoiceMuted(false);audio.current.muted=false;
  delegations.current.clear();busy.current=false;commit(createTriage());
  const client=new LiveBrowser({token,audio:audio.current,audioContext:audioCtx.current,mode:'triage',
   onInputLevel:value=>{level.current=value;},
   onEvent:event=>eventReceived(event,epoch),
   onNotice:text=>{if(mounted.current&&epoch===generation.current)setNotice(text);},
   onEnded:()=>{if(mounted.current&&epoch===generation.current){setConnection('idle');settle('idle');setFlying(null);setFinished(current.current.cards.length>0);}}});
  live.current=client;
  try{await client.start();}
  catch(e){if(mounted.current&&epoch===generation.current)setFailure(e instanceof Error?e.message:'Falha na conexão.');await client.stop();}
 }
 async function stop(){setConnection('closing');await live.current?.stop();if(mounted.current)setConnection('idle');}
 function toggleMic(){const next=!micMuted;live.current?.setMicMuted(next);setMicMuted(next);}
 function toggleVoice(){const next=!voiceMuted;if(audio.current)audio.current.muted=next;setVoiceMuted(next);}
 function route(id:number,team:Team){
  const next=resolveReview(current.current,id,team);
  commit(next);
  live.current?.send(boardSummary(next),null,true);
 }
 const counts=columnCounts(board);
 const top=topTeam(board);
 const pending=pendingReport(board);
 const active=connection==='active';
 return <MotionConfig reducedMotion="user"><LayoutGroup><SignalBackdrop voiceLevel={level}/><main className="triage">
  <a className="skip" href="#board">Pular para o quadro</a>
  <header className="topbar">
   <a className="brand" href="/" aria-label="Voltar para a Alô, TI"><span className="brand-mark"><AudioLines size={20}/></span><span>Triagem<span className="brand-light"> ao vivo</span></span></a>
   <div className="event-name"><span className="tiny-square"/>DEV<span className="event-slash">/</span>DAY EXCHANGE <span className="city">RIO 2026</span></div>
   <a className="docs-link" href="/"><ArrowLeft size={15}/><span>Alô, TI</span></a>
  </header>
  <section className="intro triage-intro">
   <div><p className="eyebrow"><span/>GPT-LIVE + DECISIONS API</p><h1>Conte um problema.<br/><span>A sala vira uma fila de suporte.</span></h1><p className="intro-copy">A voz escuta, o Decisions classifica e cada relato vira um cartão. Quando a confiança é baixa, quem decide é você.</p></div>
   <div className="intro-note"><span className="note-icon"><ShieldCheck size={22}/></span><p>A inteligência sugere.<br/><strong>Você decide.</strong></p></div>
  </section>

  <section className="tri-console" aria-label="Controle da sessão de voz">
   {!active&&connection!=='closing'?<div className="tri-access">
    {enabled===false&&<p className="notice attention" role="status">Ao vivo desativado no servidor. Configure o .env.local seguro e reinicie o servidor.</p>}
    <label htmlFor="tri-token">Código de acesso da demo local (não é a chave OpenAI)</label>
    <input id="tri-token" type="password" autoComplete="off" value={token} maxLength={256} disabled={connection!=='idle'} onChange={e=>setToken(e.target.value)}/>
    <label className="review-check"><input type="checkbox" checked={consent} disabled={connection!=='idle'} onChange={e=>setConsent(e.target.checked)}/><span>Entendi o envio de áudio e texto à OpenAI e estou autorizada a usar a API com custo nesta demo. Dados fictícios.</span></label>
    <button className="primary start" disabled={!enabled||!consent||token.length<32||connection!=='idle'} onClick={()=>void start()}>{connection==='connecting'?<LoaderCircle size={17} className="spin"/>:<Mic size={17}/>}Iniciar triagem ao vivo</button>
   </div>:<div className="tri-live">
    <div className={'live-voice'+(active&&!micMuted?' is-listening':'')+(micMuted?' is-muted':'')}>
     <button type="button" className={'live-voice-icon'+(micMuted?' is-off':'')} aria-pressed={micMuted} aria-label={micMuted?'Ativar meu microfone':'Mutar meu microfone'} title={micMuted?'Ativar meu microfone':'Mutar meu microfone'} disabled={!active} onClick={toggleMic}>{micMuted?<MicOff size={22}/>:<Mic size={22}/>}</button>
     <span className="live-voice-copy"><strong>{micMuted?'Microfone mudo':active?'Ouvindo a sala':'Encerrando'}</strong><small>{micMuted?'Clique no microfone para voltar a ouvir':'Diga “registra” para classificar'}</small></span>
     <button type="button" className={'live-voice-icon is-speaker'+(voiceMuted?' is-off':'')} aria-pressed={voiceMuted} aria-label={voiceMuted?'Ativar a voz da assistente':'Mutar a voz da assistente'} title={voiceMuted?'Ativar a voz da assistente':'Mutar a voz da assistente'} disabled={!active} onClick={toggleVoice}>{voiceMuted?<VolumeX size={22}/>:<Volume2 size={22}/>}</button>
    </div>
    <div className="tri-stats">
     <span aria-label={`${board.cards.length} chamados`}><NumberFlow value={board.cards.length} aria-hidden="true"/> chamados</span>
     <span aria-label={`${board.calls} chamadas ao Decisions`}><NumberFlow value={board.calls} aria-hidden="true"/> chamadas ao Decisions</span>
     <span aria-label={`${Math.ceil(seconds)} segundos de voz`}><NumberFlow value={Math.ceil(seconds)} aria-hidden="true"/> s de voz</span>
    </div>
    <div className="tri-actions">
     <button className="text-button" disabled={!active||classifying||!pending} onClick={()=>void classify(null)}><Sparkles size={15}/>Classificar agora</button>
     <button className="primary" disabled={connection!=='active'} onClick={()=>void stop()}><MicOff size={15}/>Encerrar triagem</button>
    </div>
   </div>}
   <audio ref={audio} autoPlay aria-label="Áudio da triagem"/>
   <p role="status" className="tri-notice">{notice}</p>
   {failure&&<p role="alert" className="notice error">{failure}</p>}
   <FlowRail stage={active?stage:'idle'}/>
  </section>

  {(active||pending||classifying)&&<section className="tri-captions" aria-live="polite" aria-label="Legenda ao vivo">
   <p><span>OUVINDO</span>{pending||(flying?'':'…')}<i className="tri-caret" aria-hidden="true"/></p>
   <AnimatePresence>{flying&&<motion.div key={flying.id} layoutId={`card-${flying.id}`} transition={SPRING} className="tri-card is-flying">
    <div className="tri-card-head"><span className="tri-id">#{flying.id}</span><span className="tri-thinking"><LoaderCircle size={14} className="spin"/>Decisions analisando…</span></div>
    <p>{flying.text}</p>
   </motion.div>}</AnimatePresence>
   {assistant&&<p className="tri-assistant"><span>TRIAGEM</span>{assistant}</p>}
  </section>}

  <section id="board" className="tri-board" aria-label="Quadro de triagem" tabIndex={-1}>
   {COLUMNS.map(team=><div key={team} className={'tri-column'+(team==='human'?' is-review':'')} aria-label={TEAMS[team]}>
    <header><ColumnIcon team={team}/><div><h2>{TEAMS[team]}{top===team&&<Crown size={16} className="tri-crown" aria-label="Equipe com mais chamados"/>}</h2><small>{COLUMN_HINT[team]}</small></div><span className="tri-count" aria-label={`${counts[team]} chamados`}><NumberFlow value={counts[team]} aria-hidden="true"/></span></header>
    <ol>
     {counts[team]===0&&<li className="tri-empty">{team==='human'?'Casos incertos aparecem aqui':'Nenhum chamado ainda'}</li>}
     <AnimatePresence initial={false}>{board.cards.filter(card=>card.team===team).reverse().map(card=><motion.li key={card.id} layout layoutId={`card-${card.id}`} transition={SPRING} className={'tri-card'+(card.decidedBy==='human'?' by-human':'')}>
      <div className="tri-card-head"><span className="tri-id">#{card.id}</span><ConfidenceRing value={card.confidence}/></div>
      <p>{card.text}</p>
      <div className="tri-urgency"><span><UrgencyIcon score={card.score}/>{urgencyLabel(card.score)}</span><span className="tri-bar"><i style={{'--value':Math.min(1,card.score/2)} as CSSProperties}/></span></div>
      {card.decidedBy==='human'&&<span className="human-reminder is-new"><UserCheck size={13}/>Decidido por você</span>}
      {card.team==='human'&&<div className="tri-route" role="group" aria-label={`Encaminhar chamado ${card.id}`}>
       {COLUMNS.filter(option=>option!=='human').map(option=><button key={option} onClick={()=>route(card.id,option)}>{TEAMS[option]}</button>)}
      </div>}
     </motion.li>)}</AnimatePresence>
    </ol>
   </div>)}
  </section>

  {finished&&<section className="tri-finale" aria-label="Resultado da triagem">
   <Confetti/>
   <Trophy size={28}/>
   <h2>{board.cards.length} chamados triados ao vivo</h2>
   <p>{top?<>Mais chamados em <strong>{TEAMS[top]}</strong>. </>:null}{counts.human>0?`${counts.human} ainda aguardam decisão humana.`:'Nenhum ficou sem dono.'} {board.calls} chamadas ao Decisions.</p>
  </section>}

  <section className="tri-evidence">
   <button className="text-button" onClick={()=>setShowJson(!showJson)} aria-expanded={showJson}><Braces size={15}/>Evidência da última decisão</button>
   {showJson&&<pre aria-label="Última resposta do Decisions">{JSON.stringify(board.last??{status:'Aguardando o primeiro chamado'},null,2)}</pre>}
  </section>
  <footer className="site-footer"><p>Triagem ao vivo · GPT-Live + Decisions API<br/><span>DevDay Exchange Community · Rio de Janeiro, 2026</span></p><p>Dados fictícios. A IA sugere, a pessoa decide.<br/><span>Material da comunidade. Este não é um produto oficial da OpenAI.</span></p></footer>
 </main></LayoutGroup></MotionConfig>;
}
