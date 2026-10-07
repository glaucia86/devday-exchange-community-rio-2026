# LAB · Decisions API: do relato ao encaminhamento

[Início](../../README.md) · [Aplicação Mesa TI](../../apps/decisions/README.md) · [Guia da apresentadora](../../docs/guia-apresentadora.md)

## Objetivo

Entender três formatos de decisão (`predicate`, `choice`, `score`), observar o efeito de uma correção e exigir revisão humana antes de criar um ticket simulado. O cenário é um service desk fictício.

**Estado atual:** domínio, TypeScript, build e fluxo mock em Chromium verificados; dependências fixadas e capturas desktop/celular inspecionadas. A integração OpenAI de voz para voz está documentada, ainda não implementada/conectada ou validada de ponta a ponta. Não confunda a reprodução mock com uma chamada de API.

## Pré-requisitos

- Leitura: navegador e noções de JSON
- Testes: Node.js 22.18+; nenhuma chave ou dependência necessária
- Interface: seguir o [README da aplicação](../../apps/decisions/README.md), observando seu status de validação
- Modo OpenAI futuro: disponibilidade na conta, autorização de gasto e configuração segura no servidor; não é necessário para o mock

Sugestão de prática: 20–30 minutos, a confirmar após ensaio completo.

## Passo a passo em casa

1. Execute, na raiz do repositório:

   ```bash
   node --test apps/decisions/tests/*.test.mts
   ```

   **Confira:** os testes de correção, resposta atrasada, reset e confirmação humana passam.
2. Leia as três perguntas e os cenários em `apps/decisions/src/domain/service-desk.ts`. **Confira:** uma probabilidade de contexto, uma escolha de equipe e um score de impacto têm papéis diferentes.
3. Após instalar a interface pelo README, abra Mesa TI e escolha “Acesso ao portal”. **Confira:** o selo Simulado e a transcrição do cenário estão visíveis. Nenhum microfone é capturado.
4. Clique “Analisar relato”. **Confira:** a equipe sugerida é Acessos e identidade; o ticket continua rascunho. Os números são fixtures.
5. Clique “Simular uma correção” e analise novamente. **Confira:** o relato passa a descrever erro 500 para o time; a análise anterior perde a validade; a nova sugestão é Aplicações internas.
6. Revise o título, relato e equipe; marque a caixa de revisão e clique “Confirmar e criar ticket simulado”. **Confira:** aparece DEMO-0001, sem envio a qualquer sistema externo.
7. Recomece e experimente “Relato incompleto”. **Confira:** o app pede esclarecimento, sem inventar um encaminhamento.
8. Abra “Por trás da decisão” e simule uma falha. **Confira:** o relato permanece na tela, sem ticket falso de sucesso.

## O que a API faz, e o que a aplicação faz

Na [documentação consultada em 7/10/2026](https://developers.openai.com/api/docs/guides/decisions), Decisions está em beta pública com `gpt-6-luna`; os exemplos JavaScript requerem SDK 7.30.0+. Decisions avalia texto/imagens, não áudio. `score` pode ser fracionário; não o arredonde automaticamente para uma prioridade.

No desenho de voz, [GPT-Live conversa e delega](https://developers.openai.com/api/docs/guides/decisions-voice), enquanto a aplicação reúne a transcrição, chama Decisions e verifica se a resposta ainda corresponde ao pedido atual. A aplicação controla a confirmação e a criação do ticket.

## Problemas e reset

- **Sem voz local em português:** continue pela transcrição; o mock não é voz OpenAI
- **Editei texto livre:** o mock não o interpreta. Recarregue um cenário pronto
- **Resposta antiga terminou depois:** o teste exige que seja descartada pela revisão/sessão
- **Instalação indisponível na sua máquina:** execute os testes do domínio; a instalação inicial precisa acessar o registro npm
- **Reset:** “Recomeçar” limpa somente o estado em memória. Uma atualização da página também reinicia a demo

Use somente dados fictícios. Não coloque chave em código, navegador, log, captura ou commit. [Referências do encontro](../../docs/referencias.md)
