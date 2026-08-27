import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

export const firebaseConfig = {
  projectId: "gen-lang-client-0332570285",
  appId: "1:637309887254:web:2947711a239958baed6637",
  apiKey: "AIzaSyDg2qLnohrjebFpiDv2Jt22_RYjCR8zN18",
  authDomain: "gen-lang-client-0332570285.firebaseapp.com",
  firestoreDatabaseId: "ai-studio-digitalearningbk-032d57cf-ed53-4f14-b98d-5acc16f38c39",
  storageBucket: "gen-lang-client-0332570285.firebasestorage.app",
  messagingSenderId: "637309887254",
  oAuthClientId: "637309887254-5qfafk4d23pj2237rs7ha9ok5pa4oohj.apps.googleusercontent.com"
};

const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();

export const auth = getAuth(app);
export const db = firebaseConfig.firestoreDatabaseId && firebaseConfig.firestoreDatabaseId !== '(default)'
  ? getFirestore(app, firebaseConfig.firestoreDatabaseId)
  : getFirestore(app);

export default app;
