import test from 'node:test';
import assert from 'node:assert/strict';
import { createDesk, deskReducer, canCreate } from '../src/domain/service-desk.ts';
import { buildDecisionRequest, parseDecision, parseLiveEvent } from '../src/domain/live-contract.ts';
import { createLiveHandler } from '../src/server/live-handler.ts';

const answers = [
 {type:'score',name:'impacto',score:1.25,confidence:.8},
 {type:'choice',name:'equipe',choice:'applications',confidence:.91},
 {type:'predicate',name:'contexto',probability:.96}
];
const decision = () => parseDecision({answers});
test('live free text uses real-source decisions and still requires human review',()=>{
 let s=createDesk(1,'live');
 s=deskReducer(s,{type:'EDIT',value:'O portal mostra erro 500 para toda a equipe.'});
 s=deskReducer(s,{type:'TITLE',value:'Portal fora do ar'});
 s=deskReducer(s,{type:'ANALYZE'});
 assert.equal(s.status,'analyzing');
 s=deskReducer(s,{type:'RESOLVED',session:s.session,revision:s.revision,result:decision()});
 assert.equal(s.analysis?.source,'openai'); assert.equal(canCreate(s),false);
 s=deskReducer(s,{type:'REVIEW',checked:true});
 assert.equal(canCreate(s),true);
 assert.equal(deskReducer(s,{type:'CREATE'}).ticket?.simulated,true);
});
test('input transcript corrections revoke approval and reject late analysis',()=>{
 let s=deskReducer(createDesk(1,'live'),{type:'EDIT',value:'Falha de acesso'});
 s=deskReducer(s,{type:'ANALYZE'});
 const old={session:s.session,revision:s.revision};
 s=deskReducer(s,{type:'EDIT',value:'Correção: erro 500 geral'});
 assert.equal(s.analysis,null);assert.equal(s.reviewed,false);
 assert.deepEqual(deskReducer(s,{type:'RESOLVED',...old,result:decision()}),s);
});
test('live cannot accept a fixture and mock cannot accept a live response',()=>{
 let s=deskReducer(deskReducer(createDesk(),{type:'REPLAY',scenario:'access'}),{type:'ANALYZE'});
 s=deskReducer(s,{type:'RESOLVED',session:s.session,revision:s.revision,result:decision()});
 assert.equal(s.status,'error');
});
test('Decisions request has named predicate, choice and ordered score questions',()=>{
 const request=buildDecisionRequest('Relato atual', [{role:'user',text:'Corrigi o relato'}]);
 assert.equal(request.model,'gpt-6-luna');
 assert.deepEqual(request.questions.map(q=>q.type),['predicate','choice','score']);
 assert.ok(request.input.includes('Relato atual'));
 assert.equal(request.questions[1].choices?.at(-1)?.value,'human');
 assert.equal(request.questions[2].levels?.length,3);
});
test('Decisions answers are matched by name and fractional scores are preserved',()=>{
 const r=decision();assert.equal(r.team,'applications');assert.equal(r.score,1.25);
 assert.equal(r.source,'openai');assert.equal(r.confidence,.91);
});
test('refusal, duplicate, malformed and out-of-range answers fail closed',()=>{
 for(const response of [
  {answers:[{type:'refusal',name:'contexto'}]},
  {answers:[...answers,answers[0]]},
  {answers:answers.map(a=>a.name==='impacto'?{...a,score:3}:a)},
  {answers:answers.map(a=>a.name==='equipe'?{...a,choice:'shell'}:a)},
  {answers:answers.map(a=>a.name==='contexto'?{...a,probability:NaN}:a)},
  {answers:answers.slice(1)}
 ]) assert.throws(()=>parseDecision(response));
});
test('uncertain context is routed to human without converting score into priority',()=>{
 const result=parseDecision({answers:answers.map(a=>a.name==='contexto'?{...a,probability:.1}:a)});
 assert.equal(result.team,'human');assert.equal(result.score,1.25);
});
test('invalid and unrelated Live events cannot become instructions',()=>{
 assert.equal(parseLiveEvent('not json'),null);
 assert.equal(parseLiveEvent(JSON.stringify({type:'execute',command:'anything'})),null);
 assert.equal(parseLiveEvent(JSON.stringify({type:'session.delegation.created',delegation:{id:'d1'}}))?.type,'session.delegation.created');
});
const origin='http://127.0.0.1:3000';
const token='test-only-demo-access-token-not-a-real-secret';
const env={MESA_LIVE_ENABLED:'true',MESA_LIVE_ACCESS_TOKEN:token,OPENAI_API_KEY:'test-only-fake-key'};
const guard=async()=>({close:async()=>true,finalized:new Promise<boolean>(()=>{})});
const req=(body:unknown,headers:Record<string,string>={})=>new Request(origin+'/api/live',{method:'POST',headers:{origin,host:'127.0.0.1:3000','content-type':'application/json',authorization:'Bearer '+token,...headers},body:JSON.stringify(body)});
test('disabled live does not call OpenAI even when a request contains valid-looking data',async()=>{
 let calls=0;const handle=createLiveHandler({},async()=>{calls++;throw Error('network forbidden');},guard);
 assert.equal((await handle(req({action:'start',sdp:'v=0\r\n'}))).status,503);
 assert.equal(calls,0);
});
test('auth, cross-origin, public host and oversized input are rejected before inference',async()=>{
 let calls=0;const handle=createLiveHandler(env,async()=>{calls++;throw Error('network forbidden');},guard);
 assert.equal((await handle(req({action:'start',sdp:'v=0\r\n'},{authorization:'Bearer wrong'}))).status,401);
 assert.equal((await handle(req({action:'start',sdp:'v=0\r\n'},{origin:'https://evil.example'}))).status,403);
 const external=new Request('https://public.example/api/live',{method:'POST',headers:{origin:'https://public.example',host:'public.example',authorization:'Bearer '+token,'content-type':'application/json'},body:JSON.stringify({action:'start',sdp:'v=0'})});
 assert.equal((await handle(external)).status,403);
 assert.equal((await handle(req({action:'start',sdp:'x'.repeat(70000)}))).status,413);
 assert.equal(calls,0);
});
test('server creates only client-delegation WebRTC sessions and never returns the project key',async()=>{
 let seenUrl='',seenBody:any;
 const handle=createLiveHandler(env,async(url,init)=>{seenUrl=String(url);seenBody=JSON.parse(String(init?.body));return Response.json({session:{id:'sess_test'},transport:{type:'webrtc',sdp:'v=0\r\nanswer'}});},guard);
 const res=await handle(req({action:'start',sdp:'v=0\r\noffer'}));
 assert.equal(res.status,200);const json=await res.json();
 assert.equal(seenUrl,'https://api.openai.com/v1/live/sessions');
 assert.deepEqual(seenBody.session.delegation,{type:'client'});
 assert.equal(seenBody.session.model,'gpt-live-1');
 assert.equal(seenBody.transport.type,'webrtc');
 assert.equal(json.sessionId,'sess_test');
 assert.equal(JSON.stringify(json).includes(env.OPENAI_API_KEY),false);
});
test('unknown sessions and invalid actions never reach upstream',async()=>{
 let calls=0;const handle=createLiveHandler(env,async()=>{calls++;throw Error('network forbidden');},guard);
 assert.equal((await handle(req({action:'decide',sessionId:'not-owned',revision:1,text:'hello',transcript:[]}))).status,409);
 assert.equal((await handle(req({action:'run-command'}))).status,400);
 assert.equal(calls,0);
});
test('session and request caps bound local demo inference',async()=>{
 let calls=0;const handle=createLiveHandler(env,async()=>{calls++;return Response.json({session:{id:'sess_'+calls},transport:{type:'webrtc',sdp:'v=0\r\nanswer'}});},guard);
 assert.equal((await handle(req({action:'start',sdp:'v=0\r\n'}))).status,200);
 assert.equal((await handle(req({action:'start',sdp:'v=0\r\n'}))).status,429);
 assert.equal(calls,1);
});

