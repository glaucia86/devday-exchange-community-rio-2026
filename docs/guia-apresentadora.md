# Guia da apresentadora

[Início](../README.md) · [Programação](programacao.md) · [Validação](validacao.md)

Roteiro público para Glaucia preparar e conduzir as demonstrações. **No evento, Glaucia opera os produtos e o público acompanha. Os LABS são para reproduzir as mesmas demonstrações em casa depois. Não há tempo reservado para execução coletiva dos exercícios.**

O [roteiro de palco](roteiro-de-palco.md) divide a apresentação em duas camadas: a base que sempre funciona e a camada ao vivo, que só entra com ensaio feito.

Os blocos podem ser organizados conforme a programação. Os tempos abaixo são **estimativas para ensaiar a demonstração no palco**, ainda não medidos; não redefinem a grade oficial. Instalação, login, criação de ambiente e configuração de chave ficam fora da apresentação.

## Quatro demonstrações, quatro LABS em casa

O fio condutor dos blocos de código e de voz é o suporte fictício da Aurora. Dots usa outra fonte: as issues e os pull requests públicos deste repositório. A pergunta que liga os blocos é: **“Que evidência me permite aceitar esta entrega?”**

| Demonstração conduzida por Glaucia | O que aparece no palco | O que a pessoa reproduz em casa |
| --- | --- | --- |
| [Dots](#dots) | Relatório preparado das issues e dos pull requests públicos, pergunta ao vivo sobre o que mudou e revisão na página | [Mesmo cenário e pedidos](../labs/01-dots/README.md) |
| [Codex CLI](#codex-cli) | Voz no terminal, visão `/agents` e uma correção curta da Alô, TI | [Mesmos comandos e o mesmo pedido](../labs/codex-cli/README.md) |
| [Codex Cloud](#codex-cloud) | Candidata preparada → regressão → tarefa remota → revisão | [Mesma candidata, contrato e tarefa](../labs/codex-cloud/README.md) |
| [Decisions API](#decisions-api) | Triagem ao vivo: a plateia conta problemas, a voz escuta, o Decisions classifica cada relato num quadro e Glaucia decide os casos incertos | [Mesmos relatos e sequência de voz](../labs/02-decisions-typescript/README.md), com exercícios de contrato sem chave |

O CLI mostra a voz no terminal e uma correção curta na Alô, TI. O Cloud continua no contrato de encaminhamento. A candidata do Cloud é uma cópia com defeito intencional para estudar revisão; não a apresente como um resultado produzido pela execução anterior do CLI.

**Pendente antes de considerar as quatro demos prontas:** ensaiar o cenário novo de Dots no notebook do projetor (o cenário antigo rodou uma vez em 8 de outubro de 2026 e não libera este bloco), ensaiar CLI e Cloud nas contas reais e Decisions com API, microfone e áudio reais. Testes offline e uma página publicada não comprovam essas experiências. Consulte o [registro de validação](validacao.md).

## Preparação antes do encontro

- Conferir programação e local no Luma
- Node.js de 24.12.0 a 24.21.0; `.nvmrc` recomenda 24.21.0. Na véspera, rode `node scripts/prepare-stage.mjs` e deixe `npm start` pronto em `apps/decisions`
- Se o Codex CLI entrar no ensaio: `npm install -g @openai/codex@0.161.0`, `codex --version` mostra `codex-cli 0.161.0` e `codex login status` confirma a sessão, sem projetar a conta. A abertura do palco é `codex -m gpt-6-luna -s workspace-write -a on-request`, na pasta `apps/decisions`. Antes do projetor, confie a pasta se aparecer `Trust this folder?` e, dentro do agente, peça `node --version`: o esperado é v24.21.0, versão recomendada em `.nvmrc`. Se vier outra versão, saia com `/quit` e reabra com `-c allow_login_shell=false`.
- Preparar uma cópia limpa do material e uma cópia separada para cada demonstração; manter soluções de referência para contingência
- Conferir acesso e login de Dots e Codex sem expor dados pessoais na projeção
- Publicar o ambiente Cloud em `glaucia86/devday-exchange-community-rio-2026` antes do palco, conferir que `bug-rede.test.mts` ainda falha, enviar a tarefa antes do bloco e deixar o plano B gravado com a data na tela
- Ensaiar fonte/zoom, teclado e troca de janelas no projetor; fechar notificações e projetos de trabalho
- Para voz: configurar segredo somente no servidor local, aprovar orçamento, confirmar acesso aos modelos e ouvir a saída no dispositivo que será usado
- Não projetar `.env.local`, chave, tokens ou configurações da conta
- Não apresentar fixture, replay, vídeo ou tarefa antiga como execução ao vivo

Comandos de conferência, na raiz:

```sh
node --version
node --test exercises/ticket-router/starter/router.test.mjs
node --test exercises/ticket-router/solution/router.test.mjs
node --test exercises/ticket-router/review-candidate/router.test.mjs
node --test exercises/decisions-contract/inspect.test.mts
node --test apps/decisions/tests/*.test.mts
node scripts/check-workshop-examples.mjs
```

Esperado: Node.js de 24.12.0 a 24.21.0, 88 testes no conjunto de referência, cujo resultado deve ser conferido na CI do commit atual e aceitação com falhas didáticas conferidas: starter 8/18, candidata 16/18, solução 18/18. Isso verifica os exemplos locais; os ensaios nos produtos são uma etapa adicional.

## Abertura e transições

**Estimativa de palco: 3–5 minutos, além do recap.**

Fala sugerida: “Vou mostrar quatro demonstrações. Vocês podem acompanhar agora e repetir cada uma em casa usando o LAB correspondente. Não precisam instalar nem executar nada durante a apresentação.”

Mostre o índice. Dots abre com uma fonte pública real. Os blocos seguintes usam relatos de suporte fictícios que precisam de clareza, encaminhamento e revisão. As transições abaixo mantêm a pergunta da evidência, sem pedir que a plateia abra ferramentas.

## Dots

**Alvo de palco: 2–3 minutos, ainda não cronometrado com este cenário.** [Reprodução em casa](../labs/01-dots/README.md) · [Cenário](../labs/01-dots/cenario.md)

A única espera medida foi de 20 a 45 segundos, em 8 de outubro de 2026, com o cenário antigo de texto colado. Esse ensaio não libera este bloco. Se a resposta ao vivo não fechar em cerca de 45 segundos, passe ao plano B para o bloco caber no alvo.

**Deixar pronto, longe do projetor:**

- Conta de demonstração, sem o exercício antigo na conversa. Não há um item chamado “dots”: o dot aparece pelo próprio nome. No teste de 8 de outubro, o nome ficava no topo da barra lateral, abaixo de “New chat”, e abria em `https://chatgpt.com/dots/<id>`. Os rótulos podem variar. A primeira criação segue a introdução oficial; pule aplicativos e computador. Fonte: [Get started](https://learn.chatgpt.com/docs/dots/getting-started).
- Se o dot dessa conta já tiver histórico, não reutilize. A documentação consultada fala em um dot, que pode ter várias responsabilidades, e na ação **Delete** para apagá-lo. Leia a confirmação. Faça isso só na conta de demonstração, antes do evento. Não apague um dot de trabalho. Essas páginas não descrevem um segundo dot simultâneo.
- Primeiro bloco do [cenário](../labs/01-dots/cenario.md) já enviado e conferido contra as duas páginas públicas. Anote data, hora no horário de Brasília e o que estava visível, com o estado que a página mostra. Não envie o segundo bloco antes do palco: essa pergunta é a batida ao vivo.
- Duas abas ao lado, nas listagens que incluem fechadas: [issues](https://github.com/glaucia86/devday-exchange-community-rio-2026/issues?q=is%3Aissue+is%3Aopen+OR+is%3Aissue+is%3Aclosed) e [pull requests](https://github.com/glaucia86/devday-exchange-community-rio-2026/pulls?q=is%3Apr+is%3Aopen+OR+is%3Apr+is%3Aclosed).
- Glaucia vigia essas abas durante o bloco. Conteúdo não revisado ou inadequado corta na hora para o Plano B, sem ser lido.
- Se o dot pedir GitHub, aplicativo ou computador, recuse. Se ele não ler as páginas sem isso, o ao vivo não está liberado.

| Batida | Ação de Glaucia | Fala sugerida | Evidência na tela |
| --- | --- | --- | --- |
| Estado preparado | Abrir o dot pelo nome e mostrar o relatório já conferido | “Isto não é um chat novo. O dot ficou responsável por vigiar estas duas páginas.” | URL no formato `chatgpt.com/dots/…` e o relatório com horário |
| Conferência muda | Abrir a página pública e bater um número e um título | “Eu aceito o que consigo ver na página.” | O item citado está na página, com o estado que ela mostra |
| Ao vivo | Enviar o segundo bloco, com Enter ou com a seta do campo | “Agora peço só o que mudou. Se nada mudou, essa também é uma resposta.” | Resposta em cerca de 45 segundos, ou passagem ao plano B |
| Revisão | Comparar a resposta com a página | “O texto parece bom. A página é que decide.” | Só mudança real, ou “nada mudou”, sem item inventado |

**Transição:** “O que eu revisei foi uma mudança observável numa fonte pública. No próximo bloco, a evidência passa a ser teste e diff.”

**Leve para casa:** o [LAB](../labs/01-dots/README.md) cabe numa tarde. Quem já acompanha um repositório público ou uma página de status troca as URLs e repete a mesma responsabilidade.

**Reset:** não peça para “desconsiderar a rodada anterior”. As notas do dot atravessam a conversa, e encerrar a conversa não zera esse contexto. Fonte: [Tasks and memory](https://learn.chatgpt.com/docs/dots/tasks-and-memory). Para outro ensaio, use de novo uma conta sem esse histórico, longe do projetor.

**Plano B · relatório preparado:** mostre o relatório conferido antes e a página pública ao lado. Se o corte for por conteúdo não revisado ou inadequado, Glaucia fecha a resposta ao vivo sem lê-la e fica só nesse relatório. Diga que a consulta ao vivo não foi concluída. Não leia o relatório preparado como se fosse a resposta de agora. Não divida a plateia em duplas.

**Ponto de parada:** pedido para conectar GitHub, aplicativo, computador ou e-mail, ou qualquer escrita no repositório. Não autorize no palco.

## Codex CLI

**Estimativa de palco: 2–3 minutos.** [Reprodução em casa](../labs/codex-cli/README.md)

O encaminhador não entra neste bloco. Ele continua no Cloud. Aqui a plateia vê a voz dentro do terminal, a visão `/agents` e uma correção curta na Alô, TI. Comandos, fontes e o texto falado estão no LAB. A versão fixada continua `codex-cli 0.161.0`. O modelo do palco é `gpt-6-luna`, com `-s workspace-write`.

**Deixar pronto, fora deste relógio:** login ChatGPT já conferido, `Trust this folder?` já respondido para este repositório, `node --version` dentro do agente em v24.21.0, versão recomendada em `.nvmrc` (se vier outra versão, reabra com `-c allow_login_shell=false`), microfone ensaiado com `/voice` e `/voice stop`. A Alô, TI deste bloco não usa o `npm start` da véspera: pare esse processo se ele ocupar a porta 3000 e, em `apps/decisions`, deixe `npm run dev` aberto em http://127.0.0.1:3000, aba **Simulado**, página recém-carregada. Fora do relógio, clique **Som desligado** e confira que existe voz local em português; recarregue em seguida, para o palco começar com o som desligado e sem cenário. Tenha uma gravação do ensaio que passou. Cada plano B abaixo é essa gravação: diga “isto é gravação” antes de dar play. Sem gravação, diga que o passo não rodou.

| Tempo | Ação | Fala | Tela | Plano B GRAVAÇÃO |
| --- | --- | --- | --- | --- |
| 0:00–0:20 | Na página recém-aberta: **Por trás da decisão**, marque **Simular falha na próxima análise**, **Explorar cenário** e **Analisar relato** | “A falha está no aviso do lado. A conversa não a repete.” | Aviso `A análise falhou. Seu relato continua aqui; tente novamente.` A conversa não ganha essa frase. | Gravação dessa tela. |
| 0:20–0:40 | No Codex já aberto com `codex -m gpt-6-luna -s workspace-write -a on-request`, digite `/status` | “O modelo desta versão, por padrão, é o GPT-6.1 Sol. No palco eu fixo o Luna: no catálogo da 0.161.0 ele é o modelo rápido e mais barato, para tarefas mais simples.” | `gpt-6-luna` e escrita no workspace. A conta fica fora da projeção. | Gravação do `/status`, com a conta coberta. |
| 0:40–1:10 | `/voice`, fale o pedido do LAB e encerre com `/voice stop` | “Eu começo a tarefa falando, no mesmo terminal.” | Rodapé de voz e a legenda da frase. | Digite o pedido. Se `/voice` não existir nesta instalação, diga isso e use a gravação. |
| 1:10–1:40 | `/agents`, enquanto a tarefa anda | “Esta é a visão nova: as tarefas do terminal num lugar só. Worktree, retomada e a tela cheia ficam para casa.” | O agent command center lista a tarefa. | Gravação do `/agents`. |
| 1:40–2:20 | `/diff` e, depois de `/quit`, `node --test tests/spoken-reply.test.mts tests/service-desk.test.mts` em `apps/decisions` | “O diff cabe numa tela. O teste é a evidência, não a frase do agente.” | Diff curto nos dois arquivos de domínio e nos dois testes. A suíte desses arquivos aprovada. Se passar de 2:00, corte. | Gravação do diff e do teste. Não chame de ao vivo. |
| 2:20–2:50 | Recarregue. Clique **Som desligado** até o botão mostrar **Som ligado**. Repita **Por trás da decisão**, a falha, **Explorar cenário** e **Analisar relato** | “A mesma frase agora entra na conversa, e a voz local a fala uma vez.” | A frase aparece na transcrição e é falada. Se o aviso disser que não há voz local em português, diga isso e fique na transcrição. Se a recompilação passar de 2:50, corte. | Gravação desse reload, com a frase falada. |

**Transição:** “No Cloud, a revisão muda de lugar. O encaminhador continua lá.”

**Reset:** se o diff for só `service-desk.ts`, `spoken-reply.ts`, `spoken-reply.test.mts` e `service-desk.test.mts`, descarte esses arquivos e não faça push. Pare o `npm run dev`. O `next-env.d.ts` que ele reescreve fica fora do Git. A Alô, TI do Decisions volta com `npm start`, na build do `prepare-stage.mjs`, com a frase fora da conversa.

**Ponto de parada:** login, microfone, `/voice` ausente no menu, ou diff fora de `service-desk.ts`, `spoken-reply.ts`, `spoken-reply.test.mts` e `service-desk.test.mts`. A versão do encontro continua `codex-cli 0.161.0`. O catálogo dessa versão não inclui `gpt-5.4-mini`. `codex exec` só edita com `-s workspace-write`; ele não substitui a voz da TUI. `Trust this folder?` pode aparecer mesmo com a pasta já versionada: resolva antes do projetor.

## Codex Cloud

**Estimativa de palco: 6–8 minutos, com ambiente publicado e tarefa já enviada.** O relógio da evidência ao vivo é de **3 minutos**. [Reprodução em casa](../labs/codex-cloud/README.md)

**Deixar pronto, fora do projetor:**

- Ambiente publicado em `glaucia86/devday-exchange-community-rio-2026`, branch principal. A conta já está conectada ao GitHub como `glaucia86`. Não reconecte no palco e não mostre outros repositórios
- `node labs/codex-cloud/run-bug-test.mjs` ainda sai com código 1, na explicação `qual serviço falhou`. Se a preparação do ambiente tiver corrigido `apps/decisions/src/domain/service-desk.ts`, restaure o arquivo e publique de novo. Não suba com o teste verde
- Tarefa enviada antes deste bloco, com o [pedido da tarefa](../labs/codex-cloud/README.md#pedido-da-tarefa). Anote o horário no cartão. A aba já está aberta: `/codex/cloud` passou de 20 segundos em spinner no teste de 8 de outubro, e a lista de repositórios levou cerca de 10 segundos
- Gravação no notebook, fora do Git, primeiro quadro com o letreiro **GRAVADO ANTES · não é ao vivo** e a data. A gravação mostra o mesmo pedido, o diff em `service-desk.ts` mais o teste novo, `bug-rede.test.mts` intacto e o teste passando. Sem esse arquivo, o plano B é só o teste vermelho, anunciado como tal

Rótulos podem variar. A documentação oficial ainda diz **Work in → Cloud → Select environment → Create environment**. O teste de 8 de outubro mostrou **Cloud → Choose environment → Create environment**. Não entre em **Codex Cloud (Legacy)**.

1. **Dizer o que é a tarefa.** Uma frase. O encaminhador ficou no CLI.
   - Fala: “A rede da sala voltou. O texto da Alô, TI ainda diz que não sabemos qual serviço falhou. Vou revisar o diff, não a espera.”
2. **Abrir a tarefa que já está rodando.** Confira o repositório `glaucia86/devday-exchange-community-rio-2026`. Não crie ambiente, não conecte GitHub e não cole o pedido de novo.
3. **Ligar o relógio de 3 minutos** se o diff e a saída de `bug-rede.test.mts` ainda não estiverem na tela. Aos 3 minutos, corte, mesmo no meio da frase do agente.
4. **Revisar, se o resultado chegou.** Leia o diff. Aceite só `apps/decisions/src/domain/service-desk.ts` e `apps/decisions/tests/network-followup.test.mts`. A explicação precisa dizer que a rede voltou, a equipe continua revisão humana, e `labs/codex-cloud/bug-rede.test.mts` não muda. Peça o [pedido de revisão](../labs/codex-cloud/README.md#pedido-de-revisao) só se a saída dos comandos não estiver visível.
   - Fala: “Teste verde aqui é este arquivo passando. Eu ainda decido se o texto serve.”
5. **Encerrar.** Sem pull request, merge ou deploy.

**Transição:** “Até aqui, a revisão foi de um diff. Agora a entrada vem da sala, por voz, e o caso incerto continua sendo decisão minha.”

**Reset:** nova tarefa no ambiente que ainda falha `bug-rede.test.mts`. Guarde a entrega anterior. A documentação diz que arquivos de uma tarefa não atualizam o ambiente publicado; o risco é a preparação ter corrigido o texto antes de publicar.

**Plano B no palco:** aos 3 minutos, ou se a conta, o ambiente ou a permissão falhar, abra a gravação com o letreiro **GRAVADO ANTES · não é ao vivo**. Diga a data e que a tarefa remota não terminou no tempo. Sem a gravação, rode `node labs/codex-cloud/run-bug-test.mjs`, mostre `qual serviço falhou` e diga que o Cloud não rodou. Não corrija o arquivo ao vivo e chame isso de tarefa remota. Não volte para a caça ao bug do encaminhador como se fosse esta demo.

**Ponto de parada:** erro de conta, setup que já corrigiu o defeito, ou o relógio. Não conecte outros repositórios durante a apresentação.

## Decisions API

**Estimativa de palco: 8–10 minutos.** [Reprodução em casa](../labs/02-decisions-typescript/README.md) · [Roteiro de palco](roteiro-de-palco.md)

**Triagem ao vivo**, em http://127.0.0.1:3000/triagem. Glaucia repete no microfone um problema de TI contado pela plateia. Ao ouvir “registra”, a voz (GPT-Live) delega para a aplicação, que envia o relato ao Decisions. Um cartão entra no quadro, na coluna da equipe sugerida, com urgência e confiança. Casos com pouco contexto ou confiança baixa vão para **Revisão humana**, e quem escolhe a equipe é Glaucia, na tela. Tudo é ao vivo; não há modo simulado neste bloco.

### Por que este desenho cabe na conta

A sessão de voz usa **delegação para o cliente**: GPT-Live não chama outro modelo a cada fala. A aplicação faz **uma** chamada ao Decisions (`gpt-6-luna`) por relato. A quota observada na conta do evento foi de 50 requisições por dia e 10 por minuto por modelo; confira novamente antes de cada ensaio. Outras contas podem ter limites diferentes. Uma execução planejada usa cerca de 6 a 8 classificações, além das tentativas que falharem. O contador na tela mostra quantas já foram usadas. Confira os limites na plataforma (Settings → Limits) antes do ensaio.

### Condições para levar ao palco

Siga o [guia de ativação local](integracao-live.md). No notebook do projetor, confirme:

- Acesso a `gpt-live-1` e `gpt-6-luna`, orçamento aprovado e segredo só no servidor
- Fala reconhecida em português e resposta audível na sala, sem retorno para o microfone
- “Registra” cria um cartão por relato; um relato vago cai em **Revisão humana**
- Encerramento confirmado (**Conversa encerrada. Microfone liberado.**) e consumo conferido
- Gravação do ensaio que passou, com o letreiro **GRAVADO ANTES · não é ao vivo**

Glaucia informou um ensaio bem-sucedido da nova Triagem em 8 de outubro de 2026. Registre commit, ambiente e quais itens acima foram observados; não generalize esse relato para outros dispositivos ou casos ainda não percorridos.

### Preparação fora da sessão de voz

Deixe `npm start` aberto com a build conferida, a página `/triagem` carregada, o código local digitado e o consentimento lido. Para Windows, prefira os [comandos diretos de instalação e build](../labs/02-decisions-typescript/README.md#instalar-interface) até o wrapper de palco ser verificado nesse sistema. Confira o quadro: dados de um ensaio anterior podem ser restaurados. Para uma rodada nova, confirme o encerramento e use **Nova triagem** antes de começar. Só clique **Iniciar triagem ao vivo** quando for falar com a voz; a sessão encerra sozinha em dez minutos, o que não é teto de gasto. Tenha dois relatos de reserva no cartão, caso a plateia demore.

Fala sugerida: “Agora quem traz o problema são vocês. Eu repito, a voz escuta, o Decisions classifica e eu decido o que ficar incerto.”

### Sequência no palco

| Batida | Ação de Glaucia | Esperado na tela |
| --- | --- | --- |
| Abrir | **Iniciar triagem ao vivo**, permitir o microfone | **Microfone ativo**; a voz cumprimenta a sala em uma frase |
| Relato 1 | Pedir um problema à plateia, repetir no microfone e dizer “registra” | A legenda **OUVINDO** mostra o relato; um cartão entra na coluna sugerida; a voz anuncia equipe, urgência e confiança |
| Relatos 2 a 4 | Repetir com outros problemas | O quadro enche; o contador de chamadas ao Decisions sobe um por relato |
| Revisão humana | Repetir um relato vago, como “nada funciona aqui” | O cartão vai para **Revisão humana**; Glaucia clica a equipe certa e o cartão ganha **Decidido por você** |
| Padrão | Perguntar “qual o padrão de hoje?” | A voz responde a partir do quadro, sem nova chamada ao Decisions |
| Encerrar | **Encerrar triagem** | **Conversa encerrada. Microfone liberado.** e o placar final |

Relatos de reserva: “Esqueci a senha depois das férias e não entro no e-mail.” · “A VPN da filial cai a cada dez minutos e o financeiro parou.” · “O sistema de reembolso mostra erro 500 para todo mundo.”

Se a voz não delegar ao ouvir “registra”, clique **Classificar agora** e diga que acionou o botão. Em 429 durante a classificação, confira se o relato foi para **Na fila**, ainda sem cartão. Pause/encerre e confirme o fechamento antes de aguardar cota ou passar ao plano B. A fila não é processada sozinha: retomar cria outra sessão e **Classificar fila** exige sessão ativa. Não acumule mais de 20 relatos pendentes.

### Explicação após encerrar

Abra **Evidência da última decisão**, que mostra o objeto interpretado e validado pelo aplicativo, não a resposta bruta completa: `predicate` avalia contexto, `choice` escolhe a equipe e `score` aplica a rubrica de impacto. Mostre `live-contract.ts` e `triage.ts`: confiança abaixo de 0,7 ou contexto abaixo de 0,8 manda o cartão para revisão humana. Os limiares são didáticos; score fracionário não vira prioridade automaticamente.

**Reset real:** espere a análise em andamento terminar, clique **Encerrar triagem** e confira a confirmação de fechamento. **Retomar triagem** abre outra sessão preservando cartões/fila. Para zerar a demonstração, clique **Nova triagem** e confirme a exclusão. Recarregar pode restaurar o quadro e não comprova encerramento remoto. Somente os cartões em **Revisão humana** permitem escolher equipe na tela.

**Plano B no palco:** se uma sessão foi iniciada, clique **Encerrar triagem** e confirme o fechamento. Se a finalização não for confirmada, pare os novos inícios e verifique sessão/consumo. Depois, abra a gravação com o letreiro **GRAVADO ANTES · não é ao vivo** e diga a data. Sem gravação, rode `node --test tests/triage.test.mts` em `apps/decisions`, mostre a regra da revisão humana e diga que a triagem ao vivo não rodou.

## Fechamento

**Estimativa de palco: 2–3 minutos.**

Retome contexto, escopo, evidência e confirmação. Abra os quatro LABS e diga onde cada pessoa pode reproduzir a demonstração correspondente em casa, no seu ritmo. Reforce requisitos, alternativas offline e disponibilidade por conta. Não peça instalação ou execução antes de encerrar.

## Depois de cada ensaio

Registrar data, commit, versões, ambiente, passos realmente executados, saídas, duração e limitações em [validação](validacao.md). Manter separados teste de domínio, build, navegador, produto autenticado, áudio reproduzido e API real. Nunca promover uma etapa pendente a “validada” sem executar a verificação correspondente.
