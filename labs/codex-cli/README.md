# LAB · Codex CLI: uma mudança pequena, verificada no terminal

[Início](../../README.md) · [Exercício](../../exercises/ticket-router/README.md) · [Guia da apresentadora](../../docs/guia-apresentadora.md)

## Objetivo

Implementar uma mudança com Codex no terminal e verificar o resultado com testes que ficam fora da pasta editada pelo agente. Você vai ampliar um encaminhador fictício de relatos.

**Para fazer em casa:** reproduza a demonstração de CLI do [guia da apresentadora](../../docs/guia-apresentadora.md#codex-cli), com o mesmo starter, pedido e verificador. No evento, Glaucia opera o terminal e o público acompanha.

**Sua entrega:** `router.mjs`, novos testes e um diff que você consegue explicar. Estimativa de estudo em casa: 15–20 minutos, além da preparação do ambiente; duração não medida.

**Validação:** starter, solução e verificação independente são executáveis localmente. A interação autenticada com Codex CLI ainda precisa de ensaio. O código do exercício não chama APIs; usar o agente requer conexão, autenticação e o acesso/consumo da sua conta.

## 1. Prepare uma cópia de trabalho

Siga [Prepare seu ambiente](../../README.md#preparacao) para instalar Node.js 22.18+, verificar Git e clonar o material. Abra o terminal na pasta `devday-exchange-community-rio-2026`.

Execute uma vez. Este comando de Node funciona no PowerShell, macOS e Linux e recusa sobrescrever uma cópia existente:

```sh
node -e "require('node:fs').cpSync('exercises/ticket-router/starter','../rio-codex-cli',{recursive:true,errorOnExist:true,force:false})"
cd ../rio-codex-cli
node --test router.test.mjs
```

**Esperado:** três testes aprovados. Você está em `rio-codex-cli`, uma pasta separada do material original, com `README.md`, `router.mjs` e `router.test.mjs`.

Agora execute a verificação do desafio, ainda nessa pasta:

```sh
node ../devday-exchange-community-rio-2026/exercises/ticket-router/verify.mjs router.mjs
```

**Esperado antes da mudança:** `ACCEPTANCE {"total":18,"passed":8,"failed":10}` e código de saída 1. Aqui, falhar é parte do exercício: os três testes iniciais não cobrem os requisitos novos. Erro de arquivo ausente ou de sintaxe não conta como esse resultado.

## 2. Entre no Codex

Se o CLI ainda não estiver instalado, o [guia oficial](https://learn.chatgpt.com/docs/codex/cli) oferece instaladores por sistema. Com npm, uma opção é:

```sh
npm install -g @openai/codex
codex --version
codex login
codex login status
```

No PowerShell, use `npm.cmd` se `npm.ps1` for bloqueado. Se instalou via npm e `codex.ps1` também for bloqueado, use `codex.cmd` nos quatro comandos e ao abrir o CLI, ou use o Prompt de Comando. Não altere a política de execução do sistema para acompanhar o LAB. Conclua o login no navegador com sua própria conta; não cole credenciais na conversa. Login com ChatGPT e autenticação por chave são modalidades diferentes. Este LAB não pede chave de API. Veja [autenticação](https://learn.chatgpt.com/docs/auth).

Na pasta `rio-codex-cli`, execute `codex`. Confira `/status` e `/permissions`; não desative as proteções para destravar o exercício.

## 3. Peça a mudança

Copie o pedido completo:

```text
Leia README.md, router.mjs e router.test.mjs desta pasta.
Amplie routeTicket(text) para ignorar maiúsculas e acentos.
Palavras inteiras senha/login/permissão retornam acessos;
conexão/Wi-Fi/rede retornam infraestrutura;
erro 500/aplicativo retornam aplicacoes.
Nenhuma categoria ou mais de uma categoria retorna revisao_humana.
Duas palavras da mesma categoria continuam sendo uma categoria.
Entrada ausente ou não textual retorna revisao_humana sem erro.

Primeiro acrescente testes e execute-os para mostrar as falhas.
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

**Esperado:** a suíte expandida passa; a verificação independente mostra `18` aprovados e `0` falhas. O agente dizer “testado” não substitui essa saída.

Abra `router.mjs` no editor. Para comparar com o início:

```sh
git diff --no-index -- ../devday-exchange-community-rio-2026/exercises/ticket-router/starter/router.mjs router.mjs
```

O diff usa `-` para linhas antigas e `+` para novas. Código de saída 1 significa que encontrou diferenças; nesse comando isso é normal.

**Critério de conclusão:** normalização explicável, nenhuma dependência nova, ambiguidade enviada para revisão humana e testes cobrindo o comportamento. Em especial, “senha e login” é uma equipe; “senha e conexão” são duas. Só depois compare com a [solução de referência](../../exercises/ticket-router/solution/router.mjs).

## Problemas e reset

- **`codex` não encontrado:** reabra o terminal após instalar e confira `codex --version`
- **Falha de login ou acesso:** use o editor e os mesmos testes; registre que o produto Codex não foi ensaiado
- **`ARQUIVO_INVALIDO` no verificador:** confira o diretório atual e o nome `router.mjs`; isso não é uma falha esperada do desafio
- **Os testes do agente passam, mas o verificador falha:** leia o caso que falhou e peça um teste de regressão antes da correção
- **A pasta já existe:** preserve a tentativa. Repita a cópia com outro nome, como `rio-codex-cli-2`, e ajuste o `cd`

## Depois do encontro, se quiser aprofundar

Adicione seu próprio caso antes de mudar o código: “Wi Fi”, no lugar de “Wi-Fi”. Decida explicitamente se faz parte do contrato; o exercício atual não promete tratar todas as grafias. Compare uma ampliação deliberada de escopo com um bug dos requisitos existentes.

No [LAB Cloud](../codex-cloud/README.md), você vai revisar uma candidata que passa seus testes, mas ainda encaminha relatos ambíguos incorretamente.
