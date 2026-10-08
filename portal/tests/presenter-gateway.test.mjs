import test from 'node:test';
import assert from 'node:assert/strict';
import { createFirebaseGateway } from '../src/presenter/firebase-gateway.mjs';

const OWNER = 'test-presenter-owner';
const config = { enabled: true, presenterUid: OWNER, firebase: { projectId: 'demo-devday-presenter' } };
function deferred() {
  let resolve;
  const promise = new Promise((yes) => { resolve = yes; });
  return { promise, resolve };
}

function setup(overrides = {}) {
  const events = [];
  const identities = [];
  const errors = [];
  const apps = [];
  let authListener = async () => {};
  let currentAuth;
  const memoryPersistence = Symbol('memory-auth');
  const memoryCache = Symbol('memory-cache');
  const serverTime = Symbol('server-time');
  const sdk = {
    initializeApp(values, name) { const app = { values, name }; apps.push(app); events.push(['app', app]); return app; },
    initializeAuth(app, options) { currentAuth = { app, options, currentUser: null }; events.push(['auth', options]); return currentAuth; },
    inMemoryPersistence: memoryPersistence,
    browserPopupRedirectResolver: Symbol('popup-resolver'),
    onAuthStateChanged(auth, next) { authListener = next; return () => events.push(['unsubscribe']); },
    async getIdTokenResult() { return { signInProvider: 'github.com' }; },
    GithubAuthProvider: class { constructor() { this.kind = 'github'; } },
    async signInWithPopup(auth, provider) { events.push(['popup', provider]); },
    async signOut(auth) { events.push(['signOut']); auth.currentUser = null; },
    async deleteApp(app) { events.push(['deleteApp', app]); },
    initializeFirestore(app, options) { events.push(['firestore', options]); return { app }; },
    memoryLocalCache() { return memoryCache; },
    doc(db, ...path) { return { db, path }; },
    async getDocFromServer(ref) { events.push(['read', ref]); return { exists: () => true, data: () => ({ content: 'Nota sintética', updatedAt: { toMillis: () => 1 } }) }; },
    serverTimestamp() { return serverTime; },
    async setDoc(ref, data) { events.push(['write', ref, data]); },
    async terminate(db) { events.push(['terminate', db]); },
    setLogLevel(level) { events.push(['logLevel', level]); },
    ...overrides,
  };
  const gateway = createFirebaseGateway(config, sdk);
  const unsubscribe = gateway.subscribeAuth((identity) => { identities.push(identity); }, (error) => { errors.push(error); });
  return {
    gateway, events, apps, identities, errors, memoryPersistence, memoryCache, serverTime, unsubscribe,
    async user(value) { if (currentAuth) currentAuth.currentUser = value; await authListener(value); },
  };
}

