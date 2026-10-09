# Triagem ao vivo e Alô, TI · demos de Decisions

Aplicação Next.js, TypeScript, Tailwind CSS 4 e Lucide com duas páginas:

- **`/triagem` · Triagem ao vivo:** demo de voz do LAB Decisions. GPT-Live escuta, a aplicação envia cada relato ao Decisions e um cartão entra num quadro por equipe. Casos incertos vão para **Revisão humana**. Fica desativada até a configuração segura da chave.
- **`/` · Alô, TI:** service desk fictício usado nos blocos do Codex CLI e Cloud. O modo padrão reproduz fixtures e não chama qualquer API.

## Estado real

- Testes de domínio, contratos e proteção de fala; consulte os resultados da CI no SHA atual
- Instalação, TypeScript e build aprovados no GitHub Actions
- Fluxo mock testado em Chromium: revisão humana, correção, reset, texto livre, erro e nova tentativa
- Capturas desktop e celular inspecionadas; sem corte, sobreposição ou overflow horizontal observado
- Voz: leitura opcional com voz local em português do dispositivo; não é áudio OpenAI ou transcrição real
- GPT-Live + Decisions: Triagem ao vivo e aba ao vivo da Alô, TI implementadas; testes usam fixtures. API e áudio reais ainda sem ensaio completo
- Nenhuma chave, sessão ou chamada paga foi utilizada

O [registro de validação](../../docs/validacao.md) distingue cada estágio.

## Requisitos e versões

Node.js de 24.12.0 a 24.21.0. O arquivo `.nvmrc` recomenda 24.21.0, a mesma versão da CI; a faixa aceita está em `engines`. O Next.js 16 pede Node 20.9.0 e os testes `.mts` só carregam a partir do 22.18; a faixa comum com o portal começa em 24.12.0, porque o Firebase de lá pede essa versão. As dependências diretas e transitivas estão fixadas no package.json e package-lock.json. Versões principais: Next.js 16.4.0, React 19.3.0, Tailwind CSS 4.3.3, TypeScript 5.9.3 e Lucide 0.468.0. `engine-strict` recusa um Node fora dessa faixa na instalação.

## Testar o domínio sem instalar pacotes

```bash
cd apps/decisions
node --test tests/*.test.mts
```

## Instalar e executar a interface

Na pasta apps/decisions:

```bash
npm ci --ignore-scripts
npm run typecheck
npm test
npm run build
npm start
```

Abra http://127.0.0.1:3000. A aplicação escuta somente em 127.0.0.1. Dependências são baixadas na instalação; depois, o mock funciona sem uma conta OpenAI. A primeira preparação exige acesso ao registro npm. No palco, **Modo palco** aumenta o texto da equipe. O rodapé deixa registrado que a aba Simulado usa respostas preparadas.

`npm run dev` serve para editar a interface. Ele reescreve `next-env.d.ts`, que o Next gera e o Git ignora. O comando `npm run typecheck` roda `next typegen` antes do `tsc`, então um checkout limpo continua passando. Não exponha o servidor como serviço público sem um desenho de segurança apropriado.

## Teste de navegador

Com as dependências instaladas:

```bash
npx playwright install chromium
npm run build
npm start
```

Em outro terminal, na mesma pasta, execute `node tests/browser.mjs`. Em Linux, as bibliotecas do Chromium podem exigir a etapa oficial `npx playwright install --with-deps chromium`. Revise essa instalação antes de executá-la na sua máquina.

As capturas ficam em test-results. O teste usa uma simulação da API de voz do navegador para verificar carregamento tardio e invalidação de fala; isso não comprova saída real de áudio.

## Fluxo do LAB

Escolha um cenário → analise o relato → corrija o texto ou simule uma correção → analise novamente → revise os campos → marque a revisão → crie o ticket simulado. Recomeçar limpa o estado em memória e interrompe a voz local.

A espera de 900 ms é parte do mock, não uma medida de latência de API. Probabilidades são fixtures. **Corrigir o relato** abre o texto atual para edição; a nova análise usa esse texto. **Simular uma correção** insere o exemplo pronto do palco. Texto livre fica na conversa, com uma explicação de que o simulado não o encaminha; nunca vira uma sugestão pronta disfarçada de análise.

## Triagem ao vivo (`/triagem`)

A sessão GPT-Live usa **delegação para o cliente**: não há modelo de backend chamado a cada fala. Quando a apresentadora diz “registra”, GPT-Live delega; a página pega a fala ouvida desde o último cartão, retira o comando falado e envia o texto ao servidor, que faz **uma** chamada ao Decisions (`gpt-6-luna`). O resultado volta como cartão e como fala curta (`session.commentary.append`); um resumo do quadro segue como contexto (`session.thinking.append`) para a voz responder “qual o padrão?” sem nova chamada.

- Equipe com contexto abaixo de 0,8 ou confiança abaixo de 0,7 vira **Revisão humana**; só esses cartões aceitam a escolha de equipe na tela
- **Classificar agora** é a reserva se a voz não delegar
- O contador mostra as chamadas ao Decisions; limites da conta (por exemplo, 50 por dia) aparecem como aviso com o tempo de espera
- **Evidência da última decisão** mostra o JSON validado
- Regras do quadro em `src/domain/triage.ts`, testadas em `tests/triage.test.mts`

## OpenAI ao vivo: integração experimental

A aba OpenAI ao vivo da Alô, TI conecta microfone e áudio por WebRTC. GPT-Live pede uma função (`registrar_relato`, `corrigir_relato`, `analisar`, `confirmar_ticket`, `recomecar`); o navegador executa o mesmo redutor dos botões e devolve o resultado. A transcrição não altera o relato sozinha. `analisar` consulta Decisions no servidor. O ticket simulado só nasce com confirmação explícita, por voz ou pelo botão. Depois do ticket, a tela mostra um monitoramento calculado dos registros de demonstração da semana; com a sessão ativa, essa frase é falada uma vez por `session.commentary.append`, depois de uma pausa.

Sem microfone ou sem API, a aba Simulado repete o fluxo e mostra a mesma frase na tela. O ensaio offline, sem chave, é `node scripts/replay-voice-commands.mts` nesta pasta.

O live fica desativado por padrão. Abrir a aba não pede microfone nem inicia inferência. A ativação exige configuração segura, acesso aos modelos e autorização de custo. A rota aceita apenas loopback HTTP, mesma origem e um código de acesso da demo distinto da chave OpenAI.

O [guia local Windows](../../docs/integracao-live.md) explica o mock, o arquivo .env.local ignorado pelo Git, a inserção manual de uma chave existente e os limites. Nenhum segredo foi configurado ou usado nesta implementação.

Testes interceptam transporte, eventos e respostas. Eles não comprovam reconhecimento de fala, acesso da conta, latência, decisões de modelo, áudio audível ou consumo real.

[LAB](../../labs/02-decisions-typescript/README.md) · [Guia da apresentadora](../../docs/guia-apresentadora.md#decisions-api)
