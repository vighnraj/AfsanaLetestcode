# Environment Setup Guide

This guide explains how to configure environment variables for EduCRM React Admin Dashboard.

---

## Overview

Environment variables allow you to configure the application without modifying source code. They are stored in a `.env` file that is NOT committed to version control.

---

## Setup Steps

### Step 1: Create Environment File

Copy the example file:

```bash
cd source
cp .env.example .env
```

### Step 2: Configure Required Variables

Edit `.env` and set your values:

```env
VITE_API_BASE_URL=https://your-api.com/api/
VITE_SOCKET_URL=https://your-api.com
```

### Step 3: Restart Development Server

Environment changes require a server restart:

```bash
# Stop the server (Ctrl+C)
# Then restart
npm run dev
```

---

## Variable Reference

### Required Variables

| Variable | Description | Example |
|----------|-------------|---------|
| `VITE_API_BASE_URL` | Backend API base URL | `https://api.example.com/api/` |
| `VITE_SOCKET_URL` | Socket.io server URL | `https://api.example.com` |

### Optional - Firebase

| Variable | Description |
|----------|-------------|
| `VITE_FIREBASE_API_KEY` | Firebase Web API Key |
| `VITE_FIREBASE_AUTH_DOMAIN` | Firebase Auth Domain |
| `VITE_FIREBASE_PROJECT_ID` | Firebase Project ID |
| `VITE_FIREBASE_STORAGE_BUCKET` | Firebase Storage Bucket |
| `VITE_FIREBASE_MESSAGING_SENDER_ID` | Firebase Messaging Sender ID |
| `VITE_FIREBASE_APP_ID` | Firebase App ID |
| `VITE_FIREBASE_VAPID_KEY` | VAPID Key for Push Notifications |

### Optional - Application

| Variable | Default | Description |
|----------|---------|-------------|
| `VITE_APP_NAME` | EduCRM | Application display name |
| `VITE_APP_VERSION` | 1.0.0 | Application version |
| `VITE_ENABLE_NOTIFICATIONS` | true | Enable push notifications |
| `VITE_ENABLE_CHAT` | true | Enable chat feature |

---

## Firebase Setup

If you want to use Google Sign-In or Push Notifications:

### Step 1: Create Firebase Project

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Click "Add Project"
3. Follow the setup wizard

### Step 2: Register Web App

1. In your Firebase project, click the gear icon > Project Settings
2. Scroll to "Your apps" section
3. Click the web icon (`</>`) to add a web app
4. Register your app and copy the configuration

### Step 3: Get VAPID Key (for Push Notifications)

1. Go to Project Settings > Cloud Messaging
2. Scroll to "Web configuration"
3. Generate a key pair
4. Copy the key to `VITE_FIREBASE_VAPID_KEY`

### Step 4: Configure Environment

Add all Firebase values to your `.env`:

```env
VITE_FIREBASE_API_KEY=AIzaSy...
VITE_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your-project
VITE_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=123456789
VITE_FIREBASE_APP_ID=1:123456789:web:abc123
VITE_FIREBASE_VAPID_KEY=BGt...
```

---

## Production Deployment

### Vercel

1. Go to Project Settings > Environment Variables
2. Add each variable with its value
3. Redeploy

### Netlify

1. Go to Site Settings > Build & Deploy > Environment
2. Add each variable
3. Trigger a new deploy

### Docker

Create a `.env.production` file or pass variables at runtime:

```bash
docker run -e VITE_API_BASE_URL=https://api.example.com/api/ your-image
```

### CI/CD Pipeline

Add variables to your CI/CD secrets:

```yaml
# GitHub Actions example
env:
  VITE_API_BASE_URL: ${{ secrets.API_URL }}
  VITE_SOCKET_URL: ${{ secrets.SOCKET_URL }}
```

---

## Security Notes

1. **Never commit `.env` files** - They are gitignored by default
2. **Frontend variables are public** - Anyone can see them in browser DevTools
3. **Don't store secrets** - Only store client-side API keys (like Firebase)
4. **Backend secrets stay on backend** - Database passwords, JWT secrets, etc. should never be in frontend

---

## Troubleshooting

### Variables not loading

- Ensure variables start with `VITE_`
- Restart the development server after changes
- Check for typos in variable names

### Build not picking up variables

- Set variables before running `npm run build`
- Or configure them in your hosting provider's dashboard

### Firebase errors

- Verify all Firebase config values are correct
- Check that your domain is authorized in Firebase Console
- Enable the required authentication methods in Firebase
