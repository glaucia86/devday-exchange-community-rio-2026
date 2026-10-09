# LAB · Codex CLI: voz no terminal e uma correção curta

[Início](../../README.md) · [Guia da apresentadora](../../docs/guia-apresentadora.md#codex-cli) · [Roteiro de palco](../../docs/roteiro-de-palco.md)

Bloco de **2–3 minutos** no palco. Em casa, a mesma sequência cabe numa tarde. O encaminhador de chamados não entra neste bloco: ele continua no [LAB Cloud](../codex-cloud/README.md).

No evento, Glaucia opera o terminal e o público acompanha. Este LAB é para repetir depois, no seu computador.

## O que entra no palco

Três coisas, nesta ordem: o modelo e a permissão certos, a voz dentro do terminal, e o centro de agentes enquanto uma correção pequena da Alô, TI acontece. A correção é real e curta. O caso `FAILED` em [service-desk.ts](../../apps/decisions/src/domain/service-desk.ts) grava o aviso `A análise falhou. Seu relato continua aqui; tente novamente.` e não acrescenta essa frase à conversa. [getSpokenReply](../../apps/decisions/src/domain/spoken-reply.ts) devolve vazio quando o status é `error`, e o [teste de fala](../../apps/decisions/tests/spoken-reply.test.mts) trava esse silêncio mesmo com uma mensagem da assistente na revisão atual. O [teste do redutor](../../apps/decisions/tests/service-desk.test.mts) despacha `FAILED` e trava o outro lado: a frase não entra na conversa e não é falada a partir desse estado. Na tela, a frase fica no aviso lateral.

Se essa frase já estiver na conversa no commit que você clonou, pare. Outra alteração pode ter tratado o caso. Não invente um segundo bug para o palco continuar.

## Recursos do DevDay, como estão na CLI 0.161.0

Consulta em 8 de outubro de 2026. O recap de 29 de setembro de 2026 diz que a CLI passa a começar e conduzir tarefas por voz, ganha a visão `/agents`, melhora a edição de prompt, a retomada de sessão e as worktrees, e deixa o terminal mais legível em sessões longas. Fonte: [DevDay 2026 Recap](https://openai.com/index/devday-2026-recap/).

| No recap | Na CLI `0.161.0` | Fonte |
| --- | --- | --- |
| Voz para começar e conduzir a tarefa | `/voice` liga ou desliga. `/voice settings` escolhe a voz. Com a conversa aberta, o rodapé coberto pelos testes mostra `/voice stop` e o mute. O snapshot usa Ctrl+X para mute; o código escreve `/voice mute` quando não há atalho desenhado. A release 0.156.0 descreve um atalho F8 configurável para a conversa de voz. No código da 0.161.0 o campo correspondente se chama `toggle_voice`. No ensaio, use a tecla que o rodapé **desta** instalação mostrar. | [slash_command.rs da tag 0.161.0](https://github.com/openai/codex/blob/rust-v0.161.0/codex-rs/tui/src/slash_command.rs), [snapshot do rodapé](https://github.com/openai/codex/blob/rust-v0.161.0/codex-rs/tui/src/chatwidget/realtime/snapshots/codex_tui__chatwidget__realtime__tests__recording_controls_tests__voice_footer_renders_the_main_conversation_states.snap), [keymap da tag 0.161.0](https://github.com/openai/codex/blob/rust-v0.161.0/codex-rs/config/src/tui_keymap.rs), [release 0.156.0](https://github.com/openai/codex/releases/tag/rust-v0.156.0) |
| Visão `/agents` | `/agents` abre o agent command center. `/subagents` troca de subagente da sessão. | O mesmo `slash_command.rs` e o recap |
| Worktree, retomada, tela cheia | `/worktree` abre a conversa numa worktree nova. `/resume` retoma um chat. `/tui` escolhe o modo da próxima abertura; a 0.156.0 descreve a UI em tela cheia. Estes três ficam de fora dos 3 minutos. | `slash_command.rs` e a [release 0.156.0](https://github.com/openai/codex/releases/tag/rust-v0.156.0) |

A página [Slash commands](https://developers.openai.com/codex/cli/slash-commands), lida em 8 de outubro de 2026, ainda lista `/agent` no singular e não lista `/voice` nem `/agents`. O [changelog publicado](https://developers.openai.com/codex/changelog) dessa consulta para no CLI 0.145.0 e registra a remoção antiga do `/realtime` experimental. A versão fixada do encontro é a 0.161.0, cujo código e release notes têm voz e `/agents`. No ensaio, abra `/` e confira se `/voice` e `/agents` aparecem. Se não aparecerem, não improvise o comando: use o pedido digitado e a gravação rotulada. A alternativa documentada nessa página de changelog é a voz do app desktop do ChatGPT, em Chat, Work e Codex. Isso não é voz dentro do terminal.

A 0.155.0, de 17 de setembro de 2026, introduziu `/voice` experimental, ligado em `/experimental`. A 0.156.0, de 22 de setembro de 2026, ligou as conversas de voz por padrão. Fonte: [release 0.155.0](https://github.com/openai/codex/releases/tag/rust-v0.155.0) e [release 0.156.0](https://github.com/openai/codex/releases/tag/rust-v0.156.0).

## Versão, modelo e permissão

```sh
npm install -g @openai/codex@0.161.0
codex --version
codex login
codex login status
```

`codex --version` mostra `codex-cli 0.161.0`. O login do encontro é o do ChatGPT no navegador. Este bloco não pede chave de API. Autenticação: [documentação oficial](https://learn.chatgpt.com/docs/auth).

No PowerShell, use `npm.cmd` e `codex.cmd` se a política bloquear os scripts `.ps1`. Não mude a política de execução do sistema.

Abra o agente já no modelo e na permissão do palco, a partir de `apps/decisions`:

```sh
codex -m gpt-6-luna -s workspace-write -a on-request
```

- `-m gpt-6-luna` é o slug `gpt-6-luna` do catálogo da tag 0.161.0. A descrição nessa tag é a de um modelo rápido e mais barato, para tarefas mais simples. O padrão dessa versão é `gpt-6.1-sol`. Fonte: [models.json da tag](https://github.com/openai/codex/blob/rust-v0.161.0/codex-rs/models-manager/models.json) e a [release 0.161.0](https://github.com/openai/codex/releases/tag/rust-v0.161.0). O catálogo dessa tag não contém `gpt-5.4-mini`. O hotfix da 0.156.0 passa a recomendar GPT-6 Luna no aviso de limite de taxa: [PR 47405](https://github.com/openai/codex/pull/47405).
- `-s workspace-write` e `-a on-request` são o par documentado para trabalho local com escrita na pasta e pergunta antes de sair dela. Fonte: [referência da CLI](https://developers.openai.com/codex/cli/reference) e [aprovações](https://developers.openai.com/codex/agent-approvals-security.md).
- `codex exec` começa em sandbox somente leitura. Para editar, o comando leva `-s workspace-write`. Fonte: [modo não interativo](https://developers.openai.com/codex/noninteractive.md). A voz deste bloco é da TUI; `codex exec` não a substitui.

## Véspera, fora do relógio do palco

1. Confirme `codex login status` sem projetar a conta.
2. Se aparecer `Trust this folder?`, com `1. Trust and continue` e `2. Back to Agent Command Center`, confira o caminho e escolha 1 só se for este repositório. O `git init` não tira essa tela: ela apareceu em 8 de outubro de 2026 na 0.161.0 mesmo depois do commit inicial. A documentação oficial fala num pedido de confiança ao abrir a pasta: [aprovações](https://developers.openai.com/codex/agent-approvals-security.md). Faça isso antes do projetor.
3. Dentro do agente, peça só isto: `Execute node --version e pare. Não edite arquivos.` O esperado é `v24.21.0`, a versão recomendada em `.nvmrc`. Se vier outra versão, o agente está num login shell com outro PATH. Saia com `/quit` e abra de novo com `-c allow_login_shell=false`. A chave `allow_login_shell` está na [configuração avançada](https://developers.openai.com/codex/config-advanced). O flag `-c` está na [referência](https://developers.openai.com/codex/cli/reference).
4. Ligue `/voice`, diga uma frase, ouça o retorno e encerre com `/voice stop`. Confira o microfone no dispositivo que a sala vai ouvir. A 0.161.0 também escolhe microfone, alto-falante e canal em `/voice settings`. Fonte: [release 0.161.0](https://github.com/openai/codex/releases/tag/rust-v0.161.0).
5. Na pasta `apps/decisions`, pare um `npm start` que esteja na porta 3000 e execute `npm run dev`. Abra http://127.0.0.1:3000 na aba **Simulado**. Clique **Som desligado** e confira que o botão passa a **Som ligado** sem o aviso de voz local em português ausente. Recarregue. A página do palco começa de novo: som desligado, sem cenário. `npm run dev` reescreve `next-env.d.ts`; esse arquivo é gerado e não entra no Git. O `npm start` da véspera continua sendo o servidor do Decisions, depois deste bloco: ele serve a build e não mostra a edição do agente.
6. Deixe uma gravação do ensaio que passou, fora do repositório. O nome leva a palavra `GRAVAÇÃO` e a data. Sem essa gravação, o plano B é dizer que o passo não rodou.

Para sair, use `/quit` ou `/exit`. Fonte: `slash_command.rs` da tag 0.161.0. No ensaio de 8 de outubro, um Ctrl+C sozinho não encerrou a TUI.

## Roteiro de 2–3 minutos

Deixe a Alô, TI aberta em http://127.0.0.1:3000, aba **Simulado**, e o Codex já aberto no comando da seção anterior. A instalação e o login ficam fora deste relógio. O servidor deste bloco é `npm run dev`, em `apps/decisions`, iniciado antes do relógio. O `npm start` serve a build do `prepare-stage.mjs` e continuaria mostrando a falha antiga depois da edição.

| Tempo | Comando | Tela esperada | Plano B, rotulado GRAVAÇÃO |
| --- | --- | --- | --- |
| 0:00–0:20 | Na página recém-aberta: **Por trás da decisão**, marque **Simular falha na próxima análise**, **Explorar cenário**, **Analisar relato** | O aviso lateral diz `A análise falhou. Seu relato continua aqui; tente novamente.` A conversa não ganha essa frase. **Analisar relato** só existe depois de **Explorar cenário**. | Diga “isto é gravação” e mostre o ensaio dessa tela. |
| 0:20–0:40 | No Codex, `/status` | Modelo `gpt-6-luna`, escrita no workspace. A conta não aparece na projeção. | Gravação do `/status` do ensaio, com a conta coberta. |
| 0:40–1:10 | `/voice` e fale o pedido abaixo. Quando a legenda fechar o pedido, `/voice stop`. | Rodapé de voz (`listening` ou `speaking`) e a legenda do que foi dito. | Digite o mesmo pedido. Se a voz não abrir, diga isso e use a gravação do ensaio em que `/voice` funcionou. |
| 1:10–1:40 | `/agents` | O agent command center lista a tarefa. Fale os outros nomes uma vez: `/worktree`, `/resume`, `/tui`. Não os execute. | Gravação do centro de agentes. |
| 1:40–2:20 | Quando a tarefa terminar, `/diff`. Fora do Codex, na pasta `apps/decisions`: `node --test tests/spoken-reply.test.mts tests/service-desk.test.mts` | Diff curto nos dois arquivos de domínio e nos dois testes. A suíte desses arquivos passa. | Se passar de 2:00 sem diff, corte para a gravação. Diga que não é ao vivo. |
| 2:20–2:50 | Recarregue a Alô, TI. O reload desliga o som e volta à página inicial: clique **Som desligado** até o botão mostrar **Som ligado**, abra **Por trás da decisão**, marque a falha, **Explorar cenário** e **Analisar relato** | A mesma frase entra na conversa e a voz local em português a fala uma vez. Se o aviso disser que não há voz local em português, a transcrição é a evidência. O `npm run dev` recompila ao recarregar; se passar de 2:50, corte. | Gravação desse reload, com a frase falada. |

Pedido falado, numa frase:

```text
A falha simulada da Alô, TI fica só no aviso do lado. Coloque essa mesma frase na conversa, como mensagem da assistente, e deixe a voz local falá-la uma vez, sem repetir uma sugestão antiga. Atualize o teste que despacha FAILED para exigir essa mensagem e a fala desse estado. Mexa só em src/domain/service-desk.ts, src/domain/spoken-reply.ts, tests/spoken-reply.test.mts e tests/service-desk.test.mts. Não instale nada e não faça commit.
```

O diff esperado descreve quatro mudanças. O caso `FAILED` passa a anexar a frase que já está no aviso, como mensagem da assistente nesta revisão. `getSpokenReply` aceita o status `error` quando essa última mensagem é da assistente nesta revisão. `tests/spoken-reply.test.mts` continua mudo para uma sugestão antiga e passa a exigir uma fala para a frase nova. `tests/service-desk.test.mts` deixa de afirmar que a frase fica fora da conversa: o mesmo `FAILED` precisa criar a mensagem, e a fala sai desse estado, não de um objeto montado à mão. Se o agente editar outro arquivo, peça para reverter essa parte e pare.

Saia com `/quit` antes de rodar o `node --test`.

## Leve para casa

Uma tarde, com Node.js de 24.12.0 a 24.21.0 e o login ChatGPT. `.nvmrc` recomenda 24.21.0. Não use chave de API neste exercício: no ensaio de 8 de outubro de 2026, o padrão `gpt-6.1-sol` passou do TPM de uma chave pequena (pedido de 14640 tokens contra limite de 10000), e `gpt-6-luna` nessa mesma chave tinha teto de 50 requisições por dia, compartilhado com a Alô, TI ao vivo. Esses números são daquela organização, não um teto publicado da OpenAI.

1. Siga [Prepare seu ambiente](../../README.md#preparacao) e entre na pasta `apps/decisions` deste repositório.
2. Instale a CLI 0.161.0, entre com `codex login` e confira `codex login status`.
3. Abra com `codex -m gpt-6-luna -s workspace-write -a on-request`.
4. Resolva a confiança da pasta e o `node --version` dentro do agente, como na véspera.
5. Envie o pedido da tabela. Pode ser por `/voice` ou digitado. Os dois usam o mesmo texto.
6. Rode os dois arquivos de teste citados e leia o `git diff`.
7. Para ver a frase na conversa, o processo precisa servir o código já editado. Na pasta `apps/decisions`, se ainda não houver `node_modules`, rode `npm ci --ignore-scripts`. Em seguida `npm run dev` e abra http://127.0.0.1:3000. Recarregue, clique **Som desligado** até o botão mostrar **Som ligado**, abra **Por trás da decisão**, marque **Simular falha na próxima análise**, clique **Explorar cenário** e **Analisar relato**. A frase entra na transcrição. Com uma voz local em português no dispositivo, ela é falada uma vez.

Se `npm start` já estiver no ar com a build de antes da correção, ele continua nessa build. Pare com Ctrl+C, rode `npm run build` e só então `npm start`. Essa reconstrução não cabe no bloco de 2–3 minutos; no palco o caminho é o `npm run dev` aberto antes do relógio. O mock não chama a API.

`codex exec` só entra se a TUI não abrir. Na pasta `apps/decisions`:

```sh
codex exec -m gpt-6-luna -s workspace-write "A falha simulada da Alô, TI fica só no aviso do lado. Coloque essa mesma frase na conversa, como mensagem da assistente, e deixe a voz local falá-la uma vez, sem repetir uma sugestão antiga. Atualize o teste que despacha FAILED para exigir essa mensagem e a fala desse estado. Mexa só em src/domain/service-desk.ts, src/domain/spoken-reply.ts, tests/spoken-reply.test.mts e tests/service-desk.test.mts. Não instale nada e não faça commit."
```

Sem `-s workspace-write`, o exec permanece somente leitura e não edita. Esse caminho não tem `/voice`.

### Problemas

- **`codex` não encontrado:** reabra o terminal e confira `codex --version`. A versão do encontro é `codex-cli 0.161.0`.
- **Tela pedindo para trocar de modelo:** o slug do palco é `gpt-6-luna`. O catálogo da 0.161.0 não inclui `gpt-5.4-mini`.
- **`Trust this folder?`:** confira o caminho e confie só neste repositório. A tela pode aparecer com a pasta já versionada.
- **`node --version` dentro do agente fora de v24.12.0 a v24.21.0:** abra de novo com `-c allow_login_shell=false` ou coloque uma versão compatível do Node no PATH do login shell. O `node --version` do terminal, sozinho, não basta.
- **`/voice` ausente no menu:** a instalação não é a 0.161.0, ou a build não tem o runtime de voz. Digite o pedido. Não invente outro comando de voz.
- **Limite de taxa:** pare e volte no dia seguinte, ou use outra conta ChatGPT. Não cole chave no terminal.
- **O agente commitou:** `git log --oneline` mostra o commit. Não faça push. O pedido pedia para não commitar.

## O encaminhador saiu deste bloco

O exercício longo do encaminhador não entra neste bloco. O contrato, o starter e a candidata continuam no [LAB Cloud](../codex-cloud/README.md) e em [exercises/ticket-router](../../exercises/ticket-router/README.md).
