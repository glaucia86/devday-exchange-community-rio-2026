# Guia da apresentadora

[Início](../README.md) · [Programação](programacao.md) · [Validação](validacao.md)

Roteiro de execução para Glaucia, separado dos LABS dos participantes. Os blocos abaixo podem ser reorganizados segundo a agenda do evento. **Os tempos são sugestões de ensaio, não novos horários oficiais.**

## Preparação antes do encontro

- Conferir programação e local no Luma
- Preparar uma pasta limpa com este material e Node.js 22.18+
- Rodar os testes do starter, solução e Mesa TI; guardar o resultado com data e versão
- Conferir o acesso a Dots, Codex CLI e Codex Cloud na conta usada na apresentação
- Usar só a empresa fictícia e os relatos fornecidos; fechar notificações e abas de trabalho
- Preparar uma cópia intacta do starter para cada tentativa; manter uma solução pronta separada
- Ensaiar fonte/zoom no projetor e navegação por teclado
- Conferir microfone e saída de áudio somente se o modo ao vivo tiver sido implementado, autorizado e validado
- Para a versão atual, deixar explícito: mock, voz local opcional, integração OpenAI ainda pendente
- Testar a interface após a instalação/build; se essa etapa ainda estiver pendente, usar o plano B de leitura/testes
- Não apresentar uma captura, fixture ou replay como execução real

Comandos de conferência, na raiz:

```bash
node --version
node --test exercises/ticket-router/starter/router.test.mjs
node --test exercises/ticket-router/solution/router.test.mjs
node --test apps/decisions/tests/*.test.mts
```

Resultado esperado: Node compatível; 3 testes do starter; 8 da solução; a contagem atual do domínio em [validação](validacao.md).

## Abertura e transições

**Sugestão: 3–5 minutos, além do recap que você preparar.**

Apresente a ideia: “Hoje vamos sair da intenção e chegar a um resultado que dá para revisar.” Mostre os quatro LABS no índice. Explique que CLI e Cloud são experiências diferentes e que a voz faz parte de Decisions.

Use a mesma pergunta em todos os blocos: **“Que evidência me permite aceitar esta entrega?”**

## Dots

**Sugestão: 6–8 minutos.** [Guia do participante](../labs/01-dots/README.md)

1. **Mostrar:** os três relatos do [cenário Aurora](../labs/01-dots/cenario.md).
   - **Falar:** “Vou fornecer o contexto e deixar claro o que não deve ser executado.”
2. **Agir:** colar o cenário e o pedido em uma conversa com o dot, se disponível.
   - **Esperado:** resumo para revisão, separando fatos e lacunas, sem enviar mensagens ou abrir tickets.
3. **Agir:** conferir A-103 e perguntar à plateia o que falta.
   - **Falar:** “Uma palavra como urgente não informa sozinha impacto, prazo ou prioridade.”
4. **Agir:** enviar a correção de A-102.
   - **Esperado:** duas pessoas afetadas e alternativa móvel no texto atualizado.
5. **Encerrar:** apontar no checklist o que você aceitaria e o que pediria para corrigir.

**Reset:** outra conversa com o cenário original.  
**Plano B:** revisar um resumo escrito a partir dos mesmos relatos ou fazer a leitura em dupla, indicando que o produto não foi executado.  
**Ponto de parada:** se houver pedido de acesso privado ou envio externo, não autorizar para salvar a demo.

## Codex CLI

**Sugestão: 8–10 minutos.** [Guia do participante](../labs/codex-cli/README.md)

1. **Preparar:** uma cópia de starter; abrir o terminal nessa pasta.
2. **Executar:** `node --test router.test.mjs`.
   - **Esperado:** 3 testes aprovados.
   - **Falar:** “A linha de base passa, mas ainda não cobre o que vou pedir.”
3. **Executar:** `codex` e enviar o pedido delimitado do LAB.
   - **Esperado:** novos testes falham antes da mudança; implementação vem depois; nada de dependências, rede, commit ou push.
4. **Mostrar:** um teste com caixa alta, um com acentos e um relato ambíguo.
   - **Falar:** “Quero ver o caso difícil representado no teste.”
5. **Executar:** novamente `node --test router.test.mjs`; revisar arquivos alterados.
   - **Esperado:** casos novos aprovados e retorno de revisão humana quando duas equipes seriam plausíveis.

