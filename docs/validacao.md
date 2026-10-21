# Estado da validação

[Início](../README.md) · [Guia da apresentadora](guia-apresentadora.md)

## Dependências de segurança · 20 de outubro de 2026

Base conferida: `22888fd6b8b923993b129f57756a509cf79add03`. Os checks dessa base estavam aprovados no GitHub, incluindo `offline-tests`, `ui-build` e portal; isso é evidência histórica, não validação desta alteração.

A aplicação passa de Next.js `16.4.0` para `16.4.1` e de React/React DOM `19.3.0` para `19.3.1`, mantendo as mesmas linhas de versão. O [aviso oficial do Next.js](https://nextjs.org/blog/nextjs-security-update-october-14-2026) identifica `16.4.1` como corrigida. Os avisos do React para [RCE em RSC](https://github.com/react/react/security/advisories/GHSA-xqc2-xf4c-x3h3) e [DoS em Server Functions](https://github.com/react/react/security/advisories/GHSA-h3gv-c5rc-p453) indicam `19.3.1` para os pacotes RSC da linha 19.3. O Next distribui implementações RSC internas; atualizar React isoladamente não substitui atualizar o framework.

O lockfile da aplicação foi regenerado pelo npm, incluindo `@next/env`, os oito pacotes SWC de plataforma, URLs e integridades. `sharp` já estava em `0.35.5`, o mínimo indicado pelo aviso do Next, e foi preservado. Os pacotes de tipos React permanecem em `19.3.0`; a compatibilidade foi conferida por typecheck e build. Não houve alteração de lógica, configuração do Next ou dependências do portal.

O código usa App Router. A revisão de fontes e configuração não encontrou `use cache`, Cache Components, Server Actions ou `next/image`. Isso não comprova exploração nem imunidade: as condições específicas não foram reproduzidas e nenhum payload de RCE/DoS foi executado.

### Execução local desta alteração

Ambiente Linux x64, Node.js `24.21.0` (arquivo oficial com SHA-256 conferido) e npm `11.19.0`. Antes da alteração, os 105 testes de domínio, instalação, typecheck e build passaram com o runtime inicialmente disponível, Node `24.19.0`/npm `11.9.0`.

| Verificação após a alteração | Resultado executado |
| --- | --- |
| `npm ci --ignore-scripts --no-audit --no-fund` na aplicação | Instalação limpa aprovada; lockfile preservado |
| `npm ls next react react-dom sharp` | Next `16.4.1`, React/DOM `19.3.1`, Sharp `0.35.5`, sem conflito de peers |
| `npm run typecheck` e `npm run build` | Aprovados; rotas `/`, `/triagem` e `/api/live` geradas |
| `node --test apps/decisions/tests/*.test.mts` na raiz | 105 aprovados, zero falhas |
| `node --test tests/live-origin.mjs` na aplicação | Aprovado contra `next start`, com credenciais fictícias e sem inferência |
| `node tests/browser.mjs` na aplicação | Fluxo simulado, revisão humana, edição, ticket, mobile e suíte live importada pelo próprio script aprovados |
| `node --test tests/triage-browser.mjs` na aplicação | 10 aprovados: fila 429, fala concorrente, respostas tardias, pausa/encerramento, autoplay e persistência |
| Testes de scripts e exercícios | 38 aprovados; aceitação didática, links locais e roteiro CLI aprovados |
| `npm audit --omit=dev --json` | Zero alertas conhecidos retornados; não é prova de ausência de vulnerabilidades |

O download padrão de Chromium pelo Playwright falhou neste ambiente. Os testes de navegador foram executados com Playwright `1.63.0` e Chromium headless `153.0.8010.0`, obtido de `@sparticuz/chromium@153.0.0` em diretório temporário. Um preload local alterou apenas `chromium.launch` para selecionar esse executável; os testes e suas asserções não foram editados. Servidor e testes rodaram na mesma sessão de execução com `MESA_LIVE_ENABLED=false`. A CI continua usando o Chromium instalado pelo próprio Playwright.

Microfone, WebRTC, áudio e respostas do modelo foram simulados pelos testes. Nenhuma chamada paga foi feita. Permanecem pendentes o ensaio com áudio/API reais e a validação no notebook do evento. Os testes completos do portal não foram repetidos localmente nesta revisão; consultar a CI do SHA proposto, sem transferir a aprovação da base para o PR.

### Node.js: publicação ainda pendente na consulta

O [anúncio oficial](https://nodejs.org/en/blog/vulnerability/october-2026-security-releases) ainda informa publicação em ou após 21/10, com severidade máxima alta para 24.x. A [versão `24.22.0`](https://nodejs.org/en/blog/release/v24.22.0), publicada em 14/10, não foi identificada como a correção anunciada. Nenhuma versão futura foi presumida.

Por isso, `.nvmrc`, a faixa aceita e a CI continuam em `24.21.0`. Isso **não resolve** a atualização pendente do Node. Assim que a versão corrigida for publicada, conferir o aviso e as notas oficiais e atualizar de forma coordenada `.nvmrc`, `engines` dos três manifests e seus lockfiles, o teto e os testes de `scripts/prepare-stage`, todos os pins de CI e os guias. Repetir instalação limpa, testes, typecheck, build e navegador da aplicação e do portal, além do ensaio de palco, antes de adotar o runtime novo para 24/10. Não remover `engine-strict` para contornar a incompatibilidade.

Para reproduzir a atualização do lockfile, em `apps/decisions`, com o Node de `.nvmrc`:

```bash
npm install --save-exact --package-lock-only --ignore-scripts --no-audit --no-fund next@16.4.1 react@19.3.1 react-dom@19.3.1
npm ci --ignore-scripts --no-audit --no-fund
npm run typecheck
npm test
npm run build
node --test tests/live-origin.mjs
npx playwright install --with-deps chromium
# Em outro terminal, iniciar npm start; manter o modo live desativado.
node tests/browser.mjs
npm run test:triage-browser
```

As evidências locais acima pertencem aos comandos executados durante a preparação deste patch. O resultado do GitHub Actions deve ser consultado no SHA do PR. Esta revisão não integrou a branch nem publicou aplicações.

<a id="triagem-2026-10-09"></a>
## Triagem e documentação em 9 de outubro de 2026

Base de código conferida: `e7129f316f5e8830687b658a7384b8d4e47e3fe1`. A [CI desse commit](https://github.com/glaucia86/devday-exchange-community-rio-2026/actions/runs/37888062878) concluiu os jobs de testes offline e build/interface com sucesso. Foram consultados os estados e os passos dessa execução; a revisão de texto não repetiu comandos localmente.

A base declara 67 testes da aplicação, dos quais nove são de Triagem, e 88 nos conjuntos descritos pelo README. Os dois testes novos cobrem fila e restauração. O teste de navegador executado pelo workflow atual visita a rota `/`; os testes de domínio não substituem um walkthrough de navegador da rota `/triagem`.

Glaucia informou ter executado a nova Triagem com sucesso no ensaio de 8 de outubro de 2026. O relato deve ser complementado com commit, sistema, navegador, versões, passos observados, encerramento e limitações. Não implica validação de todos os sistemas operacionais ou dos estados adicionados depois.

A revisão documental de 9 de outubro alinhou o percurso da Triagem com configuração, fila, persistência, pausa, retomada e reset. Não executou microfone, áudio ou chamadas pagas. A CI do commit que receber a documentação e o walkthrough de participante devem ser registrados separadamente.

Para o próximo ensaio, conferir e registrar: instalação limpa; primeira abertura desativada; configuração sem vazamento de segredo; código local e consentimento; áudio de entrada e saída; relatos; revisão humana; fila/limites; pausa e retomada; nova rodada; porta alternativa; encerramento confirmado e comportamento em fechamento incerto. Não provocar limites pagos artificialmente só para testar recuperação; transporte simulado é apropriado para os testes automatizados.

As correções posteriores desta branch têm [registro próprio de regressões e verificações locais](triagem-regressions-2026-10-09.md), incluindo `/triagem` com transporte substituído, falha de persistência e os limites do que foi executado. Esse registro não comprova voz ou API reais nem uma execução posterior de CI.

## Registros anteriores

Os registros abaixo pertencem às versões e execuções citadas. Contagens e pendências históricas não representam automaticamente a versão atual.

**7 de outubro de 2026.** Material escrito, comportamento testado e integração real são estágios diferentes.

## Evidência observada

| Verificação | Resultado |
| --- | --- |
| Encaminhador starter | 3 testes aprovados |
| Encaminhador solução | 8 testes aprovados |
| Domínio Mesa TI + proteção de fala | 15 testes aprovados |
| Instalação, TypeScript e build Next.js | Aprovados no GitHub Actions |
| Interface Chromium | Fluxo mock aprovado, sem erros não capturados no navegador |
| Capturas desktop e celular | Inspecionadas; sem corte, sobreposição ou overflow horizontal observado |
| Voz real pelo dispositivo | Ainda não ensaiada; regressão usa simulação da API do navegador |
| GPT-Live + Decisions | Triagem ao vivo implementada com delegação para o cliente e 11 testes novos (regras do quadro, sessão e limite 429); ensaio com conta e áudio reais pendente |
| Dots | Cenário antigo executado uma vez em 8 de outubro de 2026; o cenário novo ainda não foi ensaiado |
| Codex CLI / Codex Cloud | Guias disponíveis; fluxos nos produtos ainda não ensaiados |

A integração ampliou o conjunto unitário para **46 testes**. Os 26 testes anteriores e suas execuções abaixo permanecem como referência histórica; confira a CI no SHA atual. Testes de seleção de fala não comprovam que áudio foi ouvido.

## Execuções de referência

- [26 testes e links locais](https://github.com/glaucia86/devday-exchange-community-rio-2026/actions/runs/37650412472), commit 3f5522749bd911460d676bb3aabdd825800854f3
- [TypeScript e build](https://github.com/glaucia86/devday-exchange-community-rio-2026/actions/runs/37650844453), commit 7c3045e5768cfcb41d64685b24cef122dea8dec4
- [Fluxo Chromium e capturas](https://github.com/glaucia86/devday-exchange-community-rio-2026/actions/runs/37652351449), commit 70ba748ef9709f5e1cc071e5c25a3958c8385b9c

Ambiente: Ubuntu 24.04, Node.js 24.21.0. Os manifests resolvidos na terceira execução foram preservados para instalação com npm ci. Consulte também a execução correspondente ao HEAD da branch; uma aprovação de um SHA anterior não valida alterações posteriores.

O teste de navegador cobre: cenário, bloqueio antes da revisão humana, edição do relato, correção ensaiada, alteração de título, criação do ticket, pista para recomeçar, ambiguidade, texto livre no simulado, reset durante análise, falha/nova tentativa, ausência de overflow horizontal e erros não capturados. A regressão de carregamento tardio de voz é simulada; a nova execução no HEAD deve confirmar seu resultado.

## Como repetir

Na raiz, com Node.js de 24.12.0 a 24.21.0:

```bash
node --test exercises/ticket-router/starter/router.test.mjs
node --test exercises/ticket-router/solution/router.test.mjs
node --test apps/decisions/tests/*.test.mts
node scripts/check-doc-links.mjs
```

Instalação, build e navegador: [README da aplicação](../apps/decisions/README.md).

A CI usa runners padrão do repositório público e permissões de leitura. Os pacotes vêm do registro público npm. Não recebe segredos de modelo, não chama OpenAI, não publica aplicações e não faz deploy. URLs externas e âncoras dos documentos não são validadas automaticamente.

## O que ainda falta

- Ensaiar projeção e acessibilidade com teclado/leitor de tela
- Ouvir a saída real de áudio em dispositivos-alvo
- Configurar o runtime local somente após autorização; ensaiar o adaptador com fala, transcrição, interrupção e resposta tardia reais
- Ensaiar o cenário novo de Dots no notebook do projetor. O cenário antigo foi executado uma vez em 8 de outubro de 2026 e não libera o palco
- Ensaiar os LABS nos produtos Codex CLI e Codex Cloud
- Confirmar limites de acesso e consumo antes de qualquer API real

Nos próximos ensaios, registrar data, commit, ambiente, versões, comandos, resultados e limitações. Falha continua sendo falha; mock continua sendo mock.

## Verificação do adaptador

Os novos testes cobrem autenticação local, origem/Host, limites de entrada e sessão, contrato Decisions, recusa, respostas atrasadas, perda do sideband, encerramento idempotente, correções e ticket confirmado. Chromium usa microfone, WebRTC, transporte HTTP e respostas simulados; não chama OpenAI.

Um teste de handshake usa apenas loopback para verificar headers no WebSocket nativo do Node. Não recebe uma chave real. O modo live permanece desativado no servidor da CI.

A revisão revelou regressões reproduzidas antes das correções: fala apagando ticket, sideband perdido e fechamento concorrente. A evidência final deve sempre ser o resultado do SHA exato; uma build antiga ou um teste parcial não valida alterações posteriores.

[Guia Windows](integracao-live.md) · [Workflow](https://github.com/glaucia86/devday-exchange-community-rio-2026/actions/workflows/check-labs.yml)



## Revisão dos LABS como participante · 8 de outubro de 2026

A revisão partiu do portal público e dos arquivos do commit `fc939b501182d488d4e3d91d423623e14b87d472`. O caminho “Prepare seu ambiente” omitia o clone antes de pedir comandos na raiz; o LAB Decisions apontava para o arquivo errado das perguntas. O novo material inclui preparação, checkpoints e resultados observáveis.

Execução local desta revisão, no computador cloud, com Node.js 24.19.0:

- 46 testes existentes: 46 aprovados, sem inferência ou áudio reais
- Verificador independente do encaminhador: starter 8/18, candidata de revisão 16/18 e solução 18/18. As falhas iniciais são intencionais e conferidas por script; arquivo ausente não vale como “vermelho”
- Cópia do starter, execução, comparação de diff e reset percorridos em diretório temporário: três testes iniciais, aceitação vermelha, solução verde e recusa de sobrescrita confirmados. A correção foi reproduzida com a solução local, sem chamar o agente Codex
- Os quatro arquivos do exercício Cloud foram montados em uma pasta independente e executados localmente, sem criar tarefa remota
- Cinco testes do exercício TypeScript de contrato: resposta completa, contexto insuficiente, recusa, equipe inválida e arquivo ausente
- CLI disponível no ambiente: `codex-cli 0.159.2`; ajuda e sintaxe de login consultadas, sem autenticar ou executar uma tarefa de modelo

O conjunto passou a ter 71 testes, contando os cinco testes deliberadamente incompletos da candidata e os cinco do exercício de contrato. A correção da retomada ao editar o relato deixou o conjunto corrente em 73 testes, dos quais 52 são da Alô, TI. A aceitação independente acrescenta 18 verificações para cada versão do encaminhador. A CI executa tanto o verde quanto as falhas didáticas esperadas.

Isso comprova os exercícios locais e seus critérios. Não comprova que esta revisão concluiu Dots, a interação autenticada do CLI ou uma tarefa Codex Cloud. CLI, Cloud, microfone, áudio audível e APIs reais continuam pendentes. O walkthrough público confirma a navegação e o conteúdo que estava publicado; alterações de um PR só chegam ao site após integração e deploy autorizados.

Esta revisão de repositório não executou Dots. Mais tarde, em 8 de outubro de 2026, o cenário antigo de Dots foi executado uma vez numa conta ChatGPT. O registro está em [Dots · ensaio de 8 de outubro de 2026](#dots-ensaio-2026-10-08). O cenário novo continua sem ensaio.

Comandos novos, na raiz:

```sh
node --test exercises/ticket-router/review-candidate/router.test.mjs exercises/decisions-contract/inspect.test.mts
node scripts/check-workshop-examples.mjs
```

Para conferir o patch atual, use a [CI dos LABS](https://github.com/glaucia86/devday-exchange-community-rio-2026/actions/workflows/check-labs.yml) e a [CI do portal](https://github.com/glaucia86/devday-exchange-community-rio-2026/actions/workflows/check-portal.yml). Não reutilize uma execução de outro SHA como prova de uma alteração posterior.

<a id="dots-ensaio-2026-10-08"></a>

### Dots · ensaio de 8 de outubro de 2026

Conta real em chatgpt.com. Cenário daquele dia: resumo dos relatos fictícios da Aurora, com uma correção no segundo bloco. Não é o cenário atual.

- A resposta completa chegou em 20 a 45 segundos
- O checklist daquele cenário passou: separou fatos de lacunas e não inventou prioridade nem responsável
- Não havia um item chamado “dots”. O dot aparecia pelo próprio nome no topo da barra lateral, abaixo de “New chat”, em `https://chatgpt.com/dots/<id>`. Os rótulos podem variar
- O envio era a seta do campo ou Enter. Não havia um botão com o texto “Enviar”
- O dot reutilizado já tinha uma rodada igual no histórico. A conferência da correção ficou contaminada
- A documentação oficial descreve o dot como agente de responsabilidade contínua. Aquele ensaio pediu um resumo único e não mostrou isso

O cenário novo, vigiar as issues e os pull requests públicos deste repositório e relatar só o que mudou, ainda não foi ensaiado. O ensaio de 8 de outubro não libera o bloco de palco.


### Finalidade dos roteiros

No evento, Glaucia conduz as quatro demonstrações e o público acompanha. Os quatro LABS são para reproduzir essas mesmas demonstrações em casa depois; não haverá execução coletiva durante a apresentação. Tempos do guia da apresentadora são estimativas de palco/ensaio; tempos dos LABS são de estudo em casa, fora da grade oficial.

Decisions mantém voz para voz real como demonstração principal planejada, condicionada ao ensaio real ainda pendente. Mock e fixtures continuam identificados como preparação, alternativa e aprofundamento. Documentar o roteiro principal não comprova que ele foi executado.

### Codex Cloud · teste de usabilidade · 8 de outubro de 2026

Conta real do ChatGPT, GitHub já conectado ao Codex como `glaucia86`. O roteiro antigo não estava pronto para o palco: pedia Node, Git, quatro comandos `node -e`, `git init`, um repositório GitHub novo e o envio de quatro arquivos pelo navegador. Quem só tinha o navegador parava ali.

No mesmo dia, a interface observada foi **Cloud → Choose environment → Create environment**, com “What should we build?”, “Loading saved environments…”, “Create a cloud environment” e “Connected to GitHub as glaucia86”. A página `/codex/cloud` ficou mais de 20 segundos em spinner. A lista de repositórios levou cerca de 10 segundos em “Loading repositories…”. **Publish** e **Environment published** não apareceram, porque o ambiente não foi criado. Existe **Codex Cloud (Legacy)**; o roteiro antigo não o mencionava. A documentação oficial lida no mesmo dia ainda descreve **Work in → Cloud → Select environment**. Rótulos podem variar.

O exercício antigo do encaminhador rodou no Node 20.19.2, com 5 testes da candidata e aceitação 16/18. Exigir Node.js 24.21.0 antes da tarefa Cloud era mais do que aquele JavaScript puro pedia. O requisito 24.21.0 continua no `.nvmrc`, na instalação da Alô, TI e na CI.

O roteiro passou a usar o repositório do evento, ou um fork de um clique, e o defeito real de explicação em `mockDecision('network', true)`. `node scripts/check-codex-cloud.mjs` confirma que essa explicação ainda fala em serviço desconhecido e que os textos do Cloud citam o teto de 3 minutos e o plano B gravado. Isso não é ensaio da tarefa remota. O ambiente publicado, a tarefa e a gravação do plano B continuam pendentes.


### Autonomia de quem estuda em casa

Os guias incluem abertura do terminal, conceitos básicos, verificação de versões, pasta atual, preparação de cópias, distinção entre comandos e mensagens ao agente, saídas esperadas e recuperação de erros. O caminho essencial fica separado do aprofundamento opcional. A cópia Cloud com os dois comandos de Node e os quatro arquivos foi repetida em uma pasta temporária: cinco testes verdes, aceitação 16/18 e recusa de sobrescrita confirmadas. Navegação de conta e upload no GitHub seguem fontes oficiais, mas não foram ensaiados com login nesta revisão.

## Roteiro curto do Codex CLI · 8 de outubro de 2026

O bloco de palco do CLI deixou de ser o encaminhador de 18 casos. O texto novo pede a CLI `0.161.0`, o modelo `gpt-6-luna`, `-s workspace-write`, a tela `Trust this folder?` mesmo com a pasta versionada, e `node --version` dentro do agente. A voz documentada é `/voice` na TUI da tag 0.161.0. A página de slash commands em developers.openai.com, nessa data, ainda não listava `/voice` nem `/agents`.

Isso confere o texto e os links citados no LAB. Não é um ensaio autenticado: esta revisão não abriu o microfone, não entrou com conta e não deixou o agente editar a Alô, TI. A gravação de plano B continua por fazer no notebook do projetor. O encaminhador segue no LAB Cloud.

O reload do bloco CLI usa `npm run dev`, aberto antes do relógio. O `npm start` da véspera serve a build do `prepare-stage.mjs` e não mostraria a edição. O teste que despacha `FAILED` trava o defeito atual: a frase fica no aviso, fora da conversa, e `getSpokenReply` desse estado devolve vazio. A suíte continua verde com o defeito. O pedido do palco manda o agente atualizar esse teste junto com o redutor. Depois do reload, o roteiro liga de novo o som, que volta desligado, e repete **Explorar cenário** antes de **Analisar relato**.

```sh
node scripts/check-cli-stage.mjs
```
