import test from 'node:test';
import assert from 'node:assert/strict';
import { readdir, readFile, access } from 'node:fs/promises';
import { resolve, extname, dirname } from 'node:path';
import { parse } from 'parse5';

const dist=resolve(import.meta.dirname,'../dist');
const base='/devday-exchange-community-rio-2026/';
async function files(dir){return (await Promise.all((await readdir(dir,{withFileTypes:true})).map(x=>x.isDirectory()?files(resolve(dir,x.name)):resolve(dir,x.name)))).flat();}
function elements(root){const out=[];function walk(n){if(n.tagName)out.push(n);for(const c of n.childNodes??[])walk(c);}walk(root);return out;}
function attr(n,key){return n.attrs?.find(a=>a.name===key)?.value;}
test('generated HTML has correct structure, local routes, assets and fragments',async()=>{
 const html=(await files(dist)).filter(p=>p.endsWith('.html'));
 assert.ok(html.length>=16);
 for(const path of html){
  const nodes=elements(parse(await readFile(path,'utf8')));
  assert.equal(nodes.filter(n=>n.tagName==='h1').length,1,path);
  const ids=nodes.map(n=>attr(n,'id')).filter(Boolean);
  assert.equal(new Set(ids).size,ids.length,'duplicate ID: '+path);
  for(const n of nodes){for(const key of ['href','src']){
   const href=attr(n,key);if(!href||/^(?:[a-z]+:|\/\/)/i.test(href))continue;
   const url=new URL(href,'https://glaucia86.github.io'+base+path.slice(dist.length+1));
   assert.ok(url.pathname.startsWith(base),'missing base: '+href+' in '+path);
   let target=resolve(dist,decodeURIComponent(url.pathname.slice(base.length)));
   if(url.pathname.endsWith('/'))target=resolve(target,'index.html');
   else if(!extname(target))target=resolve(target,'index.html');
   await assert.doesNotReject(access(target),'missing '+href+' in '+path);
   if(url.hash&&target.endsWith('.html')){
    const targetNodes=elements(parse(await readFile(target,'utf8')));
    assert.ok(targetNodes.some(n=>attr(n,'id')===decodeURIComponent(url.hash.slice(1))),'missing anchor '+href+' in '+path);
   }
  }}
 }
});
test('presenter is excluded from indexing and default build contains no private data or emulator bypass',async()=>{
 const presenter=await readFile(resolve(dist,'apresentadora/index.html'),'utf8');
 assert.match(presenter,/noindex/);
 assert.match(presenter,/data-pagefind-ignore/);
 assert.doesNotMatch(presenter,/Conteúdo exclusivamente fictício|Nota sintética|test-presenter-owner/);
 for(const path of (await files(dist)).filter(p=>/\.(?:html|js|json)$/.test(p))){
  const text=await readFile(path,'utf8');
  assert.doesNotMatch(text,/__PRESENTER_TEST_ADAPTER__|connectAuthEmulator\(|connectFirestoreEmulator\(/,path);
  assert.doesNotMatch(text,/sk-proj-[A-Za-z0-9_-]{16,}/,path);
 }
});
