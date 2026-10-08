# Roteiro de palco

[Início](../README.md) · [Guia da apresentadora](guia-apresentadora.md)

Duas camadas. A primeira cabe no projetor sem conta, chave ou rede de modelo. A segunda só entra depois de um ensaio no mesmo notebook, com áudio e login conferidos.

Na véspera, na raiz do repositório:

```sh
node scripts/prepare-stage.mjs
```

Depois, em `apps/decisions`, `npm start` e http://127.0.0.1:3000. O script pede Node.js 24.21.0 ou posterior, o valor de `.nvmrc`.

## Camada 1 · o que sempre funciona

### 1. Caça ao bug, com voto da sala

Abra a candidata e mostre cinco testes verdes. Leia em voz alta: “A senha falhou e a conexão caiu”. Peça para a sala dizer se isso é uma equipe só ou duas. Rode o verificador. A tela fica em 16/18, e essa frase volta `acessos` quando o contrato pede `revisao_humana`.

```sh
node --test exercises/ticket-router/review-candidate/router.test.mjs
node exercises/ticket-router/verify.mjs exercises/ticket-router/review-candidate/router.mjs
```

Fala: “Teste verde não é o mesmo que contrato cumprido.”

**Plano B:** os dois comandos acima, na máquina local. Se o Cloud não estiver no ar, a caça ao bug já é a demo.

### 2. Alô, TI · a equipe muda

Com o servidor da build aberto, clique **Modo palco**. Fique na aba **Simulado**.

1. **Explorar cenário.** Leia o relato da senha e peça um palpite de equipe.
2. **Analisar relato.** Aparece Acessos e identidade. O botão de criar ticket continua desligado.
3. Pergunte: “E se a senha funcionar e o portal cair para o time inteiro?” Clique **Simular uma correção** e analise de novo. **Corrigir o relato** só abre o texto para edição.
4. A sugestão passa para Aplicações internas. A revisão anterior sai.
5. Marque a revisão e crie `DEMO-0001`.

O seletor **Simulado** e o rodapé dizem que esta aba usa respostas preparadas. A fala pode repetir isso no fim, depois da virada. Não abra **Por trás da decisão** antes desse momento: é lá que os números aparecem como exemplo.

**Plano B:** se a página não abrir, mostre os testes e as fixtures e diga que não houve conversa.

## Camada 2 · só com ensaio feito

Cada bloco abaixo fica de fora se o ensaio da véspera não tiver passado no notebook do projetor. A camada 1 continua de pé.

| Bloco | Ensaio que libera o palco | Plano B |
| --- | --- | --- |
| **Dots** | O dots abre na conta, sem conectar aplicativos. O resumo separa fato de lacuna e a correção do A-102 muda só o que foi corrigido. | Leia o exemplo comentado do cenário e diga que o dots não foi executado. |
| **Codex CLI** | `codex --version` mostra `codex-cli 0.161.0` e `codex login status` confirma a sessão. A frase **A senha falhou e a conexão caiu** está vermelha no starter. | Rode a solução de referência e os 18 critérios. Diga que a mudança não veio do CLI. |
| **Codex Cloud** | O ambiente publicado ainda começa em 16/18, com a candidata original. | Faça a caça ao bug da camada 1 e diga que a tarefa remota não rodou. |
| **Voz** | No notebook do projetor: fala reconhecida, resposta audível na sala, correção refletida na equipe, sessão encerrada e consumo conferido. | Fique na Alô, TI simulada. Diga que a conversa real não foi executada. |

A versão do Codex fica fixa em `@openai/codex@0.161.0` para o encontro. `codex login status` entra no checklist da véspera, antes de abrir o projetor.
