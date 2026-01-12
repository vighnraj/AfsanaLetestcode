# Firebase Setup Guide

## Overview

Firebase integration in this template is **optional** and is primarily used for:
- Push notifications
- Google Sign-In authentication (optional)

## Prerequisites

- A Google account
- Access to Firebase Console (https://console.firebase.google.com)

## Step 1: Create a Firebase Project

1. Go to [Firebase Console](https://console.firebase.google.com)
2. Click "Add project"
3. Enter your project name (e.g., "EduCRM")
4. Follow the setup wizard
5. Click "Create project"

## Step 2: Register Your Web App

1. In Firebase Console, go to Project Settings
2. Scroll down to "Your apps" section
3. Click the web icon (</>)
4. Register your app with a nickname
5. Copy the Firebase configuration object

## Step 3: Configure Environment Variables

Add the Firebase configuration to your `.env` file:

```env
VITE_FIREBASE_API_KEY=AIzaSyxxxxxxxxxxxxxxxxxxxxxxxxx
VITE_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your-project-id
VITE_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=123456789012
VITE_FIREBASE_APP_ID=1:123456789012:web:abcdef123456
```

## Step 4: Enable Cloud Messaging (For Push Notifications)

1. In Firebase Console, go to Project Settings
2. Click on "Cloud Messaging" tab
3. Under "Web Push certificates", click "Generate key pair"
4. Copy the Key pair (VAPID key)
5. Add to your `.env` file:

```env
VITE_FIREBASE_VAPID_KEY=your-vapid-key
```

## Step 5: Enable Authentication (Optional)

If you want to use Firebase Authentication:

1. Go to Firebase Console > Authentication
2. Click "Get started"
3. Enable desired sign-in methods:
   - Email/Password
   - Google
   - Others as needed

## Firebase Configuration Files

The template includes Firebase configuration in:

- `src/services/firebase.js` - Firebase initialization
- `src/services/FirebaseNotification.js` - Push notification setup

## Updating Firebase Configuration

Update the `src/services/firebase.js` file if needed:

```javascript
import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const provider = new GoogleAuthProvider();
```

## Service Worker for Push Notifications

For push notifications to work, you need a service worker. Create `public/firebase-messaging-sw.js`:

```javascript
importScripts('https://www.gstatic.com/firebasejs/9.0.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/9.0.0/firebase-messaging-compat.js');

firebase.initializeApp({
  apiKey: "your-api-key",
  authDomain: "your-auth-domain",
  projectId: "your-project-id",
  storageBucket: "your-storage-bucket",
  messagingSenderId: "your-sender-id",
  appId: "your-app-id"
});

const messaging = firebase.messaging();

messaging.onBackgroundMessage((payload) => {
  const notificationTitle = payload.notification.title;
  const notificationOptions = {
    body: payload.notification.body,
    icon: '/logo.png'
  };

  self.registration.showNotification(notificationTitle, notificationOptions);
});
```

## Disabling Firebase

If you don't want to use Firebase:

1. Remove Firebase-related imports from `App.jsx`
2. Remove or comment out the notification code in `App.jsx`
3. The app will work without Firebase features

## Troubleshooting

### Common Issues

1. **Notifications not working**
   - Check if VAPID key is correct
   - Ensure service worker is registered
   - Check browser notification permissions

2. **Google Sign-In not working**
   - Verify OAuth configuration in Firebase Console
   - Check authorized domains list

3. **Firebase initialization error**
   - Verify all environment variables are set correctly
   - Check for typos in configuration
