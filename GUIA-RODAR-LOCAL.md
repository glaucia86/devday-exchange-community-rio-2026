# Rodar o devday-exchange-community-rio-2026 na sua máquina

Base: `main` em `06b297b` (merge do PR #8, voz). PRs #9 (Dots), #10 (Codex CLI) e #11 (Codex Cloud) ainda abertos: onde eles mudam algo, está marcado **[muda no PR #N]**.
Conferido no box Linux em 8/10/2026 com Node 24.21.0. Windows não foi testado (veja Lacunas 1 e 2).

---

## 1. Pré-requisitos

| Item | Versão / por quê |
| --- | --- |
| Node.js | **24.21.0** (`.nvmrc`). Os três `package.json` pedem `>=24.21.0` e os `.npmrc` têm `engine-strict=true`: com Node mais antigo o `npm ci` falha com `EBADENGINE` (confirmado com Node 20). |
| Git | Qualquer versão recente. |
| Codex CLI (opcional) | `@openai/codex@0.161.0`, fixado para o evento. |
| Conta ChatGPT | Dots, Codex CLI (login) e Codex Cloud. |
| Chave OpenAI (opcional) | Só para a aba **OpenAI ao vivo** da Alô, TI (`gpt-live-1` + `gpt-6-luna`). Testes, mock, Dots, CLI e Cloud não usam chave. |

Instale o Node com um gerenciador, na raiz do repositório (já clonado):

```sh
# macOS/Linux com nvm (lê o .nvmrc)
nvm install
nvm use
```

```sh
# macOS/Linux/Windows com fnm (lê o .nvmrc)
fnm install
fnm use
```

```powershell
# Windows com nvm-windows
nvm install 24.21.0
nvm use 24.21.0
```

Confira:

```sh
node --version   # v24.21.0
npm --version
git --version
```

Se o nvm recusar por causa de `NPM_CONFIG_PREFIX`, rode `unset NPM_CONFIG_PREFIX` nessa sessão antes (aconteceu no box).

## 2. Clonar e instalar

```sh
git clone --branch main https://github.com/glaucia86/devday-exchange-community-rio-2026.git
cd devday-exchange-community-rio-2026
cd apps/decisions
npm ci --ignore-scripts
```

Na raiz não há dependências: só `apps/decisions` (Alô, TI) e `portal` (site) instalam pacotes.

**Windows (PowerShell):** se `npm.ps1` for bloqueado, use `npm.cmd` e `npx.cmd` (ou o Prompt de Comando). Não mude a política de execução.

## 3. Variáveis de ambiente

Sem nenhuma variável, a Alô, TI abre no modo **Simulado** (fixtures, sem rede de modelo, sem microfone).

Variáveis que o código realmente lê:

| Variável | Onde | Para quê | Obrigatória? |
| --- | --- | --- | --- |
| `MESA_LIVE_ENABLED` | `apps/decisions/.env.local` | Liga a aba ao vivo. Só vale o texto exato `true`. | Só para o modo ao vivo |
| `OPENAI_API_KEY` | `apps/decisions/.env.local` (ou já no ambiente do sistema) | Chave usada só no servidor para `/v1/live/sessions` e `/v1/decisions`. | Só para o modo ao vivo |
| `MESA_LIVE_ACCESS_TOKEN` | `apps/decisions/.env.local` | Código da demo, **não** é a chave. Precisa ter 32+ caracteres. É o que você digita na interface. | Só para o modo ao vivo |
| `NEXT_TELEMETRY_DISABLED` | ambiente | Desliga a telemetria do Next (o script de ensaio e a CI usam `1`). | Opcional |
| `PUBLIC_PRESENTER_*`, `PUBLIC_FIREBASE_*` | `portal/.env` | Painel da apresentadora no portal (Firebase). Vão para o bundle público. | Opcional; deixe `PUBLIC_PRESENTER_ENABLED=false` |

`PORTAL_PUBLIC_URL`, `EXPECTED_COMMIT` e `FIRESTORE_EMULATOR_HOST` são só de teste/CI.

Criar o `.env.local` (servidor parado, em `apps/decisions`):

```powershell
# Windows
Copy-Item .env.example .env.local
git check-ignore -v .env.local
notepad .env.local
```

```sh
# macOS/Linux (não sobrescreve um arquivo existente)
node -e "const fs=require('node:fs');fs.copyFileSync('.env.example','.env.local',fs.constants.COPYFILE_EXCL)"
git check-ignore -v .env.local
```

`git check-ignore` deve mostrar a regra `.env.*`. Gere um código local para a demo (32 caracteres):

```sh
node -e "console.log(require('node:crypto').randomBytes(24).toString('base64url'))"
```

Conteúdo do arquivo, preenchido no editor:

```dotenv
MESA_LIVE_ENABLED=true
OPENAI_API_KEY=sk-...
MESA_LIVE_ACCESS_TOKEN=<código gerado acima>
```

- Sem prefixo `NEXT_PUBLIC_`. Não comite, não projete e não cole em chat.
- Se `OPENAI_API_KEY` já existir nas variáveis do sistema, o Next usa essa e o `.env.local` não a sobrescreve.
- Para voltar ao modo só simulado: `MESA_LIVE_ENABLED=false` e reinicie o servidor.

## 4. Cada demo

### Alô, TI (único app local)

Modo dev (para editar; recarrega sozinho):

```sh
cd apps/decisions
npm run dev
```

Build (o que o palco usa):

```sh
cd apps/decisions
npm run build
npm start
```

- Abra **http://127.0.0.1:3000**. O servidor só escuta em 127.0.0.1.
- Se a 3000 estiver ocupada, o `npm run dev` passa sozinho para 3001 (mostra no terminal). Já o `npm start` falha com `EADDRINUSE`. Nesse caso, use `npm start -- -p 3002`.
- Use **um só nome** na aba: `127.0.0.1` ou `localhost`. São origens diferentes para o navegador.
- `npm run dev` reescreve `next-env.d.ts`. Esse arquivo é gerado e ignorado pelo Git.

**Simulado (sem chave):** aba **Simulado** → **Modo palco** → **Explorar cenário** → **Analisar relato** → **Simular uma correção** → **Analisar relato** → marcar revisão → criar `DEMO-0001`.

**Ao vivo / voz (com chave):**
1. Configure o `.env.local` (seção 3) e reinicie o servidor.
2. Aba **OpenAI ao vivo** → digite o `MESA_LIVE_ACCESS_TOKEN` (nunca a chave).
3. Marque o consentimento de custo → **Iniciar conversa real**.
4. Permita o microfone **só nesta página local** e espere **Microfone ativo**. O navegador libera microfone em `http://127.0.0.1`.
5. Fones de ouvido. O app encerra a sessão após 10 minutos, o que não é um teto de gasto. Se ela terminar antes, a mensagem final mostra o motivo informado pela plataforma (ex.: `expired`, `connection_lost`).
6. Termine com **Encerrar conversa** e espere **Conversa encerrada. Microfone liberado.**

Cada sessão já pode custar. Na sua chave, o `gpt-6-luna` tinha limite de 50 requisições por dia (visto em 8/10).

Ensaio dos comandos de voz sem chave e sem custo:

```sh
cd apps/decisions
node scripts/replay-voice-commands.mts
```

### Dots (não é app local)

Roda em chatgpt.com, no navegador desktop ou no app desktop. Nada a instalar nem clonar: você cola o texto de `labs/01-dots/cenario.md` na conversa do dot.
- **No `main`:** cenário fictício "Aurora" (A-101..A-103) e a instrução de "procurar dots".
- **[muda no PR #9]:**
  - O cenário vira o acompanhamento de uma fonte pública real (issues e PRs).
  - O guia explica que o dot aparece pelo próprio nome na barra lateral (`chatgpt.com/dots/<id>`).
  - Alerta que a memória de rodadas anteriores contamina o teste.

### Codex CLI (terminal, não é app)

```sh
npm install -g @openai/codex@0.161.0
codex --version        # codex-cli 0.161.0
codex login            # login ChatGPT no navegador, sem chave
codex login status
```

No PowerShell, use `codex.cmd` se `codex.ps1` for bloqueado.

LAB no `main` (`labs/codex-cli/README.md`), a partir da raiz do repo:

```sh
node -e "require('node:fs').cpSync('exercises/ticket-router/starter','../rio-codex-cli',{recursive:true,errorOnExist:true,force:false})"
cd ../rio-codex-cli
node --test router.test.mjs
node ../devday-exchange-community-rio-2026/exercises/ticket-router/verify.mjs router.mjs
git init -b main
git config user.name "Exercicio"
git config user.email "exercicio@example.invalid"
git add AGENTS.md README.md router.mjs router.test.mjs
git commit -m "Ponto de partida do exercício"
codex
```

1. Antes de abrir o `codex`, o teste dá 3/3 e o `verify.mjs` dá `ACCEPTANCE {"total":18,"passed":8,"failed":10}`. Essa falha é esperada.
2. Dentro do `codex`, cole o pedido da etapa 3 do LAB.
3. Saia do `codex` e rode de novo `node --test router.test.mjs` e o `verify.mjs`. O esperado agora é `18/18`.

**[muda no PR #10]:** o bloco vira uma demo de 2–3 minutos, com voz e `/agents`, em cima de um bug real da Alô, TI:
- Abre em `apps/decisions` com `codex -m gpt-6-luna -s workspace-write -a on-request`.
- Usa `/voice`, `/agents` e `/diff`.
- Sai do Codex com `/quit`.
- O exercício do encaminhador deixa o palco.

O PR #10 ainda tem uma correção em andamento: depois da mudança do agente, a demo precisa recompilar ou usar `npm run dev` para o reload mostrar a correção.

### Codex Cloud (roda no ChatGPT, não é app local)

Precisa de uma conta ChatGPT com Codex Cloud e GitHub conectado. Localmente, só a parte de conferir o defeito:

```sh
node --test exercises/ticket-router/review-candidate/router.test.mjs
node exercises/ticket-router/verify.mjs exercises/ticket-router/review-candidate/router.mjs
```

O esperado é 5 testes verdes e aceitação `16/18`.
- **No `main`:** você copia 4 arquivos, **cria um repositório novo no GitHub**, faz upload manual e depois publica um ambiente no Cloud.
- **[muda no PR #11]:**
  - Não cria repositório: usa este repositório ou um fork de um clique.
  - O bug passa a ser real na Alô, TI (`mockDecision('network', true)`).
  - A conferência local vira `node labs/codex-cloud/run-bug-test.mjs`, com 3 testes passando e 1 falhando, de propósito.
  - O guia avisa para não usar "Codex Cloud (Legacy)".

## 5. Testes e ensaio

Ensaio completo (instala, roda os 71 testes, confere starter 8/18, candidata 16/18 e solução 18/18, e faz o build):

```sh
node scripts/prepare-stage.mjs
cd apps/decisions
npm start
```

No Windows, o script provavelmente falha (Lacuna 1). Rode o equivalente à mão:

```powershell
cd apps/decisions
npm.cmd ci --ignore-scripts
cd ../..
node --test exercises/ticket-router/starter/router.test.mjs
node --test exercises/ticket-router/solution/router.test.mjs
node --test apps/decisions/tests/*.test.mts
node --test exercises/ticket-router/review-candidate/router.test.mjs exercises/decisions-contract/inspect.test.mts
node scripts/check-workshop-examples.mjs
cd apps/decisions
npm.cmd run build
npm.cmd start
```

Os mesmos passos da CI (`.github/workflows/check-labs.yml`):

```sh
node scripts/check-doc-links.mjs
node --test scripts/prepare-stage.test.mjs
cd apps/decisions
npm run typecheck
npm test
```

Teste de navegador (opcional): instale com `npx playwright install chromium`. Com o `npm start` rodando, execute `node tests/browser.mjs`.

O portal (`portal/`, Astro) é só o site de leitura e não é uma demo. Para abrir localmente: `cd portal`, `npm ci --ignore-scripts`, `npm run dev`. Não foi verificado aqui.

## 6. Lacunas no repositório (`main` @ 06b297b)

1. **`scripts/prepare-stage.mjs` provavelmente quebra no Windows.**
   - Ele chama `spawnSync('npm.cmd', …)` sem `shell: true`.
   - Desde o Node 18.20.2 e o 20.12.2 (CVE-2024-27980), o Node recusa abrir `.cmd` assim e retorna `EINVAL`. Com Node 24, o script deve parar logo no `npm ci`.
   - Não testei no Windows, mas esse é o comportamento documentado do Node, e a sua máquina é Windows.
   - O README, o roteiro e o guia mandam usar esse script.
2. **Windows nunca foi ensaiado.** Quem diz isso é o próprio `docs/integracao-live.md` ("Este fluxo ainda não foi ensaiado em Windows").
3. **Portas.**
   - O README e `docs/integracao-live.md` só falam em `:3000`.
   - O `npm run dev` muda sozinho para 3001 quando a 3000 está ocupada, e o `npm start` falha com `EADDRINUSE`.
   - Nenhum documento explica `npm start -- -p <porta>`. Só `labs/02-decisions-typescript/README.md:61` diz "use a URL informada".
4. **Não há comando para gerar o `MESA_LIVE_ACCESS_TOKEN`.** O `docs/integracao-live.md` só diz "escolha uma senha aleatória… 32 caracteres".
5. **Não é dito que uma `OPENAI_API_KEY` do sistema prevalece sobre o `.env.local`.** Confirmei no box: a chave veio do ambiente e o `.env.local` não tinha chave.
6. **Contradição sobre o ensaio real.**
   - `README.md` (aviso IMPORTANT), `apps/decisions/README.md` ("Nenhuma chave, sessão ou chamada paga foi utilizada") e o topo de `docs/integracao-live.md` dizem que nunca houve chamada real.
   - Mas o mesmo `docs/integracao-live.md` diz que a pergunta de contexto foi "conferida na Decisions real" (confiança 0,93, do PR #7).
7. **`gpt-5.4-mini` obsoleto.**
   - `labs/codex-cli/README.md:160` e `docs/guia-apresentadora.md:106` recomendam `codex -m gpt-5.4-mini`.
   - Esse modelo não está no catálogo da CLI 0.161.0. O PR #10 corrige.
8. **Contagens antigas em `docs/validacao.md`.**
   - A tabela fala em "Domínio Mesa TI… 15 testes" e "46 testes".
   - Hoje são 50 testes na Alô, TI e 71 no total, como o README já diz.
9. **Cenário "Aurora" ainda no `main`.** Aparece em `README.md:72`, `labs/01-dots/*` e mais 8 menções. O PR #9 troca.
10. **Codex Cloud no `main`.**
    - Exige criar um repositório no GitHub e subir arquivos à mão (`labs/codex-cloud/README.md` §2).
    - Os rótulos do Cloud ("Work in → Cloud → Select environment") não batem com a tela vista em 8/10 ("Cloud → Choose environment").
    - O PR #11 corrige.
11. **Bug conhecido na voz ao vivo, no `main`.**
    - Em `live-desk.tsx`, se alguém editar o relato enquanto a análise por voz está pendente, o assistente pode travar.
    - Apontado pela revisão do Codex no PR #8. Uma correção em PR separado está em andamento.
    - Não afeta o modo Simulado.
12. **Não existe `docker-compose`.** Também não existe script `dev` ou `test` na raiz: o `package.json` da raiz só tem `stage`. Não falta nada, mas `npm run dev` na raiz não funciona. É preciso estar em `apps/decisions`.
