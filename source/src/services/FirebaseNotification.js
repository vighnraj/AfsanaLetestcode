/**
 * Firebase Cloud Messaging (FCM) Configuration
 *
 * This file initializes Firebase for push notifications.
 * All Firebase credentials must be configured via environment variables.
 *
 * Required environment variables:
 * - VITE_FIREBASE_API_KEY
 * - VITE_FIREBASE_AUTH_DOMAIN
 * - VITE_FIREBASE_PROJECT_ID
 * - VITE_FIREBASE_STORAGE_BUCKET
 * - VITE_FIREBASE_MESSAGING_SENDER_ID
 * - VITE_FIREBASE_APP_ID
 * - VITE_FIREBASE_VAPID_KEY (for push notifications)
 */

import { initializeApp, getApps, getApp } from "firebase/app";
import { getMessaging, getToken, onMessage } from "firebase/messaging";

// Firebase configuration from environment variables
const firebaseNotificationConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
};

// Validate Firebase configuration in development
if (import.meta.env.DEV) {
  const missingKeys = Object.entries(firebaseNotificationConfig)
    .filter(([key, value]) => !value)
    .map(([key]) => key);

  if (missingKeys.length > 0) {
    console.warn(
      `⚠️ Firebase Notification configuration incomplete. Missing: ${missingKeys.join(', ')}\n` +
      'Push notifications will not work. See .env.example for required variables.'
    );
  }
}

// Prevent duplicate initialization
const notifApp = !getApps().some(app => app.name === "notifApp")
  ? initializeApp(firebaseNotificationConfig, "notifApp")
  : getApp("notifApp");

const messaging = getMessaging(notifApp);

// Export VAPID key getter for use in components
export const getVapidKey = () => import.meta.env.VITE_FIREBASE_VAPID_KEY || '';

export { messaging, getToken, onMessage };
