# LAB · Dots: contexto, limites e revisão

[Início](../../README.md) · [Guia da apresentadora](../../docs/guia-apresentadora.md) · [Referências](../../docs/referencias.md)

## O que você vai aprender

Transformar uma intenção em uma tarefa verificável, corrigir o contexto e revisar a entrega antes de qualquer ação externa. Você será a pessoa que prepara um resumo de suporte da empresa fictícia Aurora.

**Para fazer em casa:** reproduza a demonstração de Dots do [guia da apresentadora](../../docs/guia-apresentadora.md#dots): os mesmos três relatos, a correção de A-102 e a revisão final. No evento, você acompanha Glaucia; não precisa executar os passos junto com ela.

**Sua entrega:** um resumo revisado, uma correção conferida e uma frase explicando o que você ainda precisa decidir. Estimativa de estudo em casa: 10–15 minutos, ainda não medida.

**O que já foi testado:** o cenário e os critérios foram revisados. O exercício ainda não foi ensaiado em uma conta com dots. Executar os testes do repositório não valida este fluxo.

## Essencial e opcional

Para reproduzir a demo, faça as quatro etapas de **Passo a passo em casa**. O desafio final é opcional. Não precisa de terminal, Git ou programação.

Três ideias vão orientar sua revisão: **contexto** são os dados fornecidos; **escopo** é o que foi pedido; **evidência** é o trecho que sustenta uma afirmação. Uma hipótese pode ser útil como pergunta, mas não deve aparecer como fato confirmado.

## Antes de começar

Abra o ChatGPT no navegador desktop ou aplicativo desktop e procure dots. Siga a introdução descrita no [guia oficial](https://learn.chatgpt.com/docs/dots/getting-started). Você pode pular a conexão de aplicativos e computador: este LAB só usa texto fictício colado na conversa. Não precisa clonar o repositório, instalar pacotes ou criar uma chave.

A disponibilidade depende do rollout e da conta. Se dots não aparecer, confira [Meet dots](https://learn.chatgpt.com/docs/dots) e use a alternativa de revisão manual ao final. Não altere seu plano para concluir o exercício.

### Confira seu ponto de partida

Você deve conseguir abrir a conversa do dot e ver um campo para enviar uma mensagem. Mantenha o cenário em outra aba. Se o produto pedir conexões opcionais, pule-as; o único dado necessário é o texto fictício do exercício. Se você não conseguir localizar dots na conta, pare o caminho do produto e siga a alternativa manual, sem usar um chat comum como prova de que dots foi testado.

## Passo a passo em casa

### 1. Prepare o pedido

Abra o [cenário Aurora](cenario.md). Antes de enviar qualquer coisa, responda:

- Qual relato não diz nem qual serviço falhou?
- Dizer “urgente” basta para escolher uma prioridade?
- Qual é a única entrega que está autorizada?

**Confira:** A-103 está incompleto; urgência declarada não mede impacto; a entrega é apenas um resumo nesta conversa.

### 2. Envie contexto e pedido juntos

No cenário, selecione o conteúdo do primeiro bloco, começando por “Vamos praticar...” e terminando em “Não invente prazo, prioridade ou responsável.”. Copie com Ctrl+C (Command+C no Mac), volte à conversa do dot, cole no campo de mensagem e envie pelo botão de enviar. Aguarde a resposta antes de mandar a correção. Não envie apenas o pedido final.

Leia a resposta procurando evidências:

| Caso | Deve aparecer | Não pode ser inventado |
| --- | --- | --- |
| A-101 | Uma pessoa afetada; falha após trocar a senha | Que a causa já foi diagnosticada |
| A-102 | Quatro pessoas; erro 500; alternativa não informada | Que não existe alternativa |
| A-103 | Serviço e impacto desconhecidos | Uma equipe, responsável ou prioridade |

**Pare aqui se:** o resumo abriu um ticket, enviou uma mensagem ou pediu acesso privado. Essas ações não fazem parte do LAB. Se o texto inventar algo, cite a frase e peça uma versão corrigida antes de continuar.

**Se a resposta não passar no checklist**, envie, por exemplo:

```text
No A-102, o cenário diz “alternativa não informada”. Você escreveu que
não há alternativa. Corrija essa afirmação sem mudar os demais fatos.
Continue produzindo somente o resumo nesta conversa.
```

Esse pedido aponta o problema e a evidência. Evite somente dizer “está errado”, porque isso não explica qual fato precisa mudar.

### 3. Corrija um fato e confira o restante

Na mesma conversa, envie o segundo bloco do cenário. Não substitua a primeira mensagem: a intenção é observar como o dot revisa uma informação depois de receber uma correção. A-102 passa a afetar duas pessoas e possui uma alternativa pelo aplicativo móvel.

**Confira:** a nova versão mostra os dois fatos alterados, preserva A-101 e continua tratando A-103 como incompleto. Uma resposta fluente que ainda diz “quatro pessoas” não passa na revisão.

### 4. Registre sua decisão

Preencha, nas suas anotações:

- Aceitei o resumo porque: …
- Pedi correção ou esclarecimento sobre: …
- Continuou sendo minha decisão: …

**Critério de conclusão:** fatos corretos, lacunas explícitas, nenhuma prioridade inventada e nenhuma ação externa. A redação pode variar. Confira depois o [exemplo comentado](cenario.md#exemplo-de-revisao).

## Se algo não funcionar

- **Dots não aparece:** revise manualmente o exemplo comentado do cenário usando o mesmo checklist. Você pode fazer isso por conta própria em casa. Isso pratica revisão, mas não é um teste do produto
- **Resposta longa:** reforce o limite de 150 palavras e peça somente os três relatos
- **Resposta misturou suposição com fato:** destaque a afirmação e pergunte qual trecho do cenário a sustenta
- **Para repetir:** envie o cenário original novamente, dizendo “Nova rodada deste exercício: use somente os relatos abaixo e desconsidere as correções da rodada anterior”. Confira os fatos; não presuma que abrir outra conversa apaga contexto ou memória

## Depois do encontro, se quiser aprofundar

Acrescente um quarto relato fictício com informação contraditória. Peça ao dot para apontar a contradição antes de resumir. Compare a primeira resposta e a revisão: qual mudança reduziu o risco de alguém agir com informação errada?
