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
| [Decisions API](#decisions-api) | Conversa de voz para voz, correção, revisão e ticket simulado | [Mesmos relatos e sequência de voz](../labs/02-decisions-typescript/README.md), com alternativa simulada identificada |

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

Esperado: Node.js de 24.12.0 a 24.21.0, 72 testes aprovados no conjunto atual e aceitação com falhas didáticas conferidas: starter 8/18, candidata 16/18, solução 18/18. Isso verifica os exemplos locais; os ensaios nos produtos são uma etapa adicional.

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

**Transição:** “Até aqui, a revisão foi de um diff. Agora a entrada será uma conversa, e a confirmação continua na tela.”

**Reset:** nova tarefa no ambiente que ainda falha `bug-rede.test.mts`. Guarde a entrega anterior. A documentação diz que arquivos de uma tarefa não atualizam o ambiente publicado; o risco é a preparação ter corrigido o texto antes de publicar.

**Plano B no palco:** aos 3 minutos, ou se a conta, o ambiente ou a permissão falhar, abra a gravação com o letreiro **GRAVADO ANTES · não é ao vivo**. Diga a data e que a tarefa remota não terminou no tempo. Sem a gravação, rode `node labs/codex-cloud/run-bug-test.mjs`, mostre `qual serviço falhou` e diga que o Cloud não rodou. Não corrija o arquivo ao vivo e chame isso de tarefa remota. Não volte para a caça ao bug do encaminhador como se fosse esta demo.

**Ponto de parada:** erro de conta, setup que já corrigiu o defeito, ou o relógio. Não conecte outros repositórios durante a apresentação.

## Decisions API

**Estimativa de palco: 10–12 minutos.** [Reprodução em casa](../labs/02-decisions-typescript/README.md) · [Roteiro de palco](roteiro-de-palco.md)

**O que entra sem ensaio:** a aba **Simulado**, com **Modo palco**, a virada de Acessos e identidade para Aplicações internas e o ticket `DEMO-0001`. O botão do exemplo pronto é **Simular uma correção**. **Corrigir o relato** abre o texto para a pessoa editar.

**Demonstração ao vivo, só depois do ensaio:** voz para voz real com GPT-Live + Decisions. O mock não prova que a conversa real funcionou.

### Condições para ensaiar e levar ao palco

Siga o [guia de ativação local](integracao-live.md). Antes do encontro, confirme no dispositivo-alvo:

- Acesso aos modelos, orçamento aprovado e configuração segura no servidor
- Fala reconhecida em português e resposta realmente audível, chegando também ao áudio da plateia sem retorno para o microfone
- Correção do relato refletida na transcrição e na nova análise
- Revisão anterior invalidada; confirmação só após nova revisão humana
- Encerramento remoto confirmado e consumo conferido

Enquanto esses itens estiverem pendentes, o fluxo principal não deve ser anunciado como validado. O aviso atual da interface sobre integração experimental permanece verdadeiro.

### Preparação fora da sessão de voz

Deixe a aplicação local aberta com `npm start`, a partir da build do `node scripts/prepare-stage.mjs`. Na aba **OpenAI ao vivo**, já configurada. Não comece a captura enquanto explica a arquitetura ou ajusta projeção. Sessões têm limite local de dez minutos; esse controle não garante teto de gasto.

Fala sugerida: “Até aqui eu cliquei. Agora eu falo com a Alô, TI. Ela pede uma função, a mesa executa, e o ticket continua fictício até eu confirmar.”

O meio da demonstração continua na aba **Simulado**. A voz entra no fechamento. Sem o ensaio de áudio, leia a frase de monitoramento que a aba simulada mostra depois do ticket e diga que a conversa real não rodou.

### Sequência da conversa

1. **Iniciar:** confira o código local; leia o consentimento e, somente após concordar com o envio e autorizar o custo, marque **Entendi o envio de áudio e texto à OpenAI e estou autorizada a usar a API com custo nesta demo.** Clique **Iniciar conversa real** e espere **Microfone ativo**.
2. **Registrar:** diga “Registra este relato: a rede da sala de reunião cai durante as chamadas. O restante do escritório funciona.”
   - Esperado: o log mostra `registrar_relato` e o texto aparece no relato. Ainda não há ticket. A transcrição sozinha não preenche o campo.
3. **Analisar:** diga “Analisa o relato.”
   - Esperado: uma fala curta de que está analisando e, em seguida, a equipe sugerida. Se a função não vier, use **Analisar com Decisions** e diga que acionou o botão.
4. **Interromper:** no meio da resposta, diga “Corrige: na verdade é o time todo e ninguém consegue trabalhar. Não há alternativa.”
   - Esperado: o log mostra `corrigir_relato`, a análise some e a sugestão anterior não volta.
5. **Analisar de novo** e, só então, dizer “Confirma e abre o ticket.”
   - Esperado: `DEMO-0001`. Sem esse pedido explícito o ticket não nasce. A tela mostra o monitoramento de demonstração. Depois de uma pausa, a assistente fala a frase uma vez. Aponte o rótulo de dados de demonstração: não é um painel real.
6. **Encerrar:** clique **Encerrar conversa** e espere **Conversa encerrada. Microfone liberado.**.
   - Se aparecer finalização não confirmada, pare os novos inícios e verifique sessão/consumo. Não reinicie em sequência.

A conversa curta deve caber no limite local no ensaio; a explicação de arquitetura fica antes ou depois. Latência e duração reais ainda precisam ser medidas. Ao terminar, desative o modo ao vivo e reinicie ou encerre o servidor conforme o guia local.

### Explicação após encerrar

Mostre `live-contract.ts`: `predicate` avalia contexto, `choice` escolhe a equipe e `score` aplica a rubrica. A aplicação verifica o contrato e a revisão vigente antes de permitir o ticket. O encaminhador dos LABS CLI/Cloud usa palavras e categorias; ele não compreende negações ou correções como esta conversa pretende compreender. Os limiares são didáticos; score fracionário não vira prioridade automaticamente.

O exercício de editar fixtures e comparar recusas fica no LAB para estudo em casa. Não transforme essa etapa em atividade simultânea da plateia.

**Reset real:** confirmar o encerramento e só então iniciar outra sessão autorizada. Não usar “Recomeçar” do mock para inferir que uma sessão remota foi encerrada.

**Plano B no palco:** se uma conversa real foi iniciada, clique **Encerrar conversa** e confirme o fechamento antes de trocar para Simulado. Se a finalização não for confirmada, pare os novos inícios e siga a verificação de sessão/consumo do guia local; trocar de aba não comprova encerramento remoto. Depois, anuncie “Agora vou reproduzir o fluxo com respostas preparadas”. Na aba **Simulado**, clique **Modo palco → Explorar cenário → Analisar relato → Simular uma correção → Analisar relato**, revise e crie `DEMO-0001`. Leia a frase de monitoramento na tela e diga que os registros marcados como demonstração não são chamados reais. O seletor e o rodapé já dizem que esta aba é simulada. Não há microfone nem inferência nesse caminho. Voz local opcional do dispositivo não é GPT-Live. Se nem a interface estiver disponível, mostrar os testes e fixtures, sem dizer que houve conversa.

## Fechamento

**Estimativa de palco: 2–3 minutos.**

Retome contexto, escopo, evidência e confirmação. Abra os quatro LABS e diga onde cada pessoa pode reproduzir a demonstração correspondente em casa, no seu ritmo. Reforce requisitos, alternativas offline e disponibilidade por conta. Não peça instalação ou execução antes de encerrar.

## Depois de cada ensaio

Registrar data, commit, versões, ambiente, passos realmente executados, saídas, duração e limitações em [validação](validacao.md). Manter separados teste de domínio, build, navegador, produto autenticado, áudio reproduzido e API real. Nunca promover uma etapa pendente a “validada” sem executar a verificação correspondente.
