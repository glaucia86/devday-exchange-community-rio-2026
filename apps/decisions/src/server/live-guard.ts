/** Sideband só no servidor. O header de autorização do WebSocket existe desde o Node 22.18; a faixa aceita deste repositório vai de 24.12.0 a 24.21.0. */
export type SessionGuard = { close:()=>Promise<boolean>; finalized:Promise<boolean> };
export type GuardFactory = (sessionId:string,key:string)=>Promise<SessionGuard>;
type NodeWebSocketConstructor = new(url:string,options:{headers:Record<string,string>})=>WebSocket;
export function createNodeSocket(url:string,headers:Record<string,string>):WebSocket {
  const NativeWebSocket=WebSocket as unknown as NodeWebSocketConstructor;
  return new NativeWebSocket(url,{headers});
}
export const openSessionGuard:GuardFactory=async(sessionId,key)=>{
  const ws=createNodeSocket('wss://api.openai.com/v1/live/sessions/'+encodeURIComponent(sessionId)+'/attach',{Authorization:'Bearer '+key});
  let complete=false,settled=false;
  let finish!:(ok:boolean)=>void;
  const finalized=new Promise<boolean>(resolve=>{finish=ok=>{if(settled)return;settled=true;complete=ok;resolve(ok);};});
  const opened=Date.now();
  const elapsed=()=>Math.round((Date.now()-opened)/1000)+' s';
  ws.addEventListener('message',event=>{
    try{
      const value=JSON.parse(String(event.data));
      if(value.type==='error')console.warn(`[live] ${elapsed()} error code=${value.error?.code??'-'} type=${value.error?.type??'-'} message=${String(value.error?.message??'').slice(0,200)}`);
      if(value.type==='session.closed'){console.info(`[live] ${elapsed()} session.closed reason=${value.reason??'-'} usage=${value.usage?.seconds??'-'} s`);finish(true);ws.close();}
    }catch{/* Ignore non-JSON events. */}
  });
  ws.addEventListener('close',event=>{console.info(`[live] ${elapsed()} sideband fechado code=${event.code} reason=${event.reason||'-'}`);finish(complete);});
  ws.addEventListener('error',()=>{console.warn(`[live] ${elapsed()} erro no sideband`);finish(false);});
  await new Promise<void>((resolve,reject)=>{
    const timer=setTimeout(()=>{ws.close();reject(Error('Sideband indisponível.'));},8000);
    ws.addEventListener('open',()=>{clearTimeout(timer);resolve();},{once:true});
    ws.addEventListener('error',()=>{clearTimeout(timer);reject(Error('Sideband indisponível.'));},{once:true});
  });
  return {finalized,close:async()=>{
    if(settled)return complete;
    if(ws.readyState===1)ws.send(JSON.stringify({type:'session.close',event_id:crypto.randomUUID()}));
    const timer=setTimeout(()=>{finish(false);ws.close();},5000);
    const result=await finalized;clearTimeout(timer);return result;
  }};
};
