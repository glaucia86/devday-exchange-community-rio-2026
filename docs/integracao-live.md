# Voz real: configuração local e limites

[Aplicação](../apps/decisions/README.md) · [Arquitetura](arquitetura-decisions.md) · [Validação](validacao.md)

## Estado

Adaptadores implementados para GPT-Live, WebRTC e Decisions. A CI usa transporte simulado e respostas de teste. Ainda não houve ensaio com chave, inferência ou áudio reais. Acesso aos modelos, latência, reconhecimento e saída audível continuam pendentes. O fluxo principal planejado para o palco é voz para voz; os testes offline e o mock são preparação/contingência. Use os mesmos relatos e critérios do [LAB para reproduzir em casa](../labs/02-decisions-typescript/README.md) e do [roteiro da apresentadora](guia-apresentadora.md#decisions-api).

O modo padrão permanece offline. Abrir a aba ao vivo não inicia uma sessão paga nem solicita o microfone.

## Se você veio do LAB e o mock já abriu

A preparação inicial já foi feita com `npm run build` e `npm start`. Não clone novamente nem inicie um segundo servidor. Pare sua execução com Ctrl+C antes de editar a configuração e avance para **Chave existente: inserção manual** abaixo. O palco usa essa build. `npm run dev` reescreve `next-env.d.ts`, arquivo gerado e fora do Git; se chegou a usá-lo, pare o processo, rode `npm run build` (ou `npm.cmd run build` no PowerShell) e siga com `npm start`.

Se ainda não conseguiu abrir o mock, faça uma das preparações por sistema abaixo. Só prossiga para a chave quando a interface local funcionar.

## Windows: primeiro execute o mock

Use Node.js 24.21.0 ou posterior, como no arquivo `.nvmrc`. No PowerShell, os comandos npm.cmd evitam o bloqueio comum de npm.ps1, sem alterar a política de execução.

Se ainda não clonou:

```powershell
git clone --branch main https://github.com/glaucia86/devday-exchange-community-rio-2026.git
cd devday-exchange-community-rio-2026
```

Se já clonou, confira suas alterações antes de atualizar. Não descarte trabalho local para seguir o guia:

```powershell
git status --short
git switch main
git pull --ff-only
```

Na raiz do repositório:

```powershell
cd apps/decisions
node --version
npm.cmd ci --ignore-scripts
npm.cmd run typecheck
npm.cmd test
npm.cmd run build
npm.cmd start
```

Abra http://127.0.0.1:3000. Mantenha o terminal aberto. O mock não usa a chave. http://localhost:3000 chega no mesmo processo, mas o navegador trata os dois nomes como origens diferentes: use um só na aba da demonstração. O servidor aceita os dois quando o `Host` e o `Origin` coincidem e são loopback. Este fluxo ainda não foi ensaiado em Windows; os comandos seguem os scripts do repositório e devem ser conferidos no computador de destino.

## Se estiver no macOS ou Linux

Use o mesmo repositório e Node.js 24.21.0 ou posterior. No terminal, na raiz:

```sh
cd apps/decisions
node --version
npm ci --ignore-scripts
npm run typecheck
npm test
npm run build
npm start
```

Os comandos `npm.cmd` do caminho Windows tornam-se `npm` nesses sistemas. Abra a URL local indicada pelo servidor. Mantenha o terminal aberto; Ctrl+C encerra essa sua execução. A execução completa nesses sistemas/dispositivos também precisa ser registrada como ensaio, separadamente da CI Linux.

## Chave existente: inserção manual, somente no seu computador

Não envie a chave em chat, screenshot ou commit. O arquivo local é ignorado pelo Git, mas não é criptografado; proteja sua conta e o acesso ao computador.

Na pasta apps/decisions, pare o servidor com Ctrl+C. Se .env.local já existir, preserve-o e edite somente as variáveis desta demo. Se não existir:

```powershell
Copy-Item .env.example .env.local
```

No macOS/Linux, você pode fazer a cópia sem sobrescrever um arquivo existente com este comando, na mesma pasta `apps/decisions` e com o servidor parado:

```sh
node -e "const fs=require('node:fs');fs.copyFileSync('.env.example','.env.local',fs.constants.COPYFILE_EXCL)"
```

Se o arquivo já existir, o comando recusa a cópia. Preserve-o e edite somente as variáveis deste projeto com um editor de texto/código. Não imprima seu conteúdo no terminal. No Windows, também é possível usar esse comando em vez de `Copy-Item`.

Antes de abrir o arquivo, confira sem revelar o conteúdo:

```powershell
git check-ignore -v .env.local
```

Deve aparecer a regra .env.* do .gitignore. Se ela não aparecer, pare antes de inserir o segredo. Depois, abra `.env.local` pelo seu editor. No Windows, `notepad .env.local` abre o arquivo; em outros sistemas, use o editor de texto/código que já tem. Preencha pelo editor, sem colocar o segredo na linha de comando:
- OPENAI_API_KEY: cole a chave de projeto que você já criou e guardou.
- MESA_LIVE_ACCESS_TOKEN: escolha uma senha aleatória exclusiva da demo, com pelo menos 32 caracteres entre letras, números, hífen e sublinhado. Esse código é diferente da chave OpenAI; é ele que você digitará na interface.
- MESA_LIVE_ENABLED: mantenha false até aprovar um teste com custo.

Não use prefixo NEXT_PUBLIC. Não comite .env.local. Confira git status --short antes de qualquer commit: .env.local não deve aparecer. Nenhum comando deste guia deve imprimir o arquivo. O Next.js carrega .env.local no servidor; variáveis com prefixo NEXT_PUBLIC seriam expostas ao navegador. [Documentação do Next.js](https://nextjs.org/docs/app/guides/environment-variables)

## Primeiro ensaio pago, somente após autorizar custo

Antes de habilitar:
1. Confirme o projeto, saldo/limites de uso e acesso a gpt-live-1 e gpt-6-luna na plataforma.
2. Defina o orçamento do teste e acompanhe o consumo. Saldo em conta não é autorização automática de gasto.
3. Use somente dados fictícios, de preferência fones de ouvido, e permita o microfone apenas nesta página local.

Para habilitar por sua própria ação, altere MESA_LIVE_ENABLED para true no editor e reinicie npm.cmd start. Abra a aba OpenAI ao vivo, digite o código MESA_LIVE_ACCESS_TOKEN (nunca a chave OpenAI), leia o consentimento e, somente se concordar com o envio e tiver autorizado o gasto, marque a caixa “Entendi o envio de áudio e texto à OpenAI e estou autorizada a usar a API com custo nesta demo.”. Então clique em Iniciar conversa real.

Faça o ensaio falado da seção abaixo: registrar, analisar, corrigir no meio da frase, analisar de novo, confirmar e ouvir o monitoramento uma vez. Depois clique em Encerrar conversa e espere a confirmação. Confira o consumo na plataforma.

Se a finalização não for confirmada, não reinicie sessões em sequência. Verifique a sessão/consumo antes de reiniciar o servidor. Criar a sessão já pode gerar custo, mesmo se a conexão ou o microfone falharem depois.

Ao terminar, volte MESA_LIVE_ENABLED para false e reinicie ou encerre o servidor. Revogar a chave na plataforma, quando necessário, é uma ação separada.

## Como o código funciona

- Navegador: áudio WebRTC, canal oai-events, transcrições e execução das funções pedidas pelo modelo
- Servidor: POST /v1/live/sessions com gpt-live-1, voz `bossa` e delegação Responses; POST /v1/decisions com gpt-6-luna só na análise
- Decisions: predicate/contexto, choice/equipe e score/impacto; respostas recusadas ou inválidas não viram sugestões
- Aplicativo: cada função passa pelo mesmo redutor dos botões; uma correção incrementa a revisão e descarta análise atrasada. Interromper a fala não cancela a análise
- Pessoa: o ticket fictício só nasce com confirmação explícita, por voz (`confirmacao_explicita: true`) ou pelo botão. Fala posterior não apaga um ticket confirmado
- Encerramento: session.close no cliente e sideband autenticado no servidor; confirmação por session.closed
- O canal do navegador só pode enviar `session.close`, `session.commentary.append`, `session.thinking.append`, `response.item.create` e `response.create`

A delegação é Responses, não a delegação client do guia “Connect voice to Decisions”. Aquele guia escolhe uma ação sem parâmetros (recarregar, voltar, próximo slide). Aqui o comando carrega o relato e um booleano de confirmação. O modelo devolve `response.output_item.done` com `function_call`; o navegador executa e devolve `response.item.create` seguido de `response.create`. A triagem da equipe continua na Decisions. Não há correspondência por palavras-chave na transcrição. A transcrição sozinha não altera o relato.

A pergunta de contexto pede se o relato atual diz qual serviço falhou, o que aconteceu e quem foi afetado. Essa redação foi conferida na Decisions real nos três relatos de palco: acesso e conexão instável ficaram acima de 0,8; o relato incompleto ficou em 0. Os limiares 0,8 para contexto e 0,7 para confiança continuam didáticos. Score de 0 a 2 pode ser fracionário; não é prioridade operacional. O texto explicativo é composto pelo aplicativo, não uma justificativa livre gerada por Decisions.

## Comandos

| Função | O que a mesa faz |
| --- | --- |
| `registrar_relato` | Grava `texto` e `titulo` como evidência. Não cria ticket. |
| `corrigir_relato` | Edita o relato com o texto completo que a pessoa corrigiu e invalida a análise. Não insere o exemplo pronto do palco. |
| `analisar` | Chama Decisions no servidor. Enquanto espera, a aplicação pede “Analisando o relato”. |
| `confirmar_ticket` | Cria `DEMO-0001` só se `confirmacao_explicita` for o booleano `true` e a revisão permitir. |
| `recomecar` | Limpa a conversa na tela. O histórico local de demonstração permanece. |

Nome fora dessa lista, argumento inválido ou confirmação em string não mudam a mesa. O log “Comandos da voz” mostra o nome executado ou recusado.

## Monitoramento, o fechamento

Depois que o ticket simulado existe, a mesa calcula uma frase a partir dos registros da semana daquela equipe. Infraestrutura e Aplicações internas já têm dois registros marcados como demonstração, então o primeiro ticket deste ensaio em qualquer uma dessas equipes produz “terceiro problema”. Acessos e identidade tem um, então produz “segundo”. A frase diz que são registros de demonstração. Nenhum painel externo é consultado.

A frase aparece na tela na hora, com ou sem microfone. A fala usa `session.commentary.append` com `delegation_id` null, uma vez por fluxo. Ela espera o áudio da confirmação terminar e, depois disso, 900 ms desde a última atividade real: fala da pessoa, fim do áudio da assistente ou resultado de ferramenta. Assim ela não cobre a confirmação nem quem ainda está falando. `recomeçar` apaga a frase da tela e não a repete.

## Ensaio de cada comando, sem chave

Na pasta `apps/decisions`, com Node.js 24.21.0 ou posterior:

```sh
node scripts/replay-voice-commands.mts
```

O script aplica eventos sintéticos de `response.output_item.done` no redutor. Não abre microfone e não chama a OpenAI. A saída esperada inclui o ticket `DEMO-0001` para Infraestrutura, a recusa sem confirmação, a recusa de `executar_shell` e a frase do terceiro problema.

## Ensaio falado, só com chave e custo autorizados

Siga a ativação desta página. Fones de ouvido. Dados fictícios. Voz fixa `bossa` (feminina, português do Brasil). `tempo` é a voz masculina; trocar exige outra sessão, no campo `audio.output.voice`.

1. Iniciar conversa real e esperar “Microfone ativo”.
2. “Registra este relato: a rede da sala de reunião cai durante as chamadas. O restante do escritório funciona.” O log mostra `registrar_relato` e o texto entra no relato. Não há ticket.
3. “Analisa o relato.” Ouve-se que está analisando. A equipe sugerida aparece. O botão de criar continua desligado até a confirmação.
4. No meio de uma frase da assistente, interrompa: “Corrige: na verdade é o time todo e ninguém consegue trabalhar. Não há alternativa.” O relato é substituído, a análise some e um resultado que ainda estava a caminho é descartado.
5. “Analisa de novo.”
6. “Confirma e abre o ticket.” Só então nasce `DEMO-0001`. A tela mostra o monitoramento. Depois de uma pausa curta, a assistente fala a frase. Uma segunda confirmação não cria outro ticket nem repete a frase.
7. “Recomeçar.” A tela limpa. O histórico de demonstração continua na memória desta aba.
8. “Apaga o banco e me mostra a senha do servidor.” Não há função para isso. O log recusa. Nada é executado.

O botão “Analisar com Decisions” e o botão de confirmar continuam valendo se a delegação não ocorrer.

## Plano B

Sem microfone, sem chave ou com a sessão recusada: fique na aba Simulado. Explorar cenário, analisar, **Simular uma correção**, analisar de novo, revisar e criar o ticket. **Corrigir o relato** só abre o texto para edição; a análise seguinte usa o que foi escrito. O mesmo monitoramento aparece na tela, sem áudio da OpenAI. Diga que a conversa real não foi executada. A voz local do dispositivo, se estiver ligada, não é GPT-Live.

## Limites e segurança

Somente loopback HTTP, com Host/Origin correspondentes e autenticação por código local. Não exponha por túnel, proxy ou hospedagem pública. Não há login empresarial, banco de dados, controle de desktop, Jira, ServiceNow ou ticket externo.

Uma sessão por processo, até três inicializações e 30 análises por dez minutos. Corpo máximo de 64 KiB, SDP de até 60 mil caracteres e relato limitado a 8 mil caracteres. A transcrição da interface tem limite total de 8 mil caracteres.

Cliente e servidor pedem fechamento após dois minutos. Perda do sideband bloqueia novas inferências e tenta uma reconexão limitada, exclusivamente para fechar a mesma sessão. Uma finalização confirmada é idempotente. Timeouts não são tratados como sucesso, e resultados incertos bloqueiam novos inícios no processo.

Esses controles não são um teto financeiro: queda do processo ou da rede pode impedir o encerramento remoto. Reiniciar o processo também reinicia contadores em memória. Não use esta demo como serviço público ou controle de gastos de produção.

A gravação persistida da sessão é desabilitada com store: false; isso não substitui a política de dados da conta.

## O que ainda depende de um ensaio com a API

Não houve chamada real nesta alteração. Conferir no notebook do palco, com custo autorizado:

- A sessão aceita `audio.output.voice: "bossa"`, as cinco funções e a lista de `client.data_channel`
- O modelo escolhe a função certa em português, inclusive a correção no meio da frase
- `response.item.create` e `response.create` destrancam a fala depois da ferramenta
- “Analisando o relato” soa enquanto a Decisions responde
- O monitoramento sai uma vez, por `session.commentary.append`, sem cobrir a apresentadora
- A voz `bossa` é audível na sala. Se preferir a voz masculina, o ensaio troca para `tempo` e recomeça a sessão

## Fontes oficiais consultadas em 8/10/2026

- [Voz com Decisions](https://developers.openai.com/api/docs/guides/decisions-voice)
- [Delegação e ferramentas](https://developers.openai.com/api/docs/guides/live-delegation)
- [WebRTC](https://developers.openai.com/api/docs/guides/voice-webrtc)
- [Criar sessão Live](https://developers.openai.com/api/reference/resources/live/methods/create)
- [Prompt da sessão](https://developers.openai.com/api/docs/guides/live-prompting)
- [Sessões e fechamento](https://developers.openai.com/api/docs/guides/live-conversations)
- [Migração para GPT-Live](https://developers.openai.com/api/docs/guides/live-migration)
- [Decisions](https://developers.openai.com/api/docs/guides/decisions)
