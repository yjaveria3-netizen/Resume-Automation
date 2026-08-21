const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://127.0.0.1:8000';

export const getToken = () => localStorage.getItem('access_token');

export const getUser = () => {
  const userStr = localStorage.getItem('user');
  if (!userStr) return null;
  try {
    return JSON.parse(userStr);
  } catch {
    return null;
  }
};

export const getAuthHeader = () => {
  const token = getToken();
  return token ? { Authorization: `Bearer ${token}` } : {};
};

export const isAuthenticated = () => Boolean(getToken());

export const signup = async (email, password) => {
  try {
    const res = await fetch(`${API_BASE_URL}/auth/signup`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });

    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.detail || 'Signup failed. Please try again.');
    }

    if (data.access_token) {
      localStorage.setItem('access_token', data.access_token);
      localStorage.setItem('user', JSON.stringify(data.user));
    }
    return data;
  } catch (error) {
    throw new Error(error.message || 'Signup failed. Please try again.', { cause: error });
  }
};

export const login = async (email, password) => {
  try {
    const res = await fetch(`${API_BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });

    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.detail || 'Login failed. Invalid credentials or server error.');
    }

    if (data.access_token) {
      localStorage.setItem('access_token', data.access_token);
      localStorage.setItem('user', JSON.stringify(data.user));
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
    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.detail || 'Disconnect failed.');
    }
    return data;
  } catch (error) {
    throw new Error(error.message || 'Disconnect failed.', { cause: error });
  }
};
