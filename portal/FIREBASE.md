# Notas privadas da apresentadora

## Estado do pacote RED

O controlador ainda é um stub inerte. Os casos de sucesso dos testes devem falhar no GitHub Actions antes de implementar comportamento. Tanto as regras padrão quanto o template estão fechados nesta etapa. Não há projeto, UID real, conta, credencial ou chamada ao Firebase de produção.

## Dependências e comandos para o pacote principal

- Dependência de runtime: `firebase` (SDK modular web).
- Dependências de desenvolvimento: `@firebase/rules-unit-testing` e `firebase-tools` em versões compatíveis com o SDK, fixadas no lockfile.
- Node 22 e Java 21 no GitHub Actions.
- Controlador: `node --test tests/presenter-controller.test.mjs` na pasta `portal`.
- Regras: `firebase emulators:exec --only firestore --project demo-devday-presenter --config firebase/firebase.json "node --test tests/rules.test.mjs"` na pasta `portal`.
- Testar controlador e regras como passos independentes para observar as duas falhas RED. Não colocar o emulador em um comando que será pulado após o primeiro teste falhar.

Os testes de regras recusam qualquer `FIRESTORE_EMULATOR_HOST` diferente de `127.0.0.1:porta` e qualquer projeto de ambiente diferente do projeto demo fixo. O teste usa exclusivamente identidades e textos fictícios. Não carregar credenciais, tokens, contas reais ou exportações do Firestore no Actions. Não executar deploy Firebase nos workflows.

## Contrato planejado

- Shell público estático em `/apresentadora/`, sem notas incorporadas ao HTML, build, busca ou artefatos.
- Firebase Spark, apenas GitHub Authentication e Firestore. Sem Blaze, cartão, Storage, Functions ou inferência.
- Configuração desconhecida significa interface desativada, nenhuma inicialização do SDK e regras deny-all.
- Sessão Auth em memória e cache Firestore em memória. O SDK é carregado apenas no browser.
- Um único documento: `presenter/{firebaseUid}/notes/evento`.
- Schema fechado: `content` string de até 16000 caracteres e `updatedAt` timestamp do servidor.
- Backend exige UID Firebase exato e `request.auth.token.firebase.sign_in_provider == 'github.com'`. Username e email não substituem o UID.
- Apenas get, create e update do documento conhecido; sem list, collection group ou delete.
- Editor de texto simples. Salvar exige clique; sem autosave. Saída limpa estado visual imediatamente e invalida operações antigas.
- Popup GitHub sem escopos extras e sem extrair token OAuth. Mensagens de erro são localizadas e genéricas; não registrar objetos de erro, credenciais ou notas.

## Preparação futura, ainda não executada

A proprietária precisará definir um projeto Firebase Spark e seu UID Firebase verificado. O host autorizado no Authentication será `glaucia86.github.io`, sem o caminho do repositório. O `authDomain` será o host padrão real do projeto (`PROJECT_ID.firebaseapp.com`) e o callback GitHub será `https://PROJECT_ID.firebaseapp.com/__/auth/handler`. Esses exemplos são marcadores; não representam recursos existentes.

Publicar o portal não publica as regras. `firebase/firebase.json` aponta sempre para `firestore.rules`, que permanece deny-all. O template proprietário precisa de revisão, substituição explícita do único marcador de UID e aplicação autorizada posterior. Nunca colocar Client Secret GitHub, Admin SDK/service account ou notas pessoais no repositório, nas variáveis públicas do Astro ou no Actions.

## Referências oficiais

- [GitHub Authentication, popup e callback](https://firebase.google.com/docs/auth/web/github-auth)
- [Persistência de autenticação em memória](https://firebase.google.com/docs/auth/web/auth-state-persistence)
- [Cache Firestore em memória](https://firebase.google.com/docs/firestore/manage-data/enable-offline)
- [Token, provedor e timestamp de servidor nas regras](https://firebase.google.com/docs/reference/rules/rules.firestore.Request)
- [Validação de campos nas regras](https://firebase.google.com/docs/firestore/security/rules-fields)
- [Testes de regras com Emulator Suite](https://firebase.google.com/docs/rules/unit-tests)
- [Projetos demo e emulador Firestore](https://firebase.google.com/docs/emulator-suite/connect_firestore)
