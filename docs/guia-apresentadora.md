# Guia da apresentadora

[Início](../README.md) · [Programação](programacao.md) · [Validação](validacao.md)

Roteiro de execução para Glaucia, separado dos LABS dos participantes. Os blocos abaixo podem ser reorganizados segundo a agenda do evento. **Os tempos são sugestões de ensaio, não novos horários oficiais.**

## Preparação antes do encontro

- Conferir programação e local no Luma
- Preparar uma pasta limpa com este material e Node.js 22.18+
- Rodar os testes do starter, solução e Alô, TI; guardar o resultado com data e versão
- Conferir o acesso a Dots, Codex CLI e Codex Cloud na conta usada na apresentação
- Usar só a empresa fictícia e os relatos fornecidos; fechar notificações e abas de trabalho
- Preparar uma cópia intacta do starter para cada tentativa; manter uma solução pronta separada
- Ensaiar fonte/zoom no projetor e navegação por teclado
- Conferir microfone e saída de áudio somente depois de autorizar e ensaiar o modo ao vivo no dispositivo
- Para a versão atual, deixar explícito: mock por padrão, voz local opcional, adaptador OpenAI implementado mas ainda sem ensaio real
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
2. **Agir:** copiar o bloco completo do cenário, com dados e pedido, em uma conversa com o dot, se disponível.
   - **Esperado:** resumo para revisão, separando fatos e lacunas, sem enviar mensagens ou abrir tickets.
3. **Agir:** conferir A-103 e perguntar à plateia o que falta.
   - **Falar:** “Uma palavra como urgente não informa sozinha impacto, prazo ou prioridade.”
4. **Agir:** enviar a correção de A-102.
   - **Esperado:** duas pessoas afetadas e alternativa móvel no texto atualizado.
5. **Encerrar:** apontar no checklist o que você aceitaria e o que pediria para corrigir.

**Reset:** reenviar o cenário original, identificando uma nova rodada e pedindo para desconsiderar as correções anteriores. Conferir os fatos, sem presumir limpeza de memória.  
**Plano B:** revisar um resumo escrito a partir dos mesmos relatos ou fazer a leitura em dupla, indicando que o produto não foi executado.  
**Ponto de parada:** se houver pedido de acesso privado ou envio externo, não autorizar para salvar a demo.

## Codex CLI

**Sugestão: 8–10 minutos.** [Guia do participante](../labs/codex-cli/README.md)

1. **Preparar:** uma cópia de starter; abrir o terminal nessa pasta.
2. **Executar:** `node --test router.test.mjs`.
   - **Esperado:** 3 testes aprovados.
   - **Falar:** “A linha de base passa, mas ainda não cobre o que vou pedir.”
3. **Executar:** o verificador independente do LAB e mostrar as 10 falhas esperadas do starter. Depois abrir `codex` e enviar o pedido delimitado.
   - **Esperado:** novos testes falham antes da mudança; implementação vem depois; nada de dependências, rede, commit ou push.
4. **Mostrar:** um teste com caixa alta, um com acentos e um relato ambíguo.
   - **Falar:** “Quero ver o caso difícil representado no teste.”
5. **Executar:** novamente `node --test router.test.mjs` e o verificador independente; revisar arquivos alterados.
   - **Esperado:** casos novos aprovados, 18/18 na aceitação e retorno de revisão humana quando duas equipes seriam plausíveis.

**Reset:** guardar a tentativa e abrir outra cópia do starter.  
**Plano B:** mostrar a solução e executar `node --test exercises/ticket-router/solution/router.test.mjs` na raiz; explicitar que a geração pelo CLI não foi realizada ao vivo.  
**Ponto de parada:** uma falha de login/ambiente merece explicação, não uma mudança apressada nas permissões.

## Codex Cloud

**Sugestão: 8–10 minutos, com ambiente preparado antes.** [Guia do participante](../labs/codex-cloud/README.md)

1. **Mostrar:** o repositório fictício com a candidata e o ambiente já publicado.
   - **Falar:** “Esta entrega passa cinco testes. Vamos conferir se ela cumpre o contrato.”
2. **Executar:** `node --test router.test.mjs` e `node verify.mjs router.mjs`.
   - **Esperado:** cinco testes verdes, mas duas falhas na aceitação de 18 casos. A candidata escolhe a primeira equipe e perde a ambiguidade.
3. **Agir:** enviar o pedido completo do LAB em uma nova tarefa no ambiente correto.
   - **Esperado:** testes de regressão antes da correção, sem alterar o verificador.
4. **Mostrar:** o estado real da tarefa e, quando terminar, diff e logs.
   - **Falar:** “Concluir a execução não é o mesmo que aprovar a mudança.”
5. **Revisar:** as duas verificações devem passar; apontar no código por que duas palavras da mesma categoria não são duas equipes.
   - **Esperado:** 18/18 na aceitação e revisão documentada. Não fazer PR, merge ou deploy para concluir a apresentação.

**Reset:** nova tarefa a partir da candidata original, preservando a entrega anterior.  
**Plano B:** mostrar a candidata local, reproduzir as duas falhas e comparar com a solução. Explicitar que a execução Cloud não aconteceu.  
**Ponto de parada:** erro de conta, permissão ou setup não justifica conectar um projeto de trabalho. Se a tarefa demorar, informar o estado verdadeiro e usar a revisão preparada.

## Decisions API

**Sugestão: 10–12 minutos.** [Guia do participante](../labs/02-decisions-typescript/README.md)

1. **Mostrar:** Alô, TI e o selo Simulado.
   - **Falar:** “Vamos observar a conversa, a sugestão e a confirmação. Hoje este modo usa respostas de exemplo.”
2. **Agir:** clicar “Explorar cenário”, conferir “Acesso ao portal” e clicar “Analisar relato”.
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

**Checkpoint de contrato:** se houver tempo no bloco, executar as fixtures `completo.json`, `incerto.json` e `recusado.json` com `exercises/decisions-contract/inspect.mts`, como no LAB. Comparar sugestão, bloqueio humano e recusa. O exercício de edição de fixtures fica para depois do encontro. As perguntas estão em `live-contract.ts`; cenários e reducer estão em `service-desk.ts`.

**Voz atual:** se houver voz local PT no navegador, ativar o som para ler a resposta. Dizer que não é voz OpenAI.  
**Voz OpenAI experimental:** os adaptadores já estão no código, desativados por padrão. Demonstrar GPT-Live somente após configuração autorizada e ensaio real no dispositivo; o servidor local gerencia sessões e Decisions, enquanto o navegador recebe transcrições pelo canal WebRTC. Não inserir a chave OpenAI no navegador. Consulte o [guia local](integracao-live.md).  
**Reset:** Recomeçar; interrompe a leitura e limpa o estado em memória.  
**Plano B:** executar os testes de domínio e ler as fixtures no código, indicando que a interface não foi validada/executada nesse ensaio.

## Fechamento

**Sugestão: 2–3 minutos.**

Retomar: contexto, escopo, evidência e confirmação. Abrir o índice com os quatro LABS para a prática em casa. Reforçar as alternativas offline e que disponibilidade do produto pode variar por conta. Encerrar com perguntas e referências oficiais.

## Depois de cada ensaio

Registrar data, versões, ambiente, comandos, resultado e limitações em [validação](validacao.md). Manter separados: teste de domínio, build, inspeção visual, áudio reproduzido e integração real. Não promover um estágio pendente para “validado” sem executar sua verificação.

