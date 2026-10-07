# Exercício compartilhado: encaminhar relatos fictícios

Este pequeno projeto dá contexto aos LABS de **Codex CLI** e **Codex Cloud**, com objetivos distintos. É um exercício de revisão de código baseado em regras; não chama Decisions nem qualquer API.

## Requisitos e ponto de partida

Node.js 22.18 ou posterior. Sem npm install, dependências ou chaves.

Na raiz do repositório:

```bash
node --test exercises/ticket-router/starter/router.test.mjs
```

Resultado esperado: **3 testes aprovados**. A pasta starter contém um comportamento mínimo que reconhece apenas “senha” em minúsculas.

## O desafio

Evoluir `routeTicket(text)` para:

- Ignorar maiúsculas/minúsculas e acentos
- Retornar `acessos` para senha, login ou permissão
- Retornar `infraestrutura` para conexão, Wi-Fi ou rede
- Retornar `aplicacoes` para erro 500 ou aplicativo
- Retornar `revisao_humana` quando nenhum grupo ou mais de um grupo corresponder
- Aceitar entrada ausente sem lançar erro
- Manter as opções acima, sem dependências, rede, serviços ou efeitos externos

Antes de implementar, acrescentar testes para os novos casos e observar as falhas. Depois implementar e executar a suíte toda. Os testes iniciais não são prova de que o desafio já foi resolvido.

## Referência e verificação

Só compare com a solução depois da sua tentativa:

```bash
node --test exercises/ticket-router/solution/router.test.mjs
```

Resultado esperado: **8 testes aprovados**. Inspecione `solution/router.mjs` e explique por que uma entrada que menciona senha e conexão pede revisão humana. O teste cobre um classificador didático limitado, não a qualidade de uma triagem real.

## Reset seguro

Trabalhe em uma cópia de starter. Para recomeçar, faça outra cópia do starter original, sem apagar suas alterações anteriores. Não use comandos destrutivos para limpar o projeto durante o encontro.
