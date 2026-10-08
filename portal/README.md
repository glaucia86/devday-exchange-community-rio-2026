# Portal do DevDay Exchange Rio 2026

Portal Astro + Starlight em português, separado da aplicação Alô, TI. As páginas são geradas dos Markdown originais na raiz, em labs, docs e exercises. Não edite a saída transitória em src/content/docs ou src/generated.

## Desenvolvimento

Na pasta portal, com Node.js 24.21 ou posterior:

```sh
npm ci --ignore-scripts
npm test
npm run check
npm run build
npm run dev
```

Abra o endereço informado pelo Astro, incluindo a base /devday-exchange-community-rio-2026/.

## Validação

```sh
npm run build
npm run test:site
npx playwright install chromium
npm run preview
```

Em outro terminal, na mesma pasta, execute npm run test:browser. O workflow próprio registra capturas em desktop e celular. As regras privadas são verificadas apenas com projeto demo e emulador; consulte [Firebase](FIREBASE.md).

## Conteúdo e privacidade

- O manifesto em scripts/content-manifest.mjs contém apenas rotas e origens, sem duplicação editorial.
- Os links dos guias são reescritos para o portal; arquivos de código continuam apontando ao GitHub.
- O roteiro já existente no repositório é público. Novas notas editáveis da apresentadora ficam apenas no Firestore, depois de configuração autorizada.
- Sem configuração Firebase completa, a área da apresentadora fica desativada. Nenhum login ou banco real foi validado só por passar testes em emulador.
- O portal não hospeda a API ou a experiência de voz da demo Alô, TI.
- Não coloque notas privadas, tokens, segredos OAuth ou chaves OpenAI em Markdown, configuração pública, log ou captura.

## Publicação

Esta entrega produz apenas um artefato estático para revisão. Não contém job de deploy. A ativação de GitHub Pages, o merge, o Firebase real e o login OAuth ficam para aprovação posterior.
