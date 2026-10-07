# Mesa TI · demo local de Decisions

Uma interface de service desk fictício em Next.js, TypeScript, Tailwind CSS 4 e Lucide. O domínio funciona com fixtures e não chama qualquer API.

## Estado real da entrega

- Domínio e seleção de fala: 15 testes aprovados; confira [validação](../../docs/validacao.md) para a contagem final
- Interface e configurações: escritas; instalação, TypeScript, build e inspeção no navegador ainda dependem da recuperação do ambiente de execução
- Sem lockfile validado nesta etapa; os intervalos de dependências são provisórios, não um conjunto já instalado
- Voz: leitura opcional com uma voz local em português do navegador, se disponível. Não é áudio OpenAI nem uma transcrição real
- GPT-Live + Decisions: integração documentada, ainda não conectada; nenhuma chave, sessão ou chamada paga foi utilizada

## Testar o domínio sem instalar pacotes

Node.js 22.18+:

```bash
cd apps/decisions
node --test tests/*.test.mts
```

## Executar a interface após preparar as dependências

Os comandos abaixo ainda precisam de validação em ambiente limpo:

```bash
npm install
npm run typecheck
npm test
npm run build
npm run dev
```

Abra http://localhost:3000. A aplicação escuta apenas em 127.0.0.1. Não a exponha como serviço público sem um desenho de segurança apropriado.

## Fluxo

Escolha um cenário → analise o relato → simule uma correção → analise novamente → revise os campos → marque a revisão → crie o ticket simulado. “Recomeçar” limpa o estado em memória e interrompe a voz local.

A demora de 900 ms é apenas uma animação de espera do mock, não medição de latência da API. As probabilidades são fixtures. Texto livre recebe um aviso, nunca uma sugestão pronta disfarçada de análise.

## OpenAI ao vivo

A arquitetura futura usa [GPT-Live e Decisions](https://developers.openai.com/api/docs/guides/decisions-voice). Antes de conectá-la, validar acesso da conta, autorização para a chave e para gastos, transporte de áudio, respostas tardias e confirmação humana. Não há campo de chave no frontend.

[LAB para participantes](../../labs/02-decisions-typescript/README.md) · [Roteiro da apresentadora](../../docs/guia-apresentadora.md#decisions-api)
