# Ponto de partida · encaminhador fictício

Esta pasta é independente e pode ser copiada para um diretório ou repositório de exercício. Requisito: Node.js 22.18 ou posterior. Não precisa instalar pacotes nem configurar chaves.

## Linha de base

```bash
node --test router.test.mjs
```

Resultado inicial esperado: **3 testes aprovados**. O código reconhece apenas “senha” em minúsculas e pede revisão humana nos outros casos.

## Desafio

Amplie routeTicket(text) para:

- Normalizar maiúsculas/minúsculas e acentos
- Reconhecer palavras inteiras e retornar acessos quando encontrar senha, login ou permissão
- Retornar infraestrutura quando encontrar conexão, Wi-Fi ou rede
- Retornar aplicacoes quando encontrar erro 500 ou aplicativo
- Retornar revisao_humana quando nenhum grupo ou mais de um grupo corresponder
- Duas palavras da mesma categoria não criam ambiguidade
- Retornar revisao_humana para entrada ausente ou não textual, sem lançar erro

Escreva testes para caixa alta, acentos, erro do aplicativo, categorias conflitantes, texto vazio e entrada ausente. Execute-os antes da mudança e observe as falhas. Implemente e execute a suíte toda.

Sem dependências, acesso à rede, APIs ou efeitos externos. Não faça commit, push, merge ou deploy como parte do exercício. Depois confira a alteração e explique cada regra.

## Reset

Guarde a tentativa. Faça uma nova cópia desta pasta a partir do material original para recomeçar, sem apagar o trabalho anterior.

