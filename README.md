# DevDay Exchange Community · Rio de Janeiro 2026

**Dos anúncios à prática. Da primeira ideia a um resultado que você consegue revisar.**

Material original em português para desenvolvedores, estudantes e builders explorarem os aprendizados do OpenAI DevDay 2026 e continuarem praticando depois do encontro.

**24 de outubro de 2026 · IBMEC Barra · Rio de Janeiro**

[Inscreva-se no Luma](https://luma.com/wzk8q92k) · [Guia da apresentadora](docs/guia-apresentadora.md) · [Programação](docs/programacao.md) · [Referências](docs/referencias.md) · [Estado da validação](docs/validacao.md)

## Escolha seu LAB

São quatro temas independentes. A ordem abaixo é de navegação, não uma nova ordem de palco.

| LAB | O que você vai praticar | Material disponível |
| --- | --- | --- |
| **Dots** | Dar contexto, limitar ações e revisar uma entrega | [Cenário e passo a passo](labs/01-dots/README.md) |
| **Codex CLI** | Acompanhar uma mudança no terminal e verificar testes | [LAB do CLI](labs/codex-cli/README.md) |
| **Codex Cloud** | Delegar uma tarefa remota e revisar sua entrega | [LAB do Cloud](labs/codex-cloud/README.md) |
| **Decisions API** | Inspecionar uma decisão tipada, corrigir o relato e confirmar o encaminhamento | [LAB Decisions](labs/02-decisions-typescript/README.md) |

CLI e Cloud compartilham um [exercício fictício](exercises/ticket-router/README.md), com instruções e objetivos separados. A experiência de voz para voz pertence a Decisions, não constitui um quinto tema.

## Comece aqui

1. **Participante:** abra um LAB e confira requisitos, passos, resultados esperados e reset.
2. **Apresentadora:** use o [roteiro próprio](docs/guia-apresentadora.md), com preparação, falas-chave e plano B.
3. **Quer executar algo sem conta ou chave?** Rode os testes do encaminhador e do domínio de Mesa TI, abaixo.
4. **Quer explorar a interface?** Confira primeiro o [README da aplicação](apps/decisions/README.md) e o [estado da validação](docs/validacao.md).

Com Node.js 22.18 ou posterior, na raiz do repositório:

```bash
node --test exercises/ticket-router/starter/router.test.mjs
node --test exercises/ticket-router/solution/router.test.mjs
node --test apps/decisions/tests/*.test.mts
```

Esses comandos não exigem instalação de pacotes nem acesso à OpenAI.

## O que está pronto e o que ainda precisa de ensaio

- Cenários, quatro guias e guia da apresentadora disponíveis
- Encaminhador didático e domínio de Mesa TI com testes automatizados
- Interface Mesa TI em Next.js, TypeScript, Tailwind CSS 4 e Lucide; build e TypeScript aprovados, dependências fixadas e capturas desktop/celular inspecionadas
- Mock claramente identificado, sem microfone ou chamadas de API
- Leitura de respostas por voz local do dispositivo, quando disponível; não é voz OpenAI
- Integração GPT-Live + Decisions documentada, ainda não implementada/conectada ou validada de ponta a ponta
- Fluxos reais de Dots, Codex CLI e Codex Cloud dependem do acesso do participante e de ensaio específico

Não trate o mock ou os testes de domínio como prova de funcionamento da integração de voz.

## O encontro

- **Data:** sábado, 24 de outubro de 2026
- **Horário publicado:** 09h00 às 14h30, horário de Brasília
- **Local:** IBMEC Barra, Av. Armando Lombardi, 940, Barra da Tijuca
- **Organização:** [Glaucia Lemos](https://github.com/glaucia86), Codex Ambassador
- **Inscrição e atualizações:** [página do evento no Luma](https://luma.com/wzk8q92k)

Evento gratuito, mediante inscrição e aprovação. O Luma é a fonte oficial dos detalhes de participação e da agenda. A abertura terá um recap do OpenAI DevDay; não foram atribuídos novos horários às sessões técnicas.

## Segurança e uso do material

Use somente dados fictícios ou públicos. Não publique credenciais, informações de participantes, arquivos operacionais ou dados de trabalho. Chaves de projeto ficam no servidor e nunca no código enviado ao navegador. Não é necessário conectar fontes privadas para concluir os exercícios offline.

O material segue formatos de LABS e roteiros de demonstração, com explicações e cenários próprios para o encontro. As [referências](docs/referencias.md) ajudam a aprofundar cada tema.

Este é um encontro organizado pela comunidade. O repositório não é documentação oficial nem um produto oficial da OpenAI.

Documentação e código originais sob [licença MIT](LICENSE). Marcas e materiais de terceiros têm condições próprias: [avisos](THIRD_PARTY_NOTICES.md).
