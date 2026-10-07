# LAB · Codex CLI: uma mudança pequena, verificada no terminal

[Início](../../README.md) · [Exercício](../../exercises/ticket-router/README.md) · [Guia da apresentadora](../../docs/guia-apresentadora.md)

## Objetivo

Pedir uma alteração delimitada, acompanhar o trabalho no terminal e conferir testes e diferenças. Você vai melhorar um encaminhador fictício de relatos, sem chamar APIs.

**Status:** starter e solução executados localmente; interação com Codex CLI ainda não ensaiada. O acesso ao Codex depende da conta e da configuração do participante.

## Pré-requisitos

Node.js 22.18+, terminal e editor. Git ajuda a revisar o diff. Para usar o agente, instale e autentique o CLI pelas [instruções oficiais](https://learn.chatgpt.com/docs/codex/cli). Não cole credenciais no chat nem use um repositório corporativo. Sugestão: 15–20 minutos.

## Passos em casa

1. Faça uma cópia da pasta `exercises/ticket-router/starter` para uma pasta de trabalho sua. **Resultado:** você tem um exercício que pode editar sem alterar o original.
2. Nessa pasta, execute:

   ```bash
   node --test router.test.mjs
   ```

   **Confira:** 3 testes aprovados. Essa é a linha de base, ainda sem os requisitos novos.
3. Abra o CLI nessa pasta com `codex` e use este pedido:

   > Leia router.mjs e router.test.mjs. Amplie routeTicket para ignorar maiúsculas e acentos; senha/login/permissão vão para acessos; conexão/Wi-Fi/rede para infraestrutura; erro 500/aplicativo para aplicacoes. Nenhuma ou múltiplas categorias devem retornar revisao_humana. Entrada ausente deve ser segura. Escreva e execute testes que falhem antes da mudança e depois passe a suíte toda. Não instale dependências, não acesse a rede, não faça commit ou push. Ao final, mostre arquivos alterados, testes executados e limitações.
4. Acompanhe os pedidos de aprovação. Autorize somente o escopo entendido. **Confira:** o agente não amplia a tarefa nem precisa de dados reais.
5. Execute novamente `node --test router.test.mjs`. **Confira:** os casos novos existem e passam; o caso ambíguo não é encaminhado automaticamente.
6. Leia cada alteração no editor ou no diff, se a sua cópia estiver em Git. Compare depois com `exercises/ticket-router/solution`. **Resultado:** uma mudança que você sabe explicar e verificar.

## Sem CLI, problemas e reset

- **Sem acesso/login:** faça o desafio manualmente no editor e rode os mesmos testes. Isso não valida o uso do Codex
- **Testes passaram sem novos casos:** a cobertura ainda não prova o desafio; acrescente os casos faltantes
- **Uma dependência foi sugerida:** o exercício cabe em JavaScript e node:test; questione a necessidade
- **Reset:** guarde a tentativa e faça outra cópia do starter original

CLI e Cloud são LABS separados, mesmo usando este exercício. Continue no [LAB Cloud](../codex-cloud/README.md) para estudar execução remota e revisão.
