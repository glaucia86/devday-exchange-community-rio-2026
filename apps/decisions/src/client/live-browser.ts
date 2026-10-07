import { parseLiveEvent, type LiveEvent } from '../domain/live-contract';
type Options={token:string;audio:HTMLAudioElement;onEvent:(event:LiveEvent)=>void;onNotice:(text:string)=>void;onEnded:()=>void};
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
 constructor(options:Options){this.options=options;}
 get id(){return this.sessionId;}
 get active(){return this.ready&&!this.stopped;}
 async request(body:unknown,signal?:AbortSignal){
  const response=await fetch('/api/live',{method:'POST',headers:{'Content-Type':'application/json',Authorization:'Bearer '+this.options.token},body:JSON.stringify(body),signal:signal?AbortSignal.any([signal,AbortSignal.timeout(20000)]):AbortSignal.timeout(20000)});
  const data=await response.json();
  if(!response.ok)throw Error(typeof data.error==='string'?data.error:'A solicitação falhou.');
  return data;
 }
 start():Promise<void>{this.startup=this.connect();return this.startup;}
 private async connect(){
  if(!navigator.mediaDevices?.getUserMedia||!window.RTCPeerConnection)throw Error('Este navegador não oferece áudio WebRTC.');
  this.stream=await navigator.mediaDevices.getUserMedia({audio:true});
  if(this.stopped){this.release();return;}
  this.peer=new RTCPeerConnection();
  this.peer.ontrack=event=>{if(this.stopped)return;this.outputStream=event.streams[0]??new MediaStream([event.track]);this.options.audio.srcObject=this.outputStream;void this.options.audio.play().catch(()=>{if(!this.stopped)this.options.onNotice('Use o controle de áudio para permitir a reprodução.');});};
  this.peer.onconnectionstatechange=()=>{if(this.peer&&['failed','disconnected'].includes(this.peer.connectionState)&&!this.stopped){this.options.onNotice('Conexão interrompida. Encerrando a sessão.');void this.stop();}};
  for(const track of this.stream.getTracks())this.peer.addTrack(track,this.stream);
  this.channel=this.peer.createDataChannel('oai-events');
  this.channel.onmessage=event=>{
    if(typeof event.data!=='string')return;
    const value=parseLiveEvent(event.data);if(!value)return;
    if(value.type==='session.started')this.ready=true;
    if(value.type==='session.closed'){this.closedEvent=true;this.ready=false;}
    this.options.onEvent(value);
    if(value.type==='error'&&!this.stopped){this.options.onNotice('A sessão reportou um erro. Encerrando com segurança.');void this.stop();}
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
  const data=await this.request({action:'start',sdp:this.peer.localDescription?.sdp});
  if(typeof data.sessionId!=='string'||typeof data.sdp!=='string')throw Error('Resposta de conexão inválida.');
  this.sessionId=data.sessionId;
  if(this.stopped)return;
  await this.peer.setRemoteDescription({type:'answer',sdp:data.sdp});
  this.deadline=setTimeout(()=>{this.options.onNotice('Limite de dois minutos atingido. Encerrando.');void this.stop();},120000);
  // Session readiness comes from session.started, never from the HTTP response.
  await new Promise<void>((resolve,reject)=>{
   const started=Date.now();
   const timer=setInterval(()=>{
    if(this.ready||this.stopped){clearInterval(timer);resolve();}
    else if(Date.now()-started>15000){clearInterval(timer);reject(Error('A sessão não confirmou o início.'));}
   },50);
  });
 }
 send(content:string,delegationId:string|null=null,quiet=false){
  if(!this.active||this.channel?.readyState!=='open')return false;
  this.channel.send(JSON.stringify({type:quiet?'session.thinking.append':'session.commentary.append',event_id:crypto.randomUUID(),delegation_id:delegationId,content:content.slice(0,700)}));
  return true;
 }
 stop():Promise<boolean>{
  if(this.closing)return this.closing;
  this.stopped=true;this.ready=false;
  // Release local capture immediately, including when initialization is pending.
  this.silenceLocal();
  if(this.deadline)clearTimeout(this.deadline);
  const cleanup=(async()=>{
   try{await this.startup;}catch{/* Clean up any known remote session after startup failure. */}
   if(this.channel?.readyState==='open'&&!this.closedEvent)this.channel.send(JSON.stringify({type:'session.close'}));
   let confirmed=this.closedEvent;
   if(this.sessionId&&!confirmed){
    try{const result=await this.request({action:'close',sessionId:this.sessionId});confirmed=result.confirmed===true;}catch{/* session.closed may have arrived concurrently. */}
   }else if(!this.sessionId)confirmed=!this.initializationAttempted;
   return confirmed||this.closedEvent;
  })();
  this.closing=(async()=>{
   let timeout:ReturnType<typeof setTimeout>|undefined;
   const result=!this.initializationAttempted?true:await Promise.race([cleanup,new Promise<boolean>(resolve=>{timeout=setTimeout(()=>resolve(false),8000);})]);
   if(timeout)clearTimeout(timeout);
   const confirmed=result||this.closedEvent;
   this.release();this.options.onEnded();
   this.options.onNotice(confirmed?'Conversa encerrada. Microfone liberado.':'Microfone liberado. Finalização da sessão não confirmada; verifique o consumo na plataforma.');
   // Keep late initialization cleanup alive after releasing the UI and microphone.
   if(!confirmed)void cleanup.then(ok=>{if(ok)this.options.onNotice('Finalização confirmada após a espera. Microfone liberado.');});
   return confirmed;
  })();
  return this.closing;
 }
 private silenceLocal(){this.stream?.getTracks().forEach(track=>track.stop());this.stream=null;if(this.outputStream&&this.options.audio.srcObject===this.outputStream){this.options.audio.pause();this.options.audio.srcObject=null;}this.outputStream=null;}
 private release(){this.channel?.close();this.peer?.close();this.silenceLocal();}
}
