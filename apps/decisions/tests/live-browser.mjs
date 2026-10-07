import { chromium } from 'playwright';
import assert from 'node:assert/strict';
const browser=await chromium.launch();
const page=await browser.newPage({viewport:{width:1440,height:1120}});
const errors=[];const calls=[];
page.on('pageerror',error=>errors.push(error.message));
await page.addInitScript(()=>{
 window.__live={microphones:0,stopped:0,sent:[],channel:null,holdPermission:false};
 const track={enabled:true,stop(){window.__live.stopped++;}};
 Object.defineProperty(navigator.mediaDevices,'getUserMedia',{configurable:true,value:async()=>{window.__live.microphones++;if(window.__live.holdPermission)return new Promise(resolve=>{window.__releasePermission=()=>resolve({getTracks:()=>[track]});});return {getTracks:()=>[track]};}});
 class Peer {
  iceGatheringState='complete';connectionState='connected';localDescription=null;
  createDataChannel(){const channel={readyState:'open',onmessage:null,onclose:null,send(data){window.__live.sent.push(JSON.parse(data));},close(){this.readyState='closed';this.onclose?.();}};window.__live.channel=channel;return channel;}
  addTrack(){}
  async createOffer(){return {type:'offer',sdp:'v=0\r\ntest-offer'};}
  async setLocalDescription(value){this.localDescription=value;}
  async setRemoteDescription(){setTimeout(()=>window.__emit({type:'session.started'}),20);}
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
 if(data.action==='start')return route.fulfill({json:{sessionId:'session_browser_fixture',sdp:'v=0\r\ntest-answer',maxSeconds:120}});
 if(data.action==='close'){if(closeRace){await page.evaluate(()=>window.__emit({type:'session.closed',usage:{seconds:2}}));return route.fulfill({status:409,json:{error:'Already closed in sideband fixture'}});}return route.fulfill({json:{confirmed:true}});}
 if(data.action==='decide'){
  await new Promise(resolve=>setTimeout(resolve,decisionDelay));
  try{await route.fulfill({json:{sessionId:data.sessionId,revision:data.revision,result:{source:'openai',team:'applications',probability:.96,confidence:.91,score:1.25,explanation:'Sugestão de resposta simulada do transporte.'}}});}catch{/* Aborted corrections must not apply late results. */}
 }
});
try{
 await page.goto('http://127.0.0.1:3000',{waitUntil:'networkidle'});
 await page.getByRole('button',{name:'OpenAI ao vivo'}).click();
 await page.getByText('Ao vivo desativado no servidor.',{exact:false}).waitFor();
 assert.equal(await page.getByRole('button',{name:'Iniciar conversa real'}).isEnabled(),false);
 assert.equal(calls.length,0);assert.equal(await page.evaluate(()=>window.__live.microphones),0);
 enabled=true;
 await page.getByRole('button',{name:'Simulado',exact:true}).click();
 await page.getByRole('button',{name:'OpenAI ao vivo'}).click();
 await page.getByLabel('Código de acesso da demo local').fill('test-only-browser-access-code-not-a-secret');
 await page.getByLabel('Entendi o envio de áudio e texto').check();
 await page.getByRole('button',{name:'Iniciar conversa real'}).click();
 await page.getByText('Microfone ativo',{exact:true}).waitFor();
 assert.equal(calls.filter(c=>c.action==='start').length,1);
 await page.evaluate(()=>window.__emit({type:'session.input_transcript.delta',delta:'O portal mostra erro 500 para todo o time.'}));
 await page.evaluate(()=>window.__emit({type:'session.output_transcript.delta',delta:'Vou analisar o relato.'}));
 await page.evaluate(()=>window.__emit({type:'session.delegation.created',delegation:{id:'delegation_1'}}));
 await page.getByRole('heading',{name:'Aplicações internas',exact:true}).waitFor();
 assert.equal(await page.getByRole('button',{name:'Confirmar ticket simulado ao vivo'}).isEnabled(),false);
 assert.equal(await page.evaluate(()=>window.__live.sent.some(e=>e.type==='session.commentary.append'&&e.delegation_id==='delegation_1')),true);
 const count=calls.length;
 await page.evaluate(()=>window.__emit({type:'session.delegation.created',delegation:{id:'delegation_1'}}));
 await page.waitForTimeout(100);assert.equal(calls.length,count,'duplicate delegation is not billed again');
 await page.getByLabel('Revisei este relato ao vivo e a equipe.').check();
 await page.evaluate(()=>window.__emit({type:'session.input_transcript.delta',delta:' Correção: só uma pessoa foi afetada.'}));
 await page.getByRole('heading',{name:'Aguardando relato',exact:true}).waitFor();
 assert.equal(await page.getByLabel('Revisei este relato ao vivo e a equipe.').isChecked(),false);
 assert.equal(await page.getByRole('button',{name:'Confirmar ticket simulado ao vivo'}).isEnabled(),false);
 decisionDelay=250;
 await page.getByRole('button',{name:'Analisar com Decisions'}).click();
 await page.getByLabel('Relato atual ao vivo').fill('Correção mais recente: o portal voltou.');
 await page.waitForTimeout(350);
 assert.equal(await page.getByRole('heading',{name:'Aplicações internas',exact:true}).count(),0,'stale decision is discarded');
 await page.evaluate(()=>window.__emit({type:'session.input_transcript.delta',delta:' Mais um detalhe falado.'}));
 await page.waitForFunction(()=>document.querySelector('#live-incident').value.includes('Mais um detalhe falado.'));
 assert.ok((await page.getByLabel('Relato atual ao vivo').inputValue()).includes('Correção mais recente: o portal voltou.'),'new speech preserves a manual correction');
 decisionDelay=30;
 await page.getByLabel('Relato atual ao vivo').fill('Erro 500 no portal interno para todo o time.');
 await page.getByRole('button',{name:'Analisar com Decisions'}).click();
 await page.getByRole('heading',{name:'Aplicações internas',exact:true}).waitFor();
 await page.getByLabel('Revisei este relato ao vivo e a equipe.').check();
 await page.getByRole('button',{name:'Confirmar ticket simulado ao vivo'}).click();
 await page.getByRole('heading',{name:'DEMO-0001',exact:true}).waitFor();
 await page.evaluate(()=>window.__emit({type:'session.input_transcript.delta',delta:' Obrigada.'}));
 await page.waitForTimeout(100);
 assert.equal(await page.getByRole('heading',{name:'DEMO-0001',exact:true}).count(),1,'continued speech cannot erase a confirmed ticket');
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
 await page.evaluate(()=>{window.__releasePermission();window.__live.holdPermission=false;});
 await page.waitForTimeout(100);
 assert.equal(calls.filter(c=>c.action==='start').length,startsBeforePending,'permission canceled before capture never initializes a paid session');
 closeRace=true;
 await page.getByRole('button',{name:'Iniciar conversa real'}).click();
 await page.getByText('Microfone ativo',{exact:true}).waitFor();
 await page.getByRole('button',{name:'Encerrar conversa'}).click();
 await page.getByText('Conversa encerrada. Microfone liberado.',{exact:true}).waitFor();
 assert.equal(await page.getByText('Finalização da sessão não confirmada',{exact:false}).count(),0);
 await page.setViewportSize({width:390,height:844});
 assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),true);
 await page.screenshot({path:'test-results/live-fixture-mobile.png',fullPage:true});
 assert.deepEqual(errors,[]);
 console.log('LIVE_BROWSER_FIXTURE_PASS: disabled gate, consent, microphone cleanup, WebRTC setup, transcript, delegation ID, duplicate suppression, correction, stale result, human confirmation, close, mobile. No OpenAI/audio calls.');
}finally{await browser.close();}
