# Guia da apresentadora

[Início](../README.md) · [Programação](programacao.md) · [Validação](validacao.md)

Roteiro público para Glaucia preparar e conduzir as demonstrações. **No evento, Glaucia opera os produtos e o público acompanha. Os LABS são para reproduzir as mesmas demonstrações em casa depois. Não há tempo reservado para execução coletiva dos exercícios.**

O [roteiro de palco](roteiro-de-palco.md) divide a apresentação em duas camadas: a base que sempre funciona e a camada ao vivo, que só entra com ensaio feito.

Os blocos podem ser organizados conforme a programação. Os tempos abaixo são **estimativas para ensaiar a demonstração no palco**, ainda não medidos; não redefinem a grade oficial. Instalação, login, criação de ambiente e configuração de chave ficam fora da apresentação.

## Quatro demonstrações, quatro LABS em casa

O fio condutor é o suporte fictício da Aurora. A pergunta que liga os blocos é: **“Que evidência me permite aceitar esta entrega?”**

| Demonstração conduzida por Glaucia | O que aparece no palco | O que a pessoa reproduz em casa |
| --- | --- | --- |
| [Dots](#dots) | Resumo dos três relatos, correção de A-102 e revisão dos fatos | [Mesmo cenário e pedidos](../labs/01-dots/README.md) |
| [Codex CLI](#codex-cli) | Starter → testes vermelhos → alteração → 18 critérios → diff | [Mesmos arquivos, prompt e verificador](../labs/codex-cli/README.md) |
| [Codex Cloud](#codex-cloud) | Candidata preparada → regressão → tarefa remota → revisão | [Mesma candidata, contrato e tarefa](../labs/codex-cloud/README.md) |
| [Decisions API](#decisions-api) | Conversa de voz para voz, correção, revisão e ticket simulado | [Mesmos relatos e sequência de voz](../labs/02-decisions-typescript/README.md), com alternativa simulada identificada |

CLI e Cloud compartilham o contrato de encaminhamento. A candidata do Cloud é uma cópia com defeito intencional para estudar revisão; não a apresente como um resultado produzido pela execução anterior do CLI.

**Pendente antes de considerar as quatro demos prontas:** ensaiar Dots, CLI e Cloud nas contas reais e Decisions com API, microfone e áudio reais. Testes offline e uma página publicada não comprovam essas experiências. Consulte o [registro de validação](validacao.md).

## Preparação antes do encontro

- Conferir programação e local no Luma
- Node.js 24.21.0 ou posterior, como em `.nvmrc`. Na véspera, rode `node scripts/prepare-stage.mjs` e deixe `npm start` pronto em `apps/decisions`
- Se o Codex CLI entrar no ensaio: `npm install -g @openai/codex@0.161.0`, `codex --version` mostra `codex-cli 0.161.0` e `codex login status` confirma a sessão, sem projetar a conta
- Preparar uma cópia limpa do material e uma cópia separada para cada demonstração; manter soluções de referência para contingência
- Conferir acesso e login de Dots e Codex sem expor dados pessoais na projeção
- Preparar e publicar o ambiente Cloud do exercício antes do palco; manter uma tarefa de ensaio concluída somente se ela realmente tiver sido executada
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

Esperado: Node.js 24.21.0 ou posterior, 61 testes aprovados no conjunto atual e aceitação com falhas didáticas conferidas: starter 8/18, candidata 16/18, solução 18/18. Isso verifica os exemplos locais; os ensaios nos produtos são uma etapa adicional.

## Abertura e transições

**Estimativa de palco: 3–5 minutos, além do recap.**

Fala sugerida: “Vou mostrar quatro demonstrações. Vocês podem acompanhar agora e repetir cada uma em casa usando o LAB correspondente. Não precisam instalar nem executar nada durante a apresentação.”

Mostre o índice. Apresente o contexto: relatos de suporte fictícios que precisam de clareza, encaminhamento e revisão. As transições abaixo mantêm esse contexto, sem pedir que a plateia abra ferramentas.

## Dots

**Estimativa de palco: 6–8 minutos.** [Reprodução em casa](../labs/01-dots/README.md)

**Deixar pronto:** conversa com dots acessível, [cenário Aurora](../labs/01-dots/cenario.md) e checklist. Não conectar aplicativos nem computador para esta demonstração.

| Ação de Glaucia | Fala sugerida | Evidência na tela |
| --- | --- | --- |
| Mostrar os três relatos | “Temos fatos e lacunas. ‘Urgente’ sozinho não mede impacto.” | A-103 não informa serviço nem impacto |
| Enviar o primeiro bloco completo, com cenário e pedido | “Vou pedir um resumo, mantendo qualquer ação externa fora do escopo.” | Resumo com fatos e perguntas, sem ticket ou envio |
| Comparar A-102 com o original | “Alternativa não informada não significa que não existe alternativa.” | Quatro pessoas; ausência de informação preservada |
| Enviar o bloco de correção | “Agora são duas pessoas e há uma alternativa móvel.” | Apenas os fatos correspondentes mudam; A-103 continua incompleto |
| Apontar o checklist e concluir a revisão | “O texto parece bom. Minha aceitação depende destes fatos.” | Limites respeitados e nenhuma prioridade inventada |

**Transição:** “Agora vamos transformar regras explícitas de encaminhamento em código e verificar o resultado.”

**Reset:** reenviar os relatos originais como nova rodada, pedindo para desconsiderar as correções anteriores. Conferir os fatos; não presumir limpeza de memória.

**Plano B no palco:** Glaucia mostra o exemplo comentado do cenário e faz a revisão na tela, dizendo que dots não foi executado. Não dividir a plateia em duplas ou iniciar uma atividade paralela.

**Ponto de parada:** pedido de acesso privado ou ação externa fora do roteiro. Não autorizar para salvar a demonstração.

## Codex CLI

**Estimativa de palco: 8–10 minutos.** [Reprodução em casa](../labs/codex-cli/README.md)

**Deixar pronto:** CLI autenticado, terminal na cópia `rio-codex-cli`, editor e verificador fora da pasta editada pelo agente. Instalação e login já devem ter sido ensaiados.

1. **Mostrar a linha de base.** Execute `node --test router.test.mjs`: três testes aprovados.
   - Fala: “A linha de base está verde, mas ainda não cobre a mudança.”
2. **Mostrar o trabalho que falta.** Execute `node ../devday-exchange-community-rio-2026/exercises/ticket-router/verify.mjs router.mjs`.
   - Esperado: 8/18, com dez falhas. Mostre a caixa alta e a frase **A senha falhou e a conexão caiu**: o verificador recebe `acessos` e o contrato pede `revisao_humana`. A frase **O aplicativo falhou e a rede caiu** já passa no starter; não use essa linha para mostrar a ambiguidade.
3. **Delegar no terminal.** Abra `codex` e envie o bloco completo do LAB. Acompanhe a inclusão dos testes antes da implementação.
   - Fala: “Quero ver a falha reproduzida antes de aceitar a correção.”
4. **Conferir fora da resposta do agente.** Rode novamente a suíte e o verificador.
   - Esperado: testes ampliados verdes e 18/18 na aceitação independente.
5. **Ler o diff.** Use o comando do LAB e destaque normalização, categorias e retorno para revisão humana.
   - Fala: “‘Senha e login’ é uma categoria. ‘Senha e conexão’ exige revisão.”

**Transição:** “No Cloud, vou revisar uma entrega preparada para esse mesmo contrato. Ela tem testes verdes, mas esconde uma regressão.”

**Reset:** preserve a tentativa; abra outra cópia do starter. A cópia do próximo ensaio deve começar em 8/18, não numa solução já pronta.

**Plano B no palco:** execute a solução e os 18 critérios, identificando-a como referência pronta. Não diga que o CLI gerou a mudança se a interação falhou ou não foi executada.

**Ponto de parada:** problema de login, permissões não compreendidas ou mudança fora do escopo. O agente usa conexão e acesso da conta; o código do exercício não chama APIs. A cópia precisa do `git init` do LAB: sem ele, `codex exec` pede `--skip-git-repo-check` e o modo interativo pede para confiar na pasta. Se o sandbox só mostrar `tests 1 / fail 1`, peça `node --test --test-isolation=none router.test.mjs`. Se uma conta nova responder `rate limit exceeded` no modelo padrão, entre com ChatGPT ou use `codex -m gpt-5.4-mini`. A versão do encontro continua `codex-cli 0.161.0`.

## Codex Cloud

**Estimativa de palco: 8–10 minutos, com ambiente previamente preparado.** [Reprodução em casa](../labs/codex-cloud/README.md)

**Deixar pronto:** repositório fictício com os quatro arquivos do LAB, ambiente publicado e uma tarefa nova na candidata original. Confirme o repositório selecionado antes de projetar.

1. **Mostrar a candidata.** Abra o relatório de preparação com a execução de `node --test router.test.mjs` e `node verify.mjs router.mjs`. Se precisar repetir, peça esses comandos na conversa do ambiente, como no LAB; não presuma que o terminal local está operando a máquina remota.
   - Esperado: cinco testes verdes, mas 16/18 na aceitação.
   - Fala: “Esta cópia foi preparada com um erro: ela retorna na primeira equipe encontrada.”
2. **Enviar a tarefa remota.** Use exatamente o pedido do LAB, com regressões antes do fix e proibição de alterar o verificador.
   - Fala: “Mudei onde o trabalho acontece. O contrato e a responsabilidade de revisar continuam explícitos.”
3. **Acompanhar o estado real.** Mostre execução, falha ou conclusão conforme ocorrer. Não use a mensagem final como substituto dos logs.
4. **Revisar a entrega.** Confira diff, novos casos ambíguos, preservação de `verify.mjs` e execute as duas verificações.
   - Esperado: 18/18 e uma explicação de por que duas palavras da mesma categoria não são ambiguidade.
5. **Concluir a revisão.** A demonstração termina aqui, sem PR, merge ou deploy do exercício.

**Transição:** “Até aqui, revisamos texto e código. Agora a entrada será uma conversa por voz, mas a confirmação da ação continua na tela.”

**Reset:** nova tarefa sobre a candidata original; preserve a entrega anterior. Se o ambiente partir de código já corrigido, ele não reproduz o começo desta demonstração.

**Plano B no palco:** se existir uma tarefa real de ensaio concluída, mostre-a identificando a data e que foi preparada antes. Caso contrário, reproduza localmente as duas falhas e compare com a solução, dizendo que a execução Cloud não aconteceu. Se a tarefa ainda estiver rodando, informe isso sem prolongar o bloco indefinidamente.

**Ponto de parada:** erro de conta, setup ou permissão não justifica conectar projetos de trabalho ou ampliar o acesso durante a apresentação.

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

Deixe a aplicação local aberta com `npm start`, a partir da build do `node scripts/prepare-stage.mjs`. Na aba **OpenAI ao vivo**, já configurada. Não comece a captura enquanto explica a arquitetura ou ajusta projeção. Sessões têm limite local de dois minutos; esse controle não garante teto de gasto.

Fala sugerida: “Vou falar com a Alô, TI. GPT-Live cuida da conversa e Decisions sugere o encaminhamento. O ticket continua fictício e só nasce depois da minha revisão.”

### Sequência da conversa

1. **Iniciar:** confira o código local; leia o consentimento e, somente após concordar com o envio e autorizar o custo, marque **Entendi o envio de áudio e texto à OpenAI e estou autorizada a usar a API com custo nesta demo.** Clique **Iniciar conversa real** e espere **Microfone ativo**.
2. **Relatar:** diga “Não consigo entrar no portal interno desde que troquei a senha. Só eu fui afetada e consigo continuar as outras tarefas.”
   - Esperado: transcrição correspondente, resposta audível e sugestão de **Acessos e identidade**, sujeita a revisão. Valores e palavras do modelo não são fixos.
   - Se a análise não for delegada automaticamente, use **Analisar com Decisions** e explique que acionou esse passo manualmente.
3. **Preparar a revisão, sem confirmar:** mostre que ainda não existe ticket. Marque a revisão inicial sem criar o ticket.
4. **Corrigir por voz:** diga “Correção: a senha funciona. O portal mostra erro 500 para todo o time, ninguém consegue trabalhar e não há alternativa.”
   - Esperado: análise antiga invalidada, revisão desmarcada e nova sugestão de **Aplicações internas**. Confira a transcrição; não force uma saída incorreta para seguir a fala preparada.
5. **Confirmar:** revise título, relato e equipe; marque **Revisei este relato ao vivo e a equipe.** e clique **Confirmar ticket simulado ao vivo**.
   - Esperado: `DEMO-0001`, sem envio a sistema externo. Ouça a resposta de confirmação; transcrição sozinha não comprova saída de voz.
6. **Encerrar:** clique **Encerrar conversa** e espere **Conversa encerrada. Microfone liberado.**.
   - Se aparecer finalização não confirmada, pare os novos inícios e verifique sessão/consumo. Não reinicie em sequência.

A conversa curta deve caber no limite local no ensaio; a explicação de arquitetura fica antes ou depois. Latência e duração reais ainda precisam ser medidas. Ao terminar, desative o modo ao vivo e reinicie ou encerre o servidor conforme o guia local.

### Explicação após encerrar

Mostre `live-contract.ts`: `predicate` avalia contexto, `choice` escolhe a equipe e `score` aplica a rubrica. A aplicação verifica o contrato e a revisão vigente antes de permitir o ticket. O encaminhador dos LABS CLI/Cloud usa palavras e categorias; ele não compreende negações ou correções como esta conversa pretende compreender. Os limiares são didáticos; score fracionário não vira prioridade automaticamente.

O exercício de editar fixtures e comparar recusas fica no LAB para estudo em casa. Não transforme essa etapa em atividade simultânea da plateia.

**Reset real:** confirmar o encerramento e só então iniciar outra sessão autorizada. Não usar “Recomeçar” do mock para inferir que uma sessão remota foi encerrada.

**Plano B no palco:** se uma conversa real foi iniciada, clique **Encerrar conversa** e confirme o fechamento antes de trocar para Simulado. Se a finalização não for confirmada, pare os novos inícios e siga a verificação de sessão/consumo do guia local; trocar de aba não comprova encerramento remoto. Depois, anuncie “Agora vou reproduzir o fluxo com respostas preparadas”. Na aba **Simulado**, clique **Modo palco → Explorar cenário → Analisar relato → Simular uma correção → Analisar relato**, revise e crie `DEMO-0001`. O seletor e o rodapé já dizem que esta aba é simulada. Não há microfone nem inferência nesse caminho. Voz local opcional do dispositivo não é GPT-Live. Se nem a interface estiver disponível, mostrar os testes e fixtures, sem dizer que houve conversa.

## Fechamento

**Estimativa de palco: 2–3 minutos.**

Retome contexto, escopo, evidência e confirmação. Abra os quatro LABS e diga onde cada pessoa pode reproduzir a demonstração correspondente em casa, no seu ritmo. Reforce requisitos, alternativas offline e disponibilidade por conta. Não peça instalação ou execução antes de encerrar.

## Depois de cada ensaio

Registrar data, commit, versões, ambiente, passos realmente executados, saídas, duração e limitações em [validação](validacao.md). Manter separados teste de domínio, build, navegador, produto autenticado, áudio reproduzido e API real. Nunca promover uma etapa pendente a “validada” sem executar a verificação correspondente.
