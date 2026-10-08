# LAB · Codex Cloud: revisar uma entrega que parece pronta

[Início](../../README.md) · [Exercício](../../exercises/ticket-router/README.md) · [Guia da apresentadora](../../docs/guia-apresentadora.md)

## Objetivo

Delegar uma correção em ambiente remoto e decidir se a entrega pode ser aceita. Você receberá uma candidata com cinco testes verdes e um defeito intencional: ela escolhe a primeira equipe encontrada, mesmo quando o relato envolve mais de uma.

**Para fazer em casa:** reproduza a demonstração Cloud do [guia da apresentadora](../../docs/guia-apresentadora.md#codex-cloud): mesma candidata preparada, tarefa remota e revisão. Ela continua o contexto de encaminhamento mostrado no CLI, mas usa uma cópia com defeito intencional para estudar revisão. Não é apresentada como uma falha produzida pelo CLI.

**Sua entrega:** uma tarefa concluída, um diff revisado e evidências de que a regressão foi corrigida. Estimativa de estudo em casa: 15–20 minutos, além da configuração da conta; duração não medida. Não é necessário ter feito o LAB CLI. No evento, o público apenas acompanha Glaucia.

**Validação:** a candidata, suas falhas esperadas e a solução são testadas offline. Ainda não houve ensaio deste roteiro em uma conta Codex Cloud. Conta, permissões e consumo precisam ser conferidos por quem participa.

## 1. Conheça o defeito antes de delegar

Após [clonar o material](../../README.md#preparacao), abra o terminal na raiz do repositório:

```sh
node --test exercises/ticket-router/review-candidate/router.test.mjs
node exercises/ticket-router/verify.mjs exercises/ticket-router/review-candidate/router.mjs
```

**Esperado:** os cinco testes da candidata passam, mas a verificação independente mostra `ACCEPTANCE {"total":18,"passed":16,"failed":2}`. Os relatos com duas equipes falham. O primeiro caso devolve `acessos` quando deveria devolver `revisao_humana`.

Antes de seguir, explique: por que cinco testes aprovados não bastaram?

## 2. Prepare um repositório só para o exercício

Na sua conta GitHub, crie um repositório de exercício vazio. Revise a visibilidade e use somente estes quatro arquivos na raiz:

| Origem neste material | Nome no seu repositório |
| --- | --- |
| `exercises/ticket-router/review-candidate/README.md` | `README.md` |
| `exercises/ticket-router/review-candidate/router.mjs` | `router.mjs` |
| `exercises/ticket-router/review-candidate/router.test.mjs` | `router.test.mjs` |
| `exercises/ticket-router/verify.mjs` | `verify.mjs` |

Você pode usar **Add file → Upload files** no GitHub e confirmar esses arquivos. Não envie a demo completa, dados de trabalho ou credenciais. Anote o nome do repositório para não selecionar outro projeto no próximo passo. Essa preparação fica fora do tempo de prática sugerido.

## 3. Prepare e publique o ambiente

O [guia oficial atual](https://learn.chatgpt.com/docs/environments/cloud-environments) descreve este caminho no ChatGPT web/desktop. Rótulos podem variar com idioma e rollout:

1. Abra **Work in → Cloud → Select environment → Create environment**.
2. Selecione o repositório fictício. Se precisar conectar GitHub, confira os repositórios e permissões solicitados antes de aceitar.
3. Em **Get started**, peça Node.js 22.18+ e a execução de `node --version` e `node --test router.test.mjs`. Não há `npm install` neste projeto.
4. Revise o relatório de preparação: Node compatível, os quatro arquivos na raiz e cinco testes aprovados.
5. Salve, escolha **Publish** e espere **Environment published**. Aqui, publicar cria o ambiente reutilizável do Codex; não coloca uma aplicação na internet.
6. Escolha **Start a new task** nesse ambiente.

Salvar uma configuração não significa que o ambiente já foi publicado. Se a conta não oferecer esse fluxo, siga a documentação atual e a alternativa offline, sem mudar permissões às pressas. [Acesso e autenticação](https://learn.chatgpt.com/docs/auth).

## 4. Envie uma tarefa delimitada

```text
Revise a candidata routeTicket em router.mjs deste repositório fictício.
Ela passa os cinco testes atuais, mas relatos que combinam categorias
não podem ser encaminhados automaticamente.

Contrato: ignorar caixa e acentos; palavras inteiras senha/login/permissão
retornam acessos; conexão/Wi-Fi/rede retornam infraestrutura;
erro 500/aplicativo retornam aplicacoes. Nenhuma categoria ou mais de
uma categoria retorna revisao_humana. Duas palavras da mesma categoria
não são ambiguidade. Entrada ausente ou não textual deve ser segura.

1. Execute node --test router.test.mjs e node verify.mjs router.mjs.
2. Mostre os casos que falham e acrescente testes de regressão antes do fix.
3. Faça a menor correção em router.mjs e execute ambas as verificações.
4. Não altere verify.mjs nem reduza o contrato para deixar os testes verdes.
Sem dependências, chamadas externas, push, PR, merge ou deploy.
Ao terminar, informe causa, arquivos alterados, comandos, saídas e limites.
```

A tarefa usa o acesso/consumo do Codex; o código do exercício não chama APIs. A restrição a chamadas externas diz respeito às ações no projeto.

## 5. Revise antes de aceitar

Acompanhe a tarefa: pendente, executando, falha e concluída são estados diferentes. Quando terminar:

- Abra os arquivos alterados e os logs. Procure a falha antes da correção e os resultados depois
- Confira que os novos testes cobrem “senha + conexão” e “aplicativo + rede”, além de preservar “senha + login”
- Rode novamente `node --test router.test.mjs` e `node verify.mjs router.mjs` no ambiente da tarefa
- Espere `18` aprovados e `0` falhas na aceitação; confira que `verify.mjs` não foi alterado
- Compare a lógica com a [solução de referência](../../exercises/ticket-router/solution/router.mjs) somente após sua revisão

**Critério de conclusão:** você consegue apontar o defeito original, explicar a correção e citar os testes que a comprovam. O LAB termina na revisão. Não precisa abrir PR, integrar código ou publicar uma aplicação.

## Problemas, alternativa offline e reset

- **Ambiente sem Node ou arquivos ausentes:** volte ao relatório de preparação; não confunda erro de setup com defeito da função
- **Tarefa sem logs:** peça a execução e a saída dos dois comandos; texto afirmando “passou” não basta
- **Verificador alterado:** restaure a cópia original do material antes de aceitar o resultado
- **Cloud indisponível:** faça a correção em uma cópia local da candidata e rode os mesmos comandos. Isso valida o exercício, não o produto Cloud
- **Para repetir:** inicie uma nova tarefa a partir da candidata original. Não reaproveite silenciosamente arquivos já corrigidos; preserve o resultado anterior para comparação

## Depois do encontro, se quiser aprofundar

Revise uma segunda entrega sem olhar a solução. Escreva um parecer curto: “aceitaria”, “pediria mudanças” ou “evidência insuficiente”, com dois fatos do diff ou dos testes. Compare com a revisão que você fez no terminal no [LAB CLI](../codex-cli/README.md).
