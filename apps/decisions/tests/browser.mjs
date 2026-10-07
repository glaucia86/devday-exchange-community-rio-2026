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
  await page.screenshot({path:'test-results/desktop-start.png',fullPage:true});
  await page.getByRole('button',{name:'Explorar cenário'}).click();
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
  assert.deepEqual(errors,[],'browser must not emit uncaught errors');
  console.log('BROWSER_CHECKS_PASS: scenario, human gate, correction, title edit, ticket, ambiguity, reset, free text, error/retry, mobile overflow, console.');
  // Public fictional UI only. No user data or credentials are included.
  for(const file of ['desktop-start.png','desktop-ticket.png','mobile-review.png']){
    const data=(await readFile('test-results/'+file)).toString('base64');
    for(let i=0;i<data.length;i+=6000)console.log('PUBLIC_SCREENSHOT '+file+' '+(i/6000)+' '+data.slice(i,i+6000));
  }
}finally{await browser.close();}
