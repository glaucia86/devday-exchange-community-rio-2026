# Como verificar esta cópia

Rode os testes com:

```sh
node --test --test-isolation=none router.test.mjs
```

No sandbox do Codex, `node --test router.test.mjs` sem `--test-isolation=none` pode mostrar só o resumo do arquivo (`tests 1`, `fail 1`) e esconder qual teste falhou. Informe o nome do teste e a diferença entre esperado e recebido.

Não instale dependências, não acesse a rede do projeto e não altere arquivos fora desta pasta. Não faça commit nem push.
