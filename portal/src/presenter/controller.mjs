export const MAX_NOTE_LENGTH = 16000;

function friendlyError(error, operation) {
  const code = typeof error?.code === 'string' ? error.code : '';
  if (code === 'auth/popup-blocked') return 'O navegador bloqueou a janela de login. Permita o popup e tente novamente.';
  if (code === 'auth/popup-closed-by-user' || code === 'auth/cancelled-popup-request') return 'O login foi cancelado. Você pode tentar novamente.';
  if (code === 'auth/unauthorized-domain' || code === 'auth/operation-not-allowed') return 'O login ainda precisa ser configurado para este endereço.';
  if (code === 'auth/account-exists-with-different-credential') return 'Esta conta usa outro provedor. Confira a configuração do GitHub no projeto Firebase.';
  if (code === 'permission-denied' || code === 'firestore/permission-denied') return 'Acesso às notas não autorizado. Confira a conta e as regras do projeto.';
  if (operation === 'save') return 'Não foi possível confirmar o salvamento. Seu rascunho continua aqui; confira a conexão e tente novamente.';
  if (operation === 'load') return 'Não foi possível carregar as notas. Confira a conexão, saia e entre novamente.';
  if (operation === 'signOut') return 'As notas foram removidas desta tela. Recarregue a página para encerrar completamente a sessão.';
  return 'Não foi possível entrar. Confira a conexão e tente novamente.';
}

export function createPresenterController({ config, gateway, onChange = () => {} }) {
  const enabled = config?.enabled === true && typeof config.presenterUid === 'string' && config.presenterUid.length > 0;
  let state = {
    status: enabled ? 'signed-out' : 'disabled', content: '', dirty: false,
    error: '', isBusy: false, signedIn: false, saveStatus: 'idle',
  };
  let generation = 0;
  let loginOperation = 0;
  let loginPending = false;
  let logoutPending = false;
  let started = false;
  let destroyed = false;
  let unsubscribe = () => {};
  let identity = null;
  let savedContent = '';

  const getSnapshot = () => Object.freeze({ ...state });
  function change(values) {
    if (destroyed) return;
    state = { ...state, ...values };
    onChange(getSnapshot());
  }
  function clear(values = {}) {
    savedContent = '';
    change({ content: '', dirty: false, error: '', saveStatus: 'idle', ...values });
  }
  function authorized(user) {
    return user?.uid === config.presenterUid && user?.signInProvider === 'github.com';
  }
  async function receiveIdentity(user) {
    if (destroyed) return;
    if (logoutPending) {
      clear({ status: 'signed-out', isBusy: true, signedIn: false });
      return;
    }
    const current = ++generation;
    identity = user;
    clear({ status: 'signed-out', isBusy: false, signedIn: Boolean(user) });
    if (!user) {
      if (loginPending) change({ status: 'authenticating', isBusy: true });
      return;
    }
    if (!authorized(user)) {
      change({ status: 'denied', error: 'Esta conta não tem acesso às notas da apresentadora.' });
      return;
    }
    change({ status: 'loading', isBusy: true });
    try {
      const note = await gateway.loadNote(user.uid);
      if (destroyed || current !== generation) return;
      const content = note?.content ?? '';
      if (typeof content !== 'string' || content.length > MAX_NOTE_LENGTH) throw { code: 'invalid-data' };
      savedContent = content;
      change({ status: 'ready', content, dirty: false, isBusy: false });
    } catch (error) {
      if (destroyed || current !== generation) return;
      clear({ status: 'error', isBusy: false, error: friendlyError(error, 'load') });
    }
  }
  function receiveAuthError(error) {
    if (destroyed) return;
    generation += 1;
    identity = null;
    loginOperation += 1;
    loginPending = false;
    clear({ status: 'signed-out', isBusy: logoutPending, signedIn: false, error: friendlyError(error, 'login') });
  }

  return {
    getSnapshot,
    async start() {
      if (started || destroyed) return;
      started = true;
      change({});
      if (!enabled) return;
      try { unsubscribe = gateway.subscribeAuth(receiveIdentity, receiveAuthError); }
      catch (error) { receiveAuthError(error); }
    },
    async signIn() {
      if (!enabled || destroyed || loginPending || logoutPending || state.signedIn || state.isBusy) return;
      const current = ++loginOperation;
      loginPending = true;
      change({ status: 'authenticating', isBusy: true, error: '' });
      try {
        await gateway.signIn();
      } catch (error) {
        if (!destroyed && current === loginOperation) change({ status: 'signed-out', error: friendlyError(error, 'login') });
      } finally {
        if (!destroyed && current === loginOperation) {
          loginPending = false;
          if (state.status === 'authenticating') change({ status: 'signed-out', isBusy: false });
          else if (state.status !== 'loading') change({ isBusy: false });
        }
      }
    },
    setContent(content) {
      if (destroyed || state.status !== 'ready' || !authorized(identity) || typeof content !== 'string') return;
      change({
        content, dirty: content !== savedContent,
        error: content.length > MAX_NOTE_LENGTH ? `O limite é de ${MAX_NOTE_LENGTH} caracteres.` : '',
        saveStatus: state.isBusy ? state.saveStatus : 'idle',
      });
    },
    async save() {
      if (destroyed || state.status !== 'ready' || !authorized(identity) || state.isBusy || !state.dirty) return;
      if (state.content.length > MAX_NOTE_LENGTH) {
        change({ error: `O limite é de ${MAX_NOTE_LENGTH} caracteres.` });
        return;
      }
      const current = generation;
      const content = state.content;
      change({ isBusy: true, error: '', saveStatus: 'saving' });
      try {
        await gateway.saveNote(identity.uid, content);
        if (destroyed || current !== generation) return;
        savedContent = content;
        change({ dirty: state.content !== content, isBusy: false, saveStatus: 'saved' });
      } catch (error) {
        if (destroyed || current !== generation) return;
        change({ isBusy: false, saveStatus: 'error', error: friendlyError(error, 'save') });
      }
    },
    async signOut() {
      if (!enabled || destroyed || logoutPending) return;
      logoutPending = true;
      generation += 1;
      loginOperation += 1;
      loginPending = false;
      identity = null;
      clear({ status: 'signed-out', isBusy: true, signedIn: false });
      let errorMessage = '';
      try {
        await gateway.signOut();
      } catch (error) {
        errorMessage = friendlyError(error, 'signOut');
      } finally {
        logoutPending = false;
        if (!destroyed) change({ status: 'signed-out', isBusy: false, error: errorMessage });
      }
    },
    destroy() {
      if (destroyed) return;
      generation += 1;
      loginOperation += 1;
      loginPending = false;
      identity = null;
      clear({ status: 'signed-out', isBusy: false, signedIn: false });
      destroyed = true;
      unsubscribe();
      // A page exit must not retain the Firebase app or its memory cache.
      Promise.resolve(gateway?.dispose?.()).catch(() => {});
    },
  };
}
