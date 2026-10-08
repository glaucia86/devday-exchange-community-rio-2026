# Notas privadas da apresentadora

## Estado e limites

O portal contém um shell público estático e um módulo de notas carregado no navegador. O módulo permanece desativado enquanto a configuração pública completa e o UID Firebase verificado não forem definidos. Não há projeto, UID real, conta, credencial ou chamada ao Firebase de produção nesta entrega. O guia da apresentadora que já existe no repositório continua público; apenas as novas notas deste módulo são privadas.

`firebase/firestore.rules` permanece deny-all. O arquivo `firestore.owner.rules.template` contém a política restrita para configuração posterior e é exercitado no emulador com um UID fictício. Não foi aplicado a nenhum projeto real.

## Dependências e comandos para o pacote principal

- Dependência de runtime: `firebase` (SDK modular web).
- Dependências de desenvolvimento: `@firebase/rules-unit-testing` e `firebase-tools` em versões compatíveis com o SDK, fixadas no lockfile.
- Node 22 e Java 21 no GitHub Actions.
- Unidade: `node --test tests/presenter-controller.test.mjs tests/presenter-config.test.mjs tests/presenter-gateway.test.mjs` na pasta `portal`.
- Regras: `firebase emulators:exec --only firestore --project demo-devday-presenter --config firebase/firebase.json "node --test tests/rules.test.mjs"` na pasta `portal`.
- Browser: `node tests/presenter-browser.mjs`, com Chromium instalado pelo Playwright. O script sobe uma fixture apenas em `127.0.0.1`, usa dados fictícios, bloqueia requisições externas e não entra no build.
- Depois do build: `node --test tests/presenter-build.test.mjs`. Não colocar este teste no comando de unidade executado antes do build.

Os testes e seus stubs foram publicados e executados em RED antes da implementação, em passos independentes no Actions. O controlador e as regras já passaram no primeiro ciclo GREEN; o status definitivo de todas as verificações é o run do último commit da branch.

Os testes de regras recusam qualquer `FIRESTORE_EMULATOR_HOST` diferente de `127.0.0.1:porta` e qualquer projeto de ambiente diferente do projeto demo fixo. O teste usa exclusivamente identidades e textos fictícios. Não carregar credenciais, tokens, contas reais ou exportações do Firestore no Actions. Não executar deploy Firebase nos workflows.

## Contrato

- Shell público estático em `/apresentadora/`, sem notas incorporadas ao HTML, build, busca ou artefatos.
- Firebase Spark, apenas GitHub Authentication e Firestore. Sem Blaze, cartão, Storage, Functions ou inferência.
- Configuração desconhecida significa interface desativada, nenhuma inicialização do SDK e regras deny-all.
- Sessão Auth em memória e cache Firestore em memória. O SDK é carregado apenas no browser.
- Sair descarta imediatamente o conteúdo da tela, invalida leituras tardias, encerra a instância Firestore e remove o app Firebase. Entrar de novo cria um app novo. Não há `localStorage`, `sessionStorage` ou persistência IndexedDB das notas.
- Um único documento: `presenter/{firebaseUid}/notes/evento`.
- Schema fechado: `content` string de até 16000 caracteres e `updatedAt` timestamp do servidor.
- Backend exige UID Firebase exato e `request.auth.token.firebase.sign_in_provider == 'github.com'`. Username e email não substituem o UID.
- Apenas get, create e update do documento conhecido; sem list, collection group ou delete.
- Editor de texto simples. Salvar exige clique; sem autosave. Saída limpa estado visual imediatamente e invalida operações antigas.
- Popup GitHub sem escopos extras e sem extrair token OAuth. Mensagens de erro são localizadas e genéricas; não registrar objetos de erro, credenciais ou notas.
- Uma gravação que já foi enviada ao servidor pode terminar mesmo se a usuária sair em seguida. Sair não desfaz um salvamento solicitado.
- A checagem no cliente melhora a interface; a autorização real é feita pelas regras Firestore. Esconder a rota, `noindex` ou excluir a página do Pagefind não substitui as regras.

## Variáveis públicas do build

O código lê exclusivamente estas variáveis Astro:

- `PUBLIC_PRESENTER_ENABLED`: precisa ser exatamente `true`; ausente ou `false` mantém a área desativada.
- `PUBLIC_PRESENTER_UID`: UID Firebase exato e verificado da proprietária.
- `PUBLIC_FIREBASE_API_KEY`: identificador público do web app Firebase.
- `PUBLIC_FIREBASE_AUTH_DOMAIN`: o host padrão `PROJECT_ID.firebaseapp.com` do projeto real.
- `PUBLIC_FIREBASE_PROJECT_ID`: ID do projeto Spark escolhido.
- `PUBLIC_FIREBASE_APP_ID`: ID do web app Firebase.

Não há segredo Firebase Admin ou segredo OAuth nessas variáveis. A chave pública web identifica o projeto; ela não autoriza leitura de notas. O acesso depende de Firebase Authentication e das regras. Não colocar notas ou credenciais em nenhuma variável de build. Nenhuma variável é necessária para construir e publicar somente o shell desativado.

## Preparação futura, ainda não executada

A proprietária precisará definir um projeto Firebase Spark e seu UID Firebase verificado. O host autorizado no Authentication será `glaucia86.github.io`, sem o caminho do repositório. O `authDomain` será o host padrão real do projeto (`PROJECT_ID.firebaseapp.com`) e o callback GitHub será `https://PROJECT_ID.firebaseapp.com/__/auth/handler`. Esses exemplos são marcadores; não representam recursos existentes.

Se a conta já existir no Authentication desse projeto, conferir o UID em Users. Se o projeto for novo, um primeiro login GitHub precisa ser feito em um fluxo Firebase separado e explicitamente autorizado, ainda com regras Firestore deny-all, antes de obter esse UID. O portal não tem modo de bootstrap, cadastro privilegiado ou desbloqueio por username/email. Nunca usar um UID fictício para habilitar a versão publicada.

Depois de definir conta/projeto e aprovar as configurações de acesso:

1. Manter o plano Spark e conferir as cotas no console. Não migrar para Blaze nem adicionar cartão para este módulo.
2. Configurar o provedor GitHub e o callback oficial, com o segredo OAuth apenas no console Firebase.
3. Conferir o UID Firebase e substituir o único marcador `__PRESENTER_UID__` no template em uma cópia revisada. Não aplicar o template ainda com marcador.
4. Aplicar a política proprietária somente ao projeto e banco corretos, em ação autorizada. Não trocar o arquivo padrão deny-all silenciosamente.
5. Definir as variáveis públicas e verificar manualmente o login da proprietária, negação de outra conta, edição/salvamento/saída e refresh. Até essa validação, o OAuth real e o acesso em produção permanecem não testados.

O portal não provisiona Firebase/OAuth, não cria grants/tokens, não configura billing e não aplica regras. Esses passos futuros não fazem parte do deploy do site estático.

Publicar o portal não publica as regras. `firebase/firebase.json` aponta sempre para `firestore.rules`, que permanece deny-all. O template proprietário precisa de revisão, substituição explícita do único marcador de UID e aplicação autorizada posterior. Nunca colocar Client Secret GitHub, Admin SDK/service account ou notas pessoais no repositório, nas variáveis públicas do Astro ou no Actions.

## Referências oficiais

- [GitHub Authentication, popup e callback](https://firebase.google.com/docs/auth/web/github-auth)
- [Persistência de autenticação em memória](https://firebase.google.com/docs/auth/web/auth-state-persistence)
- [Cache Firestore em memória](https://firebase.google.com/docs/firestore/manage-data/enable-offline)
- [Token, provedor e timestamp de servidor nas regras](https://firebase.google.com/docs/reference/rules/rules.firestore.Request)
- [Validação de campos nas regras](https://firebase.google.com/docs/firestore/security/rules-fields)
- [Testes de regras com Emulator Suite](https://firebase.google.com/docs/rules/unit-tests)
- [Projetos demo e emulador Firestore](https://firebase.google.com/docs/emulator-suite/connect_firestore)
- [Ciclo de vida da instância Firestore](https://firebase.google.com/docs/reference/js/firestore#terminate)
