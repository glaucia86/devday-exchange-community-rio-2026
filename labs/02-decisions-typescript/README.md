# LAB Decisions API com a Triagem ao vivo

[Início](../../README.md) · [Aplicação](../../apps/decisions/README.md) · [Guia da apresentadora](../../docs/guia-apresentadora.md#decisions-api)

## Objetivo

Você vai abrir a aplicação no seu computador, contar problemas fictícios de TI pelo microfone e acompanhar a criação de cartões em um quadro. A voz escuta. O Decisions sugere uma equipe. Quando falta contexto ou confiança, o cartão aguarda sua escolha em **Revisão humana**.

No evento, Glaucia conduz a demonstração e o público acompanha. Este LAB é para repetir a experiência **em casa, depois do evento, no seu ritmo**. Não é preciso ter assistido à apresentação.

**O que você vai entregar:** pelo menos três cartões, uma decisão sua em **Revisão humana** e o encerramento da sessão confirmado. Se não tiver acesso à API, há um caminho offline com resultados próprios. Ao final, anote qual caminho você percorreu.

**Tempo:** reserve de 20 a 30 minutos para a experiência depois de preparar ferramentas, conta e configuração. Instalação, downloads e eventuais ajustes de acesso ficam fora dessa estimativa.

**Escopo:** o projeto já está implementado. Você vai instalar, executar, entender e experimentar essa aplicação. Construir outra aplicação do zero seria uma etapa posterior.

**Referência dos checkpoints:** código `e7129f3`, consultado em 9 de outubro de 2026. As contagens correspondem a essa versão; confira a CI do commit que você está usando.

### Navegue pelo LAB

- [Acompanhar meu progresso](#meu-progresso)
- [Preparar ferramentas](#preparar-ferramentas)
- [Baixar o projeto](#obter-projeto)
- [Conferir as regras](#verificar-regras)
- [Abrir a interface](#instalar-interface)
- [Preparar conta e orçamento](#preparar-api)
- [Configurar o arquivo local](#configurar-segredos)
- [Fazer a primeira triagem](#primeira-triagem)
- [Entender fila e limites](#fila-e-limites)
- [Encerrar e voltar outro dia](#reset-e-retomada)
- [Fazer o exercício offline](#contrato-offline)
- [Resolver problemas](#resolver-problemas)
- [Continuar praticando](#aprofundar)

### Escolha o seu caminho

| Sua situação | Faça estas partes | Resultado que você poderá comprovar |
| --- | --- | --- |
| Quero usar voz e API real e aceito o custo | Seções 1 → 2 → 3 → 4 → 5 → 6 → 7 → 8 → 9 | Fala, áudio, classificação e revisão humana funcionando na sua conta |
| Quero estudar sem chave ou cobrança de API | Seções 1 → 2 → 3 → 10 | Contrato e regras locais; sem avaliar microfone, voz ou modelo |
| Quero conhecer a tela antes de decidir | Seções 1 → 2 → 3 → 4; depois posso parar | Aplicação local aberta com modo ao vivo desativado |

Não é preciso criar banco de dados, rodar seed, usar Docker, conectar Jira ou publicar um site. Os cartões desta demo são fictícios. A página `/triagem` não cria tickets em um sistema externo.

<a id="meu-progresso"></a>
### Como usar os checklists em casa

Faça uma seção por vez. Ao chegar a **Pode avançar?**, marque somente o que você realmente conferiu. A frase **Próximo passo** indica para onde ir.

As caixas são um roteiro de conferência; esta página não salva seu progresso. Para marcar, copie o checklist para suas anotações ou use uma cópia impressa. Use **não se aplica** nos itens condicionais que não pertencem ao seu caminho. Não precisa editar o repositório nem abrir um pull request.

- [ ] Escolhi meu caminho: voz real, offline ou apenas conhecer a interface.
- [ ] Separei um computador e um lugar para anotar etapa, resultado e dúvidas, sem incluir segredos.
- [ ] Entendi que só preciso de conta/chave e aceitar custos se escolher a voz real.

**Se algo não conferir:** fique na etapa, leia a saída esperada e consulte [Resolver problemas](#resolver-problemas). Com sessão de voz ativa, encerre e confirme o fechamento antes de parar para investigar. Se faltar acesso à API, o caminho offline continua disponível; registre a mudança de caminho.

**Meu registro:** sistema operacional ___ · versão do Node ___ · commit ___ · caminho escolhido ___ · última etapa concluída ___ · pendência ___. Complete os campos conforme descobrir as informações.

**Comece pela [seção 1](#preparar-ferramentas).** As seções 11 e 12 são consulta e prática opcional, respectivamente.

### Entenda as palavras do guia

- **Terminal:** janela em que você digita comandos. No Windows, procure PowerShell ou Prompt de Comando no menu Iniciar. No macOS ou Linux, abra Terminal.
- **Pasta atual:** a pasta em que o terminal está trabalhando. `cd nome-da-pasta` entra nela; `cd ..` sobe um nível.
- **Repositório:** a pasta do projeto com código e textos. **Clonar** baixa uma cópia.
- **Raiz do repositório:** a pasta principal `devday-exchange-community-rio-2026`.
- **Node.js:** executa o código JavaScript e os testes deste projeto. **npm:** instala as dependências. **Git:** baixa o repositório e acompanha alterações.
- **API:** serviço que a aplicação chama pela internet. Nesta demo, a OpenAI recebe áudio e texto quando você inicia o modo real.
- **GPT-Live:** o modelo que escuta e responde por voz.
- **Decisions:** a API que responde às perguntas de contexto, equipe e impacto em um formato definido.
- **Contrato:** as regras que determinam quais campos e valores uma resposta pode ter.
- **Fixture:** arquivo de exemplo com dados preparados. Usá-lo não chama a API.

**Como copiar os blocos:** copie uma linha de comando por vez, cole no terminal e pressione Enter. Espere ela terminar antes de seguir. Não copie a saída esperada. As frases para falar vão para o microfone depois que a sessão começar.

<a id="preparar-ferramentas"></a>
## 1 Prepare as ferramentas

**Antes de começar:** tenha um computador com acesso à internet e permissão para instalar as ferramentas que faltarem. Se o computador for gerenciado, siga a orientação de quem o administra.

### 1.1 Confira o que já está instalado

**Onde:** em um terminal no seu computador.

```sh
node --version
```

**Confira:** a saída começa com `v`. A versão recomendada é `v24.21.0`; este projeto aceita de `24.12.0` até `24.21.0`, inclusive. Uma versão mais nova também fica fora da faixa definida no projeto.

No Windows, execute:

```powershell
npm.cmd --version
```

No macOS ou Linux, execute:

```sh
npm --version
```

Em qualquer sistema:

```sh
git --version
```

**Confira:** npm mostra uma versão numérica; Git começa com `git version`. O guia não exige uma versão específica de npm ou Git além da instalação compatível com o ambiente.

### 1.2 Instale somente o que faltar

Se aparecer “comando não encontrado” ou “não é reconhecido”:

1. Abra a [página oficial do Node 24.21.0](https://nodejs.org/en/download/archive/v24.21.0).
2. No Windows, use o instalador `.msi` correspondente ao seu sistema: x64 para processadores Intel/AMD de 64 bits; ARM64 para Windows em ARM. Se não souber, confira o tipo de sistema nas informações do Windows antes de baixar.
3. No macOS, use o instalador `.pkg` listado para essa versão.
4. No Linux, abra a [página oficial de instalação](https://nodejs.org/en/download), selecione Linux e a versão 24.21.0, e siga as instruções mostradas para o método escolhido. Gerenciadores de versões têm sua própria instalação; não presuma que `nvm` já está disponível. Se um pacote da sua distribuição instalar outra versão, a conferência abaixo detectará isso.
5. Para Git, abra [Git Install](https://git-scm.com/install/), escolha Windows, macOS ou Linux e siga a instalação do seu sistema.
6. Feche e abra o terminal. Repita os comandos da seção anterior.

O npm acompanha a distribuição do Node. Não instale pacotes globais de IA para executar esta demo.

**Checkpoint:** os três comandos respondem, e o Node está na faixa aceita. Só avance depois disso. A instalação usa `engine-strict`: ignorar a exigência de versão não é o caminho deste LAB.

**Windows:** os blocos usam `npm.cmd` para evitar o bloqueio comum de `npm.ps1` no PowerShell. Não é necessário mudar a política de execução do Windows.

### Pode avançar? Ferramentas

- [ ] `node --version` respondeu com uma versão de 24.12.0 a 24.21.0.
- [ ] `npm.cmd --version` no Windows, ou `npm --version` nos outros sistemas, respondeu.
- [ ] `git --version` respondeu.

**Próximo passo:** com os três itens conferidos, vá para [2. Baixar o projeto](#obter-projeto). Se algum comando falhar, resolva a instalação antes de continuar.

<a id="obter-projeto"></a>
## 2 Baixe o projeto e reconheça as pastas

**Antes de começar:** conclua o checklist de ferramentas. Escolha o caso 2.1 ou 2.2; não execute os dois para a mesma cópia.

### 2.1 Se você ainda não tem uma cópia

**Onde:** terminal, em uma pasta em que deseja guardar o projeto. Você pode usar uma pasta de estudos da sua conta. Não escolha uma pasta de sistema e não execute como administrador só para seguir o LAB.

Para saber onde está:

```sh
node -p "process.cwd()"
```

Anote esse caminho. O clone criará uma pasta nova dentro dele.

```sh
git clone --branch main https://github.com/glaucia86/devday-exchange-community-rio-2026.git
```

Espere o download terminar. Então entre na pasta criada:

```sh
cd devday-exchange-community-rio-2026
```

```sh
node -p "process.cwd()"
```

**Confira:** o caminho termina em `devday-exchange-community-rio-2026`. Esta é a **raiz** citada pelo restante do LAB. No Windows, o caminho pode usar barras invertidas; isso é normal.

### 2.2 Se você já clonou

Abra a cópia existente. Não clone outra pasta dentro do projeto. Confira:

```sh
node -p "process.cwd()"
```

```sh
git status --short
```

Se aparecerem arquivos modificados, preserve seu trabalho. Este LAB não pede descartar alterações, aplicar reset forçado ou sobrescrever sua configuração.

Confira a branch e o último commit:

```sh
git branch --show-current
```

```sh
git log -1 --oneline
```

**Confira:** o primeiro comando mostra a branch; o segundo mostra o código curto e a descrição do commit. Se a branch estiver em branco, você está em uma revisão específica, e não deve usar a atualização abaixo.

**Somente se a branch for `main` e `git status --short` não listar alterações**, atualize a cópia:

```sh
git pull --ff-only
```

Espere terminar e confira novamente o último commit. Se houver conflito, divergência, arquivos modificados ou outra branch, não force a atualização. Preserve a cópia e faça um clone novo em outra pasta vazia, seguindo a seção 2.1. Assim você mantém seus exercícios anteriores.

O código de referência dos checkpoints é `e7129f3`; commits posteriores podem acrescentar testes. Se você está numa versão anterior, pode ainda não ter fila e retomada. Compare o commit informado no guia da sua cópia com o resultado do comando, antes de tratar uma diferença de tela como erro.

### 2.3 Entenda o mapa que será usado

**Para qualquer cópia:** na raiz, execute `git log -1 --oneline` e anote o código curto do commit no seu registro do LAB. Esse comando já aparece na seção 2.2; quem fez um clone novo também deve conferir a versão.

| Caminho a partir da raiz | O que existe ali |
| --- | --- |
| `apps/decisions` | Aplicação local com Triagem e Alô, TI |
| `apps/decisions/package.json` | Comandos e dependências da aplicação |
| `apps/decisions/.env.example` | Modelo de configuração sem credenciais |
| `apps/decisions/.env.local` | Arquivo que você criará somente para o modo real |
| `apps/decisions/tests` | Testes locais da aplicação |
| `exercises/decisions-contract` | Exercício offline com arquivos de exemplo |

O site do evento é um portal de leitura. A aplicação abre em `127.0.0.1`, que significa **este computador**. Abrir o portal público não inicia a aplicação no seu notebook.

### Pode avançar? Projeto

- [ ] Tenho uma cópia do projeto e preservei qualquer trabalho anterior.
- [ ] Meu terminal está na raiz `devday-exchange-community-rio-2026`, e anotei esse caminho.
- [ ] Anotei o commit da minha cópia; se ela já existia, também conferi a branch antes de atualizar.
- [ ] Sei que o portal é para ler o guia e que a aplicação será aberta no meu computador.

**Próximo passo:** vá para [3. Conferir as regras](#verificar-regras), mantendo o terminal na raiz.

<a id="verificar-regras"></a>
## 3 Confira as regras sem usar uma chave

**Antes de começar:** conclua o checklist do projeto. Esta etapa é comum aos três caminhos.

**Onde:** terminal na raiz do repositório.

```sh
node --test apps/decisions/tests/*.test.mts
```

Os testes usam dados simulados e comunicação local de teste. Não abrem microfone nem fazem inferência real na OpenAI.

**Saída esperada na versão de referência deste guia:** 67 testes aprovados e zero falhas. A apresentação dos símbolos e tempos pode variar.

```text
tests 67
pass 67
fail 0
```

**Checkpoint:** o comando terminou e `fail` é zero. Um número diferente exige conferir a versão do material; não altere código só para fazer a contagem bater. Um teste que falhou precisa ser investigado antes de prosseguir.

Se aparecer `Cannot find module`, confira a pasta atual e o caminho copiado. Se houver erro ao interpretar TypeScript, volte à versão do Node. Não crie arquivos vazios nem desative verificações para esconder o erro.

**Vai estudar somente offline?** Agora vá ao [exercício offline](#contrato-offline). Você já tem tudo de que precisa; não instale a interface nem configure uma chave.

### Pode avançar? Regras

- [ ] Executei o comando de teste na raiz e esperei terminar.
- [ ] A saída mostra zero falhas; conferi a versão se a contagem diferiu da referência.
- [ ] Anotei o resultado, sem confundi-lo com um teste de voz ou API real.

**Próximo passo:** para **offline**, vá direto para [10. Exercício offline](#contrato-offline). Para **voz real** ou **conhecer a tela**, vá para [4. Abrir a interface](#instalar-interface). Se houve falha inesperada, investigue antes de avançar.

<a id="instalar-interface"></a>
## 4 Abra a interface sem iniciar uma sessão paga

**Antes de começar:** conclua os testes da seção 3. Deixe esse terminal disponível e abra também um navegador no mesmo computador.

### 4.1 Entre na pasta da aplicação

**Onde:** no mesmo terminal, a partir da raiz.

```sh
cd apps/decisions
```

```sh
node -p "process.cwd()"
```

**Confira:** o caminho termina em `apps/decisions` ou `apps\decisions`.

Os comandos npm abaixo devem ser executados nessa pasta. A raiz não tem o comando `start` da aplicação.

### 4.2 Instale as dependências

**Windows:**

```powershell
npm.cmd ci --ignore-scripts
```

**macOS ou Linux:**

```sh
npm ci --ignore-scripts
```

Esse passo baixa as versões registradas no lockfile. Precisa de internet para acessar o registro npm. Espere o terminal voltar a aceitar comandos; não inicie a próxima etapa enquanto a instalação estiver trabalhando.

**Confira:** a instalação termina sem erro. Avisos não são automaticamente falhas, mas uma mensagem `npm ERR!` exige leitura. Não execute `npm audit fix --force` como parte deste tutorial: isso altera dependências fora do percurso previsto.

### 4.3 Prepare a aplicação

**Windows:**

```powershell
npm.cmd run typecheck
```

```powershell
npm.cmd run build
```

**macOS ou Linux:**

```sh
npm run typecheck
```

```sh
npm run build
```

O primeiro comando confere os tipos. O segundo cria a versão que será aberta pelo servidor. Os textos detalhados da build variam; ambos precisam terminar sem erro e devolver o controle do terminal.

### 4.4 Inicie o servidor

**Windows:**

```powershell
npm.cmd start
```

**macOS ou Linux:**

```sh
npm start
```

Agora o terminal continua ocupado. Isso é esperado: ele está mantendo a aplicação ligada. Deixe essa janela aberta.

**No navegador do mesmo computador**, abra:

http://127.0.0.1:3000/triagem

### 4.5 Confira a primeira tela

Você deve encontrar:

- O título **Conte um problema.**
- As colunas **Acessos e identidade**, **Aplicações internas**, **Infraestrutura** e **Revisão humana**.
- Um campo **Código de acesso da demo local (não é a chave OpenAI)**.
- A caixa de consentimento para envio de áudio/texto e custo.
- Em uma cópia sem configuração, o aviso **Ao vivo desativado no servidor** e o botão de início desabilitado.

**Checkpoint:** a tela abriu. O aviso de modo desativado é esperado nesta etapa. Não há necessidade de preencher o campo ou dar permissão ao microfone ainda.

Se aparecer **Alô, TI**, confira o endereço: faltou `/triagem` no final. A rota `/` é outra página do mesmo projeto.

Se aparecer um quadro antigo ou o botão **Retomar triagem**, seu navegador restaurou dados de uma rodada anterior. Leia [reset e retomada](#reset-e-retomada) antes de começar um ensaio novo.

### 4.6 Se a porta 3000 estiver ocupada

Se `npm start` terminar com `EADDRINUSE`, o servidor não começou nessa porta. Não encerre processos desconhecidos.

Na mesma pasta, escolha outra porta, por exemplo 3002:

**Windows:**

```powershell
npm.cmd start -- -p 3002
```

**macOS ou Linux:**

```sh
npm start -- -p 3002
```

Abra http://127.0.0.1:3002/triagem. A partir daqui, use essa mesma URL em todas as etapas. Se ela também estiver ocupada, escolha outra porta livre. A opção `-p` é documentada no [CLI do Next.js](https://nextjs.org/docs/app/api-reference/cli/next#next-start-options).

Mudar a porta ou trocar `127.0.0.1` por `localhost` muda a origem no navegador. Os dados e permissões daquela origem podem ser diferentes. Use um endereço consistente durante todo o LAB.

### Pode avançar? Interface

- [ ] Instalei as dependências dentro de `apps/decisions`, sem erro.
- [ ] `typecheck` e `build` terminaram sem erro.
- [ ] O servidor continua rodando, e anotei a URL e a porta usadas.
- [ ] Abri `/triagem` e reconheci o título e as quatro colunas.
- [ ] Em uma cópia sem configuração, vi **Ao vivo desativado no servidor**, sem iniciar sessão.

**Próximo passo:** se quiser **voz real**, siga para [5. Conta e orçamento](#preparar-api). Se veio **apenas conhecer a tela**, pode terminar aqui: sem sessão ativa, pressione Ctrl+C no terminal e preencha o [checklist de conclusão](#conclusao). Se já havia configuração ou dados salvos, confira a [seção 9](#reset-e-retomada) antes de uma nova rodada.

<a id="preparar-api"></a>
## 5 Prepare o acesso à API e decida seu orçamento

**Antes de começar:** confira que a interface da seção 4 abriu. Mantenha a sessão de voz desligada enquanto prepara conta, acesso e orçamento.

Esta etapa só é necessária para a triagem por voz real. Você pode encerrá-la a qualquer momento e fazer o exercício offline da seção 10.

**O que precisa estar disponível:** uma conta na plataforma de API, um projeto que você pode usar, acesso a `gpt-live-1` e `gpt-6-luna`, forma de uso/faturamento habilitada para esse projeto e uma chave autorizada. Ter a chave não comprova que a conta tem acesso ou cota suficientes.

### 5.1 Abra a plataforma da API

**Onde:** no seu navegador. Abra a [OpenAI Platform](https://platform.openai.com/), entre na sua conta ou conclua o cadastro apresentado. Confira qual organização está selecionada. Se estiver usando uma conta do trabalho, respeite as permissões e o orçamento dela.

A assinatura ChatGPT e o consumo da API têm faturamentos separados. Pagar ChatGPT Plus, Pro ou Business não inclui automaticamente as chamadas desta aplicação. [Entenda os dois faturamentos](https://help.openai.com/en/articles/9039756).

### 5.2 Escolha um projeto para o laboratório

Nas [configurações](https://platform.openai.com/settings/), selecione um projeto autorizado. Se você for proprietário da organização e quiser separar o estudo, crie um projeto com um nome reconhecível, como **Triagem Workshop**. Se não puder criar ou administrar projetos, peça ao responsável o acesso adequado; não tente contornar a restrição.

As chaves pertencem ao projeto em que foram criadas. Mantenha o mesmo projeto ao conferir limites, gerar a chave e acompanhar o uso. [Projetos e permissões](https://help.openai.com/en/articles/9186755-managing-projects-in-the-api-platform).

### 5.3 Confira modelos e limites

No projeto, localize **Limits** e **Model Usage**, conforme os rótulos disponíveis na sua conta. Confira se o uso de `gpt-live-1` e `gpt-6-luna` está permitido. Nas [Limits da organização](https://platform.openai.com/settings/organization/limits), consulte seu nível de uso e os limites apresentados.

As páginas oficiais dos modelos informam que o nível Free não é suportado. Os limites podem variar por conta e projeto; não use o limite da conta da apresentadora como promessa para a sua. A documentação confirma a existência dos modelos, mas não garante o acesso da sua conta. [GPT-Live 1](https://developers.openai.com/api/docs/models/gpt-live-1) · [GPT-6 Luna](https://developers.openai.com/api/docs/models/gpt-6-luna).

Se o acesso necessário não estiver disponível, siga o offline. Não troque os nomes dos modelos no código por tentativa e erro para forçar a demo.

### 5.4 Confira o faturamento antes de comprar qualquer coisa

Abra o [faturamento da API](https://platform.openai.com/account/billing). Se a conta já tem uso autorizado e saldo disponível, confira isso antes de adicionar créditos.

No fluxo pré-pago documentado em 9 de outubro de 2026, a compra mínima publicada é US$5. Revise o valor, o meio de pagamento e a opção **Use auto-reload**: a recarga automática aparece ativada por padrão nesse fluxo. Para um estudo pontual, deixe-a desativada se não quiser compras futuras automáticas.

Leia as condições antes de confirmar a compra. Os créditos comprados têm validade de um ano e em geral não são reembolsáveis, ressalvadas as exceções aplicáveis. O saldo pode levar alguns minutos para atualizar e seu esgotamento não é garantia de corte instantâneo. Você é quem decide se quer prosseguir com esse gasto. [Pré-pagamento e recargas](https://help.openai.com/en/articles/8264644-setting-up-and-managing-prepaid-api-billing).

### 5.5 Defina seu limite de gasto

Anote quanto você aceita gastar no teste. Nas configurações do projeto, procure **Limits → Spend → Edit spend limit**. Defina o valor mensal apropriado e, se quiser bloqueio, confira a opção **Enforce a hard limit** antes de salvar. Configure também alertas abaixo do limite.

Um alerta sozinho não bloqueia chamadas. O limite rígido pode interromper a demo e pode haver um pequeno excedente enquanto o bloqueio se propaga. Confirme o que sua conta realmente mostra e quais limites de organização/projeto estão ativos; o cronômetro da aplicação não configura isso por você. [Controles oficiais de gasto](https://developers.openai.com/api/docs/guides/spend-limits).

### 5.6 Entenda o preço deste desenho

Referência consultada em **9 de outubro de 2026**; confira os links antes de gastar, porque preços e condições podem mudar:

- **GPT-Live 1:** US$0,05 por minuto de sessão, contabilizado por segundo. Cinco minutos correspondem a US$0,25 somente dessa sessão. Backend e ferramentas podem ter cobrança separada. [Preço da sessão Live](https://developers.openai.com/api/docs/models/gpt-live-1).
- **Endpoint Decisions com gpt-6-luna:** US$0,10 por milhão de tokens de entrada, sem cobrança de leitura/escrita de cache ou tokens de saída nesse endpoint; condições regionais e multiplicadores de contexto longo continuam aplicáveis. [Preço específico de Decisions](https://developers.openai.com/api/docs/guides/decisions#pricing-and-availability).

A Triagem usa delegação para o cliente e solicita uma classificação por relato registrado. Perguntar sobre o quadro não precisa criar outra classificação, mas a sessão de voz permanece ativa. O custo total depende da duração, dos pedidos, das tentativas e das condições de uso; o exemplo de cinco minutos não é um preço fechado da atividade.

Não use o preço genérico de saída de `gpt-6-luna` como preço de Decisions. Outros usos do modelo têm suas próprias regras na [tabela geral de preços](https://developers.openai.com/api/docs/pricing).

### 5.7 Crie a chave no projeto correto

Se você já tem uma chave autorizada para esse projeto e sabe onde ela está guardada, use-a. Caso precise de uma nova:

1. Confira o projeto e abra [API Keys](https://platform.openai.com/api-keys).
2. Escolha **Create new secret key** e dê um nome que identifique o laboratório.
3. Revise expiração e permissões disponíveis. Uma chave **Read Only** não deve ser tratada como suficiente para inferência. Se usar permissões restritas, permita apenas o necessário para Live e Decisions e confirme o fluxo na conta.
4. Crie e guarde a chave somente no seu computador, em um local privado apropriado. Se a interface informar que o valor só aparece uma vez, salve-o antes de fechar.
5. Na próxima seção, você a colocará no arquivo do servidor. Não a cole na página da Triagem.

Cada participante usa sua própria chave. Não distribua a chave da apresentadora. Se expuser uma chave, revogue-a na plataforma e crie outra; apagar apenas o texto de uma mensagem não elimina a exposição. [Segurança de chaves de API](https://help.openai.com/en/articles/5112595-best-practices-for-api-key-safety).

### 5.8 Deixe a página de consumo acessível

Abra o [Usage Dashboard](https://platform.openai.com/settings/organization/usage). Confira organização, projeto e período do filtro. O seletor de projeto desse painel é independente do projeto escolhido em outras telas, e os horários são UTC. Caso não possa ver o painel, confirme a permissão com o responsável antes de assumir que não houve consumo. [Como ler o painel de uso](https://help.openai.com/en/articles/10478918-api-usage-dashboard).

**Checkpoint:** você sabe qual projeto será cobrado, verificou acesso e limites, escolheu seu orçamento, entende os controles de gasto e tem a chave guardada com segurança. Não iniciou uma sessão da demo ainda.

Use somente relatos fictícios. Não diga nomes, e-mails, senhas, dados de clientes ou detalhes reais do seu trabalho. Sua voz e o relato serão enviados à OpenAI quando você iniciar a sessão.

### Pode avançar? Conta e orçamento

- [ ] Sei qual organização e projeto serão cobrados.
- [ ] Conferi o acesso aos dois modelos e os limites da minha conta.
- [ ] Escolhi um orçamento e conferi os controles de gasto e faturamento, sem presumir que um alerta bloqueia consumo.
- [ ] Tenho uma chave autorizada guardada em local privado e acesso às informações de consumo.
- [ ] Preparei somente relatos fictícios e decidi prosseguir com o envio de áudio/texto e o custo.

**Próximo passo:** somente com esses itens conferidos, vá para [6. Configuração local](#configurar-segredos). Se algo faltar ou você não quiser pagar, vá para [10. Exercício offline](#contrato-offline); nenhuma compra é necessária para esse caminho.

<a id="configurar-segredos"></a>
## 6 Configure o arquivo local com segurança

**Antes de começar:** conclua o checklist de conta e orçamento. Tenha a chave acessível somente no seu computador; não a coloque nas anotações do LAB.

### 6.1 Pare o servidor antes de editar

**Onde:** na janela do terminal em que `npm start` continua rodando.

Pressione **Ctrl+C**. Espere o terminal voltar a aceitar comandos. A pasta ainda deve ser `apps/decisions`; confira com:

```sh
node -p "process.cwd()"
```

Não abra um segundo servidor para aplicar a configuração.

### 6.2 Crie o arquivo a partir do modelo

Se você já tem `apps/decisions/.env.local`, preserve o arquivo e vá para a edição. Não o substitua por uma cópia vazia.

Se ainda não tem, use este comando em qualquer um dos três sistemas:

```sh
node -e "const fs=require('node:fs');fs.copyFileSync('.env.example','.env.local',fs.constants.COPYFILE_EXCL)"
```

**Esperado:** normalmente não há texto de saída. O comando copia o modelo e se recusa a sobrescrever um arquivo existente. `EEXIST` significa que o arquivo já existe; nesse caso, edite-o. `ENOENT` exige conferir a pasta e a presença de `.env.example`.

### 6.3 Confira que o Git ignora esse arquivo

```sh
git check-ignore -v .env.local
```

**Confira:** deve aparecer uma regra `.env.*` e o nome `.env.local`. O caminho e o número da linha do `.gitignore` podem variar.

Se nada aparecer, pare antes de inserir a chave. Confirme a pasta e o `.gitignore` do projeto; não remova regras de proteção para continuar.

### 6.4 Gere o código local da demo

Este código serve para proteger a rota da aplicação local. Ele é diferente da chave de API.

```sh
node -e "console.log(require('node:crypto').randomBytes(24).toString('base64url'))"
```

**Esperado:** uma sequência aleatória de 32 caracteres. Copie essa sequência para preencher `MESA_LIVE_ACCESS_TOKEN` no próximo passo.

Este comando mostra somente o código local recém-gerado, não sua chave OpenAI. Mesmo assim, mantenha-o privado; não faça essa etapa com a tela sendo transmitida ou projetada.

### 6.5 Abra e preencha o arquivo

No Windows, você pode usar:

```powershell
notepad .env.local
```

No macOS ou Linux, abra `.env.local` no seu editor de texto/código, a partir da pasta `apps/decisions`. Use o recurso de abrir arquivo do editor se arquivos iniciados por ponto estiverem ocultos no gerenciador de arquivos. Salve como texto simples, com o nome exato `.env.local`, sem acrescentar `.txt`.

O arquivo tem três variáveis. O bloco abaixo é um **modelo para editar no arquivo**, não um comando de terminal. Substitua os dois textos `SUBSTITUA_...` pelos valores reais somente no seu computador.

```dotenv
MESA_LIVE_ENABLED=false
OPENAI_API_KEY=SUBSTITUA_PELA_SUA_CHAVE_DE_API
MESA_LIVE_ACCESS_TOKEN=SUBSTITUA_PELO_CODIGO_LOCAL_GERADO
```

- `OPENAI_API_KEY`: sua chave do projeto. Ela fica no servidor. Nunca a cole no campo da página.
- `MESA_LIVE_ACCESS_TOKEN`: a sequência aleatória que você acabou de gerar. É essa sequência que será digitada na página.
- `MESA_LIVE_ENABLED`: mantenha `false` até estar pronto para autorizar o envio e o custo.

Não copie os placeholders literalmente esperando que funcionem. Não use espaços adicionais antes/depois dos valores. Não acrescente o prefixo `NEXT_PUBLIC_` a nenhuma dessas variáveis.

Salve o arquivo. Não cole seu conteúdo em chat, issue, screenshot ou ferramenta de suporte. Ele é ignorado pelo Git, mas não é um cofre criptografado. [Como o Next.js trata variáveis de ambiente](https://nextjs.org/docs/app/guides/environment-variables).

Confira novamente:

```sh
git status --short
```

**Checkpoint:** `.env.local` não aparece entre os arquivos a adicionar/alterar. Outros arquivos que você modificou podem aparecer; não os descarte. Não use `git add -f` para incluir o arquivo de configuração.

**Se já houver variáveis configuradas no sistema:** uma `OPENAI_API_KEY` presente no ambiente do processo tem precedência sobre `.env.local`. Uma chave diferente pode ser usada sem que editar este arquivo resolva. Verifique a origem da configuração no seu sistema sem imprimir a chave. Não remova variáveis de outros projetos às cegas.

### 6.6 Habilite somente quando estiver pronto

Depois de conferir acesso, limites e orçamento, altere apenas esta linha no editor:

```dotenv
MESA_LIVE_ENABLED=true
```

Salve. Inicie o servidor novamente na mesma pasta:

**Windows:**

```powershell
npm.cmd start
```

**macOS ou Linux:**

```sh
npm start
```

Se escolheu outra porta, repita o comando com `-- -p 3002`, ou com a porta que você escolheu. Não é preciso instalar tudo novamente para editar essas variáveis.

Abra ou atualize a página `/triagem` na sua URL local. O aviso de modo desativado deve desaparecer. Isso confirma que a configuração mínima foi reconhecida; a conta e o microfone ainda serão verificados pela conexão real.

### Pode avançar? Configuração segura

- [ ] Editei `apps/decisions/.env.local`, preservando um arquivo anterior se ele existia.
- [ ] `git check-ignore` confirmou a proteção, e `.env.local` não aparece no `git status --short`.
- [ ] Substituí os placeholders localmente; diferencio a chave OpenAI do código local de 32 caracteres.
- [ ] Habilitei o modo real por escolha minha e reiniciei o servidor na mesma porta.
- [ ] O aviso de modo desativado desapareceu, sem eu iniciar a sessão ainda.

**Próximo passo:** vá para [7. Primeira triagem](#primeira-triagem). Se a configuração não conferir, não cole segredos para pedir ajuda: use a [seção 11](#resolver-problemas).

<a id="primeira-triagem"></a>
## 7 Faça sua primeira triagem por voz

**Antes de começar:** conclua o checklist da seção 6. Leia primeiro as etapas 7.1 a 7.8 para saber como terminar a sessão; depois siga uma por vez.

### 7.1 Comece com um quadro novo

Se já aparecem cartões ou **Quadro salvo**, siga “Começar outra triagem” na seção 9 primeiro. Para acompanhar os números desta primeira rodada, o quadro deve estar vazio.

Use fones, confirme a saída de áudio do computador e prefira um ambiente silencioso. Não abra duas abas da demo conectadas ao mesmo tempo.

### 7.2 Inicie a sessão

**Onde:** na página `/triagem`, no navegador.

1. No campo **Código de acesso da demo local**, cole o valor de `MESA_LIVE_ACCESS_TOKEN`.
2. Leia o consentimento de envio de áudio/texto e cobrança. Marque-o somente se concordar e estiver autorizado a usar a conta.
3. Clique **Iniciar triagem ao vivo**.
4. Se o navegador pedir microfone, permita o acesso apenas se quiser fazer o teste nessa página local.
5. Espere a indicação de microfone ativo e ouça a saudação. Não clique várias vezes enquanto estiver conectando.

**Pode avançar para o primeiro relato?**

- [ ] A conexão ficou pronta e consigo falar.
- [ ] Ouvi a saudação ou uma resposta da voz.

A legenda sozinha não comprova que o áudio de saída funcionou. Se um item não conferir, encerre a sessão, confira a mensagem de fechamento e consulte a seção 11 antes de tentar novamente.

Se a conexão falhar depois de criar uma sessão, pode haver consumo. Siga a mensagem exibida; não reinicie sessões sucessivas sem conferir o estado e o consumo.

### 7.3 Registre o primeiro relato

Fale uma frase inteira e depois diga o comando:

> Esqueci a senha depois das férias e não entro no e-mail. Registra.

Espere o cartão aparecer antes de falar o próximo problema. Não continue descrevendo outro caso enquanto o primeiro estiver sendo classificado.

**Confira:**

- A legenda **OUVINDO** mostra o que a aplicação entendeu.
- Um cartão aparece no quadro. A equipe esperada para esse exemplo é **Acessos e identidade**.
- O cartão tem confiança e um rótulo de impacto: **Orientação**, **Degradado** ou **Bloqueado**.
- A voz anuncia o resultado.
- O contador aumenta uma tentativa de chamada ao Decisions. Sem tentativas anteriores, passa para 1.

A resposta do modelo pode variar. Confira o relato e o resultado; não aceite uma sugestão apenas porque este guia esperava aquela coluna.

### 7.4 Registre os próximos exemplos

Fale, espere o cartão e só então avance:

> O sistema de reembolso mostra erro 500 para todo mundo e ninguém consegue trabalhar. Registra.

**Esperado:** **Aplicações internas**, com impacto compatível com o bloqueio descrito. O rótulo mais alto da tela se chama **Bloqueado**.

Depois:

> A VPN da filial cai a cada dez minutos e o financeiro parou. Registra.

**Esperado:** **Infraestrutura**. Novamente, equipe e pontuação são sugestões a revisar.

### 7.5 Decida um caso incerto

Fale:

> Nada funciona aqui. Registra.

**Esperado:** **Revisão humana**, pois faltam detalhes sobre serviço e impacto.

1. Localize o cartão na coluna **Revisão humana**.
2. Leia o relato.
3. Para exercitar o controle, escolha uma das equipes disponíveis no cartão. Na vida real, você pediria o contexto que falta antes de encaminhar.
4. Confira que o cartão muda de coluna e mostra **Decidido por você**.

Só cartões que estão em **Revisão humana** têm esses botões. Nesta versão, um cartão já classificado em outra equipe não tem edição, exclusão individual ou reclassificação na tela. Se a sugestão estiver errada, registre a divergência; não finja que o botão existe. Para refazer toda a rodada, encerre e use **Nova triagem**.

Se o exemplo não for para revisão humana, anote o resultado e inspecione a evidência. Não faça uma sequência de chamadas pagas só para forçar a coluna prevista. O exercício offline demonstra essa regra de forma controlada.

### 7.6 Pergunte sobre o quadro

Fale:

> Qual o padrão de hoje?

**Esperado:** a voz responde usando o contexto do quadro. O contador de chamadas ao Decisions não deve aumentar por essa pergunta, pois ela não pede registrar um relato. A sessão de voz continua ativa e pode continuar gerando cobrança.

### 7.7 Veja a evidência

Clique **Evidência da última decisão**. A área mostra a decisão validada pela aplicação, com campos como `team`, `probability`, `confidence` e `score`.

- `probability` representa a resposta à pergunta de contexto.
- `confidence` acompanha a escolha de equipe.
- `score` é o impacto na rubrica de 0 a 2; pode ser fracionário.
- A aplicação manda para revisão humana se o contexto ficar abaixo de 0,8 ou a confiança de equipe ficar abaixo de 0,7. Esses limiares são didáticos, sem calibração de produção.

Essa área mostra o objeto interpretado pelo aplicativo, não o pacote bruto completo de resposta da API. Ao recarregar o navegador, os cartões podem voltar, mas a última evidência não é restaurada.

### 7.8 Encerre de verdade

1. Espere terminar uma classificação em andamento.
2. Clique **Encerrar triagem**.
3. Espere **Conversa encerrada. Microfone liberado.** Uma mensagem equivalente pode informar confirmação tardia ou o motivo do encerramento.
4. Confira o consumo do projeto na plataforma.

O placar ou os cartões na tela não substituem a confirmação de fechamento. Se aparecer **Finalização da sessão não confirmada**, o microfone local pode já ter sido liberado, mas não trate o encerramento remoto como comprovado. Não inicie outra sessão até conferir a situação na plataforma.

**Checkpoint da triagem real:** você falou, ouviu resposta, viu cartões oriundos das chamadas ao Decisions, exercitou revisão humana e confirmou o fechamento. Se alguma etapa não aconteceu, registre exatamente qual ficou pendente.

### Pode avançar? Primeira rodada encerrada

- [ ] Vi os cartões dos relatos classificados e conferi as equipes sugeridas, um relato por vez.
- [ ] Exercitei a escolha em **Revisão humana** e vi **Decidido por você**.
- [ ] Li a evidência de uma decisão e anotei qualquer divergência.
- [ ] Usei **Encerrar triagem**, recebi a confirmação de fechamento e conferi o consumo.

**Se a revisão humana não apareceu:** deixe esse item pendente e registre o resultado real. A seção 10 permite estudar a regra sem novas chamadas pagas; não declare que testou esse controle da tela.

**Próximo passo:** com o fechamento confirmado, leia [8. Fila e limites](#fila-e-limites) e depois [9. Encerramento e retomada](#reset-e-retomada). Se faltaram cartões, áudio ou outro resultado, registre a etapa como parcial. Com fechamento não confirmado, não inicie outra sessão; siga a orientação da seção 11.

<a id="fila-e-limites"></a>
## 8 Entenda fila limites e pausa

**Antes de começar:** use esta seção como consulta se aparecer um limite durante a seção 7 ou leia depois de encerrar. Não provoque um erro 429 para completar o LAB.

### Quando aparece um limite 429

429 é uma resposta de limite de uso. Pode vir da plataforma ou dos controles locais da demo. Ela não significa que o relato foi classificado.

Se acontecer durante uma classificação:

1. Leia o aviso e, quando existir, o tempo de espera.
2. Confira se o relato aparece em **Na fila**, abaixo dos controles. Nenhum cartão foi criado para aquele relato.
3. Evite clicar repetidamente em **Classificar agora** ou **Classificar fila**.
4. Para estudo em casa, prefira pausar/encerrar a voz enquanto aguarda cota, conferindo a confirmação do fechamento.
5. Consulte os limites do projeto. Não presuma que todas as contas têm os mesmos limites por minuto ou dia.

O contador da tela conta tentativas de classificação, inclusive as que falham. Ele pode ser maior que o número de cartões e não é uma fatura da OpenAI.

**Antes de pausar ou atualizar:** confira se o relato virou cartão ou aparece em **Na fila**. Texto que está somente em **OUVINDO** ainda não foi salvo. Uma falha diferente de 429 não o coloca automaticamente na fila; iniciar ou retomar limpa esse texto. Se necessário, repita o relato depois, sem incluir dados reais.

Um 429 também pode exigir conferir saldo, limite de gasto ou limite de uso aprovado. Esperar não resolve todas essas causas, e comprar mais créditos não é a resposta automática. A demo pode apresentar um aviso simplificado: confira a situação da conta e o [diagnóstico oficial de limites](https://help.openai.com/en/articles/6614457-troubleshooting-api-usage-and-spend-limits) antes de decidir o próximo passo.

Se o limite ocorrer ao iniciar a sessão, pode não haver relato a enfileirar: a sessão nem chegou a ficar pronta. Siga a mensagem do início, sem repetir tentativas em sequência.

### Como voltar à fila depois

1. Aguarde o limite indicado e confira se ainda quer autorizar o custo de outra sessão.
2. Abra o mesmo navegador, perfil e endereço local usados antes.
3. Confira **Quadro salvo** e a seção **Na fila**.
4. Informe o código local e marque novamente o consentimento se a página tiver sido recarregada.
5. Clique **Retomar triagem** e espere a conexão.
6. Clique **Classificar fila** uma vez. A aplicação tenta os relatos em sequência e para na primeira falha ou quando a sessão deixa de estar ativa.
7. Confira quais relatos viraram cartões e quais permaneceram na fila. Não repita um relato que já foi classificado.

A fila não é processada em segundo plano com a página fechada. **Retomar triagem** preserva o quadro, mas abre uma nova sessão de voz; o custo e os limites de início voltam a importar.

**Limite da fila nesta versão:** são preservados até 20 relatos pendentes. Acrescentar mais pode descartar os mais antigos. Não use a fila como arquivo permanente ou para relatos importantes. No estudo, pare de acumular relatos quando atingir um limite e resolva a pendência antes de continuar.

### O que cada controle faz

| Controle | Efeito |
| --- | --- |
| Microfone com opção de mutar | Interrompe o envio da captura local enquanto estiver mudo; não fecha a sessão |
| Ícone de voz da assistente | Silencia a reprodução no seu navegador; não encerra a sessão |
| Pausar | Pede o fechamento da sessão e mantém cartões/fila |
| Retomar triagem | Inicia outra sessão com o quadro salvo |
| Encerrar triagem | Pede o fechamento e pode mostrar o resultado final |
| Nova triagem | Apaga o quadro/fila/contador local após sua confirmação; use com a sessão já encerrada |

Se você pausar antes de criar cartões ou fila, o botão pode continuar se chamando **Iniciar triagem ao vivo**, pois não há quadro salvo para retomar.

A demo limita uma sessão por processo, até três inícios e 30 análises por janela de dez minutos. Cliente e servidor tentam encerrar a sessão depois de dez minutos. Esses controles locais não substituem os controles financeiros da plataforma. Reiniciar o servidor reinicia parte dos contadores locais; não use isso para contornar limites.

### Pode avançar? Limites e recuperação

- [ ] Sei que o contador registra tentativas, e que ele pode diferir do número de cartões e da cobrança.
- [ ] Sei distinguir cartão, relato **Na fila** e texto ainda não salvo em **OUVINDO**.
- [ ] Entendi que retomar abre outra sessão de voz e que mutar não encerra a sessão.

**Se houve 429:** anote quais relatos ficaram na fila, a mensagem exibida e se decidiu aguardar, encerrar ou seguir offline. Só marque como processado um relato que realmente virou cartão.

**Próximo passo:** vá para [9. Terminar e voltar outro dia](#reset-e-retomada). Se não houve limite, basta concluir a leitura; não precisa gerar filas ou gastar em novas tentativas.

<a id="reset-e-retomada"></a>
## 9 Termine limpe e volte outro dia

**Antes de começar:** saiba se existe sessão ativa e se há cartões/fila que você quer preservar. Apagar o quadro é opcional; encerrar uma sessão iniciada é necessário.

### O que fica salvo

O navegador tenta salvar cartões, fila e contador de chamadas no armazenamento local, chamado localStorage. Ele não salva nesse registro a chave OpenAI, o código de acesso digitado, o áudio nem a última decisão completa. O texto dos relatos presentes nos cartões e na fila fica salvo. Texto somente em **OUVINDO** não é persistido.

Os dados pertencem àquela origem, navegador e perfil. Outra porta, outro perfil, navegação privada ou limpeza dos dados do site podem mudar o que será restaurado. Se o armazenamento estiver bloqueado ou cheio, a restauração pode não funcionar. Não dependa dele como backup.

Recarregar a página não é um reset do quadro nem comprovação de que a sessão remota encerrou. Antes de atualizar ou fechar a aba durante a atividade, prefira usar o controle de encerrar e conferir a resposta.

### Começar outra triagem com o quadro vazio

1. Se houver sessão ativa, clique **Encerrar triagem** e confirme o fechamento.
2. Nos controles de acesso, procure **Quadro salvo** e clique **Nova triagem**.
3. Leia a confirmação **Apagar o quadro atual e começar uma nova triagem?**.
4. Confirme somente se puder perder esses dados fictícios.
5. Confira o aviso **Quadro limpo. Pronto para uma nova triagem.** e as quatro colunas vazias.

Esse reset limpa o estado local da demo. Não revoga sua chave, não apaga histórico de consumo da conta e não substitui o fechamento remoto.

**Limitação desta versão:** **Nova triagem** só aparece quando há cartões ou fila. Se só ocorreram falhas e restou apenas um contador acumulado, o botão não aparece. Registre esse contador e compare o aumento de cada tentativa; não conclua que houve uma chamada nova só porque o número inicial não é zero.

### Desativar o modo real ao terminar

1. Confirme o encerramento na página.
2. No terminal do servidor, pressione Ctrl+C.
3. Abra `apps/decisions/.env.local` no editor.
4. Troque `MESA_LIVE_ENABLED=true` por `MESA_LIVE_ENABLED=false` e salve.
5. Se iniciar o servidor novamente, a página deve informar que o modo ao vivo está desativado.

Se não quiser manter a chave nesse computador, remova o valor do arquivo pelo editor. Quando necessário, revogue a chave na página de chaves da plataforma. Excluir um valor local não revoga a credencial no serviço.

### Voltar outro dia

Você não precisa clonar nem instalar tudo de novo se não mudou o código ou as dependências.

1. Abra a pasta do projeto que você anotou na seção 2.
2. Entre em `apps/decisions` e confira o caminho.
3. Confira novamente orçamento, acesso e limites se for usar a API real.
4. Reative `MESA_LIVE_ENABLED=true` somente se decidir fazer outro teste pago.
5. Execute o mesmo comando `npm start` ou `npm.cmd start`, com a mesma porta.
6. Abra a mesma URL `/triagem`.
7. Escolha entre **Retomar triagem**, para preservar o quadro, e **Nova triagem**, para começar vazio.

Se editou código, gere a build novamente antes de `npm start`. Se atualizou o repositório e o lockfile mudou, repita a instalação de dependências e a build. `npm run dev` fica para quem estiver editando o código; este percurso usa a build.

### Pode concluir? Encerramento

- [ ] Se iniciei voz real, confirmei o fechamento antes de fechar a aba ou parar o servidor.
- [ ] Decidi preservar o quadro ou apagá-lo. Se apaguei, confirmei o aviso e as colunas vazias.
- [ ] Parei o servidor com Ctrl+C ao terminar.
- [ ] Se configurei o modo real, deixei `MESA_LIVE_ENABLED=false` e mantive os segredos privados.

**Próximo passo:** preencha o [checklist de conclusão](#conclusao). A [seção 10](#contrato-offline) é uma prática adicional sem API; não é obrigatória para repetir uma rodada de voz já concluída.

### Quando voltar outro dia, confira

- [ ] Abri a mesma pasta e conferi se preciso reinstalar dependências ou gerar uma nova build.
- [ ] Se escolhi voz real, reconferi orçamento/acesso e reativei o modo conscientemente.
- [ ] Iniciei o servidor e abri a mesma origem e porta.
- [ ] Escolhi preservar ou limpar o quadro antes de iniciar; sei que retomar cria outra sessão.

**Próximo passo:** para uma rodada com quadro vazio, volte à [seção 7](#primeira-triagem). Para preservar o quadro, use **Retomar triagem** e confirme a conexão antes de acrescentar relatos; se houver fila pendente, siga a [seção 8](#fila-e-limites). Ao terminar, repita o checklist de encerramento. Não marque esta segunda execução como feita se ainda não a realizou.

<a id="contrato-offline"></a>
## 10 Faça o exercício offline sem chave

**Antes de começar:** conclua as seções 1, 2 e 3. Se veio da voz real, confira primeiro o fechamento da sessão; não precisa ativar nem manter o modo real para este exercício.

Este caminho exige somente Node na versão aceita e a cópia do projeto. Não exige instalar as dependências da interface, conta de API, servidor ou microfone.

Se o terminal estiver ocupado com o servidor, encerre uma eventual sessão de voz na página primeiro e confirme o fechamento. Depois pressione Ctrl+C no terminal. Se você está em `apps/decisions`, volte à raiz:

```sh
cd ../..
```

```sh
node -p "process.cwd()"
```

**Confira:** o caminho termina em `devday-exchange-community-rio-2026`.

### 10.1 Leia uma resposta completa

```sh
node exercises/decisions-contract/inspect.mts exercises/decisions-contract/fixtures/completo.json
```

**Confira na saída:**

```json
{
  "mode": "fixture local; nenhuma API foi chamada",
  "team": "applications",
  "score": 1.25,
  "canCreateBeforeReview": false,
  "canCreateAfterReview": true,
  "ticketCreated": false
}
```

Esse trecho omite outros campos da saída para destacar o que comparar. O script reutiliza o contrato e o estado da Alô, TI. Os campos de criação/revisão pertencem àquele estado de estudo; não são botões da página Triagem.

### 10.2 Veja o caso incerto

```sh
node exercises/decisions-contract/inspect.mts exercises/decisions-contract/fixtures/incerto.json
```

**Confira:** `team` é `human`. A resposta de equipe pode estar bem formada, mas o contexto insuficiente mantém a revisão humana.

### 10.3 Veja uma recusa de contrato

```sh
node exercises/decisions-contract/inspect.mts exercises/decisions-contract/fixtures/recusado.json
```

**Confira:** aparece `CONTRATO_REJEITADO`, e o comando termina com código de saída 1. Essa falha é esperada para esse arquivo. Nenhum cartão ou ticket é criado.

`ARQUIVO_INVALIDO` tem outro significado: o arquivo não foi lido ou não contém JSON válido. Nesse caso, confira caminho e conteúdo; não considere que demonstrou a recusa do modelo.

### 10.4 Confira as regras próprias do quadro

```sh
node --test apps/decisions/tests/triage.test.mts
```

**Esperado nesta versão:** nove testes aprovados, zero falhas. Eles incluem extração do relato, contagem de tentativas, revisão humana, fila, restauração do quadro e resumo curto.

### 10.5 Explique o que você observou

Abra no editor:

- [`live-contract.ts`](../../apps/decisions/src/domain/live-contract.ts): perguntas `predicate`, `choice`, `score` e validação em `parseDecision`.
- [`triage.ts`](../../apps/decisions/src/domain/triage.ts): estado, cartões, fila e revisão humana.

Responda com suas palavras:

1. O que `predicate` pergunta sobre o contexto?
2. Quais equipes `choice` permite?
3. Por que um `score` de 1,25 é válido?
4. Quando uma resposta bem formada ainda vai para **Revisão humana**?

As respostas se relacionam pelo campo `name`, não pela ordem em que aparecem no JSON. A fixture completa foi escrita fora da ordem das perguntas para mostrar isso.

**Entrega offline:** registre as saídas completa, incerta e recusada, além do resultado dos nove testes. Escreva: “Executei contrato e regras locais. Não executei voz nem inferência real.”

### Pode concluir? Exercício offline

- [ ] A fixture completa mostrou `team: "applications"`, `score: 1.25` e `ticketCreated: false`.
- [ ] A fixture incerta mostrou `team: "human"`.
- [ ] A fixture recusada mostrou `CONTRATO_REJEITADO`; reconheci essa falha esperada.
- [ ] Os testes de `triage.test.mts` terminaram com zero falhas, e conferi a contagem da minha versão.
- [ ] Registrei as saídas e respondi às quatro perguntas da seção 10.5.

**Próximo passo:** preencha o [checklist de conclusão](#conclusao). Você concluiu o caminho offline quando esses resultados conferem; microfone, cartões da interface e conta de API não são requisitos desse caminho.

<a id="resolver-problemas"></a>
## 11 Resolva problemas sem expor segredos

**Use quando precisar:** localize o sintoma, aplique a orientação e repita somente a verificação da etapa que falhou. Não marque etapas seguintes para compensar uma falha anterior.

| O que você vê | Confira | Próximo passo |
| --- | --- | --- |
| `node` ou `git` não reconhecido | Instalação e terminal reaberto | Repita a seção 1 |
| Bloqueio de `npm.ps1` | Você está no PowerShell | Use `npm.cmd`; não mude política do sistema |
| `EBADENGINE` | Versão de Node | Use a faixa 24.12.0 a 24.21.0 e reabra o terminal |
| Pasta de destino do clone já existe | Cópia anterior | Abra a cópia ou escolha outra pasta; não sobrescreva |
| `Missing script: start` ou `ENOENT` de package.json | Pasta atual | Entre em `apps/decisions` |
| `Cannot find module` no teste | Pasta atual e caminho copiado | Volte à raiz quando o comando começar com `apps/` ou `exercises/` |
| `EADDRINUSE` | Porta do servidor | Use a alternativa da seção 4.6 |
| Página não abre | Servidor ainda rodando e URL | Confira a porta e `/triagem`; iniciar o portal não inicia a aplicação |
| Modo ao vivo continua desativado | Nome/local do arquivo, valores e servidor reiniciado | Confira `.env.local` dentro de `apps/decisions`, sem extensão `.txt` |
| Botão cinza | Modo habilitado, 32 caracteres no código, consentimento e conexão ociosa | Complete o que falta, sem colar a chave da API na página |
| Acesso da demonstração inválido | Código local | Use o mesmo valor de `MESA_LIVE_ACCESS_TOKEN`, sem espaços extras |
| Microfone negado | Permissão da página e do sistema | Autorize apenas se quiser continuar; senão use o offline |
| Legenda aparece, mas não há som | Volume, saída de áudio, ícone de voz e permissões de reprodução | Confira esses itens; se continuar, encerre e registre que áudio não funcionou |
| “Registra” não cria cartão | Relato aparece em OUVINDO e não há análise em andamento | Clique **Classificar agora** uma vez e anote que usou o botão |
| Aviso de limite | Limite local ou da plataforma | Siga a seção 8, sem tentativas repetidas |
| Cartão na equipe errada | Texto reconhecido e evidência | Registre a divergência; só a coluna de revisão tem escolha manual |
| Finalização não confirmada | Aviso final e consumo da plataforma | Não inicie outra sessão em sequência |
| Cartões voltaram depois de F5 | Armazenamento local | Use **Nova triagem** depois de encerrar, se quiser apagá-los |

Ao pedir ajuda, compartilhe a mensagem de erro, a etapa, a versão de Node e o sistema operacional. Oculte dados privados e não envie `.env.local`, chave, código de acesso ou uma captura que os mostre.

<a id="aprofundar"></a>
## 12 Continue praticando

**Opcional:** faça depois de concluir um dos caminhos. Para os experimentos com fixtures abaixo, conclua primeiro a seção 10. Anote uma mudança, sua previsão e a saída antes de experimentar outra.

No [exercício offline de contrato](../../exercises/decisions-contract/README.md), copie `incerto.json` pelo editor para outro arquivo, sem alterar o original. Mude uma coisa por vez e preveja a saída antes de executar:

No arquivo JSON, o separador decimal é **ponto**, mesmo que o texto em português use vírgula. Localize cada resposta pelo campo `name`:

1. Na resposta com `"name": "contexto"`, aumente `probability` de `0.4` para `0.96`.
2. Na resposta com `"name": "equipe"`, reduza `confidence` para `0.5`.
3. Na resposta com `"name": "impacto"`, experimente `score: 1.75`, mantendo as aspas existentes no nome do campo.
4. Duplique uma resposta ou use uma equipe que o contrato não permite.

Anote entrada, previsão e resultado. Depois, se quiser editar a aplicação, experimente um texto de anúncio ou a regra de coluna em `triage.ts` e confira os testes. Não remova os limites de segurança para fazer um exemplo passar.

<a id="conclusao"></a>
## Checklist de conclusão

Confira somente o caminho que você escolheu. Nas suas anotações, use **feito**, **pendente** ou **não se aplica**, sem marcar como executado o que apenas leu.

### Para todos os caminhos

- [ ] Registrei meu sistema, versão do Node, commit e caminho escolhido.
- [ ] Sei em qual pasta executar os comandos e diferencio portal público de aplicação local.
- [ ] Anotei os resultados e as pendências sem expor credenciais ou dados pessoais.

### Se fiz voz real

- [ ] Completei a seção 7: falei, ouvi resposta real, vi pelo menos três cartões e exercitei **Revisão humana**.
- [ ] Confirmei o fechamento da sessão e conferi o consumo do projeto.
- [ ] Entendi o que fica salvo e como preservar ou apagar o quadro.
- [ ] Parei o servidor, desativei o modo real e protegi minha chave.

Se faltou um resultado, registre **rodada parcial** e o item pendente. O estudo offline pode complementar a compreensão, mas não comprova o controle de voz ou da tela que faltou.

### Se fiz somente offline

- [ ] Completei a seção 10: saídas completa/incerta/recusada, testes locais e respostas sobre o contrato.
- [ ] Registrei: “Executei contrato e regras locais. Não executei voz nem inferência real.”

Você não precisa configurar chave, provar revisão na tela ou desativar um modo real que nunca configurou.

### Se apenas conheci a interface

- [ ] Completei a seção 4, vi a página `/triagem` e parei o servidor.
- [ ] Registrei: “Abri a interface local. Ainda não executei a rodada de voz nem o exercício de contrato.”

Isso conclui a exploração da tela; para praticar a classificação, escolha depois o caminho real ou o offline.


## Referências para continuar estudando

- [Decisions API](https://developers.openai.com/api/docs/guides/decisions): perguntas, respostas e contrato.
- [Voz com Decisions](https://developers.openai.com/api/docs/guides/decisions-voice): delegação para o cliente.
- [Detalhes da integração local](../../docs/integracao-live.md): proteção do servidor e a trilha opcional da Alô, TI.
- [Registro de validação](../../docs/validacao.md): evidências por etapa e por versão.
