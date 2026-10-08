// Imported dynamically only in a configured browser session.
export { initializeApp, deleteApp } from 'firebase/app';
export {
  initializeAuth, inMemoryPersistence, browserPopupRedirectResolver,
  onAuthStateChanged, getIdTokenResult, GithubAuthProvider, signInWithPopup, signOut,
} from 'firebase/auth';
export {
  initializeFirestore, memoryLocalCache, doc, getDocFromServer,
  setDoc, serverTimestamp, terminate, setLogLevel,
} from 'firebase/firestore';
