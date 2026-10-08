# Guia da apresentadora

[Início](../README.md) · [Programação](programacao.md) · [Validação](validacao.md)

Roteiro público para Glaucia preparar e conduzir as demonstrações. **No evento, Glaucia opera os produtos e o público acompanha. Os LABS são para reproduzir as mesmas demonstrações em casa depois. Não há tempo reservado para execução coletiva dos exercícios.**

O [roteiro de palco](roteiro-de-palco.md) divide a apresentação em duas camadas: a base que sempre funciona e a camada ao vivo, que só entra com ensaio feito.

Os blocos podem ser organizados conforme a programação. Os tempos abaixo são **estimativas para ensaiar a demonstração no palco**, ainda não medidos; não redefinem a grade oficial. Instalação, login, criação de ambiente e configuração de chave ficam fora da apresentação.

## Quatro demonstrações, quatro LABS em casa

O fio condutor dos blocos de código e de voz é o suporte fictício da Aurora. Dots usa outra fonte: as issues e os pull requests públicos deste repositório. A pergunta que liga os blocos é: **“Que evidência me permite aceitar esta entrega?”**

| Demonstração conduzida por Glaucia | O que aparece no palco | O que a pessoa reproduz em casa |
| --- | --- | --- |
| [Dots](#dots) | Relatório preparado das issues e dos pull requests públicos, pergunta ao vivo sobre o que mudou e revisão na página | [Mesmo cenário e pedidos](../labs/01-dots/README.md) |
| [Codex CLI](#codex-cli) | Starter → testes vermelhos → alteração → 18 critérios → diff | [Mesmos arquivos, prompt e verificador](../labs/codex-cli/README.md) |
| [Codex Cloud](#codex-cloud) | Candidata preparada → regressão → tarefa remota → revisão | [Mesma candidata, contrato e tarefa](../labs/codex-cloud/README.md) |
| [Decisions API](#decisions-api) | Conversa de voz para voz, correção, revisão e ticket simulado | [Mesmos relatos e sequência de voz](../labs/02-decisions-typescript/README.md), com alternativa simulada identificada |

CLI e Cloud compartilham o contrato de encaminhamento. A candidata do Cloud é uma cópia com defeito intencional para estudar revisão; não a apresente como um resultado produzido pela execução anterior do CLI.

**Pendente antes de considerar as quatro demos prontas:** ensaiar o cenário novo de Dots no notebook do projetor (o cenário antigo rodou uma vez em 8 de outubro de 2026 e não libera este bloco), ensaiar CLI e Cloud nas contas reais e Decisions com API, microfone e áudio reais. Testes offline e uma página publicada não comprovam essas experiências. Consulte o [registro de validação](validacao.md).

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

Esperado: Node.js 24.21.0 ou posterior, 71 testes aprovados no conjunto atual e aceitação com falhas didáticas conferidas: starter 8/18, candidata 16/18, solução 18/18. Isso verifica os exemplos locais; os ensaios nos produtos são uma etapa adicional.

## Abertura e transições

**Estimativa de palco: 3–5 minutos, além do recap.**

Fala sugerida: “Vou mostrar quatro demonstrações. Vocês podem acompanhar agora e repetir cada uma em casa usando o LAB correspondente. Não precisam instalar nem executar nada durante a apresentação.”

Mostre o índice. Dots abre com uma fonte pública real. Os blocos seguintes usam relatos de suporte fictícios que precisam de clareza, encaminhamento e revisão. As transições abaixo mantêm a pergunta da evidência, sem pedir que a plateia abra ferramentas.

## Dots

**Alvo de palco: 2–3 minutos, ainda não cronometrado com este cenário.** [Reprodução em casa](../labs/01-dots/README.md) · [Cenário](../labs/01-dots/cenario.md)

A única espera medida foi de 20 a 45 segundos, em 8 de outubro de 2026, com o cenário antigo de texto colado. Esse ensaio não libera este bloco. Se a resposta ao vivo não fechar em cerca de 45 segundos, passe ao plano B para o bloco caber no alvo.

**Deixar pronto, longe do projetor:**

- Conta de demonstração, sem o exercício antigo na conversa. Não há um item chamado “dots”: o dot aparece pelo próprio nome. No teste de 8 de outubro, o nome ficava no topo da barra lateral, abaixo de “New chat”, e abria em `https://chatgpt.com/dots/<id>`. Os rótulos podem variar. A primeira criação segue a introdução oficial; pule aplicativos e computador. Fonte: [Get started](https://learn.chatgpt.com/docs/dots/getting-started).
- Se o dot dessa conta já tiver histórico, não reutilize. A documentação consultada fala em um dot, que pode ter várias responsabilidades, e na ação **Delete** para apagá-lo. Leia a confirmação. Faça isso só na conta de demonstração, antes do evento. Não apague um dot de trabalho. Essas páginas não descrevem um segundo dot simultâneo.
- Primeiro bloco do [cenário](../labs/01-dots/cenario.md) já enviado e conferido contra as duas páginas públicas. Anote data, hora no horário de Brasília e o que estava visível, com o estado que a página mostra. Não envie o segundo bloco antes do palco: essa pergunta é a batida ao vivo.
- Duas abas ao lado, nas listagens que incluem fechadas: [issues](https://github.com/glaucia86/devday-exchange-community-rio-2026/issues?q=is%3Aissue+is%3Aopen+OR+is%3Aissue+is%3Aclosed) e [pull requests](https://github.com/glaucia86/devday-exchange-community-rio-2026/pulls?q=is%3Apr+is%3Aopen+OR+is%3Apr+is%3Aclosed).
- Glaucia vigia essas abas durante o bloco. Conteúdo não revisado ou inadequado corta na hora para o Plano B, sem ser lido.
- Se o dot pedir GitHub, aplicativo ou computador, recuse. Se ele não ler as páginas sem isso, o ao vivo não está liberado.

| Batida | Ação de Glaucia | Fala sugerida | Evidência na tela |
| --- | --- | --- | --- |
| Estado preparado | Abrir o dot pelo nome e mostrar o relatório já conferido | “Isto não é um chat novo. O dot ficou responsável por vigiar estas duas páginas.” | URL no formato `chatgpt.com/dots/…` e o relatório com horário |
| Conferência muda | Abrir a página pública e bater um número e um título | “Eu aceito o que consigo ver na página.” | O item citado está na página, com o estado que ela mostra |
| Ao vivo | Enviar o segundo bloco, com Enter ou com a seta do campo | “Agora peço só o que mudou. Se nada mudou, essa também é uma resposta.” | Resposta em cerca de 45 segundos, ou passagem ao plano B |
| Revisão | Comparar a resposta com a página | “O texto parece bom. A página é que decide.” | Só mudança real, ou “nada mudou”, sem item inventado |

**Transição:** “O que eu revisei foi uma mudança observável numa fonte pública. No próximo bloco, a evidência passa a ser teste e diff.”

**Leve para casa:** o [LAB](../labs/01-dots/README.md) cabe numa tarde. Quem já acompanha um repositório público ou uma página de status troca as URLs e repete a mesma responsabilidade.

**Reset:** não peça para “desconsiderar a rodada anterior”. As notas do dot atravessam a conversa, e encerrar a conversa não zera esse contexto. Fonte: [Tasks and memory](https://learn.chatgpt.com/docs/dots/tasks-and-memory). Para outro ensaio, use de novo uma conta sem esse histórico, longe do projetor.

**Plano B · relatório preparado:** mostre o relatório conferido antes e a página pública ao lado. Se o corte for por conteúdo não revisado ou inadequado, Glaucia fecha a resposta ao vivo sem lê-la e fica só nesse relatório. Diga que a consulta ao vivo não foi concluída. Não leia o relatório preparado como se fosse a resposta de agora. Não divida a plateia em duplas.

**Ponto de parada:** pedido para conectar GitHub, aplicativo, computador ou e-mail, ou qualquer escrita no repositório. Não autorize no palco.

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

Fala sugerida: “Até aqui eu cliquei. Agora eu falo com a Alô, TI. Ela pede uma função, a mesa executa, e o ticket continua fictício até eu confirmar.”

O meio da demonstração continua na aba **Simulado**. A voz entra no fechamento. Sem o ensaio de áudio, leia a frase de monitoramento que a aba simulada mostra depois do ticket e diga que a conversa real não rodou.

### Sequência da conversa

1. **Iniciar:** confira o código local; leia o consentimento e, somente após concordar com o envio e autorizar o custo, marque **Entendi o envio de áudio e texto à OpenAI e estou autorizada a usar a API com custo nesta demo.** Clique **Iniciar conversa real** e espere **Microfone ativo**.
2. **Registrar:** diga “Registra este relato: a rede da sala de reunião cai durante as chamadas. O restante do escritório funciona.”
   - Esperado: o log mostra `registrar_relato` e o texto aparece no relato. Ainda não há ticket. A transcrição sozinha não preenche o campo.
3. **Analisar:** diga “Analisa o relato.”
   - Esperado: uma fala curta de que está analisando e, em seguida, a equipe sugerida. Se a função não vier, use **Analisar com Decisions** e diga que acionou o botão.
4. **Interromper:** no meio da resposta, diga “Corrige: na verdade é o time todo e ninguém consegue trabalhar. Não há alternativa.”
   - Esperado: o log mostra `corrigir_relato`, a análise some e a sugestão anterior não volta.
5. **Analisar de novo** e, só então, dizer “Confirma e abre o ticket.”
   - Esperado: `DEMO-0001`. Sem esse pedido explícito o ticket não nasce. A tela mostra o monitoramento de demonstração. Depois de uma pausa, a assistente fala a frase uma vez. Aponte o rótulo de dados de demonstração: não é um painel real.
6. **Encerrar:** clique **Encerrar conversa** e espere **Conversa encerrada. Microfone liberado.**.
   - Se aparecer finalização não confirmada, pare os novos inícios e verifique sessão/consumo. Não reinicie em sequência.

A conversa curta deve caber no limite local no ensaio; a explicação de arquitetura fica antes ou depois. Latência e duração reais ainda precisam ser medidas. Ao terminar, desative o modo ao vivo e reinicie ou encerre o servidor conforme o guia local.

### Explicação após encerrar

Mostre `live-contract.ts`: `predicate` avalia contexto, `choice` escolhe a equipe e `score` aplica a rubrica. A aplicação verifica o contrato e a revisão vigente antes de permitir o ticket. O encaminhador dos LABS CLI/Cloud usa palavras e categorias; ele não compreende negações ou correções como esta conversa pretende compreender. Os limiares são didáticos; score fracionário não vira prioridade automaticamente.

O exercício de editar fixtures e comparar recusas fica no LAB para estudo em casa. Não transforme essa etapa em atividade simultânea da plateia.

**Reset real:** confirmar o encerramento e só então iniciar outra sessão autorizada. Não usar “Recomeçar” do mock para inferir que uma sessão remota foi encerrada.

**Plano B no palco:** se uma conversa real foi iniciada, clique **Encerrar conversa** e confirme o fechamento antes de trocar para Simulado. Se a finalização não for confirmada, pare os novos inícios e siga a verificação de sessão/consumo do guia local; trocar de aba não comprova encerramento remoto. Depois, anuncie “Agora vou reproduzir o fluxo com respostas preparadas”. Na aba **Simulado**, clique **Modo palco → Explorar cenário → Analisar relato → Simular uma correção → Analisar relato**, revise e crie `DEMO-0001`. Leia a frase de monitoramento na tela e diga que os registros marcados como demonstração não são chamados reais. O seletor e o rodapé já dizem que esta aba é simulada. Não há microfone nem inferência nesse caminho. Voz local opcional do dispositivo não é GPT-Live. Se nem a interface estiver disponível, mostrar os testes e fixtures, sem dizer que houve conversa.

## Fechamento

**Estimativa de palco: 2–3 minutos.**

Retome contexto, escopo, evidência e confirmação. Abra os quatro LABS e diga onde cada pessoa pode reproduzir a demonstração correspondente em casa, no seu ritmo. Reforce requisitos, alternativas offline e disponibilidade por conta. Não peça instalação ou execução antes de encerrar.

## Depois de cada ensaio

Registrar data, commit, versões, ambiente, passos realmente executados, saídas, duração e limitações em [validação](validacao.md). Manter separados teste de domínio, build, navegador, produto autenticado, áudio reproduzido e API real. Nunca promover uma etapa pendente a “validada” sem executar a verificação correspondente.
