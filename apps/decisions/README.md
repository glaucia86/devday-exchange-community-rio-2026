# Alô, TI · demo de Decisions

Service desk fictício em Next.js, TypeScript, Tailwind CSS 4 e Lucide. O modo padrão reproduz fixtures e não chama qualquer API.

## Estado real

- Testes de domínio, contratos e proteção de fala; consulte os resultados da CI no SHA atual
- Instalação, TypeScript e build aprovados no GitHub Actions
- Fluxo mock testado em Chromium: revisão humana, correção, reset, texto livre, erro e nova tentativa
- Capturas desktop e celular inspecionadas; sem corte, sobreposição ou overflow horizontal observado
- Voz: leitura opcional com voz local em português do dispositivo; não é áudio OpenAI ou transcrição real
- GPT-Live + Decisions: adaptadores implementados; testes usam fixtures. API e áudio reais ainda não foram ensaiados
- Nenhuma chave, sessão ou chamada paga foi utilizada

O [registro de validação](../../docs/validacao.md) distingue cada estágio.

## Requisitos e versões

Node.js 24.21.0 ou posterior, o mesmo valor de `.nvmrc` e da CI. As dependências diretas e transitivas estão fixadas no package.json e package-lock.json. Versões principais: Next.js 16.4.0, React 19.3.0, Tailwind CSS 4.3.3, TypeScript 5.9.3 e Lucide 0.468.0. `engine-strict` recusa um Node anterior na instalação.

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

Escolha um cenário → analise o relato → simule uma correção → analise novamente → revise os campos → marque a revisão → crie o ticket simulado. Recomeçar limpa o estado em memória e interrompe a voz local.

A espera de 900 ms é parte do mock, não uma medida de latência de API. Probabilidades são fixtures. Texto livre recebe um aviso; nunca uma sugestão pronta disfarçada de análise.

## OpenAI ao vivo: integração experimental

A aba OpenAI ao vivo conecta microfone e áudio por WebRTC, acumula transcrições, recebe delegações, consulta Decisions no servidor e devolve sugestões ao GPT-Live. Correções invalidam a revisão anterior. Somente o clique humano cria o ticket simulado.

O live fica desativado por padrão. Abrir a aba não pede microfone nem inicia inferência. A ativação exige configuração segura, acesso aos modelos e autorização de custo. A rota aceita apenas loopback HTTP, mesma origem e um código de acesso da demo distinto da chave OpenAI.

O [guia local Windows](../../docs/integracao-live.md) explica o mock, o arquivo .env.local ignorado pelo Git, a inserção manual de uma chave existente e os limites. Nenhum segredo foi configurado ou usado nesta implementação.

Testes interceptam transporte, eventos e respostas. Eles não comprovam reconhecimento de fala, acesso da conta, latência, decisões de modelo, áudio audível ou consumo real.

[LAB](../../labs/02-decisions-typescript/README.md) · [Guia da apresentadora](../../docs/guia-apresentadora.md#decisions-api)
