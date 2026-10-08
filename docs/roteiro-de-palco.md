# Roteiro de palco

[Início](../README.md) · [Guia da apresentadora](guia-apresentadora.md)

Duas camadas. A primeira cabe no projetor sem conta, chave ou rede de modelo. A segunda só entra depois de um ensaio no mesmo notebook, com áudio e login conferidos.

Na véspera, na raiz do repositório:

```sh
node scripts/prepare-stage.mjs
```

Depois, em `apps/decisions`, `npm start` e http://127.0.0.1:3000. O script pede Node.js 24.21.0 ou posterior, o valor de `.nvmrc`.

## Camada 1 · o que sempre funciona

### 1. Caça ao bug, com voto da sala

Abra a candidata e mostre cinco testes verdes. Leia em voz alta: “A senha falhou e a conexão caiu”. Peça para a sala dizer se isso é uma equipe só ou duas. Rode o verificador. A tela fica em 16/18, e essa frase volta `acessos` quando o contrato pede `revisao_humana`.

```sh
node --test exercises/ticket-router/review-candidate/router.test.mjs
node exercises/ticket-router/verify.mjs exercises/ticket-router/review-candidate/router.mjs
```

Fala: “Teste verde não é o mesmo que contrato cumprido.”

**Plano B:** os dois comandos acima, na máquina local. Se o Cloud não estiver no ar, a caça ao bug já é a demo.

### 2. Alô, TI · a equipe muda

Com o servidor da build aberto, clique **Modo palco**. Fique na aba **Simulado**.

1. **Explorar cenário.** Leia o relato da senha e peça um palpite de equipe.
2. **Analisar relato.** Aparece Acessos e identidade. O botão de criar ticket continua desligado.
3. Pergunte: “E se a senha funcionar e o portal cair para o time inteiro?” Clique **Simular uma correção** e analise de novo. **Corrigir o relato** só abre o texto para edição.
4. A sugestão passa para Aplicações internas. A revisão anterior sai.
5. Marque a revisão e crie `DEMO-0001`.

O seletor **Simulado** e o rodapé dizem que esta aba usa respostas preparadas. A fala pode repetir isso no fim, depois da virada. Não abra **Por trás da decisão** antes desse momento: é lá que os números aparecem como exemplo.

**Plano B:** se a página não abrir, mostre os testes e as fixtures e diga que não houve conversa.

O miolo desta demonstração, cerca de três minutos no projetor, fica na aba **Simulado**: cenário, análise, correção, nova equipe e ticket. A voz é o fechamento, não o meio. Sem ensaio de áudio, o fechamento é a frase de monitoramento na própria aba simulada, lida em voz alta por você.

## Camada 2 · só com ensaio feito

Cada bloco abaixo fica de fora se o ensaio da véspera não tiver passado no notebook do projetor. A camada 1 continua de pé.

| Bloco | Ensaio que libera o palco | Plano B |
| --- | --- | --- |
| **Dots** | No notebook do projetor, com este cenário: o dot abre pelo nome, em `chatgpt.com/dots/<id>`, sem aplicativos e sem computador. O relatório preparado confere com as páginas públicas. A pergunta ao vivo “o que mudou” foi respondida dentro de cerca de 45 s, sem inventar item e sem pedir conexão. O ensaio de 8 de outubro de 2026 usou outro cenário e não libera este bloco. | **Plano B · relatório preparado.** Mostre o relatório conferido antes, ao lado da página pública, e diga que a consulta ao vivo não foi concluída. |
| **Codex CLI** | `codex --version` mostra `codex-cli 0.161.0`. A abertura é `codex -m gpt-6-luna -s workspace-write -a on-request` em `apps/decisions`. `Trust this folder?` já foi respondido. Dentro do agente, `node --version` mostra v24.21.0 ou posterior. `/voice` legenda uma frase e `/agents` abre o centro de agentes. | Diga “isto é gravação” e rode o ensaio etiquetado GRAVAÇÃO. Se não houver gravação, mostre a falha simulada na Alô, TI e diga que o CLI não rodou. |
| **Codex Cloud** | O ambiente publicado ainda começa em 16/18, com a candidata original. | Faça a caça ao bug da camada 1 e diga que a tarefa remota não rodou. |
| **Voz** | No notebook do projetor: os cinco comandos aparecem no log, a correção no meio da frase troca a equipe, o ticket só nasce depois de “confirma”, a frase de monitoramento sai uma vez e a sessão encerra. | Fique na Alô, TI simulada. Crie o ticket pelos botões. Aponte a frase de monitoramento na tela e diga que a conversa real não foi executada. |

A versão do Codex fica fixa em `@openai/codex@0.161.0` para o encontro. Na véspera do CLI, antes do projetor: `codex login status` sem mostrar a conta; `codex -m gpt-6-luna -s workspace-write -a on-request` na pasta `apps/decisions`; a pasta confiada se surgir `Trust this folder?`; dentro do agente, `node --version` em v24.21.0 ou posterior (se vier outra, reabra com `-c allow_login_shell=false`); `/voice` ensaiado até `/voice stop`. A Alô, TI desse bloco abre com `npm run dev` na mesma pasta, antes do relógio: o `npm start` da véspera serve a build e não mostra a edição do agente. Depois do bloco, o Decisions volta ao `npm start`. O plano B desse bloco é uma gravação etiquetada GRAVAÇÃO.
