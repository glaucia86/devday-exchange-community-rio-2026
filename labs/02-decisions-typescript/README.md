# LAB · Decisions API: do relato ao encaminhamento

[Início](../../README.md) · [Aplicação Alô, TI](../../apps/decisions/README.md) · [Guia da apresentadora](../../docs/guia-apresentadora.md)

## Objetivo

Reproduzir a demonstração de voz para voz da Alô, TI: relatar uma falha, ouvir a resposta, corrigir o contexto e revisar o ticket simulado. No caminho, você vai entender `predicate`, `choice` e `score` e inspecionar o contrato em TypeScript.

**Para fazer em casa:** use o mesmo roteiro de voz da [demonstração de Decisions](../../docs/guia-apresentadora.md#decisions-api). No evento, Glaucia conduz a conversa e o público acompanha; os passos abaixo ficam para depois.

**Sua entrega:** uma conversa com correção, um ticket simulado revisado e o registro do modo realmente usado. Estimativa de estudo em casa: 20–30 minutos, além de instalação, conta e configuração; duração ainda não medida. Os exercícios de contrato ao final são aprofundamento opcional.

**Estado atual:** a demonstração principal planejada é voz para voz real, e ainda exige ensaio com API e áudio antes do palco. Os adaptadores estão implementados e desativados por padrão. Domínio, contratos, build e fluxo mock têm testes; microfone, WebRTC e respostas da API são simulados na CI. A alternativa offline não exige chave nem sessão paga, mas não comprova uma conversa real.

## 1. Prepare e confira a aplicação sem custo de API

Siga [Prepare seu ambiente](../../README.md#preparacao) e [Execute Alô, TI](../../README.md#executar). Na raiz do repositório, confira primeiro:

```sh
node --test apps/decisions/tests/*.test.mts
```

**Esperado:** 35 testes aprovados no conjunto atual da aplicação. O teste de handshake usa somente loopback, sem chave real ou internet.

Para a interface, em um terminal separado:

```sh
cd apps/decisions
npm ci --ignore-scripts
npm run dev
```

Abra http://127.0.0.1:3000. Mantenha o terminal aberto. A instalação inicial baixa pacotes. A preparação no modo Simulado usa fixtures locais; a conversa real da próxima seção requer API. No PowerShell, use `npm.cmd` se necessário.

## 2. Reproduza a conversa de voz para voz

Este é o fluxo principal da demonstração. **Faça somente depois de preparar e autorizar seu próprio uso de API com custo**, conforme o [guia de ativação local](../../docs/integracao-live.md). Se não tiver acesso ou não quiser usar API, vá direto à alternativa simulada na próxima seção e registre essa diferença.

### Antes de iniciar

- Confirme acesso aos modelos e um orçamento de ensaio na sua conta; não basta possuir uma chave
- Siga o guia local para configurar o segredo no servidor e habilitar o modo ao vivo. Não cole a chave na interface, no chat ou em capturas
- Abra **OpenAI ao vivo**. Informe apenas o código local da demo. Leia o consentimento sobre envio de áudio/texto e custo; somente se concordar e tiver autorizado esse gasto, marque a caixa **Entendi o envio de áudio e texto à OpenAI e estou autorizada a usar a API com custo nesta demo.**
- Use fones e um ambiente silencioso. A sessão tem limite local de dois minutos; ele não é um teto financeiro. Faça a explicação e a preparação antes de começar a captura

### Use os mesmos relatos da apresentação

1. Clique **Iniciar conversa real**, permita o microfone nessa página local e espere **Microfone ativo**.
2. Diga: “Não consigo entrar no portal interno desde que troquei a senha. Só eu fui afetada e consigo continuar as outras tarefas.”
3. Aguarde a transcrição, a resposta audível e a sugestão. **Confira:** o texto corresponde ao que você falou; a equipe esperada para esse relato é **Acessos e identidade**, mas a saída do modelo deve ser revisada. Se a delegação não disparar a análise, use **Analisar com Decisions** e registre que acionou esse passo manualmente.
4. Marque a revisão inicial sem criar o ticket. Depois diga: “Correção: a senha funciona. O portal mostra erro 500 para todo o time, ninguém consegue trabalhar e não há alternativa.”
5. Confira que o relato atualizado invalidou a análise/revisão anterior. Aguarde nova análise, ou use **Analisar com Decisions**. A sugestão esperada agora é **Aplicações internas**. Se vier outro resultado, confira a transcrição e peça esclarecimento; não aceite só para seguir o roteiro.
6. Revise título, relato e equipe. Marque **Revisei este relato ao vivo e a equipe.** e clique **Confirmar ticket simulado ao vivo**. **Esperado:** `DEMO-0001`, sem envio a sistemas externos. Confira também a resposta falada; o texto exato pode variar.
7. Clique **Encerrar conversa**. Espere **Conversa encerrada. Microfone liberado.** e confira o consumo na plataforma. Se a finalização não for confirmada, não abra sessões em sequência; siga o diagnóstico do guia local.

**Critério de conclusão da voz:** você falou e ouviu uma resposta real, conferiu a correção, revisou o ticket e confirmou o encerramento. Transcrição sem áudio não basta para afirmar que voz para voz funcionou. Não compare os números produzidos pelo modelo com os números fixos do mock.

Para repetir, confirme o encerramento e só então comece outra sessão autorizada. Ao terminar o estudo, desative `MESA_LIVE_ENABLED` e reinicie ou encerre o servidor conforme o guia local.

## Alternativa simulada: repetir o fluxo sem API

**Se você iniciou uma conversa real:** clique **Encerrar conversa** e confirme o encerramento antes de trocar de aba. Se a finalização continuar incerta, pare os novos inícios e verifique sessão/consumo conforme o guia local. Trocar para Simulado não comprova que a sessão paga terminou.

Esta alternativa usa os mesmos relatos e checkpoints, com respostas fixas. Serve para preparar o ambiente, entender o estado da aplicação ou seguir estudando sem acesso à API. Registre “modo simulado”; ela não substitui o ensaio da demonstração de voz real.

### A. Observe uma decisão e tente agir cedo demais

1. Confira o selo **Simulado** e clique **Explorar cenário**. O cenário inicial é **Acesso ao portal**. Nenhum microfone é capturado.
2. Clique **Analisar relato**. A equipe sugerida será **Acessos e identidade**; o ticket permanece rascunho.
3. Abra **Por trás da decisão**. Leia os números como respostas de exemplo, não como medições de um modelo em execução.
4. Confira que **Confirmar e criar ticket simulado** está desabilitado antes da revisão.

**Pergunta de revisão:** a confiança exibida autoriza criar o ticket? Não: a aplicação exige uma ação humana explícita.

### B. Corrija o relato antes de confirmar

Clique **Simular uma correção**. A senha funciona; agora há erro 500 afetando todo o time.

**Confira:** a análise anterior perdeu a validade e a confirmação ficou bloqueada. Analise de novo; a sugestão muda para **Aplicações internas**.

Revise título, relato e equipe. Marque **Revisei o relato e a equipe responsável.** Edite o título e confira que a revisão foi desmarcada. Revise novamente e só então confirme.

**Esperado:** aparece `DEMO-0001`. Nenhum sistema externo recebeu um ticket. O campo pode sugerir uma equipe, mas a aplicação controla quando a ação é permitida.

### C. Confira dois caminhos que não terminam em sucesso

- **Falta de contexto:** clique **Recomeçar**, escolha **Relato incompleto** e analise. A equipe fica em **Revisão humana**; confirmação continua bloqueada
- **Falha de análise:** escolha **Acesso ao portal**, abra **Por trás da decisão** se o painel não estiver aberto, marque **Simular falha na próxima análise** e analise. Confira que o relato foi preservado. Desmarque a opção e tente novamente

Texto livre não é interpretado pelo mock: ao editar o relato fora dos cenários, ele pede um cenário pronto. Não avalie a qualidade de um modelo por essa resposta fixa.

## Aprofundamento em casa: inspecione o contrato sem chamar a API

Volte a um terminal na raiz do repositório. Abra:

- [`service-desk.ts`](../../apps/decisions/src/domain/service-desk.ts): cenários, estado e confirmação humana
- [`live-contract.ts`](../../apps/decisions/src/domain/live-contract.ts): `buildDecisionRequest`, as três perguntas e `parseDecision`

Rode um comando por vez:

```sh
node exercises/decisions-contract/inspect.mts exercises/decisions-contract/fixtures/completo.json
node exercises/decisions-contract/inspect.mts exercises/decisions-contract/fixtures/incerto.json
node exercises/decisions-contract/inspect.mts exercises/decisions-contract/fixtures/recusado.json
```

| Fixture | Resultado que você deve observar |
| --- | --- |
| `completo.json` | `team: applications`, `score: 1.25`, criação bloqueada antes da revisão e permitida depois |
| `incerto.json` | `team: human`; criação bloqueada mesmo depois da revisão |
| `recusado.json` | `CONTRATO_REJEITADO` e código de saída 1; nenhuma sugestão aceita |

Todas imprimem ou deixam claro o uso de fixture. O script não cria um ticket, abre microfone nem chama API. Ele usa as funções de contrato e estado da aplicação.

**Agora explique:**

- `predicate` traz probabilidade de haver contexto suficiente
- `choice` seleciona uma categoria permitida
- `score` usa a rubrica de impacto; `1.25` é válido e não deve virar automaticamente uma prioridade inteira

A fixture completa está fora da ordem das perguntas. Ela continua válida porque o contrato associa respostas pelo `name`, não pela posição.

## Registre o que você conseguiu reproduzir

Anote o modo usado: voz real, interface simulada ou somente contrato offline. No fluxo escolhido, confira a correção e o bloqueio antes da revisão. Se fizer o aprofundamento, distinga as três fixtures. Complete: “Uma resposta bem formada pode pedir revisão humana quando…”. A resposta deve mencionar contexto/confiança, não só erros de JSON.

## Problemas e reset

- **35 testes falham por sintaxe TypeScript:** confira Node.js 22.18+ e o diretório atual
- **`ARQUIVO_INVALIDO`:** confira caminho e sintaxe JSON; não é a recusa esperada
- **Porta 3000 ocupada:** veja a URL do terminal ou encerre somente o servidor de uma tentativa sua; não termine processos desconhecidos
- **Texto livre não foi analisado:** recarregue um cenário; não é uma falha de acesso à API
- **Recomeçar:** limpa o estado em memória da demo. Para os JSONs, trabalhe em cópias e preserve os originais
- **Sem instalação da interface:** faça o aprofundamento de contrato e os testes; registre que o navegador não foi ensaiado nessa máquina

## Depois do encontro, se quiser aprofundar

No [exercício de contrato](../../exercises/decisions-contract/README.md), altere uma cópia da fixture e preveja o resultado antes de executar: confiança baixa, equipe desconhecida e score fracionário. Acrescente um teste para uma resposta duplicada.

A preparação da conversa real permanece no [guia de ativação local](../../docs/integracao-live.md): acesso à conta, segredo no servidor, autorização de gasto e ensaio de áudio. Os limiares 0,8/0,7 são didáticos e não calibrados para produção.

A [documentação oficial de Decisions](https://developers.openai.com/api/docs/guides/decisions), consultada em 08/10/2026, descreve beta pública com `gpt-6-luna`, SDK JavaScript 7.30.0+ e entradas de texto/imagem. Decisions não recebe áudio: [GPT-Live conversa e delega](https://developers.openai.com/api/docs/guides/decisions-voice), e a aplicação envia o relato atual e valida a resposta antes de permitir uma ação.
