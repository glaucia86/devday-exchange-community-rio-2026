import { chromium } from 'playwright';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
const browser=await chromium.launch();
const page=await browser.newPage({viewport:{width:1440,height:1120}});
const errors=[];const calls=[];
page.on('pageerror',error=>errors.push(error.message));
await page.addInitScript(()=>{
 window.__live={microphones:0,stopped:0,sent:[],channel:null,holdPermission:false};
 const makeStream=()=>{const track={enabled:true,stop(){window.__live.stopped++;}};return {getTracks:()=>[track]};};
 Object.defineProperty(HTMLMediaElement.prototype,'play',{configurable:true,value:async function(){window.__live.playing=true;}});
 Object.defineProperty(HTMLMediaElement.prototype,'pause',{configurable:true,value:function(){window.__live.playing=false;}});
 Object.defineProperty(navigator.mediaDevices,'getUserMedia',{configurable:true,value:async()=>{window.__live.microphones++;if(window.__live.holdPermission)return new Promise(resolve=>{window.__releasePermission=()=>resolve(makeStream());});return makeStream();}});
 class Peer {
  iceGatheringState='complete';connectionState='connected';localDescription=null;
  createDataChannel(){const channel={readyState:'open',onmessage:null,onclose:null,send(data){window.__live.sent.push(JSON.parse(data));},close(){this.readyState='closed';this.onclose?.();}};window.__live.channel=channel;return channel;}
  addTrack(){}
  async createOffer(){return {type:'offer',sdp:'v=0\r\ntest-offer'};}
  async setLocalDescription(value){this.localDescription=value;}
  async setRemoteDescription(){const stream=new MediaStream();window.__live.output=stream;this.ontrack?.({streams:[stream]});setTimeout(()=>window.__emit({type:'session.started'}),20);}
  close(){this.connectionState='closed';}
 }
 Object.defineProperty(window,'RTCPeerConnection',{configurable:true,value:Peer});
 window.__emit=event=>window.__live.channel?.onmessage?.({data:JSON.stringify(event)});
});
let enabled=false;let decisionDelay=30;let closeRace=false;
await page.route('**/api/live',async route=>{
 const request=route.request();
 if(request.method()==='GET')return route.fulfill({json:{enabled}});
 const data=request.postDataJSON();calls.push(data);
 if(data.action==='start')return route.fulfill({json:{sessionId:'session_browser_fixture',sdp:'v=0\r\ntest-answer',maxSeconds:600}});
 if(data.action==='close'){if(closeRace){await page.evaluate(()=>window.__emit({type:'session.closed',usage:{seconds:2}}));return route.fulfill({status:409,json:{error:'Already closed in sideband fixture'}});}return route.fulfill({json:{confirmed:true}});}
 if(data.action==='decide'){
  await new Promise(resolve=>setTimeout(resolve,decisionDelay));
  try{await route.fulfill({json:{sessionId:data.sessionId,revision:data.revision,result:{source:'openai',team:'applications',probability:.96,confidence:.91,score:1.25,explanation:'Sugestão de resposta simulada do transporte.'}}});}catch{/* Aborted corrections must not apply late results. */}
 }
});

async function skipToConversation(mode,nextControl){
 const label=mode==='live'?'Transcrição ao vivo':'Conversa e transcrição';
 const skip=page.getByRole('link',{name:'Pular para a conversa',exact:true});
 // Reach the shortcut using the keyboard; do not focus its target from the test.
 for(let i=0;i<20&&!await skip.evaluate(element=>element===document.activeElement);i++)await page.keyboard.press('Shift+Tab');
 assert.equal(await skip.evaluate(element=>element===document.activeElement),true,'keyboard must reach the skip link');
 await page.keyboard.press('Enter');
 const target=page.locator('#conversation');
 assert.equal(await target.count(),1,mode+' mode must expose exactly one skip-link destination');
 assert.equal(await target.getAttribute('aria-label'),label);
 assert.equal(await target.evaluate(element=>element===document.activeElement),true,'Enter on the skip link must focus the '+mode+' conversation');
 const focusStyle=await target.evaluate(element=>({width:getComputedStyle(element).outlineWidth,offset:getComputedStyle(element).outlineOffset}));
 assert.deepEqual(focusStyle,{width:'2px',offset:'-3px'},'the conversation focus indicator must be visible inside the panel');
 await page.screenshot({path:'test-results/'+mode+'-skip-focus.png',fullPage:true});
 await page.keyboard.press('Tab');
 assert.equal(await nextControl.evaluate(element=>element===document.activeElement),true,'Tab after skipping must continue inside the '+mode+' conversation');
 const ids=await page.locator('[id]').evaluateAll(elements=>elements.map(element=>element.id));
 assert.equal(new Set(ids).size,ids.length,'mode switches must not leave duplicate IDs');
}

