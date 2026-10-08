// RED scaffold for the Firebase adapter. It never imports or calls Firebase.
export function createFirebaseGateway() {
  return {
    subscribeAuth: () => () => {},
    signIn: async () => {},
    signOut: async () => {},
    loadNote: async () => null,
    saveNote: async () => {},
    dispose: async () => {},
  };
}
