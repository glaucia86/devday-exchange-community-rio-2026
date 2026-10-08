# LAB · Decisions API: do relato ao encaminhamento

[Início](../../README.md) · [Aplicação Alô, TI](../../apps/decisions/README.md) · [Guia da apresentadora](../../docs/guia-apresentadora.md)

## Objetivo

Entender três formatos de decisão (`predicate`, `choice`, `score`), inspecionar respostas tipadas e provar por que uma sugestão ainda precisa de revisão humana. Você vai usar a Alô, TI, um service desk fictício, e um pequeno exercício de contrato em TypeScript.

**Sua entrega:** um ticket simulado revisado e três resultados comparados: resposta completa, contexto insuficiente e resposta recusada. Reserve 20–30 minutos, com a interface preparada antes; duração ainda sujeita a ensaio.

**Estado atual:** domínio, contratos, build e fluxo mock têm testes. Microfone, WebRTC e respostas da API são simulados na CI. Os adaptadores OpenAI estão implementados e desativados por padrão; API e áudio reais ainda não foram ensaiados. Este LAB não exige chave nem sessão paga.

## 1. Prepare e abra a demo

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

Abra http://127.0.0.1:3000. Mantenha o terminal aberto. A instalação inicial baixa pacotes; depois, a prática usa fixtures locais. No PowerShell, use `npm.cmd` se necessário.

## 2. Observe uma decisão e tente agir cedo demais

1. Confira o selo **Simulado** e clique **Explorar cenário**. O cenário inicial é **Acesso ao portal**. Nenhum microfone é capturado.
2. Clique **Analisar relato**. A equipe sugerida será **Acessos e identidade**; o ticket permanece rascunho.
3. Abra **Por trás da decisão**. Leia os números como respostas de exemplo, não como medições de um modelo em execução.
4. Confira que **Confirmar e criar ticket simulado** está desabilitado antes da revisão.

**Pergunta de revisão:** a confiança exibida autoriza criar o ticket? Não: a aplicação exige uma ação humana explícita.

## 3. Corrija o relato antes de confirmar

Clique **Simular uma correção**. A senha funciona; agora há erro 500 afetando todo o time.

**Confira:** a análise anterior perdeu a validade e a confirmação ficou bloqueada. Analise de novo; a sugestão muda para **Aplicações internas**.

Revise título, relato e equipe. Marque **Revisei o relato e a equipe responsável.** Edite o título e confira que a revisão foi desmarcada. Revise novamente e só então confirme.

**Esperado:** aparece `DEMO-0001`. Nenhum sistema externo recebeu um ticket. O campo pode sugerir uma equipe, mas a aplicação controla quando a ação é permitida.

## 4. Confira dois caminhos que não terminam em sucesso

- **Falta de contexto:** clique **Recomeçar**, escolha **Relato incompleto** e analise. A equipe fica em **Revisão humana**; confirmação continua bloqueada
- **Falha de análise:** escolha **Acesso ao portal**, abra **Por trás da decisão** se o painel não estiver aberto, marque **Simular falha na próxima análise** e analise. Confira que o relato foi preservado. Desmarque a opção e tente novamente

Texto livre não é interpretado pelo mock: ao editar o relato fora dos cenários, ele pede um cenário pronto. Não avalie a qualidade de um modelo por essa resposta fixa.

## 5. Inspecione o contrato sem chamar a API

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

## Critério de conclusão

Você reproduziu a correção, conferiu o bloqueio antes da revisão e distinguiu as três fixtures. Complete: “Uma resposta bem formada pode pedir revisão humana quando…”. A resposta deve mencionar contexto/confiança, não só erros de JSON.

## Problemas e reset

- **35 testes falham por sintaxe TypeScript:** confira Node.js 22.18+ e o diretório atual
- **`ARQUIVO_INVALIDO`:** confira caminho e sintaxe JSON; não é a recusa esperada
- **Porta 3000 ocupada:** veja a URL do terminal ou encerre somente o servidor de uma tentativa sua; não termine processos desconhecidos
- **Texto livre não foi analisado:** recarregue um cenário; não é uma falha de acesso à API
- **Recomeçar:** limpa o estado em memória da demo. Para os JSONs, trabalhe em cópias e preserve os originais
- **Sem instalação da interface:** faça a etapa 5 e os testes; registre que o navegador não foi ensaiado nessa máquina

## Depois do encontro, se quiser aprofundar

No [exercício de contrato](../../exercises/decisions-contract/README.md), altere uma cópia da fixture e preveja o resultado antes de executar: confiança baixa, equipe desconhecida e score fracionário. Acrescente um teste para uma resposta duplicada.

Para API e voz reais, há um caminho separado no [guia de ativação local](../../docs/integracao-live.md): acesso à conta, segredo no servidor, autorização de gasto e ensaio de áudio. Os limiares 0,8/0,7 são didáticos e não calibrados para produção.

A [documentação oficial de Decisions](https://developers.openai.com/api/docs/guides/decisions), consultada em 08/10/2026, descreve beta pública com `gpt-6-luna`, SDK JavaScript 7.30.0+ e entradas de texto/imagem. Decisions não recebe áudio: [GPT-Live conversa e delega](https://developers.openai.com/api/docs/guides/decisions-voice), e a aplicação envia o relato atual e valida a resposta antes de permitir uma ação.