try{
 await page.goto('http://127.0.0.1:3000',{waitUntil:'networkidle'});
 await skipToConversation('simulated',page.getByRole('button',{name:'Explorar cenário',exact:true}));
 await page.getByRole('button',{name:'OpenAI ao vivo'}).click();
 await page.getByText('Ao vivo desativado no servidor.',{exact:false}).waitFor();
 await skipToConversation('live',page.getByLabel('Relato atual ao vivo'));
 assert.equal(await page.getByRole('button',{name:'Som desligado',exact:true}).count(),0,'mock speech controls must be absent in live mode');
 assert.equal(await page.getByRole('button',{name:'Recomeçar',exact:true}).count(),0,'mock reset must not be offered for live mode');
 assert.equal(await page.getByRole('button',{name:'Iniciar conversa real'}).isEnabled(),false);
 assert.equal(calls.length,0);assert.equal(await page.evaluate(()=>window.__live.microphones),0);
 enabled=true;
 await page.getByRole('button',{name:'Simulado',exact:true}).click();
 await skipToConversation('simulated',page.getByRole('button',{name:'Explorar cenário',exact:true}));
 await page.keyboard.press('Enter');
 await page.getByLabel('Relato atual').waitFor();
 await skipToConversation('simulated',page.getByLabel('Relato atual'));
 await page.getByRole('button',{name:'OpenAI ao vivo'}).click();
 await skipToConversation('live',page.getByLabel('Relato atual ao vivo'));
 await page.getByLabel('Código de acesso da demo local').fill('test-only-browser-access-code-not-a-secret');
 await page.getByLabel('Entendi o envio de áudio e texto').check();
 await page.getByRole('button',{name:'Iniciar conversa real'}).click();
 await page.getByText('Microfone ativo',{exact:true}).waitFor();
 assert.equal(calls.filter(c=>c.action==='start').length,1);
 await skipToConversation('live',page.getByLabel('Relato atual ao vivo'));
 assert.equal(calls.filter(c=>c.action==='start').length,1,'keyboard navigation must not start another session');
 const tool=(name,args,callId)=>page.evaluate(({name,args,callId})=>window.__emit({type:'response.event',delegation_id:'del_'+callId,event:{type:'response.output_item.done',item:{type:'function_call',status:'completed',name,call_id:callId,arguments:JSON.stringify(args)}}}),{name,args,callId});
 await page.evaluate(()=>window.__emit({type:'session.input_transcript.delta',delta:'O portal mostra erro 500 para todo o time.'}));
 await page.waitForTimeout(50);
 assert.equal(await page.getByLabel('Relato atual ao vivo').inputValue(),'','a transcript fragment is not a command');
 await tool('registrar_relato',{texto:'O portal mostra erro 500 para todo o time.',titulo:'Portal fora'},'call_register');
 await page.waitForFunction(()=>document.querySelector('#live-incident').value.includes('erro 500'));
 await page.locator('.command-log code',{hasText:'registrar_relato'}).first().waitFor();
 await page.evaluate(()=>window.__emit({type:'session.delegation.created',delegation:{id:'delegation_1'}}));
 await page.waitForTimeout(80);
 assert.equal(calls.filter(c=>c.action==='decide').length,0,'delegation alone does not bill Decisions');
 await page.evaluate(()=>window.__emit({type:'session.delegation.created',delegation:{id:'delegation_1'}}));
 await tool('analisar',{},'call_analyze');
 await page.getByRole('heading',{name:'Aplicações internas',exact:true}).waitFor();
 assert.equal(await page.getByRole('button',{name:'Confirmar ticket simulado ao vivo'}).isEnabled(),false);
 assert.equal(await page.evaluate(()=>window.__live.sent.some(e=>e.type==='session.commentary.append'&&e.delegation_id===null&&/Analisando o relato/.test(e.content))),true);
 assert.equal(await page.evaluate(()=>window.__live.sent.some(e=>e.type==='response.item.create'&&e.item?.call_id==='call_analyze'&&e.item?.type==='function_call_output')),true);
 assert.equal(await page.evaluate(()=>window.__live.sent.some(e=>e.type==='response.create')),true);
 const count=calls.filter(c=>c.action==='decide').length;
 await tool('analisar',{},'call_analyze');
 await page.waitForTimeout(80);assert.equal(calls.filter(c=>c.action==='decide').length,count,'duplicate tool call is not billed again');
 await tool('confirmar_ticket',{confirmacao_explicita:false},'call_refuse');
 await page.waitForTimeout(50);
 assert.equal(await page.getByRole('heading',{name:'DEMO-0001',exact:true}).count(),0);
 await tool('corrigir_relato',{texto:'Correção: só uma pessoa foi afetada.'},'call_correct');
 await page.getByRole('heading',{name:'Aguardando relato',exact:true}).waitFor();
 assert.equal(await page.getByLabel('Revisei este relato ao vivo e a equipe.').isChecked(),false);
 decisionDelay=250;
 await tool('analisar',{},'call_stale');
 await tool('corrigir_relato',{texto:'Correção mais recente: o portal voltou.'},'call_interrupt');
 await page.waitForTimeout(350);
 assert.equal(await page.getByRole('heading',{name:'Aplicações internas',exact:true}).count(),0,'stale decision is discarded');
 assert.equal(await page.getByLabel('Relato atual ao vivo').inputValue(),'Correção mais recente: o portal voltou.');
 await page.evaluate(()=>window.__emit({type:'session.input_transcript.delta',delta:' Mais um detalhe falado.'}));
 await page.waitForTimeout(50);
 assert.equal(await page.getByLabel('Relato atual ao vivo').inputValue(),'Correção mais recente: o portal voltou.','later speech does not rewrite a correction');
 decisionDelay=500;
 const editMark=await page.evaluate(()=>window.__live.sent.length);
 await tool('analisar',{},'call_typed_edit');
 await page.waitForFunction(start=>window.__live.sent.slice(start).some(event=>event.type==='session.commentary.append'&&/Analisando o relato/.test(event.content)),editMark);
 await page.getByLabel('Relato atual ao vivo').fill('Relato editado no meio da análise.');
 await page.waitForTimeout(80);
 const editedEvents=await page.evaluate(start=>window.__live.sent.slice(start),editMark);
 const resumed=editedEvents.filter(event=>event.type==='response.create');
 const discarded=editedEvents.filter(event=>event.type==='response.item.create'&&event.item?.call_id==='call_typed_edit');
 assert.equal(resumed.length,1,'a typed edit resumes the cancelled analysis once');
 assert.equal(discarded.length,1);
 assert.match(discarded[0].item.output,/resultado_descartado/);
 assert.equal(/Sugestão de resposta simulada|Aplicações internas/.test(discarded[0].item.output),false);
 await page.waitForTimeout(600);
 assert.equal(await page.getByRole('heading',{name:'Aplicações internas',exact:true}).count(),0,'the cancelled analysis is not applied');
 assert.equal(await page.getByLabel('Relato atual ao vivo').inputValue(),'Relato editado no meio da análise.');
 decisionDelay=30;
 await tool('registrar_relato',{texto:'Erro 500 no portal interno para todo o time.',titulo:'Portal'},'call_again');
 await tool('analisar',{},'call_analyze_2');
 await page.getByRole('heading',{name:'Aplicações internas',exact:true}).waitFor();
 await tool('confirmar_ticket',{confirmacao_explicita:true},'call_confirm');
 await page.getByRole('heading',{name:'DEMO-0001',exact:true}).waitFor();
 await page.getByRole('status',{name:'Monitoramento de demonstração'}).waitFor();
 assert.match(await page.getByRole('status',{name:'Monitoramento de demonstração'}).innerText(),/demonstração/i);
 await page.waitForTimeout(1100);
 assert.equal(await page.evaluate(()=>window.__live.sent.filter(e=>e.type==='session.commentary.append'&&/Notei que este é o/.test(e.content)).length),0,'monitoring stays silent while the confirmation has not been heard');
 await page.evaluate(async()=>{
  const audio=document.querySelector('audio');
  const ctx=new AudioContext();
  await ctx.resume();
  const osc=ctx.createOscillator();
  const gain=ctx.createGain();
  gain.gain.value=0.25;
  const dest=ctx.createMediaStreamDestination();
  osc.frequency.value=440;
  osc.connect(gain).connect(dest);
  audio.srcObject=dest.stream;
  await audio.play();
  osc.start();
  await new Promise(resolve=>setTimeout(resolve,700));
  osc.stop();
  gain.gain.setValueAtTime(0,ctx.currentTime);
 });
 await page.waitForFunction(()=>window.__live.sent.some(e=>e.type==='session.commentary.append'&&e.delegation_id===null&&/Notei que este é o/.test(e.content)),null,{timeout:5000});
 assert.equal(await page.evaluate(()=>window.__live.sent.filter(e=>e.type==='response.item.create'&&/Notei que este é o/.test(e.item?.output??'')).length),0,'the insight is app-initiated speech, not a tool result');
 await page.evaluate(()=>window.__emit({type:'session.input_transcript.delta',delta:' Obrigada.'}));
 await page.waitForTimeout(200);
 assert.equal(await page.getByRole('heading',{name:'DEMO-0001',exact:true}).count(),1,'continued speech cannot erase a confirmed ticket');
 await tool('executar_shell',{comando:'rm -rf /'},'call_shell');
 await page.locator('.command-log code',{hasText:'executar_shell'}).waitFor();
 assert.equal(await page.getByRole('heading',{name:'DEMO-0001',exact:true}).count(),1);
 await page.waitForTimeout(1100);
 assert.equal(await page.evaluate(()=>window.__live.sent.filter(e=>e.type==='session.commentary.append'&&/Notei que este é o/.test(e.content)).length),1,'monitoring is spoken once');
 await page.getByRole('button',{name:'Encerrar conversa'}).click();
 await page.getByText('Microfone desligado',{exact:true}).waitFor();
 assert.ok(await page.evaluate(()=>window.__live.stopped)>0);
 assert.equal(calls.filter(c=>c.action==='close').length,1);
 assert.equal(await page.evaluate(()=>window.__live.sent.some(e=>e.type==='session.close')),true);
 const startsBeforePending=calls.filter(c=>c.action==='start').length;
 await page.evaluate(()=>{window.__live.holdPermission=true;});
 await page.getByRole('button',{name:'Iniciar conversa real'}).click();
 await page.waitForFunction(()=>typeof window.__releasePermission==='function');
 await page.getByRole('button',{name:'Encerrar conversa'}).click();
 await page.getByText('Microfone desligado',{exact:true}).waitFor({timeout:3000});
 assert.equal(calls.filter(c=>c.action==='start').length,startsBeforePending,'permission canceled before capture never initializes a paid session');
 await page.evaluate(()=>{window.__live.holdPermission=false;});
 closeRace=true;
 await page.getByRole('button',{name:'Iniciar conversa real'}).click();
 await page.getByText('Microfone ativo',{exact:true}).waitFor();
 await page.evaluate(()=>window.__releasePermission());
 await page.waitForTimeout(100);
 assert.equal(await page.evaluate(()=>document.querySelector('audio').srcObject===window.__live.output&&window.__live.playing),true,'late permission cleanup cannot silence a replacement session');
 await page.getByRole('button',{name:'Encerrar conversa'}).click();
 await page.getByText('Conversa encerrada. Microfone liberado.',{exact:true}).waitFor();
 assert.equal(await page.getByText('Finalização da sessão não confirmada',{exact:false}).count(),0);
 await page.setViewportSize({width:390,height:844});
 assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),true);
 await page.screenshot({path:'test-results/live-fixture-mobile.png',fullPage:true});
 for(const file of ['live-fixture-mobile.png','live-skip-focus.png','simulated-skip-focus.png']){
  const shot=(await readFile('test-results/'+file)).toString('base64');
  for(let i=0;i<shot.length;i+=6000)console.log('PUBLIC_SCREENSHOT '+file+' '+(i/6000)+' '+shot.slice(i,i+6000));
 }
 assert.deepEqual(errors,[]);
 console.log('LIVE_BROWSER_FIXTURE_PASS: simulated and live keyboard skip-link focus and continuation, unique mode targets, disabled gate, consent, microphone cleanup, WebRTC setup, transcript, delegation ID, duplicate suppression, correction, stale result, human confirmation, close, mobile. No OpenAI/audio calls.');
}finally{await browser.close();}
