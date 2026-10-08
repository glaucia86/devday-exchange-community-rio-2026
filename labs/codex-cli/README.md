# LAB · Codex CLI: uma mudança pequena, verificada no terminal

[Início](../../README.md) · [Exercício](../../exercises/ticket-router/README.md) · [Guia da apresentadora](../../docs/guia-apresentadora.md)

## Objetivo

Implementar uma mudança com Codex no terminal e verificar o resultado com testes que ficam fora da pasta editada pelo agente. Você vai ampliar um encaminhador fictício de relatos.

**Para fazer em casa:** reproduza a demonstração de CLI do [guia da apresentadora](../../docs/guia-apresentadora.md#codex-cli), com o mesmo starter, pedido e verificador. No evento, Glaucia opera o terminal e o público acompanha.

**Sua entrega:** `router.mjs`, novos testes e um diff que você consegue explicar. Estimativa de estudo em casa: 15–20 minutos, além da preparação do ambiente; duração não medida.

**Validação:** starter, solução e verificação independente são executáveis localmente. A interação autenticada com Codex CLI ainda precisa de ensaio. O código do exercício não chama APIs; usar o agente requer conexão, autenticação e o acesso/consumo da sua conta.

## Antes do primeiro comando

**Rota essencial:** preparar a cópia → conferir a falha → pedir a mudança → executar os testes → ler o diff. O desafio de outra grafia, ao final, é opcional.

- **CLI** significa interface de linha de comando: você conversa com o agente dentro do terminal
- **Starter** é o ponto de partida, deliberadamente incompleto
- **Teste** compara a saída de uma função com o resultado esperado; **regressão** é um comportamento que deixou de funcionar
- **Diff** mostra o que mudou entre duas versões
- `routeTicket(text)` recebe o texto de um relato e retorna o nome de uma categoria; não cria tickets reais

Você precisa de Node.js 24.21.0 ou posterior, Git, uma conexão para usar Codex e uma conta com acesso. A preparação compartilhada explica como abrir o terminal e conferir versões. Não precisa usar uma conta corporativa nem conectar dados de trabalho.

## 1. Prepare uma cópia de trabalho

Siga [Prepare seu ambiente](../../README.md#preparacao) para instalar Node.js 24.21.0 ou posterior, verificar Git e clonar o material. Abra o terminal na pasta `devday-exchange-community-rio-2026`.

Execute uma vez. Este comando de Node funciona no PowerShell, macOS e Linux e recusa sobrescrever uma cópia existente:

```sh
node -e "require('node:fs').cpSync('exercises/ticket-router/starter','../rio-codex-cli',{recursive:true,errorOnExist:true,force:false})"
cd ../rio-codex-cli
node --test router.test.mjs
```

**Esperado:** três testes aprovados. Você está em `rio-codex-cli`, uma pasta separada do material original. `../` no comando significa voltar uma pasta antes de criar a cópia; por isso ela fica ao lado do repositório.

Confira onde está e quais arquivos copiou:

```sh
node -p "process.cwd()"
node -e "console.log(require('node:fs').readdirSync('.').sort().join(' | '))"
```

O caminho termina em `rio-codex-cli`. A lista deve ser `AGENTS.md | README.md | router.mjs | router.test.mjs`. `AGENTS.md` diz ao agente como executar os testes dentro do sandbox. `README.md` explica o desafio, `router.mjs` contém a função e `router.test.mjs` contém os testes iniciais. Se faltar um, volte à cópia antes de continuar.

Agora execute a verificação do desafio, ainda nessa pasta:

```sh
node ../devday-exchange-community-rio-2026/exercises/ticket-router/verify.mjs router.mjs
```

**Esperado antes da mudança:** `ACCEPTANCE {"total":18,"passed":8,"failed":10}` e código de saída 1. Aqui, falhar é parte do exercício: os três testes iniciais não cobrem os requisitos novos. Erro de arquivo ausente ou de sintaxe não conta como esse resultado.

No palco, mostre a falha da frase **A senha falhou e a conexão caiu**. O verificador diz `esperado revisao_humana; recebido acessos`. A outra frase com duas equipes, **O aplicativo falhou e a rede caiu**, já passa neste starter: ele só reconhece a palavra senha e, sem ela, devolve `revisao_humana` por acaso. Não use essa segunda frase para ilustrar a ambiguidade.

Grave esse ponto de partida no Git da cópia. Assim o Codex reconhece a pasta como repositório, o `git diff` mostra só a mudança do exercício e o modo não interativo não pede `--skip-git-repo-check`:

```sh
git init -b main
git config user.name "Exercicio"
git config user.email "exercicio@example.invalid"
git add AGENTS.md README.md router.mjs router.test.mjs
git commit -m "Ponto de partida do exercício"
```

Esses `git config` valem só para esta cópia; não alteram o Git do restante do computador. `git status` deve ficar limpo. O pedido ao agente continua proibindo commit e push: este commit é a foto de antes da mudança.

## 2. Entre no Codex

Se o CLI ainda não estiver instalado, o [guia oficial](https://learn.chatgpt.com/docs/codex/cli) oferece instaladores por sistema. Com npm, uma opção é:

```sh
npm install -g @openai/codex@0.161.0
codex --version
codex login
codex login status
```

`codex --version` deve mostrar `codex-cli 0.161.0`. Essa é a versão fixada para o encontro. Uma atualização posterior pode mudar a interface no dia do palco.

No PowerShell, use `npm.cmd` se `npm.ps1` for bloqueado. Se instalou via npm e `codex.ps1` também for bloqueado, use `codex.cmd` nos quatro comandos e ao abrir o CLI, ou use o Prompt de Comando. Não altere a política de execução do sistema para acompanhar o LAB. Conclua o login no navegador com sua própria conta; não cole credenciais na conversa. Login com ChatGPT e autenticação por chave são modalidades diferentes. Este LAB não pede chave de API. Veja [autenticação](https://learn.chatgpt.com/docs/auth).

Depois do login, `codex login status` deve confirmar uma sessão autenticada. A redação varia conforme a modalidade. Se ainda informar que não está autenticado, conclua o fluxo no navegador e confira novamente antes de abrir o agente.

Na pasta `rio-codex-cli`, execute `codex` e espere aparecer a interface do agente. Digite `/status` dentro dela para conferir a sessão e `/permissions` para revisar permissões. Esses comandos com barra pertencem ao Codex; não são comandos do PowerShell ou bash. Não desative proteções para destravar o exercício.

Se o Codex pedir para confiar na pasta, confira se o caminho é a cópia `rio-codex-cli` que você acabou de criar. A confiança é desta pasta de exercício, não de outro projeto.

`codex exec` é a alternativa não interativa, na mesma versão `codex-cli 0.161.0`. Na pasta da cópia, ele recebe o mesmo pedido da etapa 3 entre aspas. Como a pasta já é um repositório, não use `--skip-git-repo-check`. Sem o `git init` acima, o `codex exec` recusa a pasta e o modo interativo pede para confiar nela.

## 3. Peça a mudança

Com o Codex aberto, cole o pedido completo no campo da conversa do agente e envie. Este bloco é texto para o agente, não um comando para o terminal:

```text
Leia AGENTS.md, README.md, router.mjs e router.test.mjs desta pasta.
Amplie routeTicket(text) para ignorar maiúsculas e acentos.
Palavras inteiras senha/login/permissão retornam acessos;
conexão/Wi-Fi/rede retornam infraestrutura;
erro 500/aplicativo retornam aplicacoes.
Nenhuma categoria ou mais de uma categoria retorna revisao_humana.
Duas palavras da mesma categoria continuam sendo uma categoria.
Entrada ausente ou não textual retorna revisao_humana sem erro.

Primeiro acrescente testes e execute-os com
node --test --test-isolation=none router.test.mjs
para mostrar qual teste falhou. Sem --test-isolation=none, o sandbox
pode imprimir só o resumo do arquivo (tests 1 / fail 1).
Depois faça a menor implementação que passa a suíte inteira.
Não instale dependências, acesse serviços externos, altere outras pastas,
faça commit ou push. Não altere o verificador do material original.
Ao terminar, mostre os arquivos alterados, comandos, resultados e limites.
```

O limite de rede acima se refere às ações no projeto; o agente não funciona offline. Revise cada pedido de aprovação e autorize apenas o escopo entendido.

## 4. Confira você mesma ou você mesmo

Depois da resposta do agente, saia do CLI com Ctrl+C e rode:

```sh
node --test router.test.mjs
node ../devday-exchange-community-rio-2026/exercises/ticket-router/verify.mjs router.mjs
```

**Esperado:** a suíte expandida passa. A quantidade de testes escritos pelo agente pode variar, mas não pode diminuir nem omitir os requisitos. O verificador independente deve terminar exatamente com:

```text
ACCEPTANCE {"total":18,"passed":18,"failed":0}
```

`passed` conta casos aprovados; `failed` conta falhas. Com falhas, o comando termina com código 1. Sem falhas, termina com 0. No PowerShell, `$LASTEXITCODE` mostra o código do último comando; no macOS/Linux, use `echo $?` imediatamente depois. O agente dizer “testado” não substitui a execução.

Abra `router.mjs` no editor. Se quiser apenas ler pelo terminal, sem instalar um editor:

```sh
node -e "console.log(require('node:fs').readFileSync('router.mjs','utf8'))"
```

Procure três partes: normalização do texto, detecção das categorias e decisão de encaminhar ou pedir revisão. Para comparar com o início:

```sh
git diff
git status
```

Se o diff abrir um visualizador com `(END)` no rodapé, pressione `q` para voltar ao terminal. O diff usa `-` para linhas antigas e `+` para novas. Um diff vazio com `git status` limpo pode significar que o agente commitou mesmo com o pedido em contrário: `git log --oneline` e `git show` mostram esse commit. Não faça push.

**Critério de conclusão:** normalização explicável, nenhuma dependência nova, ambiguidade enviada para revisão humana e testes cobrindo o comportamento. Em especial, “senha e login” é uma equipe; “senha e conexão” são duas. Só depois compare com a [solução de referência](../../exercises/ticket-router/solution/router.mjs).

## Problemas e reset

- **`codex` não encontrado:** reabra o terminal após instalar e confira `codex --version`. A versão do encontro é `codex-cli 0.161.0`, instalada com `npm install -g @openai/codex@0.161.0`
- **`codex exec` pede `--skip-git-repo-check` ou o modo interativo pede para confiar na pasta:** a cópia não é um repositório. Rode o `git init` e o commit da etapa 1 nesta pasta, não no material do evento
- **O agente diz que um teste falhou, mas não mostra qual:** no sandbox, `node --test router.test.mjs` pode resumir o arquivo inteiro como `tests 1 / fail 1`. Peça `node --test --test-isolation=none router.test.mjs`
- **`rate limit exceeded` ou `Request too large` no modelo padrão, em conta nova:** entre com ChatGPT, como este LAB recomenda, ou use um modelo menor, por exemplo `codex -m gpt-5.4-mini`. Não cole a chave na conversa
- **Falha de login ou acesso:** use o editor e os mesmos testes; registre que o produto Codex não foi ensaiado
- **`ARQUIVO_INVALIDO` no verificador:** confira o diretório atual e o nome `router.mjs`; isso não é uma falha esperada do desafio
- **Os testes do agente passam, mas o verificador falha:** leia o caso que falhou e peça um teste de regressão antes da correção
- **A pasta já existe:** preserve a tentativa. Repita a cópia com outro nome, como `rio-codex-cli-2`, e ajuste o `cd`

### Se um caso continuar falhando

Volte ao Codex na mesma pasta. Copie somente o nome do caso e a diferença entre esperado/recebido, e peça:

```text
A verificação independente ainda falhou neste caso: [cole aqui a falha].
Reproduza com um teste de regressão, explique a causa e faça a menor
correção. Não altere o verificador. Rode a suíte inteira novamente.
```

Troque o trecho entre colchetes pela saída real. Depois, volte à etapa 4 e confira por conta própria. Não cole credenciais, informações do seu computador ou logs de projetos pessoais.

## Depois do encontro, se quiser aprofundar

Adicione seu próprio caso antes de mudar o código: “Wi Fi”, no lugar de “Wi-Fi”. Decida explicitamente se faz parte do contrato; o exercício atual não promete tratar todas as grafias. Compare uma ampliação deliberada de escopo com um bug dos requisitos existentes.

No [LAB Cloud](../codex-cloud/README.md), você vai revisar uma candidata que passa seus testes, mas ainda encaminha relatos ambíguos incorretamente.
