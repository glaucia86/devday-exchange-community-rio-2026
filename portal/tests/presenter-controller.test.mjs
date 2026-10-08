import test from 'node:test';
import assert from 'node:assert/strict';
import { createPresenterController, MAX_NOTE_LENGTH } from '../src/presenter/controller.mjs';

const OWNER = 'test-presenter-owner';
const OWNER_IDENTITY = Object.freeze({ uid: OWNER, signInProvider: 'github.com' });
const SYNTHETIC_NOTE = 'Roteiro fictício de teste. Não contém notas reais.';

function deferred() {
  let resolve;
  let reject;
  const promise = new Promise((yes, no) => { resolve = yes; reject = no; });
  return { promise, resolve, reject };
}

function setup(overrides = {}, config = { enabled: true, presenterUid: OWNER }) {
  const calls = { loads: [], saves: [], signIns: 0, signOuts: 0, unsubscribes: 0 };
  let receiveUser = async () => {};
  let receiveError = async () => {};
  const gateway = {
    subscribeAuth(onUser, onError) {
      receiveUser = onUser;
      receiveError = onError;
      return () => { calls.unsubscribes += 1; };
    },
    async signIn() { calls.signIns += 1; },
    async signOut() { calls.signOuts += 1; },
    async loadNote(uid) { calls.loads.push(uid); return { content: SYNTHETIC_NOTE }; },
    async saveNote(uid, content) { calls.saves.push({ uid, content }); },
    ...overrides,
  };
  const states = [];
  const controller = createPresenterController({ config, gateway, onChange: (state) => states.push(state) });
  return {
    controller, calls, states,
    user: (value) => receiveUser(value),
    authError: (value) => receiveError(value),
  };
}

test('configuração ausente mantém interface desativada e não usa o gateway', async () => {
  const h = setup({}, { enabled: false, presenterUid: '' });
  await h.controller.start();
  await h.controller.signIn();
  await h.controller.save();
  assert.equal(h.controller.getSnapshot().status, 'disabled');
  assert.equal(h.calls.signIns, 0);
  assert.deepEqual(h.calls.loads, []);
  assert.deepEqual(h.calls.saves, []);
});

test('início configurado permanece desconectado sem ler notas', async () => {
  const h = setup();
  await h.controller.start();
  assert.equal(h.controller.getSnapshot().status, 'signed-out');
  assert.deepEqual(h.calls.loads, []);
});

test('login só abre quando solicitado explicitamente', async () => {
  const h = setup();
  await h.controller.start();
  assert.equal(h.calls.signIns, 0);
  await h.controller.signIn();
  assert.equal(h.calls.signIns, 1);
});

test('cliques repetidos não abrem popups simultâneos', async () => {
  const login = deferred();
  let attempts = 0;
  const h = setup({ signIn: () => { attempts += 1; return login.promise; } });
  await h.controller.start();
  const first = h.controller.signIn();
  const second = h.controller.signIn();
  login.resolve();
  await Promise.all([first, second]);
  assert.equal(attempts, 1);
});

test('apenas o UID exato autenticado pelo GitHub carrega o documento', async () => {
  const h = setup();
  await h.controller.start();
  await h.user(OWNER_IDENTITY);
  assert.deepEqual(h.calls.loads, [OWNER]);
  assert.equal(h.controller.getSnapshot().status, 'ready');
  assert.equal(h.controller.getSnapshot().content, SYNTHETIC_NOTE);
  assert.equal(h.controller.getSnapshot().dirty, false);
});

for (const identity of [
  { uid: 'test-another-user', signInProvider: 'github.com' },
  { uid: OWNER, signInProvider: 'password' },
  { uid: OWNER, signInProvider: 'anonymous' },
  { uid: OWNER },
]) {
  test(`não autoriza identidade ${identity.uid}/${identity.signInProvider ?? 'ausente'}`, async () => {
    const h = setup();
    await h.controller.start();
    await h.user(identity);
    h.controller.setContent('Tentativa fictícia');
    await h.controller.save();
    assert.equal(h.controller.getSnapshot().status, 'denied');
    assert.equal(h.controller.getSnapshot().content, '');
    assert.deepEqual(h.calls.loads, []);
    assert.deepEqual(h.calls.saves, []);
  });
}

test('documento ainda inexistente abre editor vazio', async () => {
  const h = setup({ loadNote: async () => null });
  await h.controller.start();
  await h.user(OWNER_IDENTITY);
  assert.equal(h.controller.getSnapshot().status, 'ready');
  assert.equal(h.controller.getSnapshot().content, '');
});

test('editar marca alterações mas não salva automaticamente', async () => {
  const h = setup();
  await h.controller.start();
  await h.user(OWNER_IDENTITY);
  h.controller.setContent('Rascunho sintético editado');
  assert.equal(h.controller.getSnapshot().content, 'Rascunho sintético editado');
  assert.equal(h.controller.getSnapshot().dirty, true);
  assert.deepEqual(h.calls.saves, []);
});

test('salvar explicitamente envia apenas UID e conteúdo e confirma o resultado', async () => {
  const h = setup();
  await h.controller.start();
  await h.user(OWNER_IDENTITY);
  h.controller.setContent('Rascunho sintético editado');
  await h.controller.save();
  assert.deepEqual(h.calls.saves, [{ uid: OWNER, content: 'Rascunho sintético editado' }]);
  assert.equal(h.controller.getSnapshot().dirty, false);
  assert.equal(h.controller.getSnapshot().status, 'ready');
});

