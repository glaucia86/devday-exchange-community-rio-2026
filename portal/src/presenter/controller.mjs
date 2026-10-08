// RED scaffold: intentionally inert until the contract tests fail in Actions.
export const MAX_NOTE_LENGTH = 16000;

export function createPresenterController() {
  const snapshot = { status: 'disabled', content: '', dirty: false, error: '', isBusy: false };
  return {
    getSnapshot: () => ({ ...snapshot }),
    start: async () => {},
    signIn: async () => {},
    setContent: () => {},
    save: async () => {},
    signOut: async () => {},
    destroy: () => {},
  };
}
