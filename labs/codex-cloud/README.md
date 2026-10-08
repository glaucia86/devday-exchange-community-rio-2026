# LAB · Codex Cloud: revisar uma entrega que parece pronta

[Início](../../README.md) · [Exercício](../../exercises/ticket-router/README.md) · [Guia da apresentadora](../../docs/guia-apresentadora.md)

## Objetivo

Delegar uma correção em ambiente remoto e decidir se a entrega pode ser aceita. Você receberá uma candidata com cinco testes verdes e um defeito intencional: ela escolhe a primeira equipe encontrada, mesmo quando o relato envolve mais de uma.

**Para fazer em casa:** reproduza a demonstração Cloud do [guia da apresentadora](../../docs/guia-apresentadora.md#codex-cloud): mesma candidata preparada, tarefa remota e revisão. Ela continua o contexto de encaminhamento mostrado no CLI, mas usa uma cópia com defeito intencional para estudar revisão. Não é apresentada como uma falha produzida pelo CLI.

**Sua entrega:** uma tarefa concluída, um diff revisado e evidências de que a regressão foi corrigida. Estimativa de estudo em casa: 15–20 minutos, além da configuração da conta; duração não medida. Não é necessário ter feito o LAB CLI. No evento, o público apenas acompanha Glaucia.

**Validação:** a candidata, suas falhas esperadas e a solução são testadas offline. Ainda não houve ensaio deste roteiro em uma conta Codex Cloud. Conta, permissões e consumo precisam ser conferidos por quem participa.

## Entenda o caminho antes de começar

**Rota essencial:** conferir o defeito local → preparar seu repositório fictício → preparar o ambiente Cloud → executar a tarefa → revisar. A comparação com outra entrega, no final, é opcional.

Você vai usar dois lugares diferentes:

- **Seu terminal:** monta a cópia local e executa os primeiros testes
- **ChatGPT/Codex Cloud:** prepara uma máquina remota e recebe o pedido de correção

**GitHub** guarda os arquivos; **ambiente** é a configuração reutilizável da máquina remota; **tarefa** é uma execução isolada dentro dessa configuração. Publicar o ambiente prepara novas tarefas, não publica a aplicação.

Precisa de Node.js 22.18+ e Git para a preparação local, uma conta GitHub sua e uma conta ChatGPT com acesso ao Cloud. Se não tiver acesso, você ainda pode estudar a candidata localmente; não registre isso como um ensaio do produto Cloud.

## 1. Conheça o defeito antes de delegar

Após [clonar o material](../../README.md#preparacao), abra o terminal na raiz do repositório:

```sh
node --test exercises/ticket-router/review-candidate/router.test.mjs
node exercises/ticket-router/verify.mjs exercises/ticket-router/review-candidate/router.mjs
```

**Esperado:** os cinco testes da candidata passam, mas a verificação independente mostra `ACCEPTANCE {"total":18,"passed":16,"failed":2}`. Os relatos com duas equipes falham. O primeiro caso devolve `acessos` quando deveria devolver `revisao_humana`.

Leia os dois casos que falham:

```text
FAIL duas equipes: acesso e rede: esperado revisao_humana; recebido acessos
FAIL duas equipes: aplicativo e rede: esperado revisao_humana; recebido infraestrutura
ACCEPTANCE {"total":18,"passed":16,"failed":2}
```

Essa saída foi reproduzida com a candidata. Ela escolhe a primeira categoria e deixa de procurar a segunda. Os cinco testes próprios não continham esses relatos. Por isso, “testes verdes” e “contrato atendido” ainda não são a mesma coisa.

**Checkpoint:** só prossiga quando conseguir identificar essas duas falhas. `Cannot find module` é problema de caminho, não a falha esperada.

## 2. Prepare um repositório só para o exercício

### Monte uma pasta fácil de encontrar

No seu terminal, ainda na raiz `devday-exchange-community-rio-2026`, execute uma linha por vez:

```sh
node -e "require('node:fs').cpSync('exercises/ticket-router/review-candidate','../rio-codex-cloud',{recursive:true,errorOnExist:true,force:false})"
node -e "const fs=require('node:fs');fs.copyFileSync('exercises/ticket-router/verify.mjs','../rio-codex-cloud/verify.mjs',fs.constants.COPYFILE_EXCL)"
cd ../rio-codex-cloud
node -p "process.cwd()"
node -e "console.log(require('node:fs').readdirSync('.').sort().join(' | '))"
```

**Esperado:** a pasta atual termina em `rio-codex-cloud`; a lista é `README.md | router.mjs | router.test.mjs | verify.mjs`. Anote o caminho completo: você vai escolher esses arquivos no navegador. Os comandos recusam sobrescrever arquivos existentes. Se a pasta já existir, preserve-a e use outro nome nos dois comandos de cópia e no `cd`.

Confira a pasta isolada:

```sh
node --test router.test.mjs
node verify.mjs router.mjs
```

O resultado continua sendo cinco testes aprovados e 16/18 na aceitação. Isso mostra que os quatro arquivos bastam para reproduzir o defeito, sem depender do restante do material.

### Envie somente esses arquivos para seu GitHub

1. Entre no GitHub com sua própria conta. No menu de criação do canto superior direito, escolha **New repository**
2. Em **Owner**, confira sua conta. Use um nome como `rio-codex-cloud`; escolha a visibilidade conscientemente. Para uma prática individual, um repositório privado mantém o exercício restrito
3. Inclua um README inicial para obter a lista de arquivos; não peça ao Copilot para gerar código. Clique **Create repository**
4. Abra **Add file → Upload files**. Escolha os quatro arquivos de `rio-codex-cloud`, não a pasta inteira nem o repositório do evento
5. Revise a seleção, informe uma mensagem como “Adicionar exercício fictício” e confirme a gravação na branch principal desse seu repositório de exercício. O README enviado substitui o inicial
6. Confira na lista os quatro nomes. Abra `README.md`: o título deve ser **Candidata para revisão · encaminhador fictício**. Se os arquivos ficaram dentro de outra pasta, corrija a organização antes do Cloud

Esses passos criam uma cópia sua no GitHub. Não envie chave, `.env`, dados de trabalho ou a demo inteira. Anote `sua-conta/rio-codex-cloud` para selecionar o projeto certo. Fontes: [criar repositório](https://docs.github.com/en/repositories/creating-and-managing-repositories/creating-a-new-repository) e [enviar arquivos](https://docs.github.com/en/repositories/working-with-files/managing-files/adding-a-file-to-a-repository).

## 3. Prepare e publique o ambiente

O [guia oficial atual](https://learn.chatgpt.com/docs/environments/cloud-environments) descreve este caminho no ChatGPT web/desktop. Rótulos podem variar com idioma e rollout:

1. Abra **Work in → Cloud → Select environment → Create environment**.
2. Selecione o repositório fictício. Se precisar conectar GitHub, confira os repositórios e permissões solicitados antes de aceitar.
3. Em **Get started**, peça Node.js 22.18+ e a execução de `node --version` e `node --test router.test.mjs`. Não há `npm install` neste projeto.
4. Revise o relatório de preparação: Node compatível, os quatro arquivos na raiz e cinco testes aprovados.
5. Salve, escolha **Publish** e espere **Environment published**. Aqui, publicar cria o ambiente reutilizável do Codex; não coloca uma aplicação na internet.
6. Escolha **Start a new task** nesse ambiente.

Na conversa de preparação, você pode enviar este texto. Ele é um pedido ao Codex, não um comando no seu terminal local:

```text
Prepare somente este repositório fictício. Confira Node.js 22.18 ou posterior.
Na pasta que contém router.mjs, execute node --version,
node --test router.test.mjs e node verify.mjs router.mjs.
A candidata deve ter cinco testes próprios aprovados e duas falhas
intencionais no verificador (16/18). Não corrija o código nesta preparação.
Não instale pacotes de aplicação nem configure segredos.
Informe a pasta usada, os quatro arquivos e os resultados.
```

**Checkpoint antes de Publish:** repositório correto, Node compatível, cinco testes verdes e duas falhas esperadas preservadas. Se a preparação já corrigiu a candidata, peça para recuperar a versão original antes de salvar; começar com 18/18 esconderia a demonstração.

Salvar uma configuração não significa que o ambiente já foi publicado. Se a conta não oferecer esse fluxo, siga a documentação atual e a alternativa offline, sem mudar permissões às pressas. [Acesso e autenticação](https://learn.chatgpt.com/docs/auth).

## 4. Envie uma tarefa delimitada

Depois de **Start a new task**, confira o nome do ambiente. Cole o bloco abaixo no campo de mensagem da nova tarefa e envie. Não o cole no PowerShell ou no bash:

```text
Revise a candidata routeTicket em router.mjs deste repositório fictício.
Ela passa os cinco testes atuais, mas relatos que combinam categorias
não podem ser encaminhados automaticamente.

Contrato: ignorar caixa e acentos; palavras inteiras senha/login/permissão
retornam acessos; conexão/Wi-Fi/rede retornam infraestrutura;
erro 500/aplicativo retornam aplicacoes. Nenhuma categoria ou mais de
uma categoria retorna revisao_humana. Duas palavras da mesma categoria
não são ambiguidade. Entrada ausente ou não textual deve ser segura.

1. Execute node --test router.test.mjs e node verify.mjs router.mjs.
2. Mostre os casos que falham e acrescente testes de regressão antes do fix.
3. Faça a menor correção em router.mjs e execute ambas as verificações.
4. Não altere verify.mjs nem reduza o contrato para deixar os testes verdes.
Sem dependências, chamadas externas, push, PR, merge ou deploy.
Ao terminar, informe causa, arquivos alterados, comandos, saídas e limites.
```

A tarefa usa o acesso/consumo do Codex; o código do exercício não chama APIs. A restrição a chamadas externas diz respeito às ações no projeto.

## 5. Revise antes de aceitar

Acompanhe a tarefa: pendente, executando, falha e concluída são estados diferentes. Quando terminar:

- Abra os arquivos alterados e os logs. Procure a falha antes da correção e os resultados depois
- Confira que os novos testes cobrem “senha + conexão” e “aplicativo + rede”, além de preservar “senha + login”
- Na conversa da mesma tarefa, peça a reexecução dos dois comandos usando o texto abaixo; confira os resultados das ferramentas, não só o resumo final
- Espere `18` aprovados e `0` falhas na aceitação; confira que `verify.mjs` não foi alterado
- Compare a lógica com a [solução de referência](../../exercises/ticket-router/solution/router.mjs) somente após sua revisão

Pedido de conferência para enviar na conversa da tarefa:

```text
Sem modificar arquivos, execute novamente node --test router.test.mjs e
node verify.mjs router.mjs na pasta deste exercício. Mostre as saídas e
os códigos de saída. Mostre também o diff e confirme se verify.mjs mudou.
```

O verificador deve mostrar `ACCEPTANCE {"total":18,"passed":18,"failed":0}`. Procure, no diff, mudanças em `router.mjs` e acréscimos em `router.test.mjs`. Se houver outras mudanças, peça a justificativa antes de aceitar. Um `return` na primeira categoria ainda indicaria o defeito original.

**Critério de conclusão:** você consegue apontar o defeito original, explicar a correção e citar os testes que a comprovam. O LAB termina na revisão. Não precisa abrir PR, integrar código ou publicar uma aplicação.

## Problemas, alternativa offline e reset

- **Repositório não aparece na seleção:** confira conta GitHub, nome do projeto e quais repositórios a conexão permite. Não amplie acesso para projetos de trabalho só para concluir o LAB
- **Ambiente salvo, mas tarefa não inicia:** confira se chegou a **Environment published**; salvar e publicar são etapas diferentes
- **Ambiente sem Node ou arquivos ausentes:** volte ao relatório de preparação; não confunda erro de setup com defeito da função
- **Tarefa sem logs:** peça a execução e a saída dos dois comandos; texto afirmando “passou” não basta
- **Verificador alterado:** restaure a cópia original do material antes de aceitar o resultado
- **Cloud indisponível:** faça a correção em uma cópia local da candidata e rode os mesmos comandos. Isso valida o exercício, não o produto Cloud
- **Para repetir:** inicie uma nova tarefa a partir da candidata original. Não reaproveite silenciosamente arquivos já corrigidos; preserve o resultado anterior para comparação

## Depois do encontro, se quiser aprofundar

Revise uma segunda entrega sem olhar a solução. Escreva um parecer curto: “aceitaria”, “pediria mudanças” ou “evidência insuficiente”, com dois fatos do diff ou dos testes. Compare com a revisão que você fez no terminal no [LAB CLI](../codex-cli/README.md).
