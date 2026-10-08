import { createPresenterController, MAX_NOTE_LENGTH } from './controller.mjs';

function statusText(state) {
  if (state.status === 'disabled') return 'Aguardando configuração.';
  if (state.status === 'authenticating') return 'Abrindo a janela de login do GitHub…';
  if (state.status === 'loading') return 'Carregando suas anotações…';
  if (state.status === 'denied') return 'Acesso restrito à conta da apresentadora.';
  if (state.status === 'error') return 'As anotações não puderam ser carregadas.';
  if (state.status === 'ready') {
    if (state.saveStatus === 'saving') return 'Salvando anotações…';
    if (state.dirty) return 'Há alterações não salvas.';
    if (state.saveStatus === 'saved') return 'Notas salvas.';
    return 'Anotações carregadas. Salve quando terminar de editar.';
  }
  return state.isBusy ? 'Limpando esta sessão…' : 'Entre com a conta GitHub autorizada.';
}

export function mountPresenter(root, { config, gateway }) {
  const select = (selector) => {
    const element = root.querySelector(selector);
    if (!element) throw new Error('A área da apresentadora está incompleta.');
    return element;
  };
  const login = select('[data-login]');
  const loginRegion = select('[data-login-region]');
  const configNote = select('[data-config-note]');
  const editor = select('[data-editor]');
  const content = select('[data-content]');
  const save = select('[data-save]');
  const logout = select('[data-logout]');
  const status = select('[data-status]');
  const error = select('[data-error]');
  const counter = select('[data-counter]');
  const listeners = new AbortController();
  let previous = null;
  let returnFocusToLogin = false;
  let destroyed = false;

  function render(state) {
    const ready = state.status === 'ready';
    configNote.hidden = state.status !== 'disabled';
    loginRegion.hidden = state.signedIn;
    login.disabled = state.status === 'disabled' || state.isBusy;
    editor.hidden = !ready;
    content.disabled = !ready;
    // Use only a textarea value, never HTML/Markdown rendering of private notes.
    const value = ready ? state.content : '';
    if (content.value !== value) content.value = value;
    save.disabled = !ready || !state.dirty || state.isBusy || state.content.length > MAX_NOTE_LENGTH;
    save.textContent = state.saveStatus === 'saving' ? 'Salvando…' : 'Salvar notas';
    logout.hidden = !state.signedIn;
    logout.textContent = state.dirty && !state.isBusy ? 'Sair e descartar alterações' : 'Sair e limpar esta tela';
    status.textContent = statusText(state);
    error.textContent = state.error;
    error.hidden = !state.error;
    counter.textContent = `${state.content.length.toLocaleString('pt-BR')} de ${MAX_NOTE_LENGTH.toLocaleString('pt-BR')} caracteres`;

    if (previous?.signedIn && !state.signedIn) returnFocusToLogin = true;
    if (ready && previous?.status !== 'ready') content.focus();
    else if (state.status === 'denied' && previous?.status !== 'denied') status.focus();
    else if (returnFocusToLogin && !state.isBusy && !login.disabled && !loginRegion.hidden) {
      login.focus();
      returnFocusToLogin = false;
    }
    previous = state;
  }
  const controller = createPresenterController({ config, gateway, onChange: render });
  login.addEventListener('click', () => { void controller.signIn(); }, { signal: listeners.signal });
  logout.addEventListener('click', () => { void controller.signOut(); }, { signal: listeners.signal });
  content.addEventListener('input', () => controller.setContent(content.value), { signal: listeners.signal });
  editor.addEventListener('submit', (event) => { event.preventDefault(); void controller.save(); }, { signal: listeners.signal });
  window.addEventListener('beforeunload', (event) => {
    if (!controller.getSnapshot().dirty) return;
    event.preventDefault();
    event.returnValue = '';
  }, { signal: listeners.signal });
  void controller.start();
  return {
    controller,
    destroy() {
      if (destroyed) return;
      controller.destroy();
      listeners.abort();
      content.value = '';
      destroyed = true;
    },
  };
}
