import { chromium } from 'playwright';
import assert from 'node:assert/strict';
const root='http://127.0.0.1:4321/devday-exchange-community-rio-2026/';
const avatar='https://avatars.githubusercontent.com/u/1631477?v=4';
const browser=await chromium.launch(process.env.CHROMIUM_PATH?{executablePath:process.env.CHROMIUM_PATH}:{});
try{
 for(const width of [320,390,768,1440]){
  const page=await browser.newPage({viewport:{width,height:900},reducedMotion:'reduce'});
  await page.route(avatar,route=>route.abort('failed'));
  await page.goto(root);await page.locator('#sobre-mim').scrollIntoViewIfNeeded();
  await page.waitForFunction(()=>document.querySelector('[data-author-photo]').dataset.state==='unavailable');
  const portrait=page.locator('[data-author-photo]');
  assert.equal(await portrait.locator('img').getAttribute('src'),avatar);
  assert.equal(await portrait.locator('img').getAttribute('aria-hidden'),'true');
  assert.equal(await portrait.locator('img').evaluate(el=>getComputedStyle(el).opacity),'0');
  assert.equal(await page.getByRole('img',{name:'Iniciais de Glaucia Lemos'}).isVisible(),true);
  const size=width<640?104:width<900?130:170;
  const rect=await portrait.boundingBox();assert.equal(rect.width,size);assert.equal(rect.height,size);
  await page.locator('#seguranca').scrollIntoViewIfNeeded();
  assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth),false);
  assert.equal(await page.getByRole('link',{name:'Área da apresentadora'}).isVisible(),true);
  await page.close();
 }
 // Synthetic pixels are only a decode fixture; no alternate portrait is installed or captured.
 const loaded=await browser.newPage({reducedMotion:'reduce'});
 await loaded.route(avatar,route=>route.fulfill({contentType:'image/png',body:Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+j5p8AAAAASUVORK5CYII=','base64')}));
 await loaded.goto(root);await loaded.locator('#sobre-mim').scrollIntoViewIfNeeded();
 await loaded.waitForFunction(()=>document.querySelector('[data-author-photo]').dataset.state==='ready');
 assert.equal(await loaded.getByRole('img',{name:'Glaucia Lemos',exact:true}).isVisible(),true);
 assert.equal(await loaded.locator('[data-author-fallback]').isVisible(),false);
 const noJs=await browser.newPage({javaScriptEnabled:false,viewport:{width:390,height:844}});
 await noJs.route(avatar,route=>route.abort('failed'));await noJs.goto(root);
 await noJs.locator('#sobre-mim').scrollIntoViewIfNeeded();
 assert.equal(await noJs.getByRole('img',{name:'Iniciais de Glaucia Lemos'}).isVisible(),true);
 assert.equal(await noJs.locator('[data-author-photo] img').evaluate(el=>getComputedStyle(el).opacity),'0');
 console.log('Autora: falha externa, dimensões reservadas, mobile, rodapé, decodificação e ausência de JS aprovados.');
}finally{await browser.close();}
