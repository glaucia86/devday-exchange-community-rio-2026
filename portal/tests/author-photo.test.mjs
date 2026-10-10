import test from 'node:test';
import assert from 'node:assert/strict';
import { mountAuthorPhoto } from '../src/home/author-photo.mjs';

function fixture({complete=false,width=0,decode=async()=>{}}={}){
 const photo=new EventTarget();photo.complete=complete;photo.naturalWidth=width;photo.decode=decode;
 photo.attrs=new Map([['aria-hidden','true']]);photo.removeAttribute=key=>photo.attrs.delete(key);photo.setAttribute=(key,value)=>photo.attrs.set(key,value);
 const fallback={hidden:false};const root={dataset:{state:'pending'},querySelector:selector=>selector==='img'?photo:fallback};
 return {root,photo,fallback};
}

test('a failed external portrait keeps initials visible and hides the broken image accessibly',()=>{
 const {root,photo,fallback}=fixture();mountAuthorPhoto(root);
 photo.dispatchEvent(new Event('error'));
 assert.equal(root.dataset.state,'unavailable');assert.equal(fallback.hidden,false);assert.equal(photo.attrs.get('aria-hidden'),'true');
});

test('the existing portrait is revealed only after decoding succeeds',async()=>{
 let resolve;const decoded=new Promise(r=>{resolve=r;});
 const {root,photo,fallback}=fixture({width:170,decode:()=>decoded});mountAuthorPhoto(root);
 photo.dispatchEvent(new Event('load'));assert.equal(root.dataset.state,'pending');assert.equal(fallback.hidden,false);
 resolve();await new Promise(r=>setImmediate(r));
 assert.equal(root.dataset.state,'ready');assert.equal(fallback.hidden,true);assert.equal(photo.attrs.has('aria-hidden'),false);
});

test('cached failed images and decoding failures retain the fallback',async()=>{
 const cached=fixture({complete:true});mountAuthorPhoto(cached.root);assert.equal(cached.root.dataset.state,'unavailable');
 const invalid=fixture({complete:true,width:170,decode:async()=>{throw new Error('Invalid bytes');}});
 mountAuthorPhoto(invalid.root);await new Promise(r=>setImmediate(r));assert.equal(invalid.root.dataset.state,'unavailable');assert.equal(invalid.fallback.hidden,false);
});
