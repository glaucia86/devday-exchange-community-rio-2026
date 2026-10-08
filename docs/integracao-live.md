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

Abra http://127.0.0.1:3000. Mantenha o terminal aberto. O mock não usa a chave. Este fluxo ainda não foi ensaiado em Windows; os comandos seguem os scripts do repositório e devem ser conferidos no computador de destino.

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

Faça um ensaio curto:
- Diga um relato fictício de falha de acesso.
- Confira transcrição e equipe sugerida.
- Corrija um detalhe por texto e depois por voz.
- Confira que a revisão anterior foi invalidada.
- Revise os campos e confirme apenas o ticket simulado.
- Clique em Encerrar conversa e espere a confirmação. Confira o consumo na plataforma.

Se a finalização não for confirmada, não reinicie sessões em sequência. Verifique a sessão/consumo antes de reiniciar o servidor. Criar a sessão já pode gerar custo, mesmo se a conexão ou o microfone falharem depois.

Ao terminar, volte MESA_LIVE_ENABLED para false e reinicie ou encerre o servidor. Revogar a chave na plataforma, quando necessário, é uma ação separada.

## Como o código funciona

- Navegador: áudio WebRTC, canal oai-events, transcrições incrementais, delegação client e resposta falada
- Servidor: POST /v1/live/sessions com gpt-live-1; POST /v1/decisions com gpt-6-luna
- Decisions: predicate/contexto, choice/equipe e score/impacto; respostas recusadas ou inválidas não viram sugestões
- Aplicativo: sessão e revisão descartam resultados atrasados; correções digitadas sobrevivem à fala seguinte
- Pessoa: só o clique explícito cria o ticket fictício. Fala posterior não apaga um ticket confirmado
- Encerramento: session.close no cliente e sideband autenticado no servidor; confirmação por session.closed

Os limiares 0,8 para contexto e 0,7 para confiança são didáticos e ainda não calibrados. Score de 0 a 2 pode ser fracionário; não é prioridade operacional. O texto explicativo é composto pelo aplicativo, não uma justificativa livre gerada por Decisions.

## Limites e segurança

Somente loopback HTTP, com Host/Origin correspondentes e autenticação por código local. Não exponha por túnel, proxy ou hospedagem pública. Não há login empresarial, banco de dados, controle de desktop, Jira, ServiceNow ou ticket externo.

Uma sessão por processo, até três inicializações e 30 análises por dez minutos. Corpo máximo de 64 KiB, SDP de até 60 mil caracteres e relato limitado a 8 mil caracteres. A transcrição da interface tem limite total de 8 mil caracteres.

Cliente e servidor pedem fechamento após dois minutos. Perda do sideband bloqueia novas inferências e tenta uma reconexão limitada, exclusivamente para fechar a mesma sessão. Uma finalização confirmada é idempotente. Timeouts não são tratados como sucesso, e resultados incertos bloqueiam novos inícios no processo.

Esses controles não são um teto financeiro: queda do processo ou da rede pode impedir o encerramento remoto. Reiniciar o processo também reinicia contadores em memória. Não use esta demo como serviço público ou controle de gastos de produção.

A gravação persistida da sessão é desabilitada com store: false; isso não substitui a política de dados da conta.

## Fontes oficiais consultadas em 7/10/2026

- [Voz com Decisions](https://developers.openai.com/api/docs/guides/decisions-voice)
- [WebRTC](https://developers.openai.com/api/docs/guides/voice-webrtc)
- [Criar sessão Live](https://developers.openai.com/api/reference/resources/live/methods/create)
- [Delegação client](https://developers.openai.com/api/docs/guides/live-delegation?delegation-mode=client)
- [Sideband](https://developers.openai.com/api/reference/resources/live/sideband-websocket)
- [Sessões e fechamento](https://developers.openai.com/api/docs/guides/live-conversations)
- [Decisions](https://developers.openai.com/api/docs/guides/decisions)
