/**
 * Centralized API Base URL configuration.
 * Dynamically resolves between local development, network IP, and cloud production.
 */
export const getApiBaseUrl = () => {
  if (import.meta.env.VITE_API_BASE_URL) {
    return import.meta.env.VITE_API_BASE_URL;
  }
  if (typeof window !== 'undefined') {
    const { protocol, hostname, port } = window.location;

    // 1. Direct local connection
    if (hostname === 'localhost' || hostname === '127.0.0.1') {
      return 'http://127.0.0.1:8000';
    }

    // 2. Local network IP access (e.g. 192.168.x.x, 10.x.x.x)
    // Direct requests to the backend port 8000 on the same machine IP
    if (/^(\d{1,3}\.){3}\d{1,3}$/.test(hostname)) {
      return `${protocol}//${hostname}:8000`;
    }

    // 3. Dev server on custom port
    if (port === '5173' || port === '3000') {
      return `${protocol}//${hostname}:8000`;
    }

    // 4. Default to current origin in production/tunnel deployments
    return window.location.origin;
  }
  return 'http://127.0.0.1:8000';
};

export const API_BASE_URL = getApiBaseUrl();

export default API_BASE_URL;
