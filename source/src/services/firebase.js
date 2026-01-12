/**
 * Firebase Authentication Configuration
 *
 * This file initializes Firebase for Google Sign-In authentication.
 * All Firebase credentials must be configured via environment variables.
 *
 * Required environment variables:
 * - VITE_FIREBASE_API_KEY
 * - VITE_FIREBASE_AUTH_DOMAIN
 * - VITE_FIREBASE_PROJECT_ID
 * - VITE_FIREBASE_STORAGE_BUCKET
 * - VITE_FIREBASE_MESSAGING_SENDER_ID
 * - VITE_FIREBASE_APP_ID
 */

import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider, signInWithPopup } from "firebase/auth";

// Firebase configuration from environment variables
const firebaseAuthConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
};

// Validate Firebase configuration in development
if (import.meta.env.DEV) {
  const missingKeys = Object.entries(firebaseAuthConfig)
    .filter(([key, value]) => !value)
    .map(([key]) => key);

  if (missingKeys.length > 0) {
    console.warn(
      `⚠️ Firebase configuration incomplete. Missing: ${missingKeys.join(', ')}\n` +
      'Google Sign-In will not work. See .env.example for required variables.'
    );
  }
}

// Initialize Firebase app with a unique name for auth
const authApp = initializeApp(firebaseAuthConfig, "authApp");
const auth = getAuth(authApp);
const provider = new GoogleAuthProvider();

export { auth, provider, signInWithPopup };
