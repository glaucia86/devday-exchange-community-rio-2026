import { chromium } from 'playwright';
import assert from 'node:assert/strict';
import { mkdir,writeFile } from 'node:fs/promises';
const root='http://127.0.0.1:4321/devday-exchange-community-rio-2026/';
const output=process.env.RIO_OUTPUT??'test-results/rio';
await mkdir(output,{recursive:true});
const browser=await chromium.launch(process.env.CHROMIUM_PATH?{executablePath:process.env.CHROMIUM_PATH}:{});
const result={phases:[],viewports:[],errors:[],hiddenTest:'visibilitychange com document.hidden simulado'};
try{
 const page=await browser.newPage({viewport:{width:1440,height:1000},reducedMotion:'reduce'});
 page.on('pageerror',e=>result.errors.push(e.message));
 await page.goto(root);await page.waitForLoadState('networkidle');
 await page.clock.install({time:new Date('2026-10-24T12:00:00Z')});
 await page.clock.pauseAt(new Date('2026-10-24T12:00:01Z'));
 const state=()=>page.locator('[data-rio-world]').evaluate(el=>({night:+el.style.getPropertyValue('--rio-night'),sunset:+el.style.getPropertyValue('--rio-sunset'),cabins:[...el.querySelectorAll('[data-rio-cabin]')].map(c=>c.getAttribute('transform'))}));
 const geometry=()=>page.locator('[data-rio-world]').evaluate(el=>{
  const images=[...el.querySelectorAll('img')].map(i=>i.getBoundingClientRect().toJSON());
  const overlay=el.querySelector('svg').getBoundingClientRect().toJSON();
  return {images,overlay,world:el.getBoundingClientRect().toJSON()};
 });
 const preference=async reducedMotion=>{
  await page.emulateMedia({reducedMotion});
  // Chromium delivers MediaQueryList.change asynchronously, outside the mock clock.
  for(let tries=0;tries<25;tries++){
   await page.clock.runFor(20);
   if(await page.locator('[data-rio-pause]').isDisabled()===(reducedMotion==='reduce'))return;
   await new Promise(resolve=>setTimeout(resolve,20));
  }
  throw new Error('A alteração de preferência não chegou ao controle.');
 };
 await preference('no-preference');await page.clock.runFor(100);
 const beginning=await state();
 const copyBox=await page.locator('.hero-copy').boundingBox();
 const actionBox=await page.locator('.hero-actions').boundingBox();
 for(const [name,advance] of [['day',0],['sunset',25200],['night',21600],['return',25200]]){
  await page.clock.runFor(advance);
  const current=await state();result.phases.push({name,...current});
  if(name==='day'||name==='return')assert.equal(current.night,0);
  if(name==='sunset'){assert.ok(current.sunset>.9);assert.ok(current.night>.2&&current.night<.6);}
  if(name==='night')assert.equal(current.night,1);
  assert.deepEqual(await page.locator('.hero-copy').boundingBox(),copyBox);
  assert.deepEqual(await page.locator('.hero-actions').boundingBox(),actionBox);
  const g=await geometry();assert.deepEqual(g.images[0],g.images[1]);assert.deepEqual(g.images[0],g.overlay);
  await page.screenshot({path:`${output}/desktop-${name}.png`});
  if(name!=='return'){
   const text=await page.evaluate(()=>{
    const rows=[];
    for(const el of document.querySelectorAll('.hero-copy *, .rio-pause *')){
     const s=getComputedStyle(el);
     for(const n of el.childNodes){if(n.nodeType!==Node.TEXT_NODE||!n.textContent.trim())continue;const r=document.createRange();r.selectNodeContents(n);for(const rect of r.getClientRects())rows.push({text:n.textContent.trim(),color:s.color,fontSize:parseFloat(s.fontSize),fontWeight:s.fontWeight,rect:rect.toJSON()});}
    }
    return rows;
   });
   await writeFile(`${output}/contrast-${name}.json`,JSON.stringify(text,null,2));
   await page.addStyleTag({content:'.portal-home .hero-actions .button,.portal-home .hero-copy *,.portal-home .rio-pause *{color:transparent!important;text-shadow:none!important}'});
   await page.screenshot({path:`${output}/background-${name}.png`});
   await page.locator('style').last().evaluate(el=>el.remove());
  }
 }
 const repeated=await state();assert.ok(Math.abs(repeated.night-beginning.night)<.002);assert.ok(Math.abs(repeated.sunset-beginning.sunset)<.002);
 const button=page.locator('[data-rio-pause]');
 const viewportObserved=expected=>page.locator('.rio-scene').evaluate((scene,expected)=>new Promise(resolve=>{
  const observer=new IntersectionObserver(([entry])=>{if(entry.isIntersecting===expected){observer.disconnect();resolve();}},{threshold:.01});
  observer.observe(scene);
 }),expected);
 await button.click();assert.equal(await button.getAttribute('aria-pressed'),'true');
 const paused=await state();await page.clock.runFor(5000);assert.deepEqual(await state(),paused);
 await page.evaluate(()=>{window.dispatchEvent(new PageTransitionEvent('pagehide',{persisted:true}));window.dispatchEvent(new PageTransitionEvent('pageshow',{persisted:true}));});
 await page.clock.runFor(100);assert.equal(await button.getAttribute('aria-pressed'),'true');assert.deepEqual(await state(),paused);
 await preference('reduce');assert.equal(await button.isDisabled(),true);
 await preference('no-preference');assert.equal(await button.isDisabled(),false);
 await page.clock.runFor(5000);assert.deepEqual(await state(),paused);
 await button.click();await page.clock.runFor(1000);assert.notDeepEqual(await state(),paused);
 await preference('reduce');const reduced=await state();await page.clock.runFor(5000);assert.deepEqual(await state(),reduced);
 await preference('no-preference');await page.clock.runFor(100);
 await page.evaluate(()=>{Object.defineProperty(document,'hidden',{configurable:true,get:()=>true});document.dispatchEvent(new Event('visibilitychange'));});
 const hidden=await state();await page.clock.runFor(10000);assert.deepEqual(await state(),hidden);
 await page.evaluate(()=>{delete document.hidden;document.dispatchEvent(new Event('visibilitychange'));});
 await page.clock.runFor(1000);assert.notDeepEqual(await state(),hidden);
 await page.evaluate(()=>window.scrollTo({top:document.documentElement.scrollHeight,behavior:'instant'}));
 await viewportObserved(false);await page.clock.runFor(100);
 assert.ok((await page.locator('.rio-scene').boundingBox()).y+ (await page.locator('.rio-scene').boundingBox()).height<=0);
 const offscreen=await state();await page.clock.runFor(5000);assert.deepEqual(await state(),offscreen);
 await page.evaluate(()=>window.scrollTo({top:0,behavior:'instant'}));await viewportObserved(true);
 // Advance beyond the station dwell; a resumed clock can legitimately stay still for 5s.
 await page.clock.runFor(7000);assert.notDeepEqual(await state(),offscreen);
 await preference('reduce');
 for(const width of [320,390,600,768,900,1100,1440,1920]){
  await page.setViewportSize({width,height:1000});await page.clock.runFor(100);
  assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth),false);
  const scene=await page.locator('.rio-scene').boundingBox();assert.ok(scene.width>=width-1);
  const g=await geometry();assert.deepEqual(g.images[0],g.overlay);
  const cable=await page.locator('[data-rio-cabin]').first().evaluate(el=>{const p=new DOMPoint(0,0).matrixTransform(el.getScreenCTM());return {x:p.x,y:p.y};});
  assert.ok(cable.x>=0&&cable.x<=width,`cable cropped at ${width}`);
  const title=await page.locator('h1').boundingBox();const actions=await page.locator('.hero-actions').boundingBox();assert.ok(title.y+title.height<actions.y);
  result.viewports.push({width,scene,cable});
  if([320,390,768].includes(width))await page.screenshot({path:`${output}/mobile-${width}.png`,fullPage:true});
 }
 await page.setViewportSize({width:390,height:844});await page.evaluate(()=>window.scrollTo({top:0,behavior:'instant'}));await page.screenshot({path:`${output}/mobile-390-viewport.png`});
 const noJs=await browser.newPage({javaScriptEnabled:false,viewport:{width:390,height:844}});
 await noJs.goto(root);await noJs.waitForLoadState('networkidle');assert.equal(await noJs.locator('h1').isVisible(),true);assert.equal(await noJs.locator('[data-rio-pause]').isVisible(),false);
 assert.equal(await noJs.locator('.rio-day').evaluate(el=>el.naturalWidth),1672);assert.equal(await noJs.locator('#event-nav').isVisible(),true);
 await noJs.screenshot({path:`${output}/mobile-no-js.png`,fullPage:true});
 assert.deepEqual(result.errors,[]);
 await writeFile(`${output}/browser-validation.json`,JSON.stringify(result,null,2));
 console.log('Rio: fases, repetição, pausas, preferência, visibilidade simulada, viewport, geometria compartilhada e ausência de JS aprovados.');
}finally{await browser.close();}
