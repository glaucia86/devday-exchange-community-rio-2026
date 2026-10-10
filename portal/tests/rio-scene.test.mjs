import test from 'node:test';
import assert from 'node:assert/strict';
import { sceneFrame, createSceneClock, CYCLE_MS, CABLES, CABIN_TRAVEL_MS, CABIN_DWELL_MS, CABIN_CYCLE_MS } from '../src/scene/rio-scene.mjs';

test('cycle repeats continuously and includes day, sunset and night',()=>{
 const day=sceneFrame(0),sunset=sceneFrame(CYCLE_MS*.35),night=sceneFrame(CYCLE_MS*.65);
 assert.equal(day.night,0);assert.equal(day.sunset,0);
 assert.ok(sunset.sunset>.9);assert.ok(sunset.night>0&&sunset.night<1);
 assert.equal(night.night,1);assert.equal(night.sunset,0);
 assert.equal(sceneFrame(CYCLE_MS).night,day.night);
 assert.equal(sceneFrame(CYCLE_MS).sunset,day.sunset);
 for(let t=0;t<CYCLE_MS;t+=100){
  const a=sceneFrame(t),b=sceneFrame(t+100);
  assert.ok(Math.abs(a.night-b.night)<.03);
  assert.ok(Math.abs(a.sunset-b.sunset)<.04);
  for(let i=0;i<2;i++){
   const {x,y}=a.cabins[i],c=CABLES[i];
   assert.ok(x>=c.from[0]&&x<=c.to[0]);
   assert.ok(Math.abs(y-(c.from[1]+(x-c.from[0])*(c.to[1]-c.from[1])/(c.to[0]-c.from[0])))<1e-8);
  }
 }
});

test('cabins take one minute per leg, dwell at stations and repeat independently of the sky',()=>{
 assert.equal(CABIN_TRAVEL_MS,60000);assert.equal(CABIN_DWELL_MS,5000);
 const start=sceneFrame(0),departure=sceneFrame(CABIN_DWELL_MS),arrival=sceneFrame(CABIN_DWELL_MS+CABIN_TRAVEL_MS);
 assert.deepEqual(departure.cabins,start.cabins);
 assert.deepEqual(arrival.cabins[0],{x:CABLES[0].to[0],y:CABLES[0].to[1]});
 assert.deepEqual(sceneFrame(CABIN_DWELL_MS+CABIN_TRAVEL_MS+4999).cabins,arrival.cabins);
 assert.deepEqual(sceneFrame(CABIN_CYCLE_MS).cabins,start.cabins);
 assert.notDeepEqual(sceneFrame(CYCLE_MS).cabins,start.cabins);
 assert.deepEqual(sceneFrame(25000,0).cabins,sceneFrame(25000,CYCLE_MS*.65).cabins);
 assert.equal(sceneFrame(25000,0).night,0);assert.equal(sceneFrame(25000,CYCLE_MS*.65).night,1);
 const distance=(a,b)=>Math.abs(b.cabins[0].x-a.cabins[0].x);
 const middle=CABIN_DWELL_MS+CABIN_TRAVEL_MS/2,arrivalTime=CABIN_DWELL_MS+CABIN_TRAVEL_MS;
 assert.ok(distance(sceneFrame(5000),sceneFrame(6000))<distance(sceneFrame(middle),sceneFrame(middle+1000))/10);
 assert.ok(distance(sceneFrame(arrivalTime-1000),sceneFrame(arrivalTime))<distance(sceneFrame(middle),sceneFrame(middle+1000))/10);
 assert.ok(distance(sceneFrame(0),sceneFrame(25000))>15,'normal-speed movement is visible in a short cable crop');
 for(let t=0;t<CABIN_CYCLE_MS;t+=1000){
  const a=sceneFrame(t),b=sceneFrame(t+1000);
  assert.ok(distance(a,b)<6);
  for(let i=0;i<2;i++){
   const {x,y}=a.cabins[i],c=CABLES[i];
   assert.ok(x>=c.from[0]&&x<=c.to[0]);
   assert.ok(Math.abs(y-(c.from[1]+(x-c.from[0])*(c.to[1]-c.from[1])/(c.to[0]-c.from[0])))<1e-8);
  }
 }
});

test('manual, reduced-motion, hidden and offscreen pauses compose without losing progress',()=>{
 let callback,id=0,canceled=0;const frames=[];
 const clock=createSceneClock({render:f=>frames.push(f),requestFrame:fn=>{callback=fn;return ++id;},cancelFrame:()=>{callback=null;canceled++;}});
 const tick=t=>{const fn=callback;callback=null;fn?.(t);};
 clock.start();tick(0);tick(40);assert.equal(clock.elapsed,40);
 clock.pause('manual',true);clock.pause('hidden',true);assert.equal(callback,null);
 clock.pause('hidden',false);assert.equal(callback,null);
 clock.pause('manual',false);tick(90000);tick(90040);assert.equal(clock.elapsed,80);
 clock.pause('reduced',true);clock.pause('offscreen',true);clock.pause('reduced',false);assert.equal(callback,null);
 clock.pause('offscreen',false);tick(100000);tick(100040);assert.equal(clock.elapsed,120);
 clock.destroy();assert.equal(callback,null);assert.ok(canceled>=3);assert.ok(frames.length>=4);
 const restored=createSceneClock({initialElapsed:clock.elapsed,render:f=>frames.push(f),requestFrame:fn=>{callback=fn;return ++id;},cancelFrame:()=>{callback=null;}});
 restored.pause('manual',true);restored.start();assert.equal(callback,null);assert.equal(restored.elapsed,120);
 assert.deepEqual(frames.at(-1),sceneFrame(120));restored.destroy();
});
