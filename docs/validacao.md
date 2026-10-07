# Estado da validação

[Início](../README.md) · [Guia da apresentadora](guia-apresentadora.md)

**7 de outubro de 2026.** Material escrito, comportamento testado e integração real são estágios diferentes.

## Evidência observada

| Verificação | Resultado |
| --- | --- |
| Encaminhador starter | 3 testes aprovados |
| Encaminhador solução | 8 testes aprovados |
| Domínio Mesa TI + proteção de fala | 15 testes aprovados |
| Instalação, TypeScript e build Next.js | Aprovados no GitHub Actions |
| Interface Chromium | Fluxo mock aprovado, sem erros não capturados no navegador |
| Capturas desktop e celular | Inspecionadas; sem corte, sobreposição ou overflow horizontal observado |
| Voz real pelo dispositivo | Ainda não ensaiada; regressão usa simulação da API do navegador |
| GPT-Live + Decisions | Arquitetura documentada; ainda não implementada/conectada ou validada de ponta a ponta |
| Dots / Codex CLI / Codex Cloud | Guias disponíveis; fluxos nos produtos ainda não ensaiados |

O conjunto unitário contém **26 testes**. Testes de seleção de fala não comprovam que áudio foi ouvido.

## Execuções de referência

- [26 testes e links locais](https://github.com/glaucia86/devday-exchange-community-rio-2026/actions/runs/37650412472), commit 3f5522749bd911460d676bb3aabdd825800854f3
- [TypeScript e build](https://github.com/glaucia86/devday-exchange-community-rio-2026/actions/runs/37650844453), commit 7c3045e5768cfcb41d64685b24cef122dea8dec4
- [Fluxo Chromium e capturas](https://github.com/glaucia86/devday-exchange-community-rio-2026/actions/runs/37652351449), commit 70ba748ef9709f5e1cc071e5c25a3958c8385b9c

Ambiente: Ubuntu 24.04, Node.js 24.21.0. Os manifests resolvidos na terceira execução foram preservados para instalação com npm ci. Consulte também a execução correspondente ao HEAD da branch; uma aprovação de um SHA anterior não valida alterações posteriores.

O teste de navegador cobre: cenário, bloqueio antes da revisão humana, correção, alteração de título, criação do ticket, ambiguidade, reset durante análise, texto livre, falha/nova tentativa, ausência de overflow horizontal e erros não capturados. A regressão de carregamento tardio de voz é simulada; a nova execução no HEAD deve confirmar seu resultado.

## Como repetir

Na raiz, com Node.js 22.18+:

```bash
node --test exercises/ticket-router/starter/router.test.mjs
node --test exercises/ticket-router/solution/router.test.mjs
node --test apps/decisions/tests/*.test.mts
node scripts/check-doc-links.mjs
```

Instalação, build e navegador: [README da aplicação](../apps/decisions/README.md).

A CI usa runners padrão do repositório público e permissões de leitura. Os pacotes vêm do registro público npm. Não recebe segredos de modelo, não chama OpenAI, não publica aplicações e não faz deploy. URLs externas e âncoras dos documentos não são validadas automaticamente.

## O que ainda falta

- Ensaiar projeção e acessibilidade com teclado/leitor de tela
- Ouvir a saída real de áudio em dispositivos-alvo
- Implementar o adaptador GPT-Live/Decisions após autorização de configuração; ensaiar fala, transcrição, interrupção e resposta tardia
- Ensaiar os LABS nos produtos Dots, Codex CLI e Codex Cloud
- Confirmar limites de acesso e consumo antes de qualquer API real

Nos próximos ensaios, registrar data, commit, ambiente, versões, comandos, resultados e limitações. Falha continua sendo falha; mock continua sendo mock.
