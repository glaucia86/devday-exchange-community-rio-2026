// Only explicitly named screenshots with public or synthetic content are exported.
// This script must never run against an authenticated production browser.
import { readFile } from 'node:fs/promises';
const allowed=['home-desktop.png','home-mobile-390.png','lab-desktop.png','lab-mobile-390.png','apresentadora-fechada-desktop.png','apresentadora-fechada-mobile-390.png'];
for(const name of allowed){
 try{
  const data=(await readFile(new URL('../test-results/'+name,import.meta.url))).toString('base64');
  console.log('PORTAL_IMAGE_START '+name);
  for(let i=0;i<data.length;i+=6000)console.log(data.slice(i,i+6000));
  console.log('PORTAL_IMAGE_END '+name);
 }catch(error){if(error.code!=='ENOENT')throw error;}
}
