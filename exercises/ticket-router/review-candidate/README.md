# Candidata para revisão · encaminhador fictício

Esta implementação tem um defeito intencional. Cinco testes passam, mas relatos com mais de uma categoria ainda são encaminhados automaticamente. Sua tarefa é reproduzir, corrigir e revisar esse problema.

Requisito: Node.js 24.21.0 ou posterior. Não precisa de pacotes, chave ou API.

## Execute na raiz da cópia de exercício

```sh
node --test router.test.mjs
node verify.mjs router.mjs
```

O segundo comando requer `verify.mjs`, copiado da pasta pai deste material. Numa pasta só com estes arquivos, ele fica ao lado de `router.mjs`.

Resultado inicial: cinco testes locais aprovados; aceitação independente com 16 aprovados e duas falhas. Código de saída 1 é esperado somente para essas duas falhas, não para arquivo ausente ou erro de sintaxe.

## Contrato

- Ignorar caixa e acentos
- Palavras inteiras senha/login/permissão → acessos
- Conexão/Wi-Fi/rede → infraestrutura
- Erro 500/aplicativo → aplicacoes
- Nenhuma categoria ou mais de uma → revisao_humana
- Duas palavras da mesma categoria continuam sendo uma categoria
- Entrada ausente ou não textual → revisao_humana, sem lançar erro

Acrescente testes de regressão antes de corrigir. Preserve os testes existentes e `verify.mjs`. Ao terminar, execute os dois comandos: todas as verificações devem passar. Explique por que retornar na primeira correspondência quebra o contrato.

Sem dependências, chamadas externas, push, PR, merge ou deploy. Para repetir, guarde o resultado e use outra cópia original da candidata.
