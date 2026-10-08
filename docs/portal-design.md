# Proposta de design: portal DevDay Exchange Community Rio 2026

Data: 8 de outubro de 2026. Status: direção e implementação aprovadas em conversa. Publicação e configuração real de login continuam pendentes.

## Objetivo e limites

Dar aos participantes uma entrada bonita, rápida e intuitiva para escolher um dos quatro LABS, preparar o ambiente e continuar praticando em casa. Conteúdo e interface em português brasileiro. O GitHub continua sendo a fonte editorial; o site é outra apresentação dos mesmos arquivos Markdown.

O portal é um novo subsistema estático, isolado da demo. Não altera contratos, testes, dependências ou código de `apps/decisions`. GitHub Pages serve o material. A demo Alô, TI e seu backend de voz continuam locais. Não haverá formulário de chave OpenAI, chamada de inferência, captura de microfone ou custo de IA no portal. A rota `/apresentadora` terá login GitHub por Firebase Auth e notas privadas no Firestore do plano Spark, após configuração e autorização separadas.

Base verificada: PR #3 mergeado em 7/10/2026 às 22:31:33 UTC; `main` em `0380021075681e323674ad0a7df08296f1197858`.

## Tecnologia recomendada

**Astro + Starlight, com home personalizada em Astro e leitura dos LABS em Starlight.** O portal será um pacote independente em `portal/`, com lockfile próprio, TypeScript, CSS nativo e saída estática. Fixar versões estáveis compatíveis na implementação; não adotar prévias de framework por padrão.

