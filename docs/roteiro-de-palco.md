# Roteiro de palco

[Início](../README.md) · [Guia da apresentadora](guia-apresentadora.md)

Duas camadas. A primeira cabe no projetor sem conta, chave ou rede de modelo. A segunda só entra depois de um ensaio no mesmo notebook, com áudio e login conferidos.

Na véspera, na raiz do repositório:

```sh
node scripts/prepare-stage.mjs
```

Depois, em `apps/decisions`, `npm start` e http://127.0.0.1:3000/triagem. O script aceita Node.js de 24.12.0 a 24.21.0. O arquivo `.nvmrc` recomenda 24.21.0, a versão da CI.

## Camada 1 · o que sempre funciona

### 1. Caça ao bug, com voto da sala

Abra a candidata e mostre cinco testes verdes. Leia em voz alta: “A senha falhou e a conexão caiu”. Peça para a sala dizer se isso é uma equipe só ou duas. Rode o verificador. A tela fica em 16/18, e essa frase volta `acessos` quando o contrato pede `revisao_humana`.

```sh
node --test exercises/ticket-router/review-candidate/router.test.mjs
node exercises/ticket-router/verify.mjs exercises/ticket-router/review-candidate/router.mjs
```

Fala: “Teste verde não é o mesmo que contrato cumprido.”

**Plano B:** os dois comandos acima, na máquina local. Se o Cloud não estiver no ar, a caça ao bug já é a demo.

## Camada 2 · só com ensaio feito

Cada bloco abaixo fica de fora se o ensaio da véspera não tiver passado no notebook do projetor. A camada 1 continua de pé.

| Bloco | Ensaio que libera o palco | Plano B |
| --- | --- | --- |
| **Dots** | No notebook do projetor, com este cenário: o dot abre pelo nome, em `chatgpt.com/dots/<id>`, sem aplicativos e sem computador. O relatório preparado confere com as páginas públicas. A pergunta ao vivo “o que mudou” foi respondida dentro de cerca de 45 s, sem inventar item e sem pedir conexão. O ensaio de 8 de outubro de 2026 usou outro cenário e não libera este bloco. | **Plano B · relatório preparado.** Mostre o relatório conferido antes, ao lado da página pública, e diga que a consulta ao vivo não foi concluída. |
| **Codex CLI** | `codex --version` mostra `codex-cli 0.161.0`. A abertura é `codex -m gpt-6-luna -s workspace-write -a on-request` em `apps/decisions`. `Trust this folder?` já foi respondido. Dentro do agente, `node --version` mostra v24.21.0, recomendada em `.nvmrc`. `/voice` legenda uma frase e `/agents` abre o centro de agentes. | Diga “isto é gravação” e rode o ensaio etiquetado GRAVAÇÃO. Se não houver gravação, mostre a falha simulada na Alô, TI e diga que o CLI não rodou. |
| **Codex Cloud** | O ambiente publicado no repositório do evento ainda falha em `bug-rede.test.mts`; a tarefa de correção já foi enviada antes do bloco. O beat ao vivo é revisar o diff e a saída do teste, com teto de **3 minutos**. | Se não houver diff e saída, use a gravação com o letreiro **GRAVADO ANTES · não é ao vivo**. Sem gravação, mostre só o teste vermelho e diga que a tarefa remota não rodou. Sem PR, merge ou deploy. |
| **Triagem ao vivo** | No notebook do projetor, em `/triagem`: “registra” cria um cartão por relato, um relato vago cai em **Revisão humana** e muda de coluna com um clique, “qual o padrão?” é respondido sem nova chamada ao Decisions e a sessão encerra confirmada. O contador cabe nos limites da conta (cerca de uma chamada por relato). | Encerre a sessão e abra a gravação com o letreiro **GRAVADO ANTES · não é ao vivo**. Sem gravação, rode `node --test tests/triage.test.mts` em `apps/decisions` e diga que a triagem ao vivo não rodou. Não há modo simulado neste bloco. |

A versão do Codex fica fixa em `@openai/codex@0.161.0` para o encontro. Na véspera do CLI, antes do projetor: `codex login status` sem mostrar a conta; `codex -m gpt-6-luna -s workspace-write -a on-request` na pasta `apps/decisions`; a pasta confiada se surgir `Trust this folder?`; dentro do agente, `node --version` em v24.21.0, recomendada em `.nvmrc` (se vier outra, reabra com `-c allow_login_shell=false`); `/voice` ensaiado até `/voice stop`. A Alô, TI desse bloco abre com `npm run dev` na mesma pasta, antes do relógio: o `npm start` da véspera serve a build e não mostra a edição do agente. Depois do bloco, o Decisions volta ao `npm start`. O plano B desse bloco é uma gravação etiquetada GRAVAÇÃO.
