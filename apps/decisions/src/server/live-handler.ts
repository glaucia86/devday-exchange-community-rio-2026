import { timingSafeEqual } from 'node:crypto';
import { buildDecisionRequest, parseDecision, type TranscriptLine } from '../domain/live-contract.ts';
import { liveSessionBody } from '../domain/live-session.ts';
import type { GuardFactory, SessionGuard } from './live-guard.ts';
type Env=Record<string,string|undefined>;
type Fetcher=(url:string|URL|Request,init?:RequestInit)=>Promise<Response>;
type Active={revision:number;busy:boolean;expires:number;guard:SessionGuard|null;usable:boolean;terminating?:Promise<boolean>;timer?:ReturnType<typeof setTimeout>;closed:boolean};
const JSON_HEADERS={'Cache-Control':'no-store','X-Content-Type-Options':'nosniff'};
const reply=(body:unknown,status=200)=>Response.json(body,{status,headers:JSON_HEADERS});
const error=(status:number,message:string)=>reply({error:message},status);
const object=(v:unknown):v is Record<string,unknown>=>!!v&&typeof v==='object'&&!Array.isArray(v);
const LOOPBACK=new Set(['127.0.0.1','localhost','[::1]']);
function httpHost(value:string):URL|null{
  try{const parsed=new URL(`http://${value}`);return parsed.username||parsed.password||parsed.pathname!=='/'||parsed.search||parsed.hash?null:parsed;}
  catch{return null;}
}
/** O next start reescreve request.url para localhost mesmo quando o navegador usa 127.0.0.1. A origem vale pelo Host e pelo Origin, e os dois nomes de loopback são aceitos. */
function localSameOrigin(request:Request):boolean{
  let url:URL;try{url=new URL(request.url);}catch{return false;}
  const host=request.headers.get('host'),origin=request.headers.get('origin');
  if(!host||!origin||url.protocol!=='http:'||!LOOPBACK.has(url.hostname))return false;
  const hostUrl=httpHost(host);
  if(!hostUrl||!LOOPBACK.has(hostUrl.hostname)||hostUrl.port!==url.port)return false;
  let originUrl:URL;try{originUrl=new URL(origin);}catch{return false;}
  return originUrl.protocol==='http:'&&originUrl.host===hostUrl.host&&LOOPBACK.has(originUrl.hostname);
}
export function liveConfigured(env:Env):boolean {
 return env.MESA_LIVE_ENABLED==='true'&&!!env.OPENAI_API_KEY&&!!env.MESA_LIVE_ACCESS_TOKEN&&env.MESA_LIVE_ACCESS_TOKEN.length>=32;
}
async function readBody(request:Request):Promise<unknown>{
 const reader=request.body?.getReader();if(!reader)throw Error('body');
 const chunks:Uint8Array[]=[];let size=0;
 try{for(;;){const {done,value}=await reader.read();if(done)break;size+=value.byteLength;if(size>65536){await reader.cancel();throw Error('large');}chunks.push(value);}}
 finally{reader.releaseLock();}
 const all=new Uint8Array(size);let at=0;for(const chunk of chunks){all.set(chunk,at);at+=chunk.length;}
 return JSON.parse(new TextDecoder().decode(all));
}
export function createLiveHandler(env:Env,fetcher:Fetcher,openGuard:GuardFactory){
 const sessions=new Map<string,Active>();const confirmedClosed=new Map<string,number>();let starting=false,blocked=false;
 let windowStart=Date.now(),starts=0,decisions=0;
 async function upstream(path:string,body:unknown,signal?:AbortSignal){
   const response=await fetcher('https://api.openai.com/v1/'+path,{method:'POST',headers:{Authorization:'Bearer '+env.OPENAI_API_KEY,'Content-Type':'application/json'},body:JSON.stringify(body),signal:signal?AbortSignal.any([signal,AbortSignal.timeout(15000)]):AbortSignal.timeout(15000)});
   if(!response.ok)throw Error('upstream');
   return response.json() as Promise<unknown>;
 }
 function confirmClosed(id:string,active:Active){
  active.closed=true;active.usable=false;if(active.timer)clearTimeout(active.timer);
  sessions.delete(id);confirmedClosed.set(id,Date.now());blocked=false;
 }
 async function terminate(id:string,active:Active,reconnect=false):Promise<boolean>{
  if(active.closed)return true;
  if(active.terminating)return active.terminating;
  active.usable=false;blocked=true;
  active.terminating=(async()=>{
   let confirmed=false;
   if(!reconnect&&active.guard){try{confirmed=await active.guard.close();}catch{/* Try one fresh sideband below. */}}
   if(!confirmed){
    try{const rescue=await openGuard(id,env.OPENAI_API_KEY!);active.guard=rescue;confirmed=await rescue.close();}catch{/* Reattachment never creates a paid session. */}
   }
   confirmed=confirmed||active.closed;
   if(confirmed)confirmClosed(id,active);
   return confirmed;
  })();
  try{return await active.terminating;}finally{active.terminating=undefined;}
 }
 return async(request:Request):Promise<Response>=>{
  if(!liveConfigured(env))return error(503,'Modo ao vivo desativado. Configuração segura e autorização de custo ainda são necessárias.');
  if(!localSameOrigin(request))return error(403,'A demonstração ao vivo aceita somente acesso local de mesma origem.');
  const auth=request.headers.get('authorization')??'',expected='Bearer '+env.MESA_LIVE_ACCESS_TOKEN;
  if(auth.length>512||Buffer.byteLength(auth)!==Buffer.byteLength(expected)||!timingSafeEqual(Buffer.from(auth),Buffer.from(expected)))return error(401,'Acesso da demonstração inválido.');
  if(request.method!=='POST')return error(405,'Método não permitido.');
  if(!request.headers.get('content-type')?.startsWith('application/json'))return error(415,'Envie JSON.');
  let body:unknown;
  try{body=await readBody(request);}catch(e){return error(e instanceof Error&&e.message==='large'?413:400,'Corpo inválido ou grande demais.');}
  if(!object(body))return error(400,'Corpo inválido.');
  if(Date.now()-windowStart>600000){windowStart=Date.now();starts=0;decisions=0;}
  for(const [id,at] of confirmedClosed)if(Date.now()-at>600000)confirmedClosed.delete(id);
  if(body.action==='start'){
   if(typeof body.sdp!=='string'||body.sdp.length>60000||!body.sdp.startsWith('v=0'))return error(400,'SDP inválido.');
   if(starting||blocked||sessions.size>0||starts>=3)return error(429,'Limite local: uma sessão por vez e até três inícios em dez minutos. Finalização incerta bloqueia novos inícios.');
   starting=true;starts++;
   let id:string|undefined;
   try{
    const value=await upstream('live/sessions',liveSessionBody(body.sdp));
    if(!object(value)||!object(value.session)||typeof value.session.id!=='string'||!/^[a-zA-Z0-9_-]{1,200}$/.test(value.session.id)||!object(value.transport)||value.transport.type!=='webrtc'||typeof value.transport.sdp!=='string'||value.transport.sdp.length>60000)throw Error('contract');
    id=value.session.id;
    const active:Active={revision:-1,busy:false,expires:Date.now()+120000,guard:null,closed:false,usable:true};sessions.set(id,active);
    const sessionId=id;
    active.timer=setTimeout(()=>{void terminate(sessionId,active);},120000);
    active.timer.unref();
    active.guard=await openGuard(id,env.OPENAI_API_KEY!);
    void active.guard.finalized.then(ok=>{if(ok)confirmClosed(sessionId,active);else {active.usable=false;blocked=true;void terminate(sessionId,active,true);}});
    if(request.signal.aborted){await terminate(sessionId,active);return error(409,'Conexão cancelada.');}
    return reply({sessionId:id,sdp:value.transport.sdp,maxSeconds:120});
   }catch{
    if(id){const active=sessions.get(id);if(active){active.usable=false;await terminate(id,active,true);}blocked=!confirmedClosed.has(id);return error(502,'A sessão foi criada, mas a proteção de encerramento falhou. Finalização não confirmada; verifique a sessão na plataforma antes de reiniciar o servidor.');}
    // A timeout can occur after upstream creation. Do not auto-retry paid initialization.
    blocked=true;return error(502,'A criação não foi confirmada. Não repetimos chamadas pagas automaticamente; confira a plataforma antes de reiniciar o servidor.');
   }finally{starting=false;}
  }
  if(body.action!=='decide'&&body.action!=='close')return error(400,'Ação inválida.');
  if(typeof body.sessionId!=='string')return error(400,'Sessão inválida.');
  if(body.action==='close'&&confirmedClosed.has(body.sessionId))return reply({confirmed:true});
  const active=sessions.get(body.sessionId);
  if(!active)return error(409,'Sessão desconhecida ou já finalizada.');
  if(body.action==='close'){
    const confirmed=await terminate(body.sessionId,active);
    return reply({confirmed},confirmed?200:502);
  }
  if(active.expires<=Date.now()||active.closed||!active.usable)return error(409,'Sessão expirada.');
  if(!Number.isSafeInteger(body.revision)||Number(body.revision)<0||Number(body.revision)<active.revision)return error(409,'Revisão desatualizada.');
  if(typeof body.text!=='string'||!body.text.trim()||body.text.length>8000||!Array.isArray(body.transcript)||body.transcript.length>30||
    body.transcript.some(line=>!object(line)||!['user','assistant'].includes(String(line.role))||typeof line.text!=='string'||line.text.length>8000))return error(400,'Relato ou transcrição inválidos.');
  if(active.busy||decisions>=30)return error(429,'Limite de análises atingido. Aguarde ou encerre a conversa.');
  active.revision=Number(body.revision);active.busy=true;decisions++;
  try{
    const result=parseDecision(await upstream('decisions',buildDecisionRequest(body.text,body.transcript as TranscriptLine[]),request.signal));
    if(request.signal.aborted||active.closed||!active.usable||active.expires<=Date.now())return error(409,'Análise cancelada ou expirada.');
    return reply({sessionId:body.sessionId,revision:body.revision,result});
  }catch{return error(502,'Decisions não retornou uma resposta válida. Nenhuma sugestão foi aplicada.');}
  finally{active.busy=false;}
 };
}
