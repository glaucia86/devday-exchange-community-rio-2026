import { parseLiveEvent, type LiveEvent } from '../domain/live-contract';
import type { TurnEvent } from '../domain/live-turn';
type Options={token:string;audio:HTMLAudioElement;audioContext?:AudioContext;mode?:'desk'|'triage';onInputLevel?:(level:number)=>void;onPlaybackBlocked?:()=>void;onEvent:(event:LiveEvent)=>void;onNotice:(text:string)=>void;onEnded:()=>void};
const CLOSE_REASONS:Record<string,string>={
 expired:'A plataforma encerrou a sessão por limite de duração (expired). ',
 content:'Um filtro de segurança da plataforma encerrou a sessão (content). ',
 remote_hangup:'A conexão principal foi encerrada pela plataforma (remote_hangup). ',
 connection_lost:'A conexão com a plataforma caiu (connection_lost). ',
};
export class LiveBrowser {
 private options:Options;
 private peer:RTCPeerConnection|null=null;
 private channel:RTCDataChannel|null=null;
 private stream:MediaStream|null=null;
 private outputStream:MediaStream|null=null;
 private sessionId:string|null=null;
 private stopped=false;
 private ready=false;
 private initializationAttempted=false;
 private closedEvent=false;
 private closing:Promise<boolean>|null=null;
 private deadline:ReturnType<typeof setTimeout>|null=null;
 private startup:Promise<void>|null=null;
 private inputSource:MediaStreamAudioSourceNode|null=null;
 private inputAnalyser:AnalyserNode|null=null;
 private inputFrame:number|null=null;
 private closeReason:string|null=null;
 private reconnectGrace:ReturnType<typeof setTimeout>|null=null;
 constructor(options:Options){
  const notify=options.onNotice;
  this.options={...options,onNotice:text=>{this.lastNotice=text;notify(text);}};
 }
 private lastNotice='';
 get id(){return this.sessionId;}
 get active(){return this.ready&&!this.stopped;}
 setMicMuted(muted:boolean){this.stream?.getAudioTracks().forEach(track=>{track.enabled=!muted;});}
 async request(body:unknown,signal?:AbortSignal){
  const response=await fetch('/api/live',{method:'POST',headers:{'Content-Type':'application/json',Authorization:'Bearer '+this.options.token},body:JSON.stringify(body),signal:signal?AbortSignal.any([signal,AbortSignal.timeout(20000)]):AbortSignal.timeout(20000)});
  const data=await response.json();
  if(!response.ok)throw Object.assign(Error(typeof data.error==='string'?data.error:'A solicitação falhou.'),{status:response.status});
  return data;
 }
 start():Promise<void>{this.startup=this.connect();return this.startup;}
 private async connect(){
  if(!navigator.mediaDevices?.getUserMedia||!window.RTCPeerConnection)throw Error('Este navegador não oferece áudio WebRTC.');
  this.stream=await navigator.mediaDevices.getUserMedia({audio:true});
  if(this.stopped){this.release();return;}
  this.watchInputLevel();
  this.peer=new RTCPeerConnection();
  this.peer.ontrack=event=>{if(this.stopped)return;this.outputStream=event.streams[0]??new MediaStream([event.track]);this.options.audio.srcObject=this.outputStream;void this.options.audio.play().catch(()=>{if(!this.stopped){this.options.onPlaybackBlocked?.();this.options.onNotice('Use o controle de áudio para permitir a reprodução.');}});};
  this.peer.onconnectionstatechange=()=>{
   const state=this.peer?.connectionState;
   if(this.stopped||!state)return;
   if(state==='connected'&&this.reconnectGrace){clearTimeout(this.reconnectGrace);this.reconnectGrace=null;return;}
   if(state==='failed'){this.options.onNotice('Conexão interrompida. Encerrando a sessão.');void this.stop();return;}
   // WebRTC often recovers from 'disconnected' by itself; only give up if it does not.
   if(state==='disconnected'&&!this.reconnectGrace){
    this.options.onNotice('Conexão instável. Tentando recuperar…');
    this.reconnectGrace=setTimeout(()=>{this.reconnectGrace=null;if(this.peer?.connectionState!=='connected'&&!this.stopped){this.options.onNotice('Conexão interrompida. Encerrando a sessão.');void this.stop();}},8000);
   }
  };
  for(const track of this.stream.getTracks())this.peer.addTrack(track,this.stream);
  this.channel=this.peer.createDataChannel('oai-events');
  this.channel.onmessage=event=>{
    if(typeof event.data!=='string')return;
    const value=parseLiveEvent(event.data);if(!value)return;
    if(value.type==='session.started')this.ready=true;
    if(value.type==='session.closed'){this.closedEvent=true;this.ready=false;this.closeReason=value.reason??null;}
    this.options.onEvent(value);
    // Rejected commands and moderation cut-offs emit 'error' without ending the session; session.closed is the end signal.
    if(value.type==='error'&&!this.stopped)this.options.onNotice('A sessão recusou um comando'+(value.code?` (${value.code})`:'')+'. A conversa continua.');
    if(value.type==='session.closed'&&!this.stopped)void this.stop();
  };
  this.channel.onclose=()=>{if(!this.stopped){this.options.onNotice('Canal de eventos desconectado. Encerrando a sessão.');void this.stop();}};
  const offer=await this.peer.createOffer();await this.peer.setLocalDescription(offer);
  if(this.peer.iceGatheringState!=='complete')await new Promise<void>((resolve,reject)=>{
   const peer=this.peer!;
   const timer=setTimeout(()=>{peer.removeEventListener('icegatheringstatechange',check);reject(Error('A negociação de rede demorou demais.'));},8000);
   function check(){if(peer.iceGatheringState==='complete'){clearTimeout(timer);peer.removeEventListener('icegatheringstatechange',check);resolve();}}
   peer.addEventListener('icegatheringstatechange',check);check();
  });
  if(this.stopped){this.release();return;}
  this.initializationAttempted=true;
  const data=await this.request({action:'start',sdp:this.peer.localDescription?.sdp,mode:this.options.mode??'desk'});
  if(typeof data.sessionId!=='string'||typeof data.sdp!=='string')throw Error('Resposta de conexão inválida.');
  this.sessionId=data.sessionId;
  if(this.stopped)return;
  await this.peer.setRemoteDescription({type:'answer',sdp:data.sdp});
  this.deadline=setTimeout(()=>{this.options.onNotice('Limite de dez minutos atingido. Encerrando.');void this.stop();},600000);
  // Session readiness comes from session.started, never from the HTTP response.
  await new Promise<void>((resolve,reject)=>{
   const started=Date.now();
   const timer=setInterval(()=>{
    if(this.ready||this.stopped){clearInterval(timer);resolve();}
    else if(Date.now()-started>15000){clearInterval(timer);reject(Error('A sessão não confirmou o início.'));}
   },50);
  });
 }
 private watchInputLevel(){
  const stream=this.stream,context=this.options.audioContext,onLevel=this.options.onInputLevel;
  if(!stream||!context||!onLevel||!(stream instanceof MediaStream))return;
  const analyser=context.createAnalyser();
  analyser.fftSize=256;analyser.smoothingTimeConstant=.72;
  const samples=new Uint8Array(analyser.fftSize);
  this.inputSource=context.createMediaStreamSource(stream);this.inputSource.connect(analyser);this.inputAnalyser=analyser;
  let last=0;
  const sample=(now:number)=>{
   if(this.stopped)return;
   this.inputFrame=requestAnimationFrame(sample);
   if(now-last<50||context.state!=='running')return;
   last=now;analyser.getByteTimeDomainData(samples);
   let energy=0;
   for(const value of samples){const centered=(value-128)/128;energy+=centered*centered;}
   const rms=Math.sqrt(energy/samples.length);
   onLevel(Math.min(1,Math.max(0,(rms-.012)/.16)));
  };
  this.inputFrame=requestAnimationFrame(sample);
 }
 send(content:string,delegationId:string|null=null,quiet=false){
  return this.sendEvent({type:quiet?'session.thinking.append':'session.commentary.append',delegation_id:delegationId,content:content.slice(0,700)});
 }
 /** Returns a function result, then optionally continues the delegated response. */
 submitToolOutput(callId:string,output:string,resume=true){
  const sent=this.sendEvent({type:'response.item.create',item:{type:'function_call_output',call_id:callId,output:output.slice(0,4000)}});
  if(!sent||!resume)return sent;
  return this.sendEvent({type:'response.create'});
 }
 /** Sends a planned turn. A failed function result does not continue the response. */
 sendTurn(events:TurnEvent[]){
  let ok=true;
  for(const event of events){
   const sent=this.sendTurnEvent(event);
   if(!sent)ok=false;
   if(!sent&&event.type==='response.item.create')return false;
  }
  return ok;
 }
 private sendTurnEvent(event:TurnEvent){
  if(event.type==='session.thinking.append')return this.send(event.content,null,true);
  if(event.type==='response.item.create')return this.sendEvent({type:'response.item.create',item:{type:'function_call_output',call_id:event.item.call_id,output:event.item.output.slice(0,4000)}});
  return this.sendEvent({type:'response.create'});
 }
 private sendEvent(event:Record<string,unknown>){
  if(!this.active||this.channel?.readyState!=='open')return false;
  this.channel.send(JSON.stringify({...event,event_id:crypto.randomUUID()}));
  return true;
 }
 stop():Promise<boolean>{
  if(this.closing)return this.closing;
  this.stopped=true;this.ready=false;
  // Release local capture immediately, including when initialization is pending.
  this.silenceLocal();
  if(this.deadline)clearTimeout(this.deadline);
  if(this.reconnectGrace)clearTimeout(this.reconnectGrace);
  const cleanup=(async()=>{
   try{await this.startup;}catch{/* Clean up any known remote session after startup failure. */}
   if(this.channel?.readyState==='open'&&!this.closedEvent)this.channel.send(JSON.stringify({type:'session.close'}));
   let confirmed=this.closedEvent;
   if(this.sessionId&&!confirmed){
    try{const result=await this.request({action:'close',sessionId:this.sessionId,cause:this.lastNotice.slice(0,160)});confirmed=result.confirmed===true;}catch{/* session.closed may have arrived concurrently. */}
   }else if(!this.sessionId)confirmed=!this.initializationAttempted;
   return confirmed||this.closedEvent;
  })();
  this.closing=(async()=>{
   let timeout:ReturnType<typeof setTimeout>|undefined;
   const result=!this.initializationAttempted?true:await Promise.race([cleanup,new Promise<boolean>(resolve=>{timeout=setTimeout(()=>resolve(false),8000);})]);
   if(timeout)clearTimeout(timeout);
   const confirmed=result||this.closedEvent;
   this.release();this.options.onEnded();
   const why=CLOSE_REASONS[this.closeReason??'']??(this.closeReason&&this.closeReason!=='close_requested'?`Motivo informado pela plataforma: ${this.closeReason}. `:'');
   this.options.onNotice(why+(confirmed?'Conversa encerrada. Microfone liberado.':'Microfone liberado. Finalização da sessão não confirmada; verifique o consumo na plataforma.'));
   // Keep late initialization cleanup alive after releasing the UI and microphone.
   if(!confirmed)void cleanup.then(ok=>{if(ok)this.options.onNotice('Finalização confirmada após a espera. Microfone liberado.');});
   return confirmed;
  })();
  return this.closing;
 }
 private silenceLocal(){this.stream?.getTracks().forEach(track=>track.stop());this.stream=null;if(this.outputStream&&this.options.audio.srcObject===this.outputStream){this.options.audio.pause();this.options.audio.srcObject=null;}this.outputStream=null;}
 private release(){
  if(this.inputFrame!==null)cancelAnimationFrame(this.inputFrame);
  this.inputFrame=null;this.inputSource?.disconnect();this.inputAnalyser?.disconnect();this.inputSource=null;this.inputAnalyser=null;this.options.onInputLevel?.(0);
  this.channel?.close();this.peer?.close();this.silenceLocal();
 }
}
