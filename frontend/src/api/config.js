/**
 * Centralized API Base URL configuration.
 * Dynamically resolves between local development, public tunnel, and cloud production.
 */
export const getApiBaseUrl = () => {
  if (import.meta.env.VITE_API_BASE_URL) {
    return import.meta.env.VITE_API_BASE_URL;
  }
  if (typeof window !== 'undefined' && window.location.hostname.includes('app.lhr.life')) {
    return 'https://98a33547bd5d82.app.lhr.life';
  }
  return 'http://127.0.0.1:8000';
};

export const API_BASE_URL = getApiBaseUrl();

export default API_BASE_URL;
