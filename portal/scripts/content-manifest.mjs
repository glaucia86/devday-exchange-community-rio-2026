export const BASE='/devday-exchange-community-rio-2026/';
export const REPOSITORY='https://github.com/glaucia86/devday-exchange-community-rio-2026';
export const manifest=[
 {route:'prepare-se/',sourcePath:'README.md',title:'Prepare seu ambiente',sections:['preparacao','validar','checklist']},
 {route:'labs/dots/',sourcePath:'labs/01-dots/README.md',lab:'Dots'},
 {route:'labs/dots/cenario/',sourcePath:'labs/01-dots/cenario.md'},
 {route:'labs/codex-cli/',sourcePath:'labs/codex-cli/README.md',lab:'Codex CLI'},
 {route:'labs/codex-cloud/',sourcePath:'labs/codex-cloud/README.md',lab:'Codex Cloud'},
 {route:'labs/decisions/',sourcePath:'labs/02-decisions-typescript/README.md',lab:'Decisions API'},
 {route:'labs/codex/',sourcePath:'labs/03-codex-cloud-cli/README.md'},
 {route:'alo-ti/',sourcePath:'README.md',title:'Demos locais: Triagem ao vivo e Alô, TI',sections:['executar']},
 {route:'alo-ti/referencia/',sourcePath:'apps/decisions/README.md'},
 {route:'exercicio/',sourcePath:'exercises/ticket-router/README.md'},
 ...['programacao','referencias','validacao','guia-apresentadora','integracao-live','arquitetura-decisions','roteiro-de-palco'].map(name=>({route:`materiais/${name}/`,sourcePath:`docs/${name}.md`})),
];