test('conteúdo acima do limite não chega ao gateway', async () => {
  const h = setup();
  await h.controller.start();
  await h.user(OWNER_IDENTITY);
  h.controller.setContent('x'.repeat(MAX_NOTE_LENGTH + 1));
  await h.controller.save();
  assert.deepEqual(h.calls.saves, []);
  assert.match(h.controller.getSnapshot().error, /limite|caracteres/i);
});

test('salvar repetidamente não duplica escrita em andamento', async () => {
  const pending = deferred();
  let writes = 0;
  const h = setup({ saveNote: () => { writes += 1; return pending.promise; } });
  await h.controller.start();
  await h.user(OWNER_IDENTITY);
  h.controller.setContent('Nota sintética');
  const first = h.controller.save();
  const second = h.controller.save();
  pending.resolve();
  await Promise.all([first, second]);
  assert.equal(writes, 1);
});

test('edição feita durante salvamento continua marcada como não salva', async () => {
  const pending = deferred();
  const h = setup({ saveNote: () => pending.promise });
  await h.controller.start();
  await h.user(OWNER_IDENTITY);
  h.controller.setContent('Primeira edição fictícia');
  const saving = h.controller.save();
  h.controller.setContent('Edição fictícia mais recente');
  pending.resolve();
  await saving;
  assert.equal(h.controller.getSnapshot().content, 'Edição fictícia mais recente');
  assert.equal(h.controller.getSnapshot().dirty, true);
});

test('saída apaga conteúdo imediatamente, antes da resposta de autenticação', async () => {
  const pending = deferred();
  const h = setup({ signOut: () => pending.promise });
  await h.controller.start();
  await h.user(OWNER_IDENTITY);
  assert.equal(h.controller.getSnapshot().content, SYNTHETIC_NOTE);
  const leaving = h.controller.signOut();
  assert.equal(h.controller.getSnapshot().content, '');
  assert.equal(h.controller.getSnapshot().dirty, false);
  pending.resolve();
  await leaving;
  assert.equal(h.controller.getSnapshot().status, 'signed-out');
});

test('leitura atrasada não restaura notas depois da saída', async () => {
  const pending = deferred();
  const h = setup({ loadNote: () => pending.promise });
  await h.controller.start();
  const loading = h.user(OWNER_IDENTITY);
  await h.controller.signOut();
  pending.resolve({ content: SYNTHETIC_NOTE });
  await loading;
  assert.equal(h.controller.getSnapshot().content, '');
  assert.equal(h.controller.getSnapshot().status, 'signed-out');
});

test('troca de conta descarta leitura pendente da conta anterior', async () => {
  const pending = deferred();
  const h = setup({ loadNote: () => pending.promise });
  await h.controller.start();
  const loading = h.user(OWNER_IDENTITY);
  await h.user({ uid: 'test-another-user', signInProvider: 'github.com' });
  pending.resolve({ content: SYNTHETIC_NOTE });
  await loading;
  assert.equal(h.controller.getSnapshot().content, '');
  assert.equal(h.controller.getSnapshot().status, 'denied');
});

test('resposta tardia de escrita não altera a sessão encerrada', async () => {
  const pending = deferred();
  const h = setup({ saveNote: () => pending.promise });
  await h.controller.start();
  await h.user(OWNER_IDENTITY);
  h.controller.setContent('Nota fictícia a salvar');
  const saving = h.controller.save();
  await h.controller.signOut();
  pending.resolve();
  await saving;
  assert.equal(h.controller.getSnapshot().status, 'signed-out');
  assert.equal(h.controller.getSnapshot().content, '');
});

test('falha de escrita mantém o rascunho para tentar de novo sem expor erro bruto', async () => {
  const h = setup({ saveNote: async () => { throw Object.assign(new Error('SECRET_FAKE_PAYLOAD'), { code: 'unavailable' }); } });
  await h.controller.start();
  await h.user(OWNER_IDENTITY);
  h.controller.setContent('Rascunho fictício preservado');
  await h.controller.save();
  const state = h.controller.getSnapshot();
  assert.equal(state.content, 'Rascunho fictício preservado');
  assert.equal(state.dirty, true);
  assert.ok(state.error);
  assert.doesNotMatch(state.error, /SECRET_FAKE_PAYLOAD/);
});

test('popup bloqueado tem mensagem útil e não revela credencial', async () => {
  const h = setup({ signIn: async () => { throw { code: 'auth/popup-blocked', credential: 'FAKE_CREDENTIAL', message: 'FAKE_RAW_ERROR' }; } });
  await h.controller.start();
  await h.controller.signIn();
  assert.match(h.controller.getSnapshot().error, /popup|janela/i);
  assert.doesNotMatch(JSON.stringify(h.controller.getSnapshot()), /FAKE_CREDENTIAL|FAKE_RAW_ERROR/);
});

test('erro de observação de autenticação limpa as notas', async () => {
  const h = setup();
  await h.controller.start();
  await h.user(OWNER_IDENTITY);
  await h.authError({ code: 'auth/network-request-failed', message: 'FAKE_RAW_ERROR' });
  assert.equal(h.controller.getSnapshot().content, '');
  assert.ok(h.controller.getSnapshot().error);
  assert.doesNotMatch(h.controller.getSnapshot().error, /FAKE_RAW_ERROR/);
});

test('desmontar remove observador e descarta leitura pendente', async () => {
  const pending = deferred();
  const h = setup({ loadNote: () => pending.promise });
  await h.controller.start();
  const loading = h.user(OWNER_IDENTITY);
  h.controller.destroy();
  const rendersAfterDestroy = h.states.length;
  pending.resolve({ content: SYNTHETIC_NOTE });
  await loading;
  assert.equal(h.calls.unsubscribes, 1);
  assert.equal(h.controller.getSnapshot().content, '');
  assert.equal(h.states.length, rendersAfterDestroy);
});