test('server Decisions keeps revision, source and allowed model; later revisions reject older work',async()=>{
 const calls:{url:string;body:any}[]=[];
 const handle=createLiveHandler(env,async(url,init)=>{
  const body=JSON.parse(String(init?.body));calls.push({url:String(url),body});
  return Response.json(String(url).endsWith('/live/sessions')?{session:{id:'sess_decide'},transport:{type:'webrtc',sdp:'v=0'}}:{answers});
 },guard);
 await handle(req({action:'start',sdp:'v=0'}));
 const body={action:'decide',sessionId:'sess_decide',revision:5,text:'Relato fictício de erro 500',transcript:[]};
 const response=await handle(req(body));assert.equal(response.status,200);
 const data=await response.json();assert.equal(data.revision,5);assert.equal(data.result.source,'openai');
 assert.equal(calls[1].url,'https://api.openai.com/v1/decisions');assert.equal(calls[1].body.model,'gpt-6-luna');
 assert.equal((await handle(req({...body,revision:4}))).status,409);
 assert.equal(calls.length,2);
});
test('server close waits for sideband confirmation before reporting success',async()=>{
 let closes=0;
 const handle=createLiveHandler(env,async()=>Response.json({session:{id:'sess_close'},transport:{type:'webrtc',sdp:'v=0'}}),async()=>({close:async()=>{closes++;return false;},finalized:new Promise<boolean>(()=>{})}));
 await handle(req({action:'start',sdp:'v=0'}));
 const response=await handle(req({action:'close',sessionId:'sess_close'}));
 assert.equal(response.status,502);assert.equal((await response.json()).confirmed,false);assert.equal(closes,1);
 assert.equal((await handle(req({action:'start',sdp:'v=0'}))).status,429);
});
test('raw upstream errors never expose credentials or upstream response contents',async()=>{
 const handle=createLiveHandler(env,async()=>new Response('sensitive upstream diagnostic',{status:401}),guard);
 const response=await handle(req({action:'start',sdp:'v=0'}));assert.equal(response.status,502);
 assert.equal((await response.text()).includes('sensitive upstream diagnostic'),false);
});

