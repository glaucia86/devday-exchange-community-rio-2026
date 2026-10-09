import { defineConfig } from 'astro/config';
import starlight from '@astrojs/starlight';
import { BASE, REPOSITORY } from './scripts/content-manifest.mjs';
export default defineConfig({
 site:'https://glaucia86.github.io',base:BASE,output:'static',trailingSlash:'always',
 integrations:[starlight({
  title:'DevDay Exchange Rio',defaultLocale:'root',locales:{root:{label:'Português',lang:'pt-BR'}},
  customCss:['./src/styles/portal.css'],social:[{icon:'github',label:'GitHub',href:REPOSITORY}],
  components:{ThemeSelect:'./src/components/LightTheme.astro'},
  head:[{tag:'meta',attrs:{name:'color-scheme',content:'light'}}],
  sidebar:[{label:'Início',link:'/'},{label:'Prepare seu ambiente',slug:'prepare-se'},
   {label:'Laboratórios',items:[{label:'Dots',slug:'labs/dots'},{label:'Codex CLI',slug:'labs/codex-cli'},{label:'Codex Cloud',slug:'labs/codex-cloud'},{label:'Decisions API',slug:'labs/decisions'}]},
   {label:'Demos locais',slug:'alo-ti'},{label:'Materiais',slug:'materiais'},
   {label:'Área da apresentadora',link:'/apresentadora/'},
  ],
 })],
});
