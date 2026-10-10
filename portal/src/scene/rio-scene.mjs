// All positions use the approved 1672 × 941 image coordinate system.
export const CYCLE_MS=72000;
// A relaxed artistic journey; Riotur's 2012 description informed the rhythm.
// The cabins use their own period rather than repeating with the sky.
export const CABIN_TRAVEL_MS=60000;
export const CABIN_DWELL_MS=5000;
export const CABIN_CYCLE_MS=2*(CABIN_TRAVEL_MS+CABIN_DWELL_MS);
const CABIN_RAMP_MS=12000;
export const CABLES=[
 {from:[1338,282],to:[1590,420.6]},
 {from:[1338,287.8],to:[1590,432.1]},
];
const smooth=x=>{const v=Math.max(0,Math.min(1,x));return v*v*(3-2*v);};
const integral=x=>x*x*x-.5*x*x*x*x;
function cabinTravel(elapsed){
 const t=((elapsed%CABIN_CYCLE_MS)+CABIN_CYCLE_MS)%CABIN_CYCLE_MS;
 const leg=CABIN_TRAVEL_MS+CABIN_DWELL_MS,reverse=t>=leg;
 const moving=Math.max(0,Math.min(CABIN_TRAVEL_MS,t%leg-CABIN_DWELL_MS));
 const area=moving<CABIN_RAMP_MS?CABIN_RAMP_MS*integral(moving/CABIN_RAMP_MS):
  moving>CABIN_TRAVEL_MS-CABIN_RAMP_MS?CABIN_TRAVEL_MS-CABIN_RAMP_MS-CABIN_RAMP_MS*integral((CABIN_TRAVEL_MS-moving)/CABIN_RAMP_MS):moving-CABIN_RAMP_MS/2;
 const travel=area/(CABIN_TRAVEL_MS-CABIN_RAMP_MS);
 return reverse?1-travel:travel;
}
export function sceneFrame(elapsed,landscapeElapsed=elapsed){
 const p=((landscapeElapsed%CYCLE_MS)+CYCLE_MS)%CYCLE_MS/CYCLE_MS;
 const night=smooth((p-.25)/.25)*(1-smooth((p-.76)/.24));
 const sunset=smooth((p-.18)/.17)*(1-smooth((p-.35)/.15));
 const travel=cabinTravel(elapsed);
 return {night,sunset,water:(1+Math.sin(16*Math.PI*p))/2,cabins:CABLES.map((c,i)=>{
  const u=i?1-travel:travel;
  return {x:c.from[0]+(c.to[0]-c.from[0])*u,y:c.from[1]+(c.to[1]-c.from[1])*u};
 })};
}

export function createSceneClock({render,requestFrame,cancelFrame,initialElapsed=0}){
 let elapsed=initialElapsed,last=null,frame=null,started=false,destroyed=false;
 const reasons=new Set();
 const running=()=>started&&!destroyed&&!reasons.size;
 const tick=time=>{
  frame=null;if(!running())return;
  // Count visible time even when frames are sparse. sync() resets last on pauses.
  if(last!==null)elapsed+=Math.max(time-last,0);
  last=time;render(sceneFrame(elapsed));frame=requestFrame(tick);
 };
 const sync=()=>{
  last=null;
  if(frame!==null){cancelFrame(frame);frame=null;}
  if(running())frame=requestFrame(tick);
 };
 return {
  get elapsed(){return elapsed;},
  start(){if(started||destroyed)return;started=true;render(sceneFrame(elapsed));sync();},
  pause(reason,value){const changed=value?!reasons.has(reason):reasons.has(reason);if(!changed)return;value?reasons.add(reason):reasons.delete(reason);sync();},
  destroy(){destroyed=true;sync();},
 };
}

const sceneStates=new WeakMap();
export function mountRioScene(root){
 const world=root.querySelector('[data-rio-world]'),button=root.querySelector('[data-rio-pause]');
 const cabins=[...root.querySelectorAll('[data-rio-cabin]')];
 if(!world||!button||cabins.length!==2)return ()=>{};
 const media=matchMedia('(prefers-reduced-motion: reduce)');
 const saved=sceneStates.get(root);
 let manual=saved?.manual??false,observer;
 const clock=createSceneClock({
  requestFrame:fn=>requestAnimationFrame(fn),cancelFrame:id=>cancelAnimationFrame(id),
  initialElapsed:saved?.elapsed??0,
  render:frame=>{
   world.style.setProperty('--rio-night',String(frame.night));
   world.style.setProperty('--rio-sunset',String(frame.sunset));
   world.style.setProperty('--rio-water',String(frame.water));
   frame.cabins.forEach((c,i)=>cabins[i].setAttribute('transform',`translate(${c.x} ${c.y})`));
  },
 });
 const control=()=>{
  button.disabled=media.matches;
  button.setAttribute('aria-pressed',String(manual));
  button.querySelector('[data-rio-label]').textContent=media.matches?'Movimento reduzido':manual?'Retomar animação':'Pausar animação';
  root.dataset.motion=media.matches?'reduced':manual?'paused':'playing';
 };
 const preference=()=>{clock.pause('reduced',media.matches);control();};
 const visibility=()=>clock.pause('hidden',document.hidden);
 const toggle=()=>{manual=!manual;clock.pause('manual',manual);control();};
 button.hidden=false;button.addEventListener('click',toggle);
 media.addEventListener('change',preference);document.addEventListener('visibilitychange',visibility);
 // Stay static in browsers without viewport observation rather than animate offscreen.
 clock.pause('offscreen',true);
 if('IntersectionObserver'in window){observer=new IntersectionObserver(entries=>clock.pause('offscreen',!entries[0].isIntersecting),{threshold:.01});observer.observe(root);}
 clock.pause('manual',manual);preference();visibility();clock.start();
 return ()=>{sceneStates.set(root,{manual,elapsed:clock.elapsed});clock.destroy();observer?.disconnect();button.removeEventListener('click',toggle);media.removeEventListener('change',preference);document.removeEventListener('visibilitychange',visibility);};
}
