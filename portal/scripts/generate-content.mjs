import { mkdir,writeFile,rm } from 'node:fs/promises';
import { resolve,dirname } from 'node:path';
import { loadPortalContent } from './content.mjs';
import { BASE,REPOSITORY } from './content-manifest.mjs';
const {pages,home}=await loadPortalContent({repoRoot:resolve(import.meta.dirname,'../..'),basePath:BASE});
const docs=resolve(import.meta.dirname,'../src/content/docs');
await rm(docs,{recursive:true,force:true});await mkdir(docs,{recursive:true});
for(const p of pages){
 const file=resolve(docs,p.route+'index.md');await mkdir(dirname(file),{recursive:true});
 await writeFile(file,`---\ntitle: ${JSON.stringify(p.title)}\ndescription: ${JSON.stringify(p.description||p.title)}\neditUrl: ${JSON.stringify(REPOSITORY+'/edit/main/'+p.sourcePath)}\n---\n\n`+p.markdown);
}
await mkdir(resolve(docs,'materiais'),{recursive:true});
await writeFile(resolve(docs,'materiais/index.md'),`---\ntitle: Materiais do encontro\n---\n\n${home.materials.map(m=>`- [${m.title}](${BASE+m.route})`).join('\n')}\n\n[Exercício de encaminhamento](${BASE}exercicio/)\n`);
await mkdir(resolve(import.meta.dirname,'../src/generated'),{recursive:true});
await writeFile(resolve(import.meta.dirname,'../src/generated/home.json'),JSON.stringify(home,null,2));
console.log(`Portal: ${pages.length+1} páginas derivadas de Markdown. Nenhum conteúdo privado carregado.`);
