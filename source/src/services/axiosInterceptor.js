/**
 * Centralized API Client
 *
 * This module provides a configured Axios instance for all API communications.
 * It handles:
 * - Base URL configuration from environment variables
 * - JWT token management (automatic attachment to requests)
 * - Authentication error handling (401 responses)
 * - Session timeout/idle detection
 *
 * Usage:
 *   import api from './services/axiosInterceptor';
 *   const response = await api.get('/endpoint');
 *   const data = await api.post('/endpoint', { data });
 */

import axios from "axios";
import BASE_URL from "../Config";

// ============================================================================
// Configuration Constants
// ============================================================================

const TOKEN_KEY = "authToken";
const LAST_ACTIVE_KEY = "lastActiveAt";
const IDLE_LIMIT_MS = 10 * 60 * 1000; // 10 minutes idle timeout

// ============================================================================
// Axios Instance Configuration
// ============================================================================

/**
 * Pre-configured Axios instance with base URL from environment variables.
 * All API calls should use this instance instead of raw axios.
 */
const api = axios.create({
  baseURL: BASE_URL,
  timeout: 30000, // 30 second timeout
  headers: {
    'Content-Type': 'application/json',
  },
});

// ============================================================================
// Request Interceptor
// ============================================================================

/**
 * Request interceptor attaches JWT token to all outgoing requests.
 * Token is retrieved from localStorage and added to Authorization header.
 */
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem(TOKEN_KEY);
    if (token) {
      config.headers["Authorization"] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// ============================================================================
// Response Interceptor
// ============================================================================

/**
 * Response interceptor handles authentication errors.
 * On 401 Unauthorized, automatically logs out the user.
 */
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      logoutUser();
    }
    return Promise.reject(error);
  }
);

// ============================================================================
// Session Management
// ============================================================================

/**
 * Clears user session and redirects to login page.
 * Called on 401 errors or session timeout.
 */
function logoutUser() {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(LAST_ACTIVE_KEY);
  window.location.href = "/login";
}

/**
 * Checks if user session has been idle beyond the limit.
 * If idle timeout exceeded, logs out the user.
 */
function checkIdle() {
  const last = Number(localStorage.getItem(LAST_ACTIVE_KEY) || 0);
  if (last && Date.now() - last >= IDLE_LIMIT_MS) {
    logoutUser();
  }
}

// Check for idle timeout every 10 seconds
setInterval(checkIdle, 10 * 1000);

// Update last activity timestamp on user interactions
["click", "keydown", "mousemove", "scroll", "touchstart"].forEach((evt) => {
  window.addEventListener(evt, () =>
    localStorage.setItem(LAST_ACTIVE_KEY, Date.now().toString())
  );
});

// Set initial activity timestamp if not present
if (!localStorage.getItem(LAST_ACTIVE_KEY)) {
  localStorage.setItem(LAST_ACTIVE_KEY, Date.now().toString());
}

// ============================================================================
// Export
// ============================================================================

export default api;

/**
 * Utility function to check if user is authenticated.
 * @returns {boolean} True if user has a valid token
 */
export const isAuthenticated = () => {
  return !!localStorage.getItem(TOKEN_KEY);
};

/**
 * Utility function to get current auth token.
 * @returns {string|null} The current JWT token or null
 */
export const getAuthToken = () => {
  return localStorage.getItem(TOKEN_KEY);
};

/**
 * Utility function to set auth token after login.
 * @param {string} token - The JWT token to store
 */
export const setAuthToken = (token) => {
  localStorage.setItem(TOKEN_KEY, token);
  localStorage.setItem(LAST_ACTIVE_KEY, Date.now().toString());
};

/**
 * Utility function to clear auth token on logout.
 */
export const clearAuthToken = () => {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(LAST_ACTIVE_KEY);
};
