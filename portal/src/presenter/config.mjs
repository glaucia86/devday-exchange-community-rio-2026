const DISABLED = Object.freeze({ enabled: false, presenterUid: '', firebase: null });

function publicValue(value) {
  if (typeof value !== 'string') return '';
  const text = value.trim();
  if (/^(?:__|<|YOUR_|REPLACE_)|replace[-_ ]?me|PROJECT_ID/i.test(text)) return '';
  return text;
}

export function resolvePresenterConfig(values = {}) {
  if (values.PUBLIC_PRESENTER_ENABLED !== 'true') return DISABLED;
  const presenterUid = publicValue(values.PUBLIC_PRESENTER_UID);
  const apiKey = publicValue(values.PUBLIC_FIREBASE_API_KEY);
  const authDomain = publicValue(values.PUBLIC_FIREBASE_AUTH_DOMAIN);
  const projectId = publicValue(values.PUBLIC_FIREBASE_PROJECT_ID);
  const appId = publicValue(values.PUBLIC_FIREBASE_APP_ID);
  if (!presenterUid || presenterUid.length > 128 || /[\s/]/.test(presenterUid)) return DISABLED;
  if (!/^[a-z][a-z0-9-]{4,28}[a-z0-9]$/.test(projectId)) return DISABLED;
  if (authDomain !== `${projectId}.firebaseapp.com`) return DISABLED;
  if (apiKey.length < 10 || /\s/.test(apiKey) || !/^1:\d+:web:[a-f0-9]+$/.test(appId)) return DISABLED;
  return Object.freeze({
    enabled: true,
    presenterUid,
    firebase: Object.freeze({ apiKey, authDomain, projectId, appId }),
  });
}
