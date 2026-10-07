import test from 'node:test';
import assert from 'node:assert/strict';
import { createServer } from 'node:http';
import { createNodeSocket } from '../src/server/live-guard.ts';

test('Node native WebSocket sends server-only Authorization via its headers option',async()=>{
 const server=createServer();let authorization='';
 server.on('upgrade',(request,socket)=>{authorization=request.headers.authorization??'';socket.end('HTTP/1.1 401 Unauthorized\r\nContent-Length: 0\r\nConnection: close\r\n\r\n');});
 await new Promise<void>(resolve=>server.listen(0,'127.0.0.1',resolve));
 const address=server.address();assert.ok(address&&typeof address==='object');
 try{
  await new Promise<void>((resolve,reject)=>{
   const socket=createNodeSocket('ws://127.0.0.1:'+address.port,{'Authorization':'Bearer fake-local-fixture'});
   const timeout=setTimeout(()=>{socket.close();reject(Error('Local handshake timed out'));},3000);
   socket.addEventListener('error',()=>{clearTimeout(timeout);resolve();},{once:true});
  });
  assert.equal(authorization,'Bearer fake-local-fixture');
 }finally{await new Promise<void>(resolve=>server.close(()=>resolve()));}
});
