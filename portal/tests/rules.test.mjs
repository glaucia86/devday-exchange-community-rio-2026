import { after, before, beforeEach, describe, test } from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { initializeTestEnvironment, assertFails, assertSucceeds } from '@firebase/rules-unit-testing';
import { initializeApp, deleteApp } from 'firebase/app';
import { collection, collectionGroup, connectFirestoreEmulator, deleteDoc, doc, getDoc, getDocFromCache, getDocFromServer, getDocs, initializeFirestore, memoryLocalCache, serverTimestamp, setDoc, terminate, Timestamp, updateDoc } from 'firebase/firestore';

const PROJECT = 'demo-devday-presenter';
const OWNER = 'test-presenter-owner';
const NOTE_PATH = `presenter/${OWNER}/notes/evento`;
const syntheticNote = () => ({ content: 'Conteúdo exclusivamente fictício.', updatedAt: serverTimestamp() });
const emulator = process.env.FIRESTORE_EMULATOR_HOST;
assert.match(emulator ?? '', /^127\.0\.0\.1:\d+$/, 'Execute somente no Firestore Emulator em 127.0.0.1.');
for (const key of ['GCLOUD_PROJECT', 'GOOGLE_CLOUD_PROJECT']) {
  if (process.env[key]) assert.equal(process.env[key], PROJECT, `${key} deve ser o projeto demo de teste.`);
}
const port = Number(emulator.split(':')[1]);
assert.ok(Number.isInteger(port) && port > 0 && port < 65536);

async function environment(rulesFile, replaceOwner = false) {
  let rules = await readFile(new URL(rulesFile, import.meta.url), 'utf8');
  if (replaceOwner) {
    assert.equal(rules.split('__PRESENTER_UID__').length - 1, 1, 'Template deve ter exatamente um marcador de UID.');
    rules = rules.replace('__PRESENTER_UID__', OWNER);
  }
  return initializeTestEnvironment({
    projectId: PROJECT,
    firestore: { host: '127.0.0.1', port, rules },
  });
}

describe('regras padrão fechadas', { concurrency: false }, () => {
  let env;
  before(async () => { env = await environment('../firebase/firestore.rules'); });
  after(async () => { await env?.cleanup(); });
  test('nega até o UID fictício correto', async () => {
    const db = env.authenticatedContext(OWNER, { firebase: { sign_in_provider: 'github.com' } }).firestore();
    await assertFails(getDoc(doc(db, NOTE_PATH)));
    await assertFails(setDoc(doc(db, NOTE_PATH), syntheticNote()));
  });
});