**Reset:** guardar a tentativa e abrir outra cópia do starter.  
**Plano B:** mostrar a solução e executar `node --test exercises/ticket-router/solution/router.test.mjs` na raiz; explicitar que a geração pelo CLI não foi realizada ao vivo.  
**Ponto de parada:** uma falha de login/ambiente merece explicação, não uma mudança apressada nas permissões.

## Codex Cloud

**Sugestão: 8–10 minutos, com tarefa preparada para contingência.** [Guia do participante](../labs/codex-cloud/README.md)

1. **Mostrar:** o repositório fictício e o ambiente selecionado.
   - **Falar:** “Agora a execução acontece remotamente; a tarefa e o critério continuam explícitos.”
2. **Agir:** enviar o pedido do LAB em uma tarefa Cloud, somente com acesso já preparado.
   - **Esperado:** a tarefa trabalha no exercício escolhido e informa os comandos executados.
3. **Mostrar:** estado pendente, conclusão ou falha real, conforme ocorrer.
   - **Falar:** “Concluir a execução não é o mesmo que aprovar a mudança.”
4. **Agir:** inspecionar diff e resultado dos testes. Conferir casos ambíguos e escopo.
   - **Esperado:** revisão documentada. Não fazer merge/deploy para concluir a apresentação.
5. **Conectar ao CLI:** apontar o que mudou no ambiente de execução e o que não mudou no checklist de aceitação.

**Reset:** nova tarefa sobre outra cópia do starter, sem apagar a tentativa anterior.  
**Plano B:** abrir uma tarefa de ensaio já concluída, se existir, identificando-a; caso contrário, usar a solução local como entrega para revisão, sem simular uma execução Cloud.  
**Ponto de parada:** se a tarefa demora, seguir para a revisão preparada e informar o estado verdadeiro.

## Decisions API

**Sugestão: 10–12 minutos.** [Guia do participante](../labs/02-decisions-typescript/README.md)

1. **Mostrar:** Mesa TI e o selo Simulado.
   - **Falar:** “Vamos observar a conversa, a sugestão e a confirmação. Hoje este modo usa respostas de exemplo.”
2. **Agir:** abrir “Acesso ao portal” e clicar “Analisar relato”.
   - **Esperado:** transcrição visível, sugestão de Acessos e identidade, ticket ainda em rascunho.
3. **Mostrar:** “Por trás da decisão”.
   - **Falar:** “Predicate estima uma condição. Choice escolhe uma opção. Score avalia uma rubrica.”
   - **Esperado:** números rotulados como fixtures; nenhum deles autoriza criar ticket.
4. **Agir:** “Simular uma correção” enquanto explica a mudança para erro 500 no time.
   - **Esperado:** análise anterior invalidada e confirmação bloqueada.
5. **Agir:** analisar novamente.
   - **Esperado:** Aplicações internas como nova sugestão; uma resposta antiga não substitui a nova.
6. **Agir:** revisar campos, marcar o checklist e criar o ticket simulado.
   - **Esperado:** DEMO-0001 visível, uma vez; nenhuma transmissão a um sistema de tickets.
7. **Agir:** recomeçar, escolher relato incompleto ou simular falha.
   - **Esperado:** esclarecimento/erro explícito, preservando o relato.

**Voz atual:** se houver voz local PT no navegador, ativar o som para ler a resposta. Dizer que não é voz OpenAI.  
**Voz OpenAI futura:** somente demonstrar GPT-Live após integração e ensaio; transcrição e Decisions ficam em rotas distintas. Não inserir chaves no navegador.  
**Reset:** Recomeçar; interrompe a leitura e limpa o estado em memória.  
**Plano B:** executar os testes de domínio e ler as fixtures no código, indicando que a interface não foi validada/executada nesse ensaio.

## Fechamento

**Sugestão: 2–3 minutos.**

Retomar: contexto, escopo, evidência e confirmação. Abrir o índice com os quatro LABS para a prática em casa. Reforçar as alternativas offline e que disponibilidade do produto pode variar por conta. Encerrar com perguntas e referências oficiais.

## Depois de cada ensaio

Registrar data, versões, ambiente, comandos, resultado e limitações em [validação](validacao.md). Manter separados: teste de domínio, build, inspeção visual, áudio reproduzido e integração real. Não promover um estágio pendente para “validado” sem executar sua verificação.
