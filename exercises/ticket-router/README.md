# Exercício compartilhado: encaminhar relatos fictícios

O LAB CLI parte de uma função mínima. O LAB Cloud começa com uma candidata que parece pronta, mas contém um erro. Ambos praticam o mesmo contrato de revisão de código. O projeto não chama Decisions nem qualquer API.

## Antes de executar

Precisa de Node.js 22.18+ e do material [clonado](../../README.md#preparacao). Não há pacotes nem chaves para instalar. Todos os comandos abaixo partem da raiz do repositório.

| Pasta | Papel | Testes da pasta | Aceitação independente |
| --- | --- | --- | --- |
| `starter` | Início do LAB CLI | 3 passam | 8 passam, 10 falham |
| `review-candidate` | Entrega para revisar no LAB Cloud | 5 passam | 16 passam, 2 falham |
| `solution` | Referência, consultar depois da tentativa | 8 passam | 18 passam |

## Contrato do desafio

Evoluir ou corrigir `routeTicket(text)` para:

- Ignorar maiúsculas/minúsculas e acentos
- Reconhecer palavras inteiras: senha, login ou permissão → `acessos`
- Conexão, Wi-Fi ou rede → `infraestrutura`
- Erro 500 ou aplicativo → `aplicacoes`
- Nenhuma categoria ou mais de uma categoria → `revisao_humana`
- Duas palavras da mesma categoria não criam ambiguidade
- Entrada ausente ou não textual → `revisao_humana`, sem lançar erro
- Não adicionar dependências, rede, serviços ou efeitos externos

Exemplos: “SENHA expirada” → `acessos`; “senha e login” → `acessos`; “senha e conexão” → `revisao_humana`. O verificador não tenta avaliar toda a língua portuguesa. Outras grafias e regras precisam de uma ampliação explícita do contrato.

## Prove a diferença entre passar testes e concluir o desafio

```sh
node --test exercises/ticket-router/starter/router.test.mjs
node exercises/ticket-router/verify.mjs exercises/ticket-router/starter/router.mjs
```

O primeiro comando passa. O segundo termina com código 1 e `ACCEPTANCE {"total":18,"passed":8,"failed":10}`. As falhas mostram o trabalho que ainda falta, não um problema de instalação.

O verificador é separado da pasta que o agente edita. Depois da sua tentativa, passe o caminho do seu `router.mjs` para ele. Não reduza os testes para aceitar uma resposta incorreta.

## Referência, só depois de tentar

```sh
node --test exercises/ticket-router/solution/router.test.mjs
node exercises/ticket-router/verify.mjs exercises/ticket-router/solution/router.mjs
```

Esperado: oito testes da solução e 18 casos de aceitação aprovados. Explique por que a solução precisa contar categorias antes de retornar, em vez de aceitar a primeira correspondência.

## Reset seguro

Trabalhe em uma cópia. Para recomeçar, use outra pasta e preserve sua tentativa anterior. Os LABS trazem comandos e caminhos específicos para [CLI](../../labs/codex-cli/README.md) e [Cloud](../../labs/codex-cloud/README.md).

Para quem mantém o material, `node scripts/check-workshop-examples.mjs` confirma as falhas didáticas do starter e da candidata, além do resultado verde da solução. Um arquivo ausente ou erro de sintaxe não é aceito como a etapa vermelha.
