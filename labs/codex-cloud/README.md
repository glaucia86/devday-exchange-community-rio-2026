# LAB · Codex Cloud: o texto da rede na Alô, TI

[Início](../../README.md) · [Alô, TI](../../apps/decisions/README.md) · [Guia da apresentadora](../../docs/guia-apresentadora.md#codex-cloud)

## Objetivo

Revisar, numa tarefa remota do Codex Cloud, um ajuste pequeno e real na mesa de serviço. Quando a pessoa corrige o relato e diz que a rede da sala de reunião voltou, o mock ainda responde como se o serviço fosse desconhecido. Você decide se o diff merece ser aceito.

**Para fazer em casa:** use este repositório do evento, ou um fork de um clique. Não crie um repositório novo e não suba arquivos à mão. A estimativa da primeira vez é 45–90 minutos, quase toda de espera do ambiente. Essa duração não foi medida de ponta a ponta; em 8 de outubro de 2026 a abertura de `/codex/cloud` passou de 20 segundos e a lista de repositórios levou cerca de 10 segundos. No evento, Glaucia conduz. O público acompanha.

**Sua entrega:** uma tarefa concluída, o diff revisado e os testes. O LAB termina nessa revisão. Sem pull request, merge ou deploy.

**Validação:** o defeito é reproduzido offline por `node labs/codex-cloud/run-bug-test.mjs`. O roteiro novo ainda não foi ensaiado numa conta Codex Cloud. Conta, permissões e consumo ficam com quem executa a tarefa.

## O que você precisa

- Conta ChatGPT com Codex Cloud, no navegador desktop ou no app desktop
- Conta GitHub. A de Glaucia já está conectada ao Codex como `glaucia86`
- O repositório [glaucia86/devday-exchange-community-rio-2026](https://github.com/glaucia86/devday-exchange-community-rio-2026)

Quem só acompanha no navegador não instala Node, Git nem pacotes. O Node.js 24.21.0 do [`.nvmrc`](../../.nvmrc) continua valendo para instalar a Alô, TI e para a CI. Ele não é a porta de entrada deste LAB. No teste de 8 de outubro, o exercício antigo em JavaScript puro rodou no Node 20.19.2; exigir 24.21.0 antes de qualquer tarefa Cloud era mais do que aquele exercício pedia.

A reprodução local deste defeito importa TypeScript. `node labs/codex-cloud/run-bug-test.mjs` liga `--experimental-strip-types` quando o Node ainda precisa. Se esse comando falhar na sua máquina, siga pelo navegador mesmo assim.

## 1. Veja o defeito antes de delegar

O relato corrigido do cenário `network`, em [`service-desk.ts`](../../apps/decisions/src/domain/service-desk.ts), diz: “A rede da sala de reunião voltou a funcionar. Ainda preciso verificar se o problema retorna.”

`mockDecision('network', true)` cai no mesmo texto do relato incompleto: “É preciso esclarecer qual serviço falhou, quem foi afetado e se há uma alternativa antes de encaminhar.” A equipe continua `human`, e isso está certo: não há outro incidente para inventar. O erro é a explicação, que trata um acompanhamento como falta de informação. A queda original da rede, sem correção, continua em Infraestrutura.

Na raiz do clone, se quiser ver isso no seu computador:

```sh
node labs/codex-cloud/run-bug-test.mjs
```

**Esperado:** três testes aprovados e um reprovado, com código de saída 1. A falha é `correção da rede não reaproveita o texto de serviço desconhecido`, e a saída mostra `qual serviço falhou`. `Cannot find module` é caminho ou Node, não o defeito.

Quem mantém o material roda `node scripts/check-codex-cloud.mjs`. Código 0 nesse script significa que o defeito ainda existe e que este roteiro está completo. Não é um ensaio do produto Cloud.

## 2. Aponte o Cloud para um repositório que já existe

No palco, Glaucia usa `glaucia86/devday-exchange-community-rio-2026`. A conexão GitHub já está feita. Não há fork na hora.

Em casa, abra o mesmo endereço. No seletor de repositórios do Cloud:

1. Se `glaucia86/devday-exchange-community-rio-2026` aparecer, selecione só ele
2. Se não aparecer, no GitHub clique **Fork** — um clique — e depois selecione `sua-conta/devday-exchange-community-rio-2026`

Fonte do fork: [Fork a repo](https://docs.github.com/en/pull-requests/collaborating-with-pull-requests/working-with-forks/fork-a-repo). Não transforme o projeto em template e não crie um repositório vazio. Conceda ao Codex acesso só a esse repositório. Não envie chave, `.env` nem dados de trabalho.

O teste de 8 de outubro viu a lista da conta conectada, com “Loading repositories…”, e não uma busca pública universal. Se o repositório original não entrar na lista, o fork é o caminho. Rótulos podem variar.

## 3. Publique o ambiente sem corrigir o texto

A [documentação oficial](https://learn.chatgpt.com/docs/environments/cloud-environments), lida em 8 de outubro de 2026, descreve: **Work in → Cloud → Select environment → Create environment**, depois **Get started**, **Publish** e **Environment published**. O mesmo fluxo está em [developers.openai.com/codex/cloud](https://developers.openai.com/codex/cloud) e na [visão geral](https://learn.chatgpt.com/docs/cloud). Há também **Settings → Codex Cloud → Environments → Create environment**. Esse caminho de Settings não foi percorrido no teste do dia.

No mesmo dia, na conta real, a tela mostrou outra sequência: **Cloud → Choose environment → Create environment**. O campo da tarefa dizia “What should we build?”. “Choose environment” passou por “Loading saved environments…” e ofereceu **Create environment**. O diálogo “Create a cloud environment” mostrou “Connected to GitHub as glaucia86”. **Publish** e **Environment published** não apareceram, porque o ambiente não chegou a ser criado. Rótulos podem variar. Siga o texto que estiver na tela e trate os nomes oficiais como o mesmo passo quando o sentido for igual.

Não use **Codex Cloud (Legacy)**. Ele continua para code review e para as integrações GitHub e Linear, e a documentação planeja descontinuá-lo. Guia legado: [Codex Cloud (Legacy)](https://learn.chatgpt.com/docs/environments/cloud-environment). A página de ajuda [Using Codex Cloud](https://help.openai.com/en/articles/20001545-using-codex-cloud) não abriu nesta revisão (resposta 403); o aviso de Legacy foi conferido na página de ambientes. [Acesso e autenticação](https://learn.chatgpt.com/docs/auth).

`https://chatgpt.com/codex` é página de apresentação. “Go to Cloud” leva a `/codex/cloud`, que no teste ficou mais de 20 segundos em spinner antes do app. Abra o app com antecedência. Não recarregue em ciclo por causa dessa espera.

<a id="pedido-de-preparacao"></a>

No passo em que a documentação diz **Get started**, cole este pedido. É texto para o Codex, não comando do seu terminal:

```text
Prepare o ambiente deste repositório, na branch principal.
Não altere arquivos. Não corrija apps/decisions.
Não instale pacotes além do que o próprio ambiente exigir para ler o código,
não configure segredos e não chame APIs.
Execute node labs/codex-cloud/run-bug-test.mjs
Se o Node não executar TypeScript, use
node --experimental-strip-types --test labs/codex-cloud/bug-rede.test.mts
O resultado esperado da preparação é código de saída 1:
três testes aprovados e falha em
"correção da rede não reaproveita o texto de serviço desconhecido",
com a explicação "qual serviço falhou".
Se você tiver editado alguma coisa, restaure antes de encerrar.
Informe a versão do Node, o repositório, o comando e a saída.
```

**Checkpoint antes de publicar:** repositório certo, nenhum diff, teste da rede ainda vermelho nessa explicação. Se a preparação deixou o teste verde, peça a restauração do arquivo e só então salve. Publicar um ambiente já corrigido esconde a demonstração. Salvar a configuração e publicar o ambiente são passos diferentes na documentação oficial; se a sua tela usar outras palavras, confirme que uma tarefa nova ainda parte do código com o defeito.

Uma alteração feita dentro de uma tarefa não atualiza o ambiente reutilizável. A [documentação de modos](https://learn.chatgpt.com/docs/environments/modes) diz que cada tarefa tem os próprios arquivos. O risco desta demo é a preparação do ambiente, que pode “ajudar” e corrigir o texto antes do palco.

## 4. Envie a tarefa

<a id="pedido-da-tarefa"></a>

Depois de **Start a new task**, ou do equivalente na sua tela, confira o nome do ambiente e cole:

```text
Na Alô, TI, mockDecision('network', true) ainda explica que é preciso
esclarecer qual serviço falhou. O relato corrigido do cenário network
diz que a rede da sala de reunião voltou e que a pessoa quer saber
se o problema retorna. A equipe human está correta. Não invente outro
incidente nem outra equipe. O acesso sem correção e a queda original
da rede precisam continuar como estão. O relato incompleto continua
pedindo esclarecimento do serviço.

1. Execute node labs/codex-cloud/run-bug-test.mjs e mostre a falha
   antes de editar.
2. Acrescente um teste de regressão em
   apps/decisions/tests/network-followup.test.mts
   com o mesmo contrato. Esse teste novo deve falhar antes do fix.
3. Faça a menor correção em
   apps/decisions/src/domain/service-desk.ts
4. Rode de novo node labs/codex-cloud/run-bug-test.mjs e
   node --test apps/decisions/tests/*.test.mts
5. Não altere labs/codex-cloud/bug-rede.test.mts nem o encaminhador,
   o portal, dependências ou segredos.
Sem push, PR, merge ou deploy.
Ao terminar, informe a causa, o diff, os comandos e as saídas.
```

A tarefa gasta a cota da conta. O código do exercício não chama a API da OpenAI.

## 5. Revise antes de aceitar

<a id="pedido-de-revisao"></a>

Quando a tarefa terminar, ainda na mesma conversa:

```text
Sem modificar arquivos, execute novamente
node labs/codex-cloud/run-bug-test.mjs
e node --test apps/decisions/tests/*.test.mts
Mostre as saídas e os códigos de saída.
Mostre o diff e confirme que
labs/codex-cloud/bug-rede.test.mts não mudou.
```

**Esperado:**

- `run-bug-test.mjs` termina com código 0
- a explicação da correção da rede contém “voltou” e não contém “qual serviço falhou”
- a equipe continua `human`
- o diff fica em `apps/decisions/src/domain/service-desk.ts` e no teste novo `apps/decisions/tests/network-followup.test.mts`
- `labs/codex-cloud/bug-rede.test.mts` sem alterações
- a suíte já existente de `apps/decisions/tests` continua aprovada

Se aparecer outro arquivo, peça a justificativa antes de aceitar. Um texto que ainda diz “qual serviço falhou” para a rede que voltou é o defeito original.

**Critério de conclusão:** você aponta a explicação errada, mostra a correção e cita o teste que a comprova. Pare aqui.

## No palco

O bloco está no [guia da apresentadora](../../docs/guia-apresentadora.md#codex-cloud). Ambiente publicado e tarefa já enviada antes de projetar. O relógio da evidência ao vivo é de **3 minutos**. Se o diff e a saída do teste não estiverem na tela, entra o plano B com o letreiro **GRAVADO ANTES · não é ao vivo**. A gravação fica no notebook do ensaio, fora do Git, e mostra este mesmo pedido, o diff curto e o teste passando. Sem a gravação, diga que a tarefa remota não rodou e mostre só o teste vermelho. Não improvise a correção e chame de Cloud.

## Problemas

- **Repositório ausente na lista:** confira a conta GitHub e o escopo da conexão. Faça o fork de um clique. Não amplie o acesso para outros projetos
- **Spinner longo ou “Loading repositories…”:** no teste de 8 de outubro isso levou mais de 20 segundos e cerca de 10 segundos. Espere uma vez. Não trate a espera como falha de código
- **Caiu em Codex Cloud (Legacy):** volte e use o fluxo atual, com o seletor de ambiente. Legacy não é esta demo
- **Preparação corrigiu o texto:** restaure `service-desk.ts` antes de publicar. Confira o teste vermelho de novo
- **Ambiente salvo e a tarefa não inicia:** na documentação, publicar é outro passo além de salvar. Rótulos podem variar
- **Tarefa sem logs:** aceite a saída dos comandos, não um resumo que só diz “passou”
- **Teste do LAB editado:** recuse a entrega. O contrato está em `bug-rede.test.mts`
- **Cloud indisponível:** rode `node labs/codex-cloud/run-bug-test.mjs` e leia a explicação. Isso mostra o defeito; não é ensaio do produto
- **Para repetir:** nova tarefa no ambiente que ainda falha o teste da rede. Guarde a entrega anterior. A documentação diz que a tarefa nova parte do ambiente publicado, não do diff da tarefa anterior
