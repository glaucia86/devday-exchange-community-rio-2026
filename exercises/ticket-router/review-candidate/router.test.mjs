import test from 'node:test';
import assert from 'node:assert/strict';
import { routeTicket } from './router.mjs';
for (const [name, input, expected] of [
  ['senha em caixa alta', 'MINHA SENHA EXPIROU', 'acessos'],
  ['rede com acento', 'A conexão caiu', 'infraestrutura'],
  ['erro da aplicação', 'O portal mostra erro 500', 'aplicacoes'],
  ['relato desconhecido', 'Está tudo estranho', 'revisao_humana'],
  ['entrada ausente', null, 'revisao_humana'],
]) test(name, () => assert.equal(routeTicket(input), expected));
