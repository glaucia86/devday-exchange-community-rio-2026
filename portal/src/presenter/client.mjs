import { resolvePresenterConfig } from './config.mjs';
import { mountPresenter } from './view.mjs';

// Astro replaces only these explicitly public values during the build.
// No private note or credential is available to the static renderer.
const config = resolvePresenterConfig({
  PUBLIC_PRESENTER_ENABLED: import.meta.env.PUBLIC_PRESENTER_ENABLED,
  PUBLIC_PRESENTER_UID: import.meta.env.PUBLIC_PRESENTER_UID,
  PUBLIC_FIREBASE_API_KEY: import.meta.env.PUBLIC_FIREBASE_API_KEY,
  PUBLIC_FIREBASE_AUTH_DOMAIN: import.meta.env.PUBLIC_FIREBASE_AUTH_DOMAIN,
  PUBLIC_FIREBASE_PROJECT_ID: import.meta.env.PUBLIC_FIREBASE_PROJECT_ID,
  PUBLIC_FIREBASE_APP_ID: import.meta.env.PUBLIC_FIREBASE_APP_ID,
});
let mounted;
let generation = 0;
async function start() {
  const root = document.querySelector('[data-presenter-root]');
  if (!root) return;
  const current = ++generation;
  mounted?.destroy();
  if (!config.enabled) {
    mounted = mountPresenter(root, { config, gateway: null });
    return;
  }
  try {
    const [{ createFirebaseGateway }, sdk] = await Promise.all([
      import('./firebase-gateway.mjs'), import('./firebase-sdk.mjs'),
    ]);
    if (current !== generation) return;
    mounted = mountPresenter(root, { config, gateway: createFirebaseGateway(config, sdk) });
  } catch {
    if (current !== generation) return;
    mounted = mountPresenter(root, { config: { enabled: false }, gateway: null });
    const message = root.querySelector('[data-error]');
    if (message) { message.textContent = 'Não foi possível iniciar o login. Confira a conexão e recarregue a página.'; message.hidden = false; }
  }
}
window.addEventListener('pagehide', () => { generation += 1; mounted?.destroy(); mounted = undefined; });
window.addEventListener('pageshow', (event) => { if (event.persisted) void start(); });
void start();
