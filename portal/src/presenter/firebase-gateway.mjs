import { MAX_NOTE_LENGTH } from './controller.mjs';

let gatewayNumber = 0;

// The SDK is injected as a dependency, not selected through a test-mode flag.
// Production receives only the real modular SDK from firebase-sdk.mjs.
export function createFirebaseGateway(config, sdk) {
  if (!config?.enabled || !config.presenterUid || !config.firebase) throw new Error('Configuração indisponível.');
  let session = null;
  let sessionNumber = 0;
  let identityGeneration = 0;
  let verifiedIdentity = null;
  let onIdentity = null;
  let onError = null;
  let disposed = false;
  const gatewayId = ++gatewayNumber;
  sdk.setLogLevel('silent');

  function ensureSession() {
    if (disposed) throw Object.assign(new Error('Operação cancelada.'), { code: 'cancelled' });
    if (session) return session;
    const app = sdk.initializeApp(config.firebase, `devday-presenter-${gatewayId}-${++sessionNumber}`);
    const auth = sdk.initializeAuth(app, {
      persistence: sdk.inMemoryPersistence,
      popupRedirectResolver: sdk.browserPopupRedirectResolver,
    });
    const local = { app, auth, db: null, unsubscribe: () => {} };
    session = local;
    local.unsubscribe = sdk.onAuthStateChanged(auth, async (user) => {
      if (session !== local || disposed) return;
      const current = ++identityGeneration;
      verifiedIdentity = null;
      // Clear the previous account's UI before waiting for any token metadata.
      await onIdentity?.(null);
      if (session !== local || disposed || current !== identityGeneration) return;
      try {
        if (local.db) {
          const previousDb = local.db;
          local.db = null;
          await sdk.terminate(previousDb);
        }
        if (!user) return;
        const result = await sdk.getIdTokenResult(user);
        if (session !== local || disposed || current !== identityGeneration || local.auth.currentUser?.uid !== user.uid) return;
        verifiedIdentity = { uid: user.uid, signInProvider: result.signInProvider };
        await onIdentity?.({ ...verifiedIdentity });
      } catch (error) {
        if (session !== local || disposed || current !== identityGeneration) return;
        verifiedIdentity = null;
        onError?.(error);
      }
    }, (error) => {
      if (session !== local || disposed) return;
      identityGeneration += 1;
      verifiedIdentity = null;
      onError?.(error);
    });
    return local;
  }

  function ownerSession(uid) {
    if (disposed || !session || uid !== config.presenterUid
      || session.auth.currentUser?.uid !== config.presenterUid
      || verifiedIdentity?.uid !== config.presenterUid
      || verifiedIdentity?.signInProvider !== 'github.com') throw Object.assign(new Error('Acesso às notas não autorizado.'), { code: 'permission-denied' });
    if (!session.db) session.db = sdk.initializeFirestore(session.app, { localCache: sdk.memoryLocalCache() });
    return session;
  }
  function noteReference(local) {
    return sdk.doc(local.db, 'presenter', config.presenterUid, 'notes', 'evento');
  }
  async function retireSession() {
    const previous = session;
    session = null;
    identityGeneration += 1;
    verifiedIdentity = null;
    previous?.unsubscribe();
    await onIdentity?.(null);
    if (!previous) return;
    let failure;
    try { await sdk.signOut(previous.auth); }
    catch (error) { failure = error; }
    try { if (previous.db) await sdk.terminate(previous.db); }
    catch (error) { failure ??= error; }
    finally {
      previous.db = null;
      try { await sdk.deleteApp(previous.app); }
      catch (error) { failure ??= error; }
    }
    if (failure) throw failure;
  }

  return {
    subscribeAuth(next, error) {
      onIdentity = next;
      onError = error;
      ensureSession();
      return () => {
        session?.unsubscribe();
        if (session) session.unsubscribe = () => {};
        onIdentity = null;
        onError = null;
      };
    },
    async signIn() {
      const local = ensureSession();
      // No additional scopes, OAuth token extraction, redirects, or account linking.
      await sdk.signInWithPopup(local.auth, new sdk.GithubAuthProvider());
    },
    signOut: retireSession,
    async loadNote(uid) {
      const local = ownerSession(uid);
      const current = identityGeneration;
      const snapshot = await sdk.getDocFromServer(noteReference(local));
      if (session !== local || current !== identityGeneration || disposed) throw Object.assign(new Error('Operação cancelada.'), { code: 'cancelled' });
      if (!snapshot.exists()) return null;
      const data = snapshot.data();
      if (typeof data.content !== 'string' || data.content.length > MAX_NOTE_LENGTH
        || Object.keys(data).length !== 2 || !data.updatedAt || typeof data.updatedAt.toMillis !== 'function') throw Object.assign(new Error('Conteúdo de notas inválido.'), { code: 'invalid-data' });
      return { content: data.content };
    },
    async saveNote(uid, content) {
      if (typeof content !== 'string' || content.length > MAX_NOTE_LENGTH) throw Object.assign(new Error('Conteúdo de notas inválido.'), { code: 'invalid-data' });
      const local = ownerSession(uid);
      await sdk.setDoc(noteReference(local), { content, updatedAt: sdk.serverTimestamp() });
    },
    async dispose() {
      if (disposed) return;
      disposed = true;
      onIdentity = null;
      onError = null;
      await retireSession();
    },
  };
}
