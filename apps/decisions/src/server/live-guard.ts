/** Sideband só no servidor. O header de autorização do WebSocket existe desde o Node 22.18; este repositório exige 24.21. */
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
  ws.addEventListener('message',event=>{
    try{const value=JSON.parse(String(event.data));if(value.type==='session.closed'){finish(true);ws.close();}}catch{/* Ignore non-JSON events. */}
  });
  ws.addEventListener('close',()=>finish(complete));
  ws.addEventListener('error',()=>finish(false));
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
