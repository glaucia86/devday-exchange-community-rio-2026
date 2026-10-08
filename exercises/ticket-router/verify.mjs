// Execute a partir da raiz: node exercises/ticket-router/verify.mjs caminho/router.mjs
// Esta verificação fica fora da pasta editada pelo agente.
import assert from 'node:assert/strict';
import { resolve } from 'node:path';
import { pathToFileURL } from 'node:url';

if (!process.argv[2]) {
  console.error('Uso: node exercises/ticket-router/verify.mjs caminho/router.mjs');
  process.exit(2);
}
let routeTicket;
try {
  ({ routeTicket } = await import(pathToFileURL(resolve(process.argv[2])).href));
  assert.equal(typeof routeTicket, 'function');
} catch {
  console.error('ARQUIVO_INVALIDO: confira o caminho e o export routeTicket.');
  process.exit(2);
}
const cases = [
  ['senha', 'Minha senha expirou', 'acessos'],
  ['caixa alta', 'MINHA SENHA EXPIROU', 'acessos'],
  ['login', 'O login falhou', 'acessos'],
  ['permissão com acento', 'Falta PERMISSÃO no portal', 'acessos'],
  ['conexão com acento', 'A conexão caiu', 'infraestrutura'],
  ['Wi-Fi', 'O Wi-Fi caiu', 'infraestrutura'],
  ['rede', 'A rede caiu', 'infraestrutura'],
  ['erro 500', 'O portal mostra erro 500', 'aplicacoes'],
  ['aplicativo', 'O aplicativo fechou', 'aplicacoes'],
  ['duas equipes: acesso e rede', 'A senha falhou e a conexão caiu', 'revisao_humana'],
  ['duas equipes: aplicativo e rede', 'O aplicativo falhou e a rede caiu', 'revisao_humana'],
  ['duas palavras da mesma equipe', 'Senha e login falharam', 'acessos'],
  ['limite de palavra', 'A parede está manchada', 'revisao_humana'],
  ['texto vazio', '  ', 'revisao_humana'],
  ['relato desconhecido', 'Está tudo estranho', 'revisao_humana'],
  ['null', null, 'revisao_humana'],
  ['undefined', undefined, 'revisao_humana'],
  ['entrada não textual', 42, 'revisao_humana'],
];
let failed = 0;
for (const [name, input, expected] of cases) {
  try {
    const actual = routeTicket(input);
    assert.equal(actual, expected);
    console.log(`PASS ${name}: ${expected}`);
  } catch (error) {
    failed++;
    console.log(`FAIL ${name}: esperado ${expected}; recebido ${error.actual ?? 'erro durante a execução'}`);
  }
}
console.log('ACCEPTANCE ' + JSON.stringify({ total: cases.length, passed: cases.length - failed, failed }));
process.exitCode = failed ? 1 : 0;
