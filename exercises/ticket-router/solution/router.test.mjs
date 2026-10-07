import test from 'node:test';
import assert from 'node:assert/strict';
import { routeTicket } from './router.mjs';
for (const [name,input,expected] of [
 ['senha em minúsculas','Minha senha expirou','acessos'],
 ['caixa alta','MINHA SENHA EXPIROU','acessos'],
 ['acentos','A conexão da sala caiu','infraestrutura'],
 ['erro do aplicativo','O portal mostra erro 500','aplicacoes'],
 ['ambiguidade entre equipes','A senha falhou e a conexão caiu','revisao_humana'],
 ['relato vazio','  ','revisao_humana'],
 ['relato desconhecido','Está tudo estranho','revisao_humana'],
 ['entrada ausente',null,'revisao_humana'],
]) test(name,()=>assert.equal(routeTicket(input),expected));
