# Correções e regressões da Triagem — 9 de outubro de 2026

[Validação geral](validacao.md) · [Checklist da participante](../labs/02-decisions-typescript/README.md)

Execução local na branch `dev/triagem-regressions-2026-10-09`, sobre `35eaa9722ebc84b5296eac5ca0ec13424bf05bd5`. Ambiente: Linux, Node.js 24.19.0, npm 11.9.0 e Chromium 151.0.7922.173. Dependências instaladas pelos lockfiles, sem mudanças de versão. O checklist dessa base foi preservado.

## Comportamentos corrigidos e evidência red/green

| Comportamento | Falha observada antes da correção | Verificação após a correção |
| --- | --- | --- |
| Relato A classifica enquanto B chega | Dois testes de domínio e dois de navegador falharam: o texto B era apagado após sucesso/429 | Só a fala capturada é consumida; 429 enfileira A. O navegador também classifica a fila e depois B, mantendo os dois cartões |
| Verbo interno e comando final | Domínio e navegador receberam `Não consigo` em vez de `Não consigo registrar ponto no portal desde as 9h` | O relato integral segue para classificação; apenas o comando final reconhecido é retirado. Infinitivos exigem início ou fronteira de frase para não cortar `para registrar` |
| Pausa/retomada com operação pendente | Cinco casos falharam: resposta antiga liberava os controles de B; pausar/encerrar não abortava a requisição | O controlador identifica e cancela a operação. Sucesso, 429 e erro antigos não alteram B, mesmo se o transporte ignorar o abort. Delegações repetidas não submetem outra requisição |
| Autoplay bloqueado | O teste falhou porque não havia controle acionável para permitir áudio | `Permitir áudio da assistente` tenta `play()` diretamente pelo gesto; rejeição repetida, recuperação e mute/unmute passam |
| Persistência indisponível | O navegador continuava exibindo `Quadro salvo` após `QuotaExceededError` | Mostra `Quadro nesta página` e aviso de possível perda ao recarregar. Cartões continuam em memória; uma gravação posterior bem-sucedida restaura ambos após reload |
| Erros locais da apresentadora | Gateway rejeitava objetos que não eram `Error` | Erros possuem mensagem e stack, preservando `permission-denied`, `cancelled` e `invalid-data` para o controller |

As funções públicas do domínio e a página `/triagem` são as fronteiras das regressões. A fixture substitui captura, WebRTC, AudioContext, reprodução e `/api/live`, e bloqueia destinos externos. As respostas são liberadas pelo teste para reproduzir a ordem da corrida; não depende de um tempo arbitrário de resposta. Nenhum modo de teste foi acrescentado à aplicação.

Os testes de segurança locais chamam `createLiveHandler` com upstream e guard injetados. Os três grupos contêm 32 casos de token, origem e schema inválidos, verificando que a rejeição ocorre antes do upstream pertinente. Esses controles já existiam e passaram com os novos testes; não são vulnerabilidades novas nem uma auditoria completa.

## Verificações executadas

| Verificação | Resultado |
| --- | --- |
| `apps/decisions`: `npm test` | 105/105, incluindo subtestes |
| `apps/decisions`: `npm run typecheck` e `npm run build` | Aprovados |
| `apps/decisions`: `npm run test:triage-browser`, contra `next start` | 10/10; desktop e 390 × 844; sem erros de página |
| `apps/decisions`: `node tests/browser.mjs`, incluindo fixture Live | Aprovado, com transporte/mídia substituídos |
| `apps/decisions`: `node --test tests/live-origin.mjs` | 1/1; servidor local com valores fictícios, sem inferência |
| `portal`: `npm test` | 60/60 |
| `portal`: `npm run check` e `npm run build` | Aprovados; zero diagnósticos na checagem |
| `portal`: `npm run test:site` e `node --test tests/presenter-build.test.mjs` | 2/2 em cada conjunto |
| `portal`: `node tests/presenter-browser.mjs` | Dez cenários com gateway injetado aprovados |
| `node scripts/check-workshop-examples.mjs` | Starter 8/18, candidata 16/18, solução 18/18; falhas didáticas preservadas |
| `node scripts/check-doc-links.mjs` | Links locais aprovados; sem verificação de URLs externas |

Os testes existentes de navegador foram executados com um adaptador temporário em `/tmp` que seleciona `/usr/bin/chromium`; sua lógica permaneceu intacta. A nova fixture aceita `CHROMIUM_PATH` para a mesma seleção. Sem essa variável, usa o navegador instalado pelo Playwright, como na CI. O workflow de LABS passa a executar a regressão de `/triagem` após o fluxo existente.

Capturas locais em `apps/decisions/test-results/`: `triage-audio-recovered.png`, `triage-storage-memory.png` e `triage-storage-memory-mobile.png`, somente com dados fictícios. Logs red/green e finais em `/tmp/triagem-*.log`, fora do Git.

## Revisão e mutação pontual

A [orientação de revisão do Addy](https://github.com/addyosmani/agent-skills/blob/main/skills/code-review-and-quality/SKILL.md) foi lida como documento, sem instalação ou execução de pacote. A revisão examinou correção, simplicidade, arquitetura, segurança e performance. A captura permanece no domínio; a identidade/cancelamento da operação fica no componente; o cliente apenas comunica a falha de reprodução. Não foram adicionadas dependências ou chamadas de rede à produção. O import `X` sem uso foi removido e os ternários aninhados dos controles foram simplificados sem mudar seus rótulos.

Uma cópia isolada do domínio e de seus testes em `/tmp/triagem-mutation` recebeu uma única mutação: negar `heard.startsWith(captured)` em `remainingHeard`. Quatro dos 12 testes falharam, incluindo as duas novas regressões de snapshot. A cópia foi restaurada antes dos commits restantes: 12/12 passaram e seu SHA-256 coincidiu com o arquivo da branch (`8584fb35cf58a8644b6e79e8f3683540f07a42592d3f5ebaf75c2e00cf759b24`). A branch não recebeu a mutação. Isso demonstra sensibilidade a essa condição, sem representar um escore universal de mutação ou cobertura.

Os candidatos manuais associados a S3776 em `apps/decisions/src/server/live-handler.ts` e `portal/scripts/content.mjs` foram mantidos. Separar autorização, encerramento e tratamento de upstream no handler, ou transformação/sanitização e leitura do manifesto no portal, exige uma mudança própria com contratos preservados. Extrair trechos apenas para reduzir uma métrica não foi considerado suficiente. Não foi executado scanner Sonar, nem produzido relatório ou escore Sonar.

## Limites e entrega

Não foram executados microfone real, áudio audível, API paga, login GitHub/Firebase real, emulador Firestore ou navegador do notebook de palco. As regras Firebase e os defeitos intencionais dos laboratórios CLI/Cloud não foram alterados. Os limites existentes de fala e fila continuam válidos; se o buffer já perdeu o prefixo capturado, a correção conserva o buffer atual em vez de apagar fala nova. Pausar/retomar mantém cartões e fila, sem prometer persistência do rascunho falado ainda não classificado.

Gherkin/Cucumber, ferramentas CRAP/Stryker e metas universais de cobertura não foram instalados ou exigidos. A revisão independente do SHA/diff final precede a publicação de um PR draft. Sem merge ou deploy.
