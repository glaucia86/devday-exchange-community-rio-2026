import { spawn } from 'node:child_process';
import { rm } from 'node:fs/promises';
import { resolve } from 'node:path';
const root=resolve(import.meta.dirname,'..');
const command=process.argv[2];
if(!['check','build','dev'].includes(command))throw new Error('Comando Astro não permitido.');
let child;
const stop=()=>child?.kill('SIGINT');
process.on('SIGINT',stop);process.on('SIGTERM',stop);
try{
 await import('./generate-content.mjs');
 const args=[resolve(root,'node_modules/astro/bin/astro.mjs'),command];
 if(command==='dev')args.push('--host','127.0.0.1');
 child=spawn(process.execPath,args,{cwd:root,stdio:'inherit',env:{...process.env,ASTRO_TELEMETRY_DISABLED:'1'}});
 const code=await new Promise((accept,reject)=>{child.once('error',reject);child.once('close',code=>accept(code??1));});
 process.exitCode=Number(code);
}finally{
 process.off('SIGINT',stop);process.off('SIGTERM',stop);
 await rm(resolve(root,'src/content/docs'),{recursive:true,force:true});
 await rm(resolve(root,'src/generated'),{recursive:true,force:true});
}
