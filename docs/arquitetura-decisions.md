# Alô, TI: arquitetura de voz e decisões

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

Probabilidade e score não autorizam uma ação. O score pode ser fracionário e não é arredondado para uma prioridade operacional. A pessoa revisa título, relato e equipe. O ticket simulado só nasce com confirmação explícita, pelo botão ou pela função `confirmar_ticket` quando o argumento booleano vem verdadeiro.

## Correção e concorrência

Fragmentos de fala não devem disparar uma análise a cada palavra. A primeira versão usa “Analisar relato” para fixar o texto. A detecção automática de fim de fala depende de validação posterior dos eventos e de pausas naturais.

Uma edição incrementa a revisão e invalida análise e confirmação. Resultados carregam sessão e revisão; os antigos são descartados. A resposta a ser narrada também precisa corresponder à revisão vigente. Reset troca a sessão e interrompe a leitura. Clique repetido não duplica o ticket.

Texto livre no mock entra na conversa e recebe uma resposta explícita de não interpretação. O estado não reutiliza “precisamos esclarecer”, nem conserva equipe, título ou transcrição do cenário anterior como se o texto novo tivesse sido analisado. Não se devolve uma fixture como se tivesse sido produzida para um relato arbitrário.

## Integração OpenAI implementada

O [guia oficial de voz com Decisions](https://developers.openai.com/api/docs/guides/decisions-voice) usa delegação client para escolher uma ação sem parâmetros. A **Triagem ao vivo** (`/triagem`), demo de palco, segue esse desenho: GPT-Live delega ao ouvir “registra”, a aplicação envia a fala ouvida ao Decisions e devolve o resultado com `session.commentary.append`. Assim, cada relato custa uma chamada ao `gpt-6-luna`, e nenhum modelo de backend é chamado a cada fala. A aba ao vivo da Alô, TI usa delegação Responses: o modelo devolve uma função com o relato ou a confirmação, e o navegador executa o redutor. A Decisions continua responsável pela triagem da equipe. O monitoramento final é calculado na mesa e falado com `session.commentary.append`.

Em 7/10/2026, o exemplo [WebRTC](https://developers.openai.com/api/docs/guides/voice-webrtc?api=live) usa gpt-live-1, e [Decisions](https://developers.openai.com/api/docs/guides/decisions) documenta gpt-6-luna. A disponibilidade na conta ainda não foi verificada.

Decisions recebe texto/contexto; áudio pertence à camada Live. A chave fica no servidor. Nenhuma sessão paga deve ser aberta só ao carregar a página. Antes de iniciar, o participante precisa compreender dados enviados, acesso e custos.

Os [eventos de transcrição são fragmentos](https://developers.openai.com/api/docs/guides/live-delegation?delegation-mode=client), não uma garantia de fala concluída. Interromper áudio também não prova que o trabalho no servidor parou.

## Limites

Sem banco de dados, login empresarial, Jira, ServiceNow, desktop control, e-mail, implantação ou ticket externo. Somente dados fictícios. Sem credenciais no frontend. Estado local apenas em memória.

O código conecta os componentes da conversa OpenAI, mas a execução real ainda não foi ensaiada. Testes com transporte simulado não medem reconhecimento de fala, qualidade do modelo, latência real nem reprodução de áudio. Consulte o [guia local e os limites](integracao-live.md).
