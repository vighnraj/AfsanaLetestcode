# Environment Setup Guide

## Environment Variables

This template uses environment variables for configuration. All environment variables must be prefixed with `VITE_` to be accessible in the frontend code.

## Configuration File

Create a `.env` file in the `source` root directory (copy from `.env.example`):

```env
# API Configuration
VITE_API_BASE_URL=https://your-api-url.com/api

# Firebase Configuration (Optional - for notifications)
VITE_FIREBASE_API_KEY=your-firebase-api-key
VITE_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your-project-id
VITE_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=your-sender-id
VITE_FIREBASE_APP_ID=your-app-id
VITE_FIREBASE_VAPID_KEY=your-vapid-key

# App Configuration
VITE_APP_NAME=EduCRM
VITE_APP_VERSION=1.0.0
```

## Variable Descriptions

### API Configuration

| Variable | Description | Required |
|----------|-------------|----------|
| `VITE_API_BASE_URL` | Base URL for your backend API | Yes |

### Firebase Configuration

| Variable | Description | Required |
|----------|-------------|----------|
| `VITE_FIREBASE_API_KEY` | Firebase API Key | Optional |
| `VITE_FIREBASE_AUTH_DOMAIN` | Firebase Auth Domain | Optional |
| `VITE_FIREBASE_PROJECT_ID` | Firebase Project ID | Optional |
| `VITE_FIREBASE_STORAGE_BUCKET` | Firebase Storage Bucket | Optional |
| `VITE_FIREBASE_MESSAGING_SENDER_ID` | Firebase Messaging Sender ID | Optional |
| `VITE_FIREBASE_APP_ID` | Firebase App ID | Optional |
| `VITE_FIREBASE_VAPID_KEY` | Firebase VAPID Key for push notifications | Optional |

## Accessing Environment Variables

In your React components or JavaScript files, access environment variables using:

```javascript
const apiUrl = import.meta.env.VITE_API_BASE_URL;
const appName = import.meta.env.VITE_APP_NAME;
```

## Multiple Environments

You can create multiple environment files for different environments:

- `.env` - Default environment
- `.env.local` - Local overrides (not committed to git)
- `.env.development` - Development environment
- `.env.production` - Production environment

Vite automatically loads the appropriate file based on the mode.

## Security Notes

1. **Never commit `.env` files** to version control
2. **Never expose sensitive keys** in frontend code
3. **Use `.env.example`** as a template for required variables
4. **Backend secrets** should never be in frontend environment variables

## Config.js File

The template also includes a `Config.js` file in the `src` folder for additional configuration. Update this file with your backend URL:

```javascript
const BASE_URL = import.meta.env.VITE_API_BASE_URL || "https://your-api-url.com/api";
export default BASE_URL;
```
