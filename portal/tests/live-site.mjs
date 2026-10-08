import assert from 'node:assert/strict';
import { chromium } from 'playwright';

const expectedRoot='https://glaucia86.github.io/devday-exchange-community-rio-2026/';
const root=new URL(process.env.PORTAL_PUBLIC_URL??expectedRoot);
assert.equal(root.origin+root.pathname.replace(/\/$/,'')+'/',expectedRoot);
const sha=process.env.EXPECTED_COMMIT;
assert.match(sha??'',/^[a-f0-9]{40}$/);
const deadline=Date.now()+180000;
let published=false;
while(Date.now()<deadline){
  try{
    const response=await fetch(new URL('deployment.json',expectedRoot),{cache:'no-store'});
    if(response.ok&&(await response.json()).commit===sha){published=true;break;}
  }catch{}
  await new Promise(resolve=>setTimeout(resolve,5000));
}
assert.equal(published,true,'O CDN ainda não expôs o commit esperado.');
const browser=await chromium.launch();
try{
  const page=await browser.newPage({viewport:{width:1440,height:1000}});
  const failedAssets=[];
  const forbiddenRequests=[];
  page.on('requestfailed',request=>{
    if(request.url().startsWith(expectedRoot))failedAssets.push(request.url());
  });
  page.on('request',request=>{
    if(/https:\/\/(?:firestore|identitytoolkit|securetoken)\.googleapis\.com\//.test(request.url()))forbiddenRequests.push(request.url());
  });
  const home=await page.goto(expectedRoot,{waitUntil:'networkidle'});
  assert.equal(home.status(),200);
  assert.match(await page.locator('h1').innerText(),/DevDay Exchange/);
  const banner=page.locator('img.event-banner');
  assert.equal(await banner.evaluate(image=>image.complete&&image.naturalWidth>0),true);
  for(const route of ['labs/dots/','alo-ti/','alo-ti/referencia/','prepare-se/']){
    const response=await page.goto(new URL(route,expectedRoot).href);
    assert.equal(response.status(),200,route);
    await page.reload();
    assert.equal(await page.locator('h1').count(),1);
  }
  await page.goto(new URL('labs/dots/',expectedRoot).href);
  await page.getByRole('button',{name:/Pesquisar|Search/i}).first().click();
  const input=page.locator('dialog input[type="search"], dialog input').first();
  await input.fill('Aurora');
  await page.locator('.pagefind-ui__result-link').first().waitFor();
  const result=await page.locator('.pagefind-ui__result-link').first().getAttribute('href');
  assert.ok(new URL(result,expectedRoot).href.startsWith(expectedRoot));
  await page.keyboard.press('Escape');
  await page.goto(new URL('apresentadora/',expectedRoot).href);
  assert.equal(await page.getByRole('button',{name:'Entrar com GitHub'}).isDisabled(),true);
  assert.equal(await page.locator('textarea:visible').count(),0);
  assert.match(await page.locator('main').innerText(),/Configuração pendente/);
  assert.equal(await page.locator('meta[name="robots"]').getAttribute('content'),'noindex, nofollow');
  assert.deepEqual(forbiddenRequests,[]);
  assert.deepEqual(failedAssets,[]);
  console.log('LIVE_OK '+expectedRoot+' commit='+sha);
  console.log('Home, rotas profundas, refresh, assets, busca e área privada fechada: aprovados.');
}finally{await browser.close();}
