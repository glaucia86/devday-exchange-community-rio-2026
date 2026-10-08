import { readFile } from 'node:fs/promises';
import { resolve, posix } from 'node:path';
import { unified } from 'unified';
import remarkParse from 'remark-parse';
import remarkGfm from 'remark-gfm';
import remarkStringify from 'remark-stringify';
import { toString } from 'mdast-util-to-string';
import { parseFragment, serialize } from 'parse5';
import { manifest as defaultManifest, REPOSITORY } from './content-manifest.mjs';
const processor=unified().use(remarkParse).use(remarkGfm).use(remarkStringify,{bullet:'-',fences:true});
const rootAnchors={preparacao:'prepare-se/#preparacao',validar:'prepare-se/#validar',checklist:'prepare-se/#checklist',executar:'alo-ti/#executar',estado:'materiais/validacao/',apresentadora:'materiais/guia-apresentadora/',estrutura:'materiais/'};
export function rewriteLink(href,sourcePath,manifest,basePath){
 if(/^(?:https?:|mailto:|tel:|\/\/)/i.test(href))return href;
 if(/^[a-z][a-z\d+.-]*:/i.test(href))throw new Error('Protocolo não permitido: '+sourcePath);
 if(href.startsWith(basePath))return href;
 const hashAt=href.indexOf('#'),hash=hashAt>=0?href.slice(hashAt):'';
 const withoutHash=hashAt>=0?href.slice(0,hashAt):href;
 const queryAt=withoutHash.indexOf('?'),query=queryAt>=0?withoutHash.slice(queryAt):'';
 const raw=queryAt>=0?withoutHash.slice(0,queryAt):withoutHash;
 if(!raw&&sourcePath!=='README.md')return href;
 const target=raw?posix.normalize(posix.join(posix.dirname(sourcePath),decodeURIComponent(raw))):sourcePath;
 if(target==='..'||target.startsWith('../')||target.startsWith('/'))throw new Error('Link sai do repositório: '+href);
 if(target==='README.md'){
  const section=decodeURIComponent(hash.slice(1));
  const selected=manifest.find(p=>p.sourcePath===target&&p.sections?.includes(section));
  if(selected)return basePath+selected.route+query+hash;
  if(rootAnchors[section])return basePath+rootAnchors[section];
  return basePath+query+hash;
 }
 const page=manifest.find(p=>!p.sections&&(p.sourcePath===target||p.sourcePath===posix.join(target,'README.md')));
 if(page)return basePath+page.route+query+hash;
 return REPOSITORY+(raw.endsWith('/')?'/tree/main/':'/blob/main/')+target.split('/').map(encodeURIComponent).join('/')+query+hash;
}
function walk(node,visit){visit(node);for(const child of node.children??node.childNodes??[])walk(child,visit);}
function anchorId(node){return node.type==='html'?node.value.match(/^\s*<a\s+id="([\w-]+)"\s*><\/a>\s*$/)?.[1]:undefined;}
function section(tree,id){
 const start=tree.children.findIndex(n=>anchorId(n)===id);
 if(start<0)throw new Error('Seção obrigatória ausente no README.md: '+id);
 let end=tree.children.findIndex((n,i)=>i>start&&anchorId(n));if(end<0)end=tree.children.length;
 return {type:'root',children:structuredClone(tree.children.slice(start,end))};
}
function htmlElements(html){const nodes=[];walk(parseFragment(html),n=>{if(n.tagName)nodes.push(n);});return nodes;}
function attr(node,key){return node.attrs?.find(a=>a.name===key)?.value;}
function nodeText(node){const values=[];walk(node,n=>{if(n.nodeName==='#text')values.push(n.value);if(n.tagName==='br')values.push(' ');});return values.join('').replace(/\s+/g,' ').trim();}
function transform(tree,sourcePath,manifest,basePath){
 const out=structuredClone(tree);
 walk(out,node=>{
  if(['link','image','definition'].includes(node.type))node.url=rewriteLink(node.url,sourcePath,manifest,basePath);
  if(node.type==='html'){
   const fragment=parseFragment(node.value);
   function clean(parent){
    parent.childNodes=(parent.childNodes??[]).filter(n=>!['script','style','iframe','object','embed','form','input','button'].includes(n.tagName));
    for(const n of parent.childNodes){
     if(n.attrs)n.attrs=n.attrs.filter(a=>['href','src','id','alt','title','width','height','align','class'].includes(a.name));
     for(const a of n.attrs??[]){if(a.name==='href'||a.name==='src')a.value=rewriteLink(a.value,sourcePath,manifest,basePath);}
     clean(n);
    }
   }
   clean(fragment);node.value=serialize(fragment);
  }
 });return out;
}
function bodySummary(tree){
 const objective=tree.children.findIndex(n=>n.type==='heading'&&/Objetivo|O que você vai aprender/.test(toString(n)));
 const paragraph=tree.children.slice(objective>=0?objective+1:0).find(n=>n.type==='paragraph'&&!n.children.some(c=>c.type==='link'));
 return paragraph?toString(paragraph):'';
}
export async function loadPortalContent({repoRoot,basePath}){
 if(!basePath.startsWith('/')||!basePath.endsWith('/'))throw new Error('Base deve começar e terminar com /.');
 const readme=await readFile(resolve(repoRoot,'README.md'),'utf8'),root=processor.parse(readme),pages=[],labs=[];
 for(const entry of defaultManifest){
  let tree=entry.sections?{type:'root',children:entry.sections.flatMap(id=>section(root,id).children)}:processor.parse(await readFile(resolve(repoRoot,entry.sourcePath),'utf8'));
  const h1=tree.children.find(n=>n.type==='heading'&&n.depth===1),title=entry.title??(h1?toString(h1):'');
  if(!title)throw new Error('Título ausente: '+entry.sourcePath);
  const description=bodySummary(tree);tree.children=tree.children.filter(n=>n!==h1);
  if(entry.anchor)tree.children.unshift({type:'html',value:`<a id="${entry.anchor}"></a>`});
  const markdown=processor.stringify(transform(tree,entry.sourcePath,defaultManifest,basePath));
  pages.push({...entry,title,description,markdown});if(entry.lab)labs.push({title:entry.lab,description,route:entry.route});
 }
 const bioNodes=htmlElements(processor.stringify(section(root,'sobre-mim')));
 const photo=bioNodes.find(n=>n.tagName==='img'&&attr(n,'alt')==='Glaucia Lemos'),name=bioNodes.find(n=>n.tagName==='h3');
 const bioParagraphs=bioNodes.filter(n=>n.tagName==='p'&&!n.childNodes?.some(c=>c.tagName==='a')).map(nodeText).filter(Boolean);
 const socials=bioNodes.filter(n=>n.tagName==='a').flatMap(n=>{const im=n.childNodes?.find(c=>c.tagName==='img'),label=im&&attr(im,'alt');return label&&label!=='Glaucia Lemos'?[{label,url:attr(n,'href')}]:[]});
 if(!photo||!name||bioParagraphs.length<2||!socials.length)throw new Error('Bio ou redes ausentes no README.md');
 const intro=htmlElements(readme.slice(0,readme.indexOf('## 📑'))),introText=intro.filter(n=>n.tagName==='p').map(nodeText);
 const titleNode=intro.find(n=>n.tagName==='h1'),slogan=introText.find(t=>t.startsWith('Dos anúncios')),details=introText.find(t=>t.includes('24 de outubro')),eventLink=intro.find(n=>n.tagName==='a'&&attr(n,'href')?.startsWith('https://luma.com/'));
 if(!titleNode||!slogan||!details||!eventLink)throw new Error('Metadados do evento ausentes no README.md');
 return {pages,home:{event:{title:nodeText(titleNode),slogan,details,registration:attr(eventLink,'href')},labs,author:{name:nodeText(name),photo:attr(photo,'src'),role:bioParagraphs[0],bio:bioParagraphs[1],socials},materials:pages.filter(p=>p.route.startsWith('materiais/')).map(({route,title,description})=>({route,title,description})),repository:REPOSITORY}};
}
