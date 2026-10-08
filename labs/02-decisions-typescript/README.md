# LAB · Decisions API: do relato ao encaminhamento

[Início](../../README.md) · [Aplicação Alô, TI](../../apps/decisions/README.md) · [Guia da apresentadora](../../docs/guia-apresentadora.md)

## Objetivo

Reproduzir a demonstração de voz para voz da Alô, TI: relatar uma falha, ouvir a resposta, corrigir o contexto e revisar o ticket simulado. No caminho, você vai entender `predicate`, `choice` e `score` e inspecionar o contrato em TypeScript.

**Para fazer em casa:** use o mesmo roteiro de voz da [demonstração de Decisions](../../docs/guia-apresentadora.md#decisions-api). No evento, Glaucia conduz a conversa e o público acompanha; os passos abaixo ficam para depois.

**Sua entrega:** uma conversa com correção, um ticket simulado revisado e o registro do modo realmente usado. Estimativa de estudo em casa: 20–30 minutos, além de instalação, conta e configuração; duração ainda não medida. Os exercícios de contrato ao final são aprofundamento opcional.

**Estado atual:** a demonstração principal planejada é voz para voz real, e ainda exige ensaio com API e áudio antes do palco. Os adaptadores estão implementados e desativados por padrão. Domínio, contratos, build e fluxo mock têm testes; microfone, WebRTC e respostas da API são simulados na CI. A alternativa offline não exige chave nem sessão paga, mas não comprova uma conversa real.

## Escolha seu caminho antes de instalar

Você não precisa ter visto a apresentação para seguir este roteiro.

| Seu ponto de partida | Caminho neste LAB | O que poderá afirmar ao terminar |
| --- | --- | --- |
| Tenho acesso à API, orçamento autorizado e posso configurar o segredo localmente | Preparação + conversa de voz para voz | Reproduzi a conversa real, se fala, áudio, análise e encerramento funcionarem |
| Quero começar sem chave nem gasto de API | Preparação + alternativa simulada | Reproduzi o fluxo com dados e respostas fixos, sem testar o modelo |
| Não posso instalar os pacotes da interface | Node + aprofundamento de contrato | Executei as verificações locais, sem testar a interface ou a voz |

A demonstração principal é a primeira linha. As outras permitem avançar com segurança, mas não são equivalentes a voz real. A edição de fixtures no final é opcional em todos os caminhos.

### Se estes termos são novos

- **API:** interface pela qual a aplicação pede um resultado a um serviço. Aqui, uma chamada real sai do seu servidor local para a OpenAI
- **Mock/fixture:** resposta preparada antecipadamente para testar o fluxo sem chamar um modelo
- **Transcrição:** texto do que foi falado. Ver texto não prova que houve saída de áudio
- **Contrato:** regras sobre campos, tipos e valores aceitos em uma resposta
- **Rascunho:** informação ainda não confirmada; **ticket simulado:** registro apenas na memória desta demo

## 1. Prepare e confira a aplicação sem custo de API

Siga somente [Prepare seu ambiente](../../README.md#preparacao) até clonar o projeto e conferir o Node. A instalação e o início da Alô, TI estão completos abaixo; não execute outro roteiro de inicialização ao mesmo tempo. Na raiz do repositório, confira primeiro:

```sh
node --test apps/decisions/tests/*.test.mts
```

**Esperado:** no fim da saída, `tests 35`, `pass 35`, `fail 0`. O teste de handshake usa somente loopback, isto é, comunicação interna na própria máquina, sem chave real ou internet. Se o comando falhar por caminho ou versão do Node, corrija a preparação antes de seguir.

Agora use o terminal que está confirmado na raiz do repositório. Execute uma linha por vez para entrar na pasta da aplicação, instalar e iniciar:

```sh
cd apps/decisions
npm ci --ignore-scripts
npm run build
npm start
```

O que cada comando faz:

- `cd apps/decisions` entra na aplicação Alô, TI
- `npm ci --ignore-scripts` instala as versões registradas no projeto; espere terminar e devolver o cursor
- `npm run build` prepara a versão que o servidor vai abrir; aguarde a conclusão sem erros
- `npm start` inicia essa versão e continua ocupando o terminal. Isso é esperado; não feche a janela

Quando o terminal mostrar que o servidor está pronto, abra http://127.0.0.1:3000 no navegador. Se ele indicar outra porta, use a URL informada. A página deve ter o título **Alô, TI** e os modos **Simulado** e **OpenAI ao vivo**. Você não deve ver apenas o portal de documentação.

**Checkpoint:** a aplicação abriu em uma URL local. Se o navegador disser que não consegue conectar, confira se o terminal ainda está executando `npm start` e se o endereço/porta são os mesmos.

Para parar uma tentativa sua, volte a esse terminal e use Ctrl+C. Para iniciar novamente, estando em `apps/decisions`, repita `npm start`. Não use comandos para encerrar processos desconhecidos. A instalação inicial baixa pacotes. A preparação no modo Simulado usa fixtures locais; a conversa real da próxima seção requer API. No PowerShell, use `npm.cmd` se necessário.

## 2. Reproduza a conversa de voz para voz

Este é o fluxo principal da demonstração. **Faça somente depois de preparar e autorizar seu próprio uso de API com custo**, conforme o [guia de ativação local](../../docs/integracao-live.md). Se não tiver acesso ou não quiser usar API, vá direto à alternativa simulada na próxima seção e registre essa diferença.

### Antes de iniciar

O guia de ativação inclui a criação de `.env.local`, um arquivo local de configuração que não vai para o Git. Há dois valores diferentes: a **chave OpenAI** fica somente no servidor; o **código local da demo** é o que você informa no campo da interface. Não troque um pelo outro.

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

Se o botão de início estiver desabilitado, verifique estes itens nessa ordem, sem clicar repetidamente:

1. O servidor informa que o modo ao vivo está habilitado? Se não, confira a configuração no guia local e reinicie seu servidor
2. O campo contém o código local correto, com pelo menos 32 caracteres? Não use a chave OpenAI nesse campo
3. Você marcou o consentimento depois de autorizar o envio e o custo?
4. Uma tentativa anterior ainda está conectando ou encerrando? Espere esse estado terminar; não inicie outra sessão sobre ela

**Critério de conclusão da voz:** você falou e ouviu uma resposta real, conferiu a correção, revisou o ticket e confirmou o encerramento. Transcrição sem áudio não basta para afirmar que voz para voz funcionou. Não compare os números produzidos pelo modelo com os números fixos do mock.

Para repetir, confirme o encerramento e só então comece outra sessão autorizada. Ao terminar o estudo, desative `MESA_LIVE_ENABLED` e reinicie ou encerre o servidor conforme o guia local.

## Alternativa simulada: repetir o fluxo sem API

**Se você iniciou uma conversa real:** clique **Encerrar conversa** e confirme o encerramento antes de trocar de aba. Se a finalização continuar incerta, pare os novos inícios e verifique sessão/consumo conforme o guia local. Trocar para Simulado não comprova que a sessão paga terminou.

Esta alternativa usa os mesmos relatos e checkpoints, com respostas fixas. Serve para preparar o ambiente, entender o estado da aplicação ou seguir estudando sem acesso à API. Registre “modo simulado”; ela não substitui o ensaio da demonstração de voz real.

### A. Observe uma decisão e tente agir cedo demais

Na parte superior da aplicação, selecione **Simulado**. Se vinha da conversa real, cumpra primeiro o encerramento acima. A partir daqui, os resultados são fixos e não há captura de microfone.


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

Se deixou o servidor rodando, abra outra janela de terminal para os comandos abaixo. Entre na pasta do projeto e confira `node -p "process.cwd()"`: o caminho deve terminar em `devday-exchange-community-rio-2026`. No terminal que estiver em `apps/decisions` e livre, `cd ../..` volta à raiz. Não cole comandos na janela ainda ocupada pelo servidor.

Os links abaixo abrem os mesmos arquivos no GitHub para leitura, sem precisar de editor:


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

A resposta completa também lista `predicate:contexto`, `choice:equipe` e `score:impacto`. `false` significa não permitido/não ocorrido; `true` significa permitido/ocorrido. No resultado, `ticketCreated` continua `false`: o script testa a permissão, mas não executa a criação.

`CONTRATO_REJEITADO` no terceiro comando é a falha esperada da fixture de recusa. Já `ARQUIVO_INVALIDO` significa que nem foi possível ler o JSON; nesse caso confira o caminho. Você pode seguir para o próximo comando após a recusa esperada.

Todas imprimem ou deixam claro o uso de fixture. O script não cria um ticket, abre microfone nem chama API. Ele usa as funções de contrato e estado da aplicação.

**Agora explique:**

- `predicate` traz probabilidade de haver contexto suficiente
- `choice` seleciona uma categoria permitida
- `score` usa a rubrica de impacto; `1.25` é válido e não deve virar automaticamente uma prioridade inteira

A fixture completa está fora da ordem das perguntas. Ela continua válida porque o contrato associa respostas pelo `name`, não pela posição.

## Registre o que você conseguiu reproduzir

Anote o modo usado: voz real, interface simulada ou somente contrato offline. No fluxo escolhido, confira a correção e o bloqueio antes da revisão. Se fizer o aprofundamento, distinga as três fixtures. Complete: “Uma resposta bem formada pode pedir revisão humana quando…”. A resposta deve mencionar contexto/confiança, não só erros de JSON.

## Problemas e reset

| Sintoma | Confira primeiro | Próximo passo seguro |
| --- | --- | --- |
| `npm` ou `node` não é reconhecido | Instalação e terminal reaberto | Volte à preparação; não tente editar código para resolver isso |
| Instalação de pacotes falhou | Conexão e versão do Node | Repita a instalação após resolver a causa; não aplique `npm audit fix --force` para acompanhar o LAB |
| Botão Iniciar está cinza | Modo habilitado, código local e consentimento | Use o checklist da conversa real; não exponha o segredo em busca de ajuda |
| Microfone negado | Permissão desta página no navegador e no sistema | Libere apenas se quiser fazer o ensaio; caso contrário siga o modo simulado |
| Transcrição aparece, mas não ouço voz | Volume, saída de áudio e controle **Áudio da conversa OpenAI** | Tente a reprodução pelo controle da página; se continuar mudo, registre a limitação e encerre |
| Resposta sugere outra equipe | Transcrição e correção mais recente | Revise o dado; não confirme uma sugestão errada para obter um ticket |
| Finalização da sessão não confirmada | Aviso após Encerrar conversa | Verifique sessão e consumo; não reinicie em sequência nem trate trocar de aba como encerramento |

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
