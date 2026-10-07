import { readdir, readFile, access } from 'node:fs/promises';
import { dirname, resolve, relative } from 'node:path';
const root=process.cwd();
async function walk(dir){
  const entries=await readdir(dir,{withFileTypes:true});
  const nested=await Promise.all(entries.filter(e=>!['.git','node_modules','.next'].includes(e.name)).map(async e=>{
    const path=resolve(dir,e.name);
    return e.isDirectory()?walk(path):path.endsWith('.md')?[path]:[];
  }));
  return nested.flat();
}
let errors=0;
for(const file of await walk(root)){
  const text=await readFile(file,'utf8');
  for(const match of text.matchAll(/!?\[[^\]]*\]\(([^)\s]+)(?:\s+[^)]*)?\)/g)){
    const href=match[1];
    if(/^(?:[a-z]+:|#|\/\/)/i.test(href))continue;
    const path=decodeURIComponent(href.split('#')[0].split('?')[0]);
    if(!path)continue;
    const target=resolve(dirname(file),path);
    if(relative(root,target).startsWith('..')){console.error(relative(root,file)+': link sai do repositório: '+href);errors++;continue;}
    try{await access(target);}catch{console.error(relative(root,file)+': link inexistente: '+href);errors++;}
  }
}
if(errors){process.exitCode=1;}else{console.log('Links locais da documentação: OK. URLs externas e âncoras não foram verificadas.');}
