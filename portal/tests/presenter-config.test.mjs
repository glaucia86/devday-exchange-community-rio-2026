import test from 'node:test';
import assert from 'node:assert/strict';
import { resolvePresenterConfig } from '../src/presenter/config.mjs';

const fixture = {
  PUBLIC_PRESENTER_ENABLED: 'true',
  PUBLIC_PRESENTER_UID: 'test-presenter-owner',
  PUBLIC_FIREBASE_API_KEY: 'synthetic-public-key-for-testing',
  PUBLIC_FIREBASE_AUTH_DOMAIN: 'demo-devday-presenter.firebaseapp.com',
  PUBLIC_FIREBASE_PROJECT_ID: 'demo-devday-presenter',
  PUBLIC_FIREBASE_APP_ID: '1:123456789:web:abcdef123456789',
};

test('sem configuração a área fica desativada', () => {
  assert.equal(resolvePresenterConfig({}).enabled, false);
});
test('habilita somente configuração completa e explicitamente ativada', () => {
  const config = resolvePresenterConfig(fixture);
  assert.equal(config.enabled, true);
  assert.equal(config.presenterUid, 'test-presenter-owner');
  assert.deepEqual(config.firebase, {
    apiKey: fixture.PUBLIC_FIREBASE_API_KEY,
    authDomain: fixture.PUBLIC_FIREBASE_AUTH_DOMAIN,
    projectId: fixture.PUBLIC_FIREBASE_PROJECT_ID,
    appId: fixture.PUBLIC_FIREBASE_APP_ID,
  });
});
for (const field of Object.keys(fixture)) {
  test(`não habilita sem ${field}`, () => {
    const value = { ...fixture };
    delete value[field];
    assert.equal(resolvePresenterConfig(value).enabled, false);
  });
}
for (const [field, value] of [
  ['PUBLIC_PRESENTER_ENABLED', 'yes'],
  ['PUBLIC_PRESENTER_UID', '__PRESENTER_UID__'],
  ['PUBLIC_PRESENTER_UID', 'invalid/path'],
  ['PUBLIC_FIREBASE_PROJECT_ID', 'PROJECT_ID'],
  ['PUBLIC_FIREBASE_AUTH_DOMAIN', 'glaucia86.github.io'],
  ['PUBLIC_FIREBASE_AUTH_DOMAIN', 'demo-devday-presenter.firebaseapp.com/path'],
  ['PUBLIC_FIREBASE_APP_ID', 'replace-me'],
]) {
  test(`rejeita configuração inválida em ${field}: ${value}`, () => {
    assert.equal(resolvePresenterConfig({ ...fixture, [field]: value }).enabled, false);
  });
}
