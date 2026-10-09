# LAB · Decisions API: triagem ao vivo por voz

[Início](../../README.md) · [Aplicação](../../apps/decisions/README.md) · [Guia da apresentadora](../../docs/guia-apresentadora.md)

## Objetivo

Reproduzir a Triagem ao vivo: você descreve problemas de TI por voz, o Decisions classifica cada relato num quadro por equipe e você decide os casos incertos. No caminho, você vai entender `predicate`, `choice` e `score` e inspecionar o contrato em TypeScript.

**Para fazer em casa:** use os mesmos relatos e a mesma sequência da [demonstração de Decisions](../../docs/guia-apresentadora.md#decisions-api). No evento, Glaucia conduz a triagem e o público acompanha; os passos abaixo ficam para depois.

**Sua entrega:** um quadro com pelo menos três cartões, um deles decidido por você em **Revisão humana**, e o encerramento confirmado. Estimativa de estudo em casa: 20–30 minutos, além de instalação, conta e configuração. Os exercícios de contrato ao final funcionam sem chave.

**Estado atual:** a Triagem ao vivo está implementada e desativada por padrão. Domínio, contratos e servidor têm testes; microfone, WebRTC e respostas da API são simulados na CI. O ensaio real com API e áudio ainda é necessário antes do palco.

## Escolha seu caminho antes de instalar

Você não precisa ter visto a apresentação para seguir este roteiro.

| Seu ponto de partida | Caminho neste LAB | O que poderá afirmar ao terminar |
| --- | --- | --- |
| Tenho acesso à API, orçamento autorizado e posso configurar o segredo localmente | Preparação + triagem ao vivo | Reproduzi a triagem real, se fala, áudio, classificação e encerramento funcionarem |
| Não tenho chave ou não quero gastar com API | Preparação + aprofundamento de contrato | Executei as regras e o contrato localmente, sem testar a voz nem o modelo |
| Não posso instalar os pacotes da interface | Node + aprofundamento de contrato | Executei as verificações locais, sem abrir a interface |

A demonstração é a primeira linha. As outras permitem estudar com segurança, mas não equivalem a uma triagem real.

### Se estes termos são novos

- **API:** interface pela qual a aplicação pede um resultado a um serviço. Aqui, uma chamada real sai do seu servidor local para a OpenAI
- **GPT-Live:** modelo de voz que escuta e fala ao mesmo tempo. Ele **delega** para a aplicação quando você pede para registrar
- **Decisions:** API que devolve respostas tipadas: uma probabilidade, uma escolha entre opções fixas e uma nota numa rubrica
- **Transcrição:** texto do que foi falado. Ver texto não prova que houve saída de áudio
- **Contrato:** regras sobre campos, tipos e valores aceitos em uma resposta

## 1. Prepare e confira a aplicação sem custo de API

Siga somente [Prepare seu ambiente](../../README.md#preparacao) até clonar o projeto e conferir o Node. Na raiz do repositório, confira primeiro:

```sh
node --test apps/decisions/tests/*.test.mts
```

**Esperado:** no fim da saída, `tests 65`, `pass 65`, `fail 0`. Os testes usam somente loopback, sem chave real ou internet. Se o comando falhar por caminho ou versão do Node, corrija a preparação antes de seguir.

Depois, execute uma linha por vez:

```sh
cd apps/decisions
npm ci --ignore-scripts
npm run build
npm start
```

- `npm ci --ignore-scripts` instala as versões registradas no projeto
- `npm run build` prepara a versão que o servidor vai abrir
- `npm start` inicia essa versão e continua ocupando o terminal. Isso é esperado; não feche a janela

Abra http://127.0.0.1:3000/triagem. A página deve ter o título **Conte um problema.** e as colunas **Acessos e identidade**, **Aplicações internas**, **Infraestrutura** e **Revisão humana**. Sem configuração, aparece o aviso **Ao vivo desativado no servidor** e o botão de início fica cinza. Isso é o esperado até a próxima seção.

Para parar, volte ao terminal do servidor e use Ctrl+C. No PowerShell, use `npm.cmd` se necessário.

## 2. Faça a triagem ao vivo

**Faça somente depois de preparar e autorizar seu próprio uso de API com custo**, conforme o [guia de ativação local](../../docs/integracao-live.md). Sem acesso à API, vá direto ao aprofundamento de contrato.

### Antes de iniciar

O guia cria o `.env.local`, arquivo de configuração que não vai para o Git. Há dois valores diferentes: a **chave OpenAI** fica somente no servidor; o **código local da demo** é o que você digita na página. Não troque um pelo outro.

- Confirme acesso a `gpt-live-1` e `gpt-6-luna` e um orçamento de ensaio
- Confira os limites da sua organização em Settings → Limits. Cada relato registrado usa **uma** chamada ao Decisions; uma triagem com seis relatos usa cerca de seis. Contas novas podem ter 50 requisições por dia por modelo
- Use fones e um ambiente silencioso. A sessão encerra sozinha em dez minutos; isso não é teto financeiro

### Use os mesmos relatos da apresentação

1. Em `/triagem`, informe o código local, leia o consentimento e, somente se concordar com o envio de áudio e texto e com o custo, marque a caixa. Clique **Iniciar triagem ao vivo**, permita o microfone e espere **Microfone ativo**.
2. Diga: “Esqueci a senha depois das férias e não entro no e-mail.” Depois diga “registra”.
   - **Confira:** a legenda **OUVINDO** mostra o relato; um cartão entra em **Acessos e identidade**, com urgência e confiança; a voz anuncia o resultado. O contador de chamadas ao Decisions sobe para 1.
3. Diga: “O sistema de reembolso mostra erro 500 para todo mundo e ninguém consegue trabalhar.” e “registra”.
   - **Esperado:** **Aplicações internas**, com urgência alta. Revise; não aceite o resultado só porque é o esperado.
4. Diga: “A VPN da filial cai a cada dez minutos e o financeiro parou.” e “registra”.
   - **Esperado:** **Infraestrutura**.
5. Diga: “Nada funciona aqui.” e “registra”.
   - **Esperado:** **Revisão humana**: falta contexto. Clique a equipe que você escolheria; o cartão muda de coluna e ganha **Decidido por você**.
6. Pergunte: “Qual o padrão de hoje?”
   - **Esperado:** a voz resume o quadro, sem nova chamada ao Decisions. O contador não muda.
7. Clique **Encerrar triagem** e espere **Conversa encerrada. Microfone liberado.** Confira o consumo na plataforma.

Se a voz não reagir ao “registra”, clique **Classificar agora** e anote que acionou o botão. Se aparecer **Limite diário do modelo atingido**, encerre e tente depois do tempo indicado.

Se o botão de início estiver desabilitado, confira nesta ordem, sem clicar repetidamente:

1. O servidor informa que o modo ao vivo está habilitado? Se não, confira o guia local e reinicie o servidor
2. O campo tem o código local correto, com pelo menos 32 caracteres? Não use a chave OpenAI
3. Você marcou o consentimento depois de autorizar o envio e o custo?
4. Uma tentativa anterior ainda está conectando ou encerrando? Espere terminar

**Critério de conclusão:** você falou, ouviu respostas reais, viu os cartões nascerem das chamadas ao Decisions, decidiu um caso em **Revisão humana** e confirmou o encerramento. Transcrição sem áudio não basta para afirmar que a voz funcionou.

Ao terminar o estudo, desative `MESA_LIVE_ENABLED` e reinicie ou encerre o servidor.

## Aprofundamento em casa: inspecione o contrato sem chamar a API

Se o servidor estiver rodando, abra outro terminal na raiz do repositório. Os arquivos principais:

- [`live-contract.ts`](../../apps/decisions/src/domain/live-contract.ts): `buildDecisionRequest`, as três perguntas e `parseDecision`
- [`triage.ts`](../../apps/decisions/src/domain/triage.ts): o relato ouvido, os cartões e a regra da revisão humana

Rode um comando por vez:

```sh
node exercises/decisions-contract/inspect.mts exercises/decisions-contract/fixtures/completo.json
node exercises/decisions-contract/inspect.mts exercises/decisions-contract/fixtures/incerto.json
node exercises/decisions-contract/inspect.mts exercises/decisions-contract/fixtures/recusado.json
node --test apps/decisions/tests/triage.test.mts
```

| Comando | Resultado que você deve observar |
| --- | --- |
| `completo.json` | `team: applications`, `score: 1.25` |
| `incerto.json` | `team: human`: o cartão iria para **Revisão humana** |
| `recusado.json` | `CONTRATO_REJEITADO` e código de saída 1; nenhum cartão seria criado |
| `triage.test.mts` | 7 testes aprovados: relato sem o comando falado, contador de chamadas, revisão humana e resumo curto |

`CONTRATO_REJEITADO` no terceiro comando é a falha esperada. Já `ARQUIVO_INVALIDO` significa que nem foi possível ler o JSON; confira o caminho.

**Agora explique:**

- `predicate` traz a probabilidade de haver contexto suficiente
- `choice` seleciona uma equipe permitida
- `score` usa a rubrica de impacto; `1.25` é válido e não vira automaticamente uma prioridade inteira

A fixture completa está fora da ordem das perguntas. Ela continua válida porque o contrato associa respostas pelo `name`, não pela posição.

## Registre o que você conseguiu reproduzir

Anote o caminho usado: triagem real ou somente contrato offline. Complete: “Uma resposta bem formada vai para revisão humana quando…”. A resposta deve mencionar contexto ou confiança, não só erros de JSON.

## Problemas e reset

| Sintoma | Confira primeiro | Próximo passo seguro |
| --- | --- | --- |
| `npm` ou `node` não é reconhecido | Instalação e terminal reaberto | Volte à preparação |
| Botão **Iniciar triagem ao vivo** está cinza | Modo habilitado, código local e consentimento | Use o checklist acima; não exponha o segredo em busca de ajuda |
| Microfone negado | Permissão desta página no navegador e no sistema | Libere apenas se quiser fazer a triagem |
| Legenda aparece, mas não ouço voz | Volume e saída de áudio | Registre a limitação e encerre |
| “Registra” não cria cartão | Legenda **OUVINDO** com o relato | Use **Classificar agora** e anote |
| **Limite diário do modelo atingido** | Limites em Settings → Limits | Encerre e espere o tempo indicado; não reinicie em sequência |
| Cartão na equipe errada | Legenda do relato | Revise o dado; o quadro é sugestão, não decisão final |
| Finalização da sessão não confirmada | Aviso após encerrar | Verifique sessão e consumo antes de iniciar outra |

- **Testes falham por sintaxe TypeScript:** confira Node.js de 24.12.0 a 24.21.0 e o diretório atual
- **Porta 3000 ocupada:** use a URL indicada pelo terminal; não encerre processos desconhecidos
- **Recarregar a página** limpa o quadro, mas não encerra uma sessão remota

## Depois do encontro, se quiser aprofundar

No [exercício de contrato](../../exercises/decisions-contract/README.md), altere uma cópia da fixture e preveja o resultado antes de executar: confiança baixa, equipe desconhecida e score fracionário. Em `triage.ts`, experimente mudar o texto do anúncio ou a regra da coluna e rode os testes.

A preparação da triagem real permanece no [guia de ativação local](../../docs/integracao-live.md). Os limiares 0,8/0,7 são didáticos e não calibrados para produção.

A [documentação oficial de Decisions](https://developers.openai.com/api/docs/guides/decisions) descreve beta pública com `gpt-6-luna`. Decisions não recebe áudio: [GPT-Live conversa e delega](https://developers.openai.com/api/docs/guides/decisions-voice), e a aplicação envia o relato e valida a resposta antes de mostrar o cartão.
