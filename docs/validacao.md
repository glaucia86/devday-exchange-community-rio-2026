# Estado da validação

[Início](../README.md) · [Guia da apresentadora](guia-apresentadora.md)

**Atualizado em 7 de outubro de 2026.** Este registro distingue material escrito, comportamento testado e integração real.

## Verificações observadas

| Verificação | Resultado |
| --- | --- |
| Encaminhador starter | 3 testes aprovados, Node.js 24.19.0 |
| Encaminhador solução | 8 testes aprovados, Node.js 24.19.0 |
| Domínio Mesa TI original | 11 testes aprovados após observar falhas iniciais |
| Proteção de fala obsoleta + domínio | 15 testes aprovados em avaliação em memória do texto atualizado, sem alterações no checkout |
| Build Next.js / TypeScript | Não executados; dependências ainda não instaladas e fixadas |
| Interface no navegador / acessibilidade visual | Não inspecionada |
| Áudio local efetivamente reproduzido | Não ensaiado |
| GPT-Live + Decisions | Não conectado; nenhuma chamada real feita |
| Dots / Codex CLI / Codex Cloud | Guias disponíveis; fluxos nos produtos ainda não ensaiados |

A suíte de fala verifica seleção e invalidação da resposta textual a ser narrada; não comprova saída de áudio pelo dispositivo. O conjunto atual contém 26 testes: 3 starter, 8 solução e 15 Mesa TI.

## Como repetir as verificações sem serviços externos

Node.js 22.18 ou posterior, na raiz:

```bash
node --test exercises/ticket-router/starter/router.test.mjs
node --test exercises/ticket-router/solution/router.test.mjs
node --test apps/decisions/tests/*.test.mts
```

O workflow de verificações, quando aceito pelo GitHub, usa runner padrão público, permissões de leitura, Node.js 24 e essas suítes. Não recebe segredos, não chama OpenAI, não publica nem faz deploy. O resultado de Actions deve ser conferido no commit correspondente; a presença do arquivo de workflow não significa que uma execução passou.

## Bloqueios antes de chamar a interface de reproduzível

1. Resolver e instalar dependências, registrar versões e gerar lockfile
2. Executar typecheck, testes e build contra os mesmos arquivos
3. Inspecionar desktop, celular, teclado, contraste e redução de movimento
4. Testar edição durante análise, reset, clique repetido, erro e áudio indisponível
5. Ensaiar a leitura com voz local, se utilizada
6. Para a experiência OpenAI, obter acesso/configuração/autorização e validar o fluxo de voz completo separadamente

## Registro dos próximos ensaios

Adicionar uma entrada com data, commit, ambiente, versão do Node, comandos, resultado observado e limitações. Registrar falhas como falhas. Não substituir essa informação por “deve funcionar”.
