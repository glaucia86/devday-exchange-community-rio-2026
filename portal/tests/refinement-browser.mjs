import { chromium } from 'playwright';
import assert from 'node:assert/strict';
import { mkdir,writeFile } from 'node:fs/promises';

const root=process.env.PORTAL_PREVIEW_URL??'http://127.0.0.1:4321/devday-exchange-community-rio-2026/';
const output=process.env.REFINEMENT_OUTPUT??'test-results';
await mkdir(output,{recursive:true});
const report={classicScrollbar:null,guides:[],mobile:[],errors:[]};
const decodeScene=page=>page.locator('.rio-world img').evaluateAll(images=>Promise.all(images.map(image=>image.decode())));
// Playwright normally hides scrollbars, masking full-bleed 100vw overflow.
const browser=await chromium.launch({
 ...(process.env.CHROMIUM_PATH?{executablePath:process.env.CHROMIUM_PATH}:{}),
 ignoreDefaultArgs:['--hide-scrollbars'],
 args:['--disable-features=OverlayScrollbar,OverlayScrollbars,FluentOverlayScrollbar'],
});
try{
 const page=await browser.newPage({viewport:{width:1440,height:1000},reducedMotion:'reduce'});
 page.on('pageerror',error=>report.errors.push(error.message));
 await page.goto(root);await page.waitForLoadState('networkidle');
 await decodeScene(page);
 // Reserve a real gutter even on systems configured for overlay scrollbars.
 await page.addStyleTag({content:'html{overflow-y:scroll}::-webkit-scrollbar{width:15px;height:15px}'});
 const dimensions=await page.evaluate(()=>({
  viewport:innerWidth,usable:document.documentElement.clientWidth,
  content:document.documentElement.scrollWidth,
  hero:document.querySelector('.event-hero').getBoundingClientRect().toJSON(),
 }));
 assert.equal(dimensions.viewport-dimensions.usable,15,'classic scrollbar must be present');
 assert.ok(dimensions.content<=dimensions.usable,JSON.stringify(dimensions));
 assert.equal(dimensions.hero.x,0);assert.equal(dimensions.hero.width,dimensions.usable);
 report.classicScrollbar=dimensions;
 await page.screenshot({path:`${output}/refinement-home-desktop.png`});
 await page.emulateMedia({reducedMotion:'no-preference'});
 const cards=page.locator('.lab-card');
 await cards.first().scrollIntoViewIfNeeded();
 const gridBefore=await page.locator('.lab-grid').boundingBox();
 const secondBefore=await cards.nth(1).boundingBox();
 await cards.first().hover();
 await page.waitForTimeout(220);
 const highlighted=await cards.first().evaluate(el=>({transform:getComputedStyle(el).transform,border:getComputedStyle(el).borderColor,shadow:getComputedStyle(el).boxShadow}));
 assert.equal(highlighted.transform,'matrix(1, 0, 0, 1, 0, -3)');
 assert.notEqual(highlighted.shadow,'none');
 assert.deepEqual(await page.locator('.lab-grid').boundingBox(),gridBefore,'hover must not reflow the grid');
 assert.deepEqual(await cards.nth(1).boundingBox(),secondBefore,'hover must not move neighboring cards');
 await page.screenshot({path:`${output}/refinement-cards-hover.png`});
 await page.mouse.move(0,0);
 await cards.first().locator('a').focus();await page.keyboard.press('Tab');await page.keyboard.press('Shift+Tab');
 await page.waitForTimeout(220);
 const focused=await cards.first().evaluate(el=>({transform:getComputedStyle(el).transform,border:getComputedStyle(el).borderColor,shadow:getComputedStyle(el).boxShadow}));
 assert.deepEqual(focused,highlighted,'keyboard focus must provide the same card highlight');
 assert.equal(await cards.first().locator('a').evaluate(el=>el.matches(':focus-visible')),true);
 await page.screenshot({path:`${output}/refinement-cards-focus.png`});
 await page.emulateMedia({reducedMotion:'reduce'});
 assert.equal(await cards.first().evaluate(el=>getComputedStyle(el).transform),'none');
 assert.equal(await cards.first().evaluate(el=>getComputedStyle(el).transitionDuration),'0s');
 for(const lab of ['dots/','dots/cenario/','codex-cli/','codex-cloud/','decisions/','codex/']){
  await page.goto(root+'labs/'+lab);
  assert.equal(await page.locator('.lab-guide-title').count(),1,lab);
  assert.equal(await page.locator('h1#_top').count(),1,lab);
  assert.equal(await page.locator('header.header').evaluate(el=>getComputedStyle(el).backgroundColor),'rgb(7, 23, 46)',lab);
  assert.equal(await page.locator('.lab-guide-title svg').count(),1,lab);
  assert.equal(await page.locator('astro-island').count(),0,'static icons need no hydration');
  assert.ok(await page.locator('.sl-markdown-content p').count()>0,lab);
  report.guides.push({lab,header:'navy',staticIcon:true});
  if(['dots/','codex-cloud/'].includes(lab))await page.screenshot({path:`${output}/refinement-guide-${lab.replace('/','')}-desktop.png`});
 }
 await page.goto(root+'prepare-se/');
 assert.equal(await page.locator('.lab-guide-title').count(),0);
 assert.equal(await page.locator('header.header').evaluate(el=>getComputedStyle(el).backgroundColor),'rgb(255, 255, 255)');
 const mobile=await browser.newPage({viewport:{width:390,height:844},hasTouch:true,isMobile:true,reducedMotion:'reduce'});
 mobile.on('pageerror',error=>report.errors.push(error.message));
 for(const width of [320,390,768]){
  await mobile.setViewportSize({width,height:844});
  for(const route of ['', 'labs/dots/','labs/codex-cli/','labs/codex-cloud/','labs/decisions/']){
   await mobile.goto(root+route);
   await mobile.waitForLoadState('networkidle');
   if(!route)await decodeScene(mobile);
   assert.equal(await mobile.evaluate(()=>document.documentElement.scrollWidth>document.documentElement.clientWidth),false,`${width}: ${route}`);
   if(route){
    const menu=mobile.getByRole('button',{name:/Menu/i}).first();
    await menu.click();
    assert.equal(await mobile.locator('#starlight__sidebar').evaluate(el=>el.matches(':popover-open')),true);
    await mobile.keyboard.press('Escape');
    assert.equal(await mobile.locator('#starlight__sidebar').evaluate(el=>el.matches(':popover-open')),false);
   }
   report.mobile.push({width,route,overflow:false});
   if(width===390&&['','labs/dots/'].includes(route))await mobile.screenshot({path:`${output}/refinement-${route?'guide-dots':'home'}-mobile.png`});
  }
 }
 await mobile.setViewportSize({width:390,height:844});await mobile.goto(root);
 await decodeScene(mobile);
 await mobile.locator('#labs').scrollIntoViewIfNeeded();
 assert.equal(await mobile.locator('.lab-card').first().evaluate(el=>getComputedStyle(el).transform),'none');
 await mobile.screenshot({path:`${output}/refinement-cards-mobile.png`});
 const touch=await browser.newPage({viewport:{width:390,height:844},hasTouch:true,isMobile:true,reducedMotion:'no-preference'});
 await touch.goto(root);
 await touch.locator('.lab-card').first().locator('h3').tap();
 await touch.waitForTimeout(220);
 assert.equal(await touch.locator('.lab-card').first().evaluate(el=>getComputedStyle(el).transform),'none','touch must not retain mouse hover elevation');
 assert.equal(await touch.locator('.lab-card').first().evaluate(el=>getComputedStyle(el).boxShadow),'none');
 const noJs=await browser.newPage({javaScriptEnabled:false,viewport:{width:390,height:844}});
 await noJs.goto(root+'labs/dots/');
 assert.equal(await noJs.locator('.lab-guide-title svg').count(),1);
 assert.match(await noJs.locator('main').innerText(),/Passo a passo/);
 assert.equal(await noJs.locator('header.header').evaluate(el=>getComputedStyle(el).backgroundColor),'rgb(7, 23, 46)');
 assert.deepEqual(report.errors,[]);
 await writeFile(`${output}/refinement-validation.json`,JSON.stringify(report,null,2));
 console.log('Refinamento: scrollbar clássica, hover/foco sem reflow, reduced-motion, seis guias, mobile e ícones sem JS aprovados.');
}finally{await browser.close();}
