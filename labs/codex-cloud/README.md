# LAB · Codex Cloud: delegar e revisar uma tarefa remota

[Início](../../README.md) · [Exercício](../../exercises/ticket-router/README.md) · [Guia da apresentadora](../../docs/guia-apresentadora.md)

## Objetivo

Delegar uma mudança pequena em um ambiente remoto e revisar o resultado antes de integrá-lo. O material usa o mesmo encaminhador fictício do LAB CLI; o aprendizado aqui é preparação do ambiente, contexto da tarefa e conferência da entrega remota.

**Status:** exercício local disponível e testado; execução de uma tarefa real no Codex Cloud ainda não ensaiada neste material. Acesso, provedor Git e permissões dependem da conta.

## Preparação

Leia o [guia oficial de Codex Cloud](https://learn.chatgpt.com/docs/cloud). Use um repositório de exercício seu contendo uma cópia do starter. Revise o público e as permissões antes de conectar qualquer repositório. Não conecte projetos de trabalho para acompanhar o LAB. O ambiente precisa de Node.js 22.18+; o exercício não precisa de pacotes, chaves de API ou serviços externos. Sugestão: 15–20 minutos, além de eventual configuração da conta.

## Passo a passo em casa

1. Confira os arquivos de `exercises/ticket-router/starter` e rode localmente os 3 testes. **Resultado:** você conhece a linha de base.
2. Prepare seu repositório de exercício e selecione o ambiente correspondente no Codex Cloud, conforme a documentação da sua conta. **Confira:** é a cópia fictícia, não outro projeto.
3. Envie o pedido:

   > Neste repositório de exercício, melhore routeTicket conforme o desafio do README: normalizar caixa e acentos; distinguir acessos, infraestrutura e aplicações; pedir revisao_humana para nenhuma ou múltiplas categorias. Use testes antes da mudança e execute a suíte toda. Sem dependências, chamadas externas, publicação, merge ou deploy. Ao terminar, informe arquivos alterados, comandos, resultados e limitações.
4. Acompanhe o estado da tarefa. **Confira:** execução pendente, falha e conclusão são situações diferentes. Não interprete uma resposta de texto como prova de que os testes rodaram.
5. Quando a tarefa terminar, abra as alterações e os resultados de teste no ambiente da tarefa. **Confira:** casos de caixa alta, acentos, ambiguidade e entrada ausente estão cobertos; nenhuma mudança foge do exercício.
6. Compare o resultado com a solução de referência e decida se aceitaria a alteração. **Resultado:** revisão concluída. O LAB não exige criar PR, fazer merge ou publicar nada.

## Alternativa offline, erros e reset

- **Cloud indisponível:** leia a solução e seus testes como uma entrega que você recebeu; anote o que aceitaria ou pediria para mudar. Não equivale a executar uma tarefa remota
- **Ambiente sem Node:** confira a preparação do ambiente, sem tratar uma falha de setup como erro do código
- **Resultado sem logs de testes:** peça os comandos e resultados ou execute você mesmo na cópia
- **Reset:** use outra cópia do starter em uma nova tarefa. Preserve o trabalho anterior para comparar

O [LAB CLI](../codex-cli/README.md) mostra a mesma revisão com execução acompanhada no terminal.
