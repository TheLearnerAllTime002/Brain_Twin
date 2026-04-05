import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider, signInWithPopup, signInWithRedirect, signOut } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';
import firebaseConfig from '../firebase-applet-config.json';

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app, firebaseConfig.firestoreDatabaseId);
export const storage = getStorage(app);

const REDIRECT_FALLBACK_ERROR_CODES = new Set([
  'auth/popup-blocked',
  'auth/cancelled-popup-request',
  'auth/web-storage-unsupported',
]);

export const signInWithGoogle = async () => {
  const provider = new GoogleAuthProvider();
  provider.setCustomParameters({
    prompt: 'select_account',
  });

  try {
    return await signInWithPopup(auth, provider);
  } catch (error: any) {
    console.error("Error signing in with Google", error);

    if (REDIRECT_FALLBACK_ERROR_CODES.has(error?.code)) {
      await signInWithRedirect(auth, provider);
      return;
    }

    throw error;
  }
};

export const logOut = async () => {
  try {
    await signOut(auth);
  } catch (error) {
    console.error("Error signing out", error);
  }
};
