import { chromium } from 'playwright';
import assert from 'node:assert/strict';
import { mkdir,readFile } from 'node:fs/promises';
const browser=await chromium.launch();
const page=await browser.newPage({viewport:{width:1440,height:1120},reducedMotion:'reduce'});
const errors=[];
page.on('pageerror',error=>errors.push(error.message));
await mkdir('test-results',{recursive:true});
async function visible(locator){await locator.waitFor({state:'visible'});}
async function enabled(locator,value){assert.equal(await locator.isEnabled(),value);}
try{
  await page.goto('http://127.0.0.1:3000',{waitUntil:'networkidle'});
  assert.equal(await page.title(),'Alô, TI · DevDay Exchange Rio');
  assert.equal(await page.getByRole('link',{name:'Alô, TI, início',exact:true}).innerText(),'Alô, TI');
  assert.equal(await page.getByRole('region',{name:'Laboratório Alô, TI',exact:true}).count(),1);
  await page.screenshot({path:'test-results/desktop-start.png',fullPage:true});
  await page.getByRole('button',{name:'Explorar cenário'}).click();
  assert.ok(await page.getByText('ALÔ, TI',{exact:true}).count()>0,'simulated transcript uses the current brand');
  await enabled(page.getByRole('button',{name:'Confirmar e criar ticket simulado'}),false);
  await page.getByRole('button',{name:'Analisar relato',exact:true}).click();
  await visible(page.getByRole('heading',{name:'Acessos e identidade',exact:true}));
  await page.getByLabel('Revisei o relato e a equipe responsável.').check();
  await enabled(page.getByRole('button',{name:'Confirmar e criar ticket simulado'}),true);
  await page.getByRole('button',{name:'Simular uma correção'}).click();
  await enabled(page.getByRole('button',{name:'Confirmar e criar ticket simulado'}),false);
  assert.equal(await page.getByLabel('Revisei o relato e a equipe responsável.').isChecked(),false);
  await page.getByRole('button',{name:'Analisar relato',exact:true}).click();
  await visible(page.getByRole('heading',{name:'Aplicações internas',exact:true}));
  await page.getByLabel('Revisei o relato e a equipe responsável.').check();
  await page.getByLabel('Título',{exact:true}).fill('Portal interno indisponível');
  await enabled(page.getByRole('button',{name:'Confirmar e criar ticket simulado'}),false);
  await page.getByLabel('Revisei o relato e a equipe responsável.').check();
  await page.getByRole('button',{name:'Confirmar e criar ticket simulado'}).click();
  await visible(page.getByRole('heading',{name:'DEMO-0001',exact:true}));
  await page.screenshot({path:'test-results/desktop-ticket.png',fullPage:true});
  await page.getByRole('button',{name:'Recomeçar'}).click();
  await page.getByRole('button',{name:'Relato incompleto',exact:true}).click();
  await page.getByRole('button',{name:'Analisar relato',exact:true}).click();
  await visible(page.getByRole('heading',{name:'Revisão humana',exact:true}));
  await enabled(page.getByRole('button',{name:'Confirmar e criar ticket simulado'}),false);
  await page.getByRole('button',{name:'Acesso ao portal',exact:true}).click();
  await page.getByRole('button',{name:'Analisar relato',exact:true}).click();
  await page.getByRole('button',{name:'Recomeçar'}).click();
  await page.waitForTimeout(1100);
  await visible(page.getByRole('button',{name:'Explorar cenário'}));
  assert.equal(await page.getByRole('heading',{name:'DEMO-0001',exact:true}).count(),0);
  await page.getByRole('button',{name:'Explorar cenário'}).click();
  await page.getByLabel('Relato atual').fill('Relato livre que não faz parte das fixtures');
  await page.getByRole('button',{name:'Analisar relato',exact:true}).click();
  await visible(page.getByRole('status').filter({hasText:'Texto livre não foi analisado'}));
  await page.getByRole('button',{name:'Acesso ao portal',exact:true}).click();
  await page.getByRole('button',{name:'Por trás da decisão'}).click();
  await page.getByLabel('Simular falha na próxima análise').check();
  await page.getByRole('button',{name:'Analisar relato',exact:true}).click();
  await visible(page.getByRole('status').filter({hasText:'A análise falhou'}));
  await page.getByLabel('Simular falha na próxima análise').uncheck();
  await page.getByRole('button',{name:'Analisar relato',exact:true}).click();
  await visible(page.getByRole('heading',{name:'Acessos e identidade',exact:true}));
  await page.setViewportSize({width:390,height:844});
  await page.getByRole('button',{name:'Por trás da decisão'}).click();
  await page.screenshot({path:'test-results/mobile-review.png',fullPage:true});
  assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth<=window.innerWidth),true,'mobile should not overflow horizontally');
  const voicePage=await browser.newPage();
  voicePage.on('pageerror',error=>errors.push(error.message));
  await voicePage.addInitScript(()=>{
    const listeners=new Set();let voices=[];
    window.__spoken=[];window.__cancelCount=0;
    Object.defineProperty(window,'SpeechSynthesisUtterance',{configurable:true,value:class {constructor(text){this.text=text;}}});
    Object.defineProperty(window,'speechSynthesis',{configurable:true,value:{
      getVoices:()=>voices,
      addEventListener:(_event,listener)=>listeners.add(listener),
      removeEventListener:(_event,listener)=>listeners.delete(listener),
      cancel:()=>{window.__cancelCount++;},
      speak:utterance=>{window.__spoken.push(utterance.text);utterance.onstart?.();utterance.onend?.();}
    }});
    window.__enableVoice=()=>{voices=[{localService:true,lang:'pt-BR',name:'Voz local de teste'}];for(const listener of listeners)listener();};
  });
  await voicePage.goto('http://127.0.0.1:3000',{waitUntil:'networkidle'});
  await voicePage.getByRole('button',{name:'Som desligado'}).click();
  await voicePage.getByRole('button',{name:'Explorar cenário'}).click();
  await voicePage.getByRole('button',{name:'Analisar relato',exact:true}).click();
  await visible(voicePage.getByRole('heading',{name:'Acessos e identidade',exact:true}));
  assert.equal(await voicePage.evaluate(()=>window.__spoken.length),0,'no available voice cannot consume a reply');
  await voicePage.evaluate(()=>window.__enableVoice());
  await voicePage.waitForFunction(()=>window.__spoken.length===1);
  await voicePage.getByLabel('Relato atual').fill('Uma correção livre');
  await voicePage.getByRole('button',{name:'Analisar relato',exact:true}).click();
  await voicePage.waitForTimeout(100);
  assert.equal(await voicePage.evaluate(()=>window.__spoken.length),1,'editing the incident must not replay its old spoken answer');
  await voicePage.close();
  assert.deepEqual(errors,[],'browser must not emit uncaught errors');
  console.log('BROWSER_CHECKS_PASS: scenario, human gate, correction, title edit, ticket, ambiguity, reset, free text, error/retry, mobile overflow, late local voice, stale speech suppression, console.');
  // Public fictional UI only. No user data or credentials are included.
  for(const file of ['desktop-start.png','desktop-ticket.png','mobile-review.png']){
    const data=(await readFile('test-results/'+file)).toString('base64');
    for(let i=0;i<data.length;i+=6000)console.log('PUBLIC_SCREENSHOT '+file+' '+(i/6000)+' '+data.slice(i,i+6000));
  }
}finally{await browser.close();}

await import('./live-browser.mjs');