describe('template de proprietária configurado somente com UID fictício', { concurrency: false }, () => {
  let env;
  before(async () => { env = await environment('../firebase/firestore.owner.rules.template', true); });
  beforeEach(async () => { await env.clearFirestore(); });
  after(async () => { await env?.cleanup(); });
  function ownerDb(provider = 'github.com') {
    return env.authenticatedContext(OWNER, { firebase: { sign_in_provider: provider } }).firestore();
  }
  async function seed(path = NOTE_PATH) {
    await env.withSecurityRulesDisabled(async (context) => {
      await setDoc(doc(context.firestore(), path), { content: 'Nota sintética sem informação real.', updatedAt: Timestamp.fromMillis(1000) });
    });
  }

  test('proprietária GitHub cria documento com timestamp do servidor', async () => {
    await assertSucceeds(setDoc(doc(ownerDb(), NOTE_PATH), syntheticNote()));
  });
  test('proprietária GitHub lê somente o documento conhecido', async () => {
    await seed();
    const snapshot = await assertSucceeds(getDoc(doc(ownerDb(), NOTE_PATH)));
    assert.equal(snapshot.exists(), true);
  });
  test('proprietária GitHub atualiza conteúdo com timestamp do servidor', async () => {
    await seed();
    await assertSucceeds(updateDoc(doc(ownerDb(), NOTE_PATH), syntheticNote()));
  });
  test('aceita texto vazio e o limite de 16000 caracteres', async () => {
    const ref = doc(ownerDb(), NOTE_PATH);
    await assertSucceeds(setDoc(ref, { content: '', updatedAt: serverTimestamp() }));
    await assertSucceeds(setDoc(ref, { content: 'x'.repeat(16000), updatedAt: serverTimestamp() }));
  });
  test('visitante anônimo não lê nem escreve', async () => {
    await seed();
    const db = env.unauthenticatedContext().firestore();
    await assertFails(getDoc(doc(db, NOTE_PATH)));
    await assertFails(setDoc(doc(db, NOTE_PATH), syntheticNote()));
  });
  test('outro UID autenticado pelo GitHub não lê nem escreve', async () => {
    await seed();
    const db = env.authenticatedContext('test-intruder', { firebase: { sign_in_provider: 'github.com' } }).firestore();
    await assertFails(getDoc(doc(db, NOTE_PATH)));
    await assertFails(setDoc(doc(db, NOTE_PATH), syntheticNote()));
    await assertFails(setDoc(doc(db, 'presenter/test-intruder/notes/evento'), syntheticNote()));
  });
  for (const provider of ['password', 'google.com', 'anonymous', 'custom']) {
    test(`UID correto via ${provider} continua bloqueado`, async () => {
      await seed();
      const db = ownerDb(provider);
      await assertFails(getDoc(doc(db, NOTE_PATH)));
      await assertFails(setDoc(doc(db, NOTE_PATH), syntheticNote()));
    });
  }
  test('UID correto sem provedor de entrada continua bloqueado', async () => {
    const db = env.authenticatedContext(OWNER).firestore();
    await assertFails(getDoc(doc(db, NOTE_PATH)));
    await assertFails(setDoc(doc(db, NOTE_PATH), syntheticNote()));
  });
  test('não permite listar coleção nem collection group', async () => {
    await seed();
    const db = ownerDb();
    await assertFails(getDocs(collection(db, `presenter/${OWNER}/notes`)));
    await assertFails(getDocs(collectionGroup(db, 'notes')));
    await assertFails(getDocs(collection(db, 'presenter')));
  });
  test('não permite outros documentos nem caminhos', async () => {
    const db = ownerDb();
    for (const path of [`presenter/${OWNER}/notes/segredo`, 'public/evento', `presenter/${OWNER}`]) {
      await assertFails(getDoc(doc(db, path)));
      await assertFails(setDoc(doc(db, path), syntheticNote()));
    }
  });
  test('não permite excluir o documento', async () => {
    await seed();
    await assertFails(deleteDoc(doc(ownerDb(), NOTE_PATH)));
  });
  for (const [name, makeData] of [
    ['campo extra', () => ({ ...syntheticNote(), email: 'ficticio@example.invalid' })],
    ['conteúdo ausente', () => ({ updatedAt: serverTimestamp() })],
    ['timestamp ausente', () => ({ content: 'Texto fictício' })],
    ['conteúdo numérico', () => ({ content: 7, updatedAt: serverTimestamp() })],
    ['conteúdo nulo', () => ({ content: null, updatedAt: serverTimestamp() })],
    ['texto acima do limite', () => ({ content: 'x'.repeat(16001), updatedAt: serverTimestamp() })],
    ['timestamp definido pelo cliente', () => ({ content: 'Texto fictício', updatedAt: Timestamp.fromMillis(1000) })],
    ['timestamp string', () => ({ content: 'Texto fictício', updatedAt: '2026-01-01' })],
  ]) {
    test(`rejeita ${name} na criação e atualização`, async () => {
      const ref = doc(ownerDb(), NOTE_PATH);
      await assertFails(setDoc(ref, makeData()));
      await seed();
      await assertFails(setDoc(ref, makeData()));
    });
  }
  test('atualizar só o texto sem renovar timestamp é negado', async () => {
    await seed();
    await assertFails(updateDoc(doc(ownerDb(), NOTE_PATH), { content: 'Outro texto fictício' }));
  });

  test('SDK real recria banco após terminate sem reaproveitar cache entre identidades', async () => {
    await seed();
    const app = initializeApp({ projectId: PROJECT, apiKey: 'synthetic-emulator-only' }, 'presenter-lifecycle-emulator');
    let db;
    function connect(uid) {
      const instance = initializeFirestore(app, { localCache: memoryLocalCache() });
      connectFirestoreEmulator(instance, '127.0.0.1', port, {
        mockUserToken: { sub: uid, user_id: uid, firebase: { sign_in_provider: 'github.com' } },
      });
      return instance;
    }
    try {
      db = connect(OWNER);
      await assertSucceeds(getDocFromServer(doc(db, NOTE_PATH)));
      assert.equal((await getDocFromCache(doc(db, NOTE_PATH))).exists(), true);
      const first = db;
      await terminate(db);
      db = connect('test-another-user');
      assert.notEqual(db, first);
      await assert.rejects(getDocFromCache(doc(db, NOTE_PATH)), (error) => error.code === 'unavailable');
      await assertFails(getDocFromServer(doc(db, NOTE_PATH)));
      await terminate(db);
      db = connect(OWNER);
      assert.notEqual(db, first);
      await assertSucceeds(getDocFromServer(doc(db, NOTE_PATH)));
    } finally {
      if (db) await terminate(db);
      await deleteApp(app);
    }
  });
});
