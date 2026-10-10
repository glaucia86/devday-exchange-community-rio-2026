// Keep the original portrait URL, but reveal its pixels only after decoding.
export function mountAuthorPhoto(root){
 const photo=root.querySelector('img'),fallback=root.querySelector('[data-author-fallback]');
 if(!photo||!fallback)return;
 const unavailable=()=>{
  root.dataset.state='unavailable';fallback.hidden=false;photo.setAttribute('aria-hidden','true');
 };
 const loaded=async()=>{
  if(!photo.naturalWidth){unavailable();return;}
  try{
   await photo.decode();
   root.dataset.state='ready';fallback.hidden=true;photo.removeAttribute('aria-hidden');
  }catch{unavailable();}
 };
 photo.addEventListener('error',unavailable);
 photo.addEventListener('load',loaded);
 if(photo.complete){if(photo.naturalWidth)void loaded();else unavailable();}
}