test('a confirmed live ticket cannot be erased by later speech or corrections',()=>{
 let s=deskReducer(createDesk(1,'live'),{type:'EDIT',value:'Erro 500 geral'});
 s=deskReducer(s,{type:'TITLE',value:'Portal'});
 s=deskReducer(s,{type:'ANALYZE'});
 s=deskReducer(s,{type:'RESOLVED',session:s.session,revision:s.revision,result:decision()});
 s=deskReducer(s,{type:'REVIEW',checked:true});s=deskReducer(s,{type:'CREATE'});
 assert.equal(s.status,'created');
 assert.deepEqual(deskReducer(s,{type:'EDIT',value:'Obrigada'}),s);
 assert.deepEqual(deskReducer(s,{type:'CORRECT'}),s);
});

test('lost sideband revokes inference and triggers bounded reattachment for closure',async()=>{
 let lose!:(ok:boolean)=>void;let attaches=0;let calls=0;
 const finalized=new Promise<boolean>(resolve=>{lose=resolve;});
 const handle=createLiveHandler(env,async()=>{calls++;return Response.json({session:{id:'sess_lost'},transport:{type:'webrtc',sdp:'v=0'}});},async()=>{
  attaches++;return {close:async()=>false,finalized:attaches===1?finalized:new Promise<boolean>(()=>{})};
 });
 await handle(req({action:'start',sdp:'v=0'}));lose(false);
 await new Promise<void>(resolve=>setImmediate(resolve));
 assert.equal(attaches,2,'a failed sideband is reattached only to close the same session');
 const response=await handle(req({action:'decide',sessionId:'sess_lost',revision:1,text:'Relato',transcript:[]}));
 assert.equal(response.status,409);assert.equal(calls,1,'no Decisions request after loss of server guard');
});
test('confirmed session closure is idempotent when browser and sideband race',async()=>{
 let closeCount=0;
 const handle=createLiveHandler(env,async()=>Response.json({session:{id:'sess_race'},transport:{type:'webrtc',sdp:'v=0'}}),async()=>({close:async()=>{closeCount++;return true;},finalized:new Promise<boolean>(()=>{})}));
 await handle(req({action:'start',sdp:'v=0'}));
 for(let i=0;i<2;i++){const response=await handle(req({action:'close',sessionId:'sess_race'}));assert.equal(response.status,200);assert.equal((await response.json()).confirmed,true);}
 assert.equal(closeCount,1);
});