test('Auth usa persistência em memória antes de abrir popup', async () => {
  const h = setup();
  await h.gateway.signIn();
  assert.equal(h.events.find(([kind]) => kind === 'auth')[1].persistence, h.memoryPersistence);
  assert.equal(h.events.filter(([kind]) => kind === 'popup').length, 1);
  assert.equal(h.events.find(([kind]) => kind === 'popup')[1].kind, 'github');
  assert.equal(h.events.filter(([kind]) => kind === 'firestore').length, 0);
});
test('adapta identidade Firebase sem repassar o token bruto', async () => {
  const h = setup({ getIdTokenResult: async () => ({ signInProvider: 'github.com', token: 'FAKE_RAW_TOKEN' }) });
  await h.user({ uid: OWNER });
  assert.deepEqual(h.identities.at(-1), { uid: OWNER, signInProvider: 'github.com' });
  assert.doesNotMatch(JSON.stringify(h.identities), /FAKE_RAW_TOKEN/);
});
test('Firestore só abre após proprietário GitHub e usa cache em memória', async () => {
  const h = setup();
  assert.equal(h.events.filter(([kind]) => kind === 'firestore').length, 0);
  await h.user({ uid: OWNER });
  const result = await h.gateway.loadNote(OWNER);
  assert.equal(result.content, 'Nota sintética');
  assert.equal(h.events.find(([kind]) => kind === 'firestore')[1].localCache, h.memoryCache);
  assert.deepEqual(h.events.find(([kind]) => kind === 'read')[1].path, ['presenter', OWNER, 'notes', 'evento']);
});
test('grava somente conteúdo e serverTimestamp no caminho conhecido', async () => {
  const h = setup();
  await h.user({ uid: OWNER });
  await h.gateway.saveNote(OWNER, 'Edição sintética');
  const write = h.events.find(([kind]) => kind === 'write');
  assert.deepEqual(write[1].path, ['presenter', OWNER, 'notes', 'evento']);
  assert.deepEqual(write[2], { content: 'Edição sintética', updatedAt: h.serverTime });
});
test('adaptador rejeita UID diferente antes de tocar Firestore', async () => {
  const h = setup();
  await h.user({ uid: 'test-another-user' });
  await assert.rejects(h.gateway.loadNote('test-another-user'));
  await assert.rejects(h.gateway.saveNote(OWNER, 'Texto sintético'));
  assert.equal(h.events.filter(([kind]) => kind === 'firestore').length, 0);
});
test('adaptador rejeita proprietário autenticado por outro provedor', async () => {
  const h = setup({ getIdTokenResult: async () => ({ signInProvider: 'password' }) });
  await h.user({ uid: OWNER });
  await assert.rejects(h.gateway.loadNote(OWNER));
  assert.equal(h.events.filter(([kind]) => kind === 'firestore').length, 0);
});
test('saída encerra Firestore e remove app para descartar cache de memória', async () => {
  const h = setup();
  await h.user({ uid: OWNER });
  await h.gateway.loadNote(OWNER);
  await h.gateway.signOut();
  assert.equal(h.events.filter(([kind]) => kind === 'signOut').length, 1);
  assert.equal(h.events.filter(([kind]) => kind === 'terminate').length, 1);
  assert.equal(h.events.filter(([kind]) => kind === 'deleteApp').length, 1);
  await assert.rejects(h.gateway.loadNote(OWNER));
  await h.gateway.signIn();
  assert.equal(h.apps.length, 2);
  assert.notEqual(h.apps[0].name, h.apps[1].name);
});
test('resolução de token atrasada não restaura identidade depois da saída', async () => {
  const token = deferred();
  const h = setup({ getIdTokenResult: () => token.promise });
  const resolving = h.user({ uid: OWNER });
  await h.gateway.signOut();
  token.resolve({ signInProvider: 'github.com' });
  await resolving;
  assert.equal(h.identities.at(-1), null);
});
test('documento inexistente devolve null sem inventar conteúdo', async () => {
  const h = setup({ getDocFromServer: async () => ({ exists: () => false }) });
  await h.user({ uid: OWNER });
  assert.equal(await h.gateway.loadNote(OWNER), null);
});
test('limpeza de app também ocorre quando signOut falha', async () => {
  const h = setup({ signOut: async () => { throw new Error('Falha sintética'); } });
  await h.user({ uid: OWNER });
  await h.gateway.loadNote(OWNER);
  await assert.rejects(h.gateway.signOut());
  assert.equal(h.events.filter(([kind]) => kind === 'terminate').length, 1);
  assert.equal(h.events.filter(([kind]) => kind === 'deleteApp').length, 1);
  await assert.rejects(h.gateway.loadNote(OWNER));
});

test('dona, outra conta e dona novamente não reutilizam o banco anterior', async () => {
  const h = setup();
  await h.user({ uid: OWNER });
  await h.gateway.loadNote(OWNER);
  const firstDb = h.events.find(([kind]) => kind === 'read')[1].db;
  await h.user({ uid: 'test-another-user' });
  await assert.rejects(h.gateway.loadNote(OWNER));
  assert.equal(h.events.find(([kind]) => kind === 'terminate')[1], firstDb);
  await h.user({ uid: OWNER });
  await h.gateway.loadNote(OWNER);
  const reads = h.events.filter(([kind]) => kind === 'read');
  assert.notEqual(reads[1][1].db, firstDb);
  assert.equal(h.events.filter(([kind]) => kind === 'firestore').length, 2);
});

test('repetição de callback Auth recebe nova instância sem cache antigo', async () => {
  const h = setup();
  await h.user({ uid: OWNER });
  await h.gateway.loadNote(OWNER);
  await h.user({ uid: OWNER });
  await h.gateway.loadNote(OWNER);
  const reads = h.events.filter(([kind]) => kind === 'read');
  assert.equal(h.events.filter(([kind]) => kind === 'terminate').length, 1);
  assert.notEqual(reads[0][1].db, reads[1][1].db);
});
