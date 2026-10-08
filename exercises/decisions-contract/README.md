# Exercício offline · ler uma resposta de Decisions

Este exercício usa o contrato TypeScript e o estado da Alô, TI com respostas locais. Nenhuma API, servidor ou microfone é iniciado. Precisa somente de Node.js 24.21.0 ou posterior e do repositório clonado.

## Execute e compare

Na raiz do repositório:

```sh
node exercises/decisions-contract/inspect.mts exercises/decisions-contract/fixtures/completo.json
```

Trecho esperado:

```json
{
  "team": "applications",
  "score": 1.25,
  "canCreateBeforeReview": false,
  "canCreateAfterReview": true,
  "ticketCreated": false
}
```

Repita trocando `completo.json` por `incerto.json`, `recusado.json` e `equipe-invalida.json`.

- Completo: aplicação sugerida, score fracionário preservado, confirmação necessária
- Incerto: equipe `human`, mesmo com uma `choice` de alta confiança; faltou contexto
- Recusado: `CONTRATO_REJEITADO`; saída 1 esperada
- Equipe inválida: `CONTRATO_REJEITADO`; saída 1 esperada

O valor `source: openai` usado internamente pertence ao contrato do adaptador. Neste script, os dados são fixtures, como o campo `mode` da saída informa. Essa marca não prova que uma inferência aconteceu.

## Pequeno desafio

Copie `incerto.json` pelo editor para `minha-resposta.json`, sem alterar o original.

1. Na resposta com `name: "contexto"`, mude somente `probability` de 0.4 para 0.96. Preveja a equipe e execute o script com o novo caminho
2. Na resposta com `name: "equipe"`, reduza `confidence` para 0.5. Preveja novamente: a equipe deve voltar a `human`
3. Troque o score por 1.75. O valor fracionário deve ser preservado; não remova o bloqueio humano
4. Duplique uma resposta no array `answers`. O contrato deve recusar o conjunto

Registre uma frase por tentativa: entrada alterada, resultado esperado, resultado observado. Esses números exercitam limites didáticos; não medem a qualidade de um modelo.

## Onde olhar

- [`buildDecisionRequest` e `parseDecision`](../../apps/decisions/src/domain/live-contract.ts)
- [`deskReducer` e `canCreate`](../../apps/decisions/src/domain/service-desk.ts)
- [Testes do exercício](inspect.test.mts)

```sh
node --test exercises/decisions-contract/inspect.test.mts
```

Esperado: cinco testes aprovados. Para aprofundar, acrescente um teste para a resposta duplicada antes de criar sua fixture correspondente.

## Se precisar recomeçar

Use os JSONs originais e salve sua tentativa com outro nome. `ARQUIVO_INVALIDO` indica caminho ou JSON ilegível; `CONTRATO_REJEITADO` significa que o arquivo foi lido, mas a resposta não foi aceita. Um erro esperado não deve ser tratado como sucesso da API.

[Voltar ao LAB Decisions](../../labs/02-decisions-typescript/README.md)
