import test from 'node:test';
import assert from 'node:assert/strict';
import { routeTicket } from './router.mjs';
test('encaminha relato simples de senha',()=>assert.equal(routeTicket('Minha senha expirou'),'acessos'));
test('pede revisão para um relato desconhecido',()=>assert.equal(routeTicket('Preciso de ajuda'),'revisao_humana'));
test('pede revisão quando a entrada está ausente',()=>assert.equal(routeTicket(null),'revisao_humana'));