- **Astro + Starlight:** melhor equilíbrio entre home de evento própria e documentação pronta. Starlight fornece navegação, sumário, busca Pagefind e apresentação de código; permite páginas Astro personalizadas. CSS e poucos componentes específicos dão identidade sem reescrever o leitor. A adaptação dos Markdown atuais exige uma pequena etapa de geração e testes de links. Fontes: [Starlight](https://starlight.astro.build/), [páginas personalizadas](https://starlight.astro.build/guides/pages/), [busca estática](https://starlight.astro.build/guides/site-search/).
- **VitePress:** alternativa sólida para documentação, também transforma Markdown em HTML e permite temas próprios. A navegação padrão hidrata como uma SPA Vue. Seria atraente se já houvesse uma base Vue ou se a prioridade fosse o tema documental padrão; aqui oferece menos vantagem para a home de evento. Não é inadequado nem inerentemente lento. Fontes: [o que é VitePress](https://vitepress.dev/guide/what-is-vitepress), [publicação](https://vitepress.dev/guide/deploy).
- **HTML/CSS/JavaScript simples:** menor dependência inicial, mas conversão Markdown, busca, índice de página, acessibilidade da navegação e manutenção virariam responsabilidades nossas. Com uma única página seria suficiente; para um portal de leitura com vários guias, o custo próprio não compensa. Esta comparação de manutenção é uma avaliação de arquitetura, não um benchmark.

Não usar Next.js só porque a demo o utiliza: o portal não precisa de seu backend. Não adicionar React, Vue, Tailwind, GSAP ou biblioteca de animação sem uma necessidade concreta. Starlight é a base visual funcional; a home tem uma linguagem editorial de evento, não uma cópia da interface GitHub.

## Direção visual

Leitura do design: portal de encontro técnico comunitário, acolhedor, energético e legível, com a identidade real do evento e um leitor de documentação calmo.

Parâmetros: `DESIGN_VARIANCE: 6`, `MOTION_INTENSITY: 4`, `VISUAL_DENSITY: 4`. A composição varia na home; nas instruções, previsibilidade e legibilidade prevalecem.

- Tema claro único: branco, cinzas frios e azul para links, ações e foco. Sem alternar seções claras e escuras. A arte original conserva suas cores.
- Banner existente inspecionado: 7680 × 4320, 16:9, fundo branco, formas azuis, verdes, laranjas, roxas e pretas, com os nomes OpenAI e DevDay Exchange Community Event. Exibir inteiro, sem sobrepor texto nem recortar logotipos. Gerar derivados responsivos no build, mantendo o JPEG original intocado.
- Tipografia: sans-serif nítida, preferencialmente Geist autohospedada se a licença e o pacote forem confirmados; fallback de sistema. Monoespaçada apenas para comandos e metadados técnicos.
- Títulos fortes, parágrafos curtos e boa área em branco. Raios consistentes: 12 px em superfícies e 8 px em controles. Evitar grades genéricas repetidas, excesso de badges e efeitos de vidro.
- Foto e links da Glaucia reaproveitados exatamente do README; nada de pessoas ou credenciais inventadas. Manter a declaração de evento organizado pela comunidade.

## Home e navegação

1. **Cabeçalho compacto:** nome do encontro, LABS, Preparação, Alô, TI, Materiais e GitHub. Busca acessível. Até 72 px de altura; menu recolhido quando os itens não couberem em uma linha.
2. **Abertura assimétrica:** título e chamada à esquerda; banner completo à direita. Data, horário e local extraídos do material atual em uma faixa de contexto. Ação principal “Escolher LAB”; secundária “Inscreva-se” para o Luma. No celular, texto e ações antes do banner; sem altura de tela forçada.
3. **Prepare seu ambiente:** faixa curta com acesso ao checklist e comandos iniciais. Deixar clara a diferença entre requisitos do material offline e acesso ao produto de cada LAB.
4. **Quatro LABS:** grade 2 × 2 com Dots, Codex CLI, Codex Cloud e Decisions API, preservando a ordem do README. Cada entrada mostra objetivo extraído do guia e o link de início. Duração, se exibida, continua rotulada como sugestão. Não transformar essa ordem em agenda de palco.
5. **Alô, TI:** destaque para o service desk fictício e o guia “Executar localmente”. Estado simulado e limites da integração real visíveis. Sem botão que sugira abrir uma demo hospedada ou iniciar voz no Pages.
6. **Materiais:** programação, exercício, referências, guia da apresentadora e validação. Agrupamento curto, sem uma segunda grade idêntica à dos LABS.
7. **Sobre a Glaucia e rodapé:** foto, bio e redes do README; licença, avisos de terceiros, organização comunitária e retorno ao início.

A referência [AI Engineering from Scratch](https://aiengineeringfromscratch.com/index.html) inspira o início rápido, a escolha clara de trilhas e a proximidade do GitHub. Não copiar sua marca, currículo extenso, métricas, progresso, ilustrações ou textos. A avaliação da referência foi estrutural pelo conteúdo acessível; não foi uma auditoria visual completa em navegador.

## Páginas de leitura e fonte única

O leitor mantém navegação lateral, sumário de seções, comandos com botão de cópia, links de origem e busca local. Em telas pequenas, a navegação e o sumário são recolhidos com controles explícitos. Os LABS continuam independentes; anterior/próximo indicam navegação, não dependência obrigatória.

Um manifesto contém somente rotas, arquivos de origem, seletores de seção e metadados de apresentação. Títulos e texto vêm dos Markdown. A etapa de geração prepara arquivos transitórios para Starlight, ignorados pelo Git; esses arquivos não são editados manualmente nem representam uma segunda fonte editorial. O build falha se uma origem ou seção esperada desaparecer.

| Rota, sob a base do projeto | Fonte canônica |
| --- | --- |
| `/` | Blocos selecionados do `README.md`, incluindo evento, banner, bio e redes |
| `/prepare-se/` | Seções preparação, validação e checklist do `README.md` |
| `/labs/dots/` | `labs/01-dots/README.md` |
| `/labs/dots/cenario/` | `labs/01-dots/cenario.md` |
| `/labs/codex-cli/` | `labs/codex-cli/README.md` |
| `/labs/codex-cloud/` | `labs/codex-cloud/README.md` |
| `/labs/decisions/` | `labs/02-decisions-typescript/README.md` |
| `/alo-ti/` | `apps/decisions/README.md` e link para a seção de execução do README raiz |
| `/materiais/` | Índice derivado dos arquivos explicitamente selecionados |
| `/materiais/<guia>/` | Programação, referências, validação, guia da apresentadora, arquitetura e integração local em `docs/` |
| `/exercicio/` | `exercises/ticket-router/README.md` |

Detalhes obrigatórios do adaptador:

- Importar apenas fontes explicitamente permitidas. Nunca publicar a árvore inteira, `.env`, logs ou resultados privados de testes.
- Interpretar Markdown/GFM e HTML já presente; preservar tabelas, `details`, blocos de código, avisos e âncoras. Não depender de substituição global ingênua por regex.
- Reescrever links relativos de documentos para a rota publicada e preservar fragmentos. Links a código ou diretórios sem página apontam para o caminho correto no GitHub. URLs externas permanecem intactas.
- Resolver também `href` e `src` do HTML embutido. Os links de origem/edição apontam para o Markdown real, nunca para o arquivo transitório.
- Preservar âncoras explícitas do README; quando uma seção aparecer em outra rota, usar o mapa de seção para produzir o destino certo.
- Não transformar exemplos Markdown em MDX executável. Sanitizar HTML de apresentação com lista de elementos/atributos permitidos, preservando o conteúdo didático necessário.
- Não alterar nem remover o guia legado `labs/03-codex-cloud-cli/README.md`; ele continua explicando a separação entre CLI e Cloud.

## Movimento, acessibilidade e desempenho

- Entrada suave e única do hero e revelação discreta de seções por IntersectionObserver; 160–280 ms, deslocamento máximo de 8 px. Hover e foco comunicam ação. Nada de parallax, rolagem capturada, cursor customizado ou animação infinita.
- Todo conteúdo permanece visível se o JavaScript falhar. `prefers-reduced-motion: reduce` remove deslocamentos e rolagem suave. O movimento não carrega instruções exclusivas.
- Skip link com foco real no conteúdo principal, headings em ordem, um H1 por página, foco visível e nenhum controle somente por hover. Menu e busca funcionam por teclado, fecham por Escape e devolvem o foco.
- Alvos de toque de aproximadamente 44 px; contraste AA; links distinguíveis sem depender apenas de cor. Testar zoom de 200%, 320 px de largura e ausência de overflow global.
- Imagens com dimensões, `srcset` e formatos otimizados; foto abaixo da dobra com carregamento tardio. O JPEG de 2,48 MB não será enviado indiscriminadamente a todo celular.
- Busca Pagefind carrega quando usada. Leitura, navegação básica e comandos continuam disponíveis sem JavaScript. Estados de busca vazia, indisponível e sem resultado têm texto claro.

## GitHub Pages e entrega

Configuração pretendida: `site: https://glaucia86.github.io` e `base: /devday-exchange-community-rio-2026`. A URL final só será anunciada como disponível depois de a publicação ser verificada. Gerar HTML real para cada rota e testar acesso direto, refresh, assets e busca com a base de projeto.

Workflow separado do existente: PR executa validação/build e produz artefato de revisão; deploy somente de `main`, após aprovação e dentro da autorização de publicação. Usar Actions oficiais com SHAs verificados. O job de deploy recebe apenas as permissões necessárias de Pages/OIDC; o de build permanece somente leitura. Não modificar o workflow de testes da demo para fazer o site passar.

Pode haver um passo em Settings → Pages para selecionar GitHub Actions como fonte. Isso precisa ser verificado no momento da configuração, não presumido. O desenho não depende de chave de API ou segredo novo. Fontes: [Astro no GitHub Pages](https://docs.astro.build/en/guides/deploy/github/), [natureza estática e URL de projeto do Pages](https://docs.github.com/en/pages/getting-started-with-github-pages/what-is-github-pages).

## Critérios de aceite

1. Home, preparação, quatro LABS, Alô, TI local e materiais navegáveis em português.
2. Mudança em Markdown de origem altera o build sem editar uma cópia de conteúdo.
3. Todos os links e fragmentos internos, assets e caminhos GitHub resolvem sob a base real do Pages.
4. Conteúdo legível sem JavaScript; busca e controles com estados adequados; navegação por teclado verificada.
5. Capturas revisadas em desktop e celular; reduced motion, zoom e menu mobile exercitados.
6. Testes do adaptador cobrem HTML embutido, `README.md`, links de pastas/código, acentos, fragmentos e fontes ausentes.
7. Build, tipos, testes, inspeção de HTML e checagens existentes da demo passam para o SHA final. Não afirmar que testes de voz simulados comprovam áudio real.
8. Nenhum backend da demo, segredo, formulário de chave ou chamada de IA incluído na publicação.
9. Após deploy autorizado, abrir a home e uma rota profunda, verificar HTTP, assets, navegação e busca na URL pública.

## Ajuste documental identificado

`THIRD_PARTY_NOTICES.md` ainda afirma que o banner não foi incorporado à branch textual, embora o arquivo já exista. Corrigir apenas esse estado factual ao preparar o portal e preservar a declaração de que a licença MIT não concede direitos sobre a arte e marcas. Não inventar autorização, patrocínio ou novos termos de licença.

## Área exclusiva da apresentadora

O HTML e o JavaScript da rota `/apresentadora` são públicos. Eles contêm apenas a interface, nunca notas ou credenciais. A privacidade é garantida pelas regras do Firestore, não por esconder a rota ou comparar um nome no navegador.

- Firebase Spark apenas, sem cobrança, cartão, Blaze, Functions ou Storage. O uso gratuito tem quotas; excedê-las deve resultar em indisponibilidade tratada, nunca upgrade automático. [Planos Firebase](https://firebase.google.com/pricing).
- Login por `signInWithPopup` e GitHub, sem solicitar acesso a repositórios, adicionar escopos ou extrair o token OAuth do GitHub. Projeto, provedor, domínio autorizado e callback serão configurados depois, com autorização própria. [Login GitHub oficial](https://firebase.google.com/docs/auth/web/github-auth).
- Configuração incompleta mantém a interface desativada e sem inicializar serviços remotos. Variáveis públicas do Firebase são distintas de segredo OAuth, token, senha ou chave OpenAI; segredos nunca entram no bundle ou Actions. [Configuração e API keys do Firebase](https://firebase.google.com/docs/projects/api-keys).
- Regra padrão versionada nega toda leitura e escrita. Um template testado para ativação posterior exige UID Firebase exato da proprietária e provedor `github.com`, com caminho `/presenter/{uid}/notes/evento`. Nenhum username ou e-mail substitui esse UID. [Condições de regras](https://firebase.google.com/docs/firestore/security/rules-conditions).
- Uma nota de texto geral, sem anexos, tem schema fechado, limite de tamanho e timestamp do servidor. Leitura e salvamento são explícitos, sem consulta ampla, autosave ou assinatura contínua.
- Sessão e cache ficam somente em memória; logout limpa imediatamente interface e dados. Respostas atrasadas não podem repor notas depois do logout. Erros não exibem credenciais ou conteúdo privado.
- Notas nunca entram em Markdown, Git, build, assets, Pagefind, logs, capturas reais ou artefatos de CI. A rota fica fora da busca e marcada para não indexação; isso é defesa complementar, não autorização.
- Testes usam somente notas fictícias e UID fictício no emulador `demo-`. Cobrem regras negando usuário anônimo, UID errado, provedor errado, path errado, schema extra e dados grandes; cobrem acesso permitido apenas ao UID/provedor de teste. [Testes de regras](https://firebase.google.com/docs/rules/unit-tests).

## Próxima entrega

Implementar e testar em `dev/github-pages-portal`, entregar draft PR e capturas de dados exclusivamente fictícios. Não fazer merge, publicar no Pages, criar OAuth app/grant/token, configurar Firebase real ou ativar plano pago. A integração real permanece pendente até configuração manual autorizada e validação posterior.
