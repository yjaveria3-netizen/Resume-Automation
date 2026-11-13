import { API_BASE_URL } from './config';

export const getToken = () => {
  return localStorage.getItem('access_token');
};

export const getUser = () => {
  const userStr = localStorage.getItem('user');
  if (!userStr) return null;
  try {
    const user = JSON.parse(userStr);
    if (!user.name && user.email) {
      user.name = user.email.split('@')[0];
    }
    return user;
  } catch {
    return null;
  }
};

export const getAuthHeader = () => {
  const token = getToken();
  return token ? { Authorization: `Bearer ${token}` } : {};
};

export const isAuthenticated = () => Boolean(getToken());

const parseErrorDetail = (detail, fallbackMsg) => {
  if (!detail) return fallbackMsg;
  if (typeof detail === 'string') return detail;
  if (Array.isArray(detail)) {
    return detail.map((d) => d.msg || d.detail || JSON.stringify(d)).join(', ');
  }
  if (typeof detail === 'object') {
    return detail.msg || detail.message || detail.detail || JSON.stringify(detail);
  }
  return String(detail);
};

export const signup = async (email, password) => {
  try {
    const cleanEmail = email.trim().toLowerCase();
    const res = await fetch(`${API_BASE_URL}/auth/signup`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: cleanEmail, password }),
    });

    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      const errMsg = parseErrorDetail(data.detail, 'Signup failed. Please try again.');
      throw new Error(errMsg);
    }

    if (data.access_token) {
      localStorage.setItem('access_token', data.access_token);
      const userToStore = data.user || { email: cleanEmail };
      if (!userToStore.name) {
        userToStore.name = cleanEmail.split('@')[0];
      }
      localStorage.setItem('user', JSON.stringify(userToStore));
      window.dispatchEvent(new Event('auth_change'));
    }
    return data;
  } catch (error) {
    throw new Error(error.message || 'Signup failed. Please try again.', { cause: error });
  }
};

export const login = async (email, password) => {
  try {
    const cleanEmail = email.trim().toLowerCase();
    const res = await fetch(`${API_BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: cleanEmail, password }),
    });

    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      const errMsg = parseErrorDetail(data.detail, 'Login failed. Invalid credentials or server error.');
      throw new Error(errMsg);
    }

    if (data.access_token) {
      localStorage.setItem('access_token', data.access_token);
      const userToStore = data.user || { email: cleanEmail };
      if (!userToStore.name) {
        userToStore.name = cleanEmail.split('@')[0];
      }
      localStorage.setItem('user', JSON.stringify(userToStore));
      window.dispatchEvent(new Event('auth_change'));
    }
    return data;
  } catch (error) {
    throw new Error(error.message || 'Login failed. Invalid credentials or server error.', {
      cause: error,
    });
  }
};

export const logout = () => {
  localStorage.removeItem('access_token');
  localStorage.removeItem('user');
  window.dispatchEvent(new Event('auth_change'));
};

export const getMe = async () => {
  try {
    const res = await fetch(`${API_BASE_URL}/auth/me`, {
      headers: getAuthHeader(),
    });
    if (!res.ok) {
      if (res.status === 401) {
        logout();
      }
      return null;
    }
    const data = await res.json();
    if (!data.name && data.email) {
      data.name = data.email.split('@')[0];
    }
    localStorage.setItem('user', JSON.stringify(data));
    return data;
  } catch {
    return null;
  }
};

export const getGitHubStatus = async () => {
  try {
    const res = await fetch(`${API_BASE_URL}/auth/github/status`, {
      headers: getAuthHeader(),
    });
    if (!res.ok) return { is_connected: false };
    return await res.json();
  } catch {
    return { is_connected: false };
  }
};

export const disconnectGitHub = async () => {
  try {
    const res = await fetch(`${API_BASE_URL}/auth/github/disconnect`, {
      method: 'DELETE',
      headers: getAuthHeader(),
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      throw new Error(data.detail || 'Disconnect failed.');
    }
    return data;
  } catch (error) {
    throw new Error(error.message || 'Disconnect failed.', { cause: error });
  }
};
