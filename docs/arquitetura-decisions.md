# Mesa TI: arquitetura de voz e decisões

[Início](../README.md) · [Aplicação](../apps/decisions/README.md) · [Validação](validacao.md)

## Intenção

Um service desk fictício em que a pessoa conversa por voz, acompanha a transcrição, corrige o relato, revisa a equipe sugerida e confirma um ticket visual. A voz integra o LAB Decisions, dentro dos quatro temas do encontro.

A versão de desenvolvimento contém um mock determinístico. O adaptador real de voz para voz está implementado, separado do mock e desativado por padrão. O ensaio com conta e áudio reais permanece pendente.

## Componentes

- **Interface:** Next.js, TypeScript, Tailwind CSS 4 e Lucide; conversa, revisão e ticket em uma tela
- **Domínio:** estado puro com sessão e revisão; nenhuma chamada externa
- **Fixtures:** exemplos de acesso, infraestrutura e relato incompleto; valores identificados como simulação
- **Voz local opcional:** leitura pelo navegador somente com uma voz local em português disponível
- **Integração experimental:** GPT-Live na conversa; Decisions no servidor; estado da aplicação decide o que pode ser exibido ou confirmado

A interface usa fundo claro, texto grafite e destaque verde-petróleo, com transcrição legível, controles por teclado e movimento reduzido. Capturas desktop e celular do fluxo mock foram inspecionadas. Isso não substitui um ensaio de projeção, uma auditoria completa de acessibilidade ou validação de áudio real.

## Contrato didático

As três perguntas avaliam o mesmo relato:

- predicate: há informação suficiente para sugerir encaminhamento?
- choice: acessos, aplicações internas, infraestrutura ou revisão humana?
- score: orientação sem bloqueio, trabalho degradado com alternativa ou trabalho bloqueado sem alternativa?

Probabilidade e score não autorizam uma ação. O score pode ser fracionário e não é arredondado para uma prioridade operacional. A pessoa revisa título, relato e equipe; somente um clique explícito cria o ticket simulado.

## Correção e concorrência

Fragmentos de fala não devem disparar uma análise a cada palavra. A primeira versão usa “Analisar relato” para fixar o texto. A detecção automática de fim de fala depende de validação posterior dos eventos e de pausas naturais.

Uma edição incrementa a revisão e invalida análise e confirmação. Resultados carregam sessão e revisão; os antigos são descartados. A resposta a ser narrada também precisa corresponder à revisão vigente. Reset troca a sessão e interrompe a leitura. Clique repetido não duplica o ticket.

Texto livre no mock recebe um aviso de não interpretação. Não se devolve uma fixture como se tivesse sido produzida para um relato arbitrário.

## Integração OpenAI implementada

O [guia oficial](https://developers.openai.com/api/docs/guides/decisions-voice) descreve GPT-Live com delegação client e Decisions no servidor. A aplicação reúne transcrições, associa delegações e devolve resultados atuais para serem falados.

Em 7/10/2026, o exemplo [WebRTC](https://developers.openai.com/api/docs/guides/voice-webrtc?api=live) usa gpt-live-1, e [Decisions](https://developers.openai.com/api/docs/guides/decisions) documenta gpt-6-luna. A disponibilidade na conta ainda não foi verificada.

Decisions recebe texto/contexto; áudio pertence à camada Live. A chave fica no servidor. Nenhuma sessão paga deve ser aberta só ao carregar a página. Antes de iniciar, o participante precisa compreender dados enviados, acesso e custos.

Os [eventos de transcrição são fragmentos](https://developers.openai.com/api/docs/guides/live-delegation?delegation-mode=client), não uma garantia de fala concluída. Interromper áudio também não prova que o trabalho no servidor parou.

## Limites

Sem banco de dados, login empresarial, Jira, ServiceNow, desktop control, e-mail, implantação ou ticket externo. Somente dados fictícios. Sem credenciais no frontend. Estado local apenas em memória.

O código conecta os componentes da conversa OpenAI, mas a execução real ainda não foi ensaiada. Testes com transporte simulado não medem reconhecimento de fala, qualidade do modelo, latência real nem reprodução de áudio. Consulte o [guia local e os limites](integracao-live.md).
