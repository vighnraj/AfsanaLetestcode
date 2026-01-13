import { initializeApp, getApps, getApp } from "firebase/app";
import { getMessaging, getToken, onMessage } from "firebase/messaging";

const firebaseNotificationConfig = {
  apiKey: "AIzaSyB_gWuBSrztt5QMIzb7OKyBbfGHnDLDbE4",
  authDomain: "afsana-c363c.firebaseapp.com",
  projectId: "afsana-c363c",
  storageBucket: "afsana-c363c.appspot.com",
  messagingSenderId: "790999171285",
  appId: "1:790999171285:web:7e8d2afbc23b6c404ae25c",
  measurementId: "G-J7W8SRPJTD"

  //   apiKey: "AIzaSyBcYs4b1bv9rrtPPDGdU62A8YfsgcLJYfM",
  // authDomain: "afsana-notification.firebaseapp.com",
  // projectId: "afsana-notification",
  // storageBucket: "afsana-notification.firebasestorage.app",
  // messagingSenderId: "163017084732",
  // appId: "1:163017084732:web:91401cc504ab8060ecd839",
  // measurementId: "G-MPCDTM28HD"
};

// Prevent duplicate initialization
const notifApp = !getApps().some(app => app.name === "notifApp")
  ? initializeApp(firebaseNotificationConfig, "notifApp")
  : getApp("notifApp");

const messaging = getMessaging(notifApp);

export { messaging, getToken, onMessage };
