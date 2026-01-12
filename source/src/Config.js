/**
 * Application Configuration
 *
 * This file centralizes all environment-based configuration.
 * All API URLs and external service configurations should be defined here.
 *
 * IMPORTANT: Never hardcode API URLs or secrets in this file.
 * All sensitive values must come from environment variables.
 */

// API Base URL - Required for all API calls
const BASE_URL = import.meta.env.VITE_API_BASE_URL || '';

// Socket.io URL - Required for real-time features
export const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || '';

// Application Settings
export const APP_CONFIG = {
  name: import.meta.env.VITE_APP_NAME || 'EduCRM',
  version: import.meta.env.VITE_APP_VERSION || '1.0.0',
  enableNotifications: import.meta.env.VITE_ENABLE_NOTIFICATIONS === 'true',
  enableChat: import.meta.env.VITE_ENABLE_CHAT === 'true',
};

// Validate required environment variables in development
if (import.meta.env.DEV) {
  if (!BASE_URL) {
    console.warn(
      '⚠️ VITE_API_BASE_URL is not configured. API calls will fail.\n' +
      'Please copy .env.example to .env and configure your API URL.'
    );
  }
  if (!SOCKET_URL) {
    console.warn(
      '⚠️ VITE_SOCKET_URL is not configured. Real-time features will not work.\n' +
      'Please set VITE_SOCKET_URL in your .env file.'
    );
  }
}

export default BASE_URL;
