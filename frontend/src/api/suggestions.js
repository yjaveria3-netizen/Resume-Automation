import axios from 'axios';
import { getAuthHeader } from './auth';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://127.0.0.1:8000';

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

apiClient.interceptors.request.use((config) => {
  const authHeaders = getAuthHeader();
  if (authHeaders.Authorization) {
    config.headers.Authorization = authHeaders.Authorization;
  }
  return config;
});

/**
 * Fetch all pending bullet suggestions for the current user.
 */
export const fetchPendingSuggestions = async () => {
  try {
    const response = await apiClient.get('/suggestions');
    return response.data;
  } catch (error) {
    const message = error.response?.data?.detail || error.message || 'Failed to fetch suggestions';
    console.error('Error fetching pending suggestions:', message);
    throw new Error(message);
  }
};

/**
 * Accept a pending suggestion and insert it into the active resume.
 * Optionally provide customText to overwrite the generated bullet.
 */
export const acceptSuggestion = async (id, customText = null, onResumeInvalidate = null) => {
  try {
    const payload = customText ? { custom_bullet: customText } : {};
    const response = await apiClient.post(`/suggestions/${id}/accept`, payload);
    if (onResumeInvalidate && typeof onResumeInvalidate === 'function') {
      try {
        await onResumeInvalidate();
      } catch (invalErr) {
        console.warn('Resume cache invalidation callback failed:', invalErr);
      }
    }
    return response.data;
  } catch (error) {
    const message = error.response?.data?.detail || error.message || 'Failed to accept suggestion';
    console.error('Error accepting suggestion:', message);
    throw new Error(message);
  }
};

/**
 * Edit the proposed bullet text of a suggestion in the database.
 */
export const editSuggestion = async (id, text) => {
  try {
    const response = await apiClient.put(`/suggestions/${id}`, {
      proposed_bullet: text,
    });
    return response.data;
  } catch (error) {
    const message = error.response?.data?.detail || error.message || 'Failed to edit suggestion';
    console.error('Error editing suggestion:', message);
    throw new Error(message);
  }
};

/**
 * Dismiss a suggestion so it leaves the review queue without altering the resume.
 */
export const dismissSuggestion = async (id) => {
  try {
    const response = await apiClient.post(`/suggestions/${id}/dismiss`);
    return response.data;
  } catch (error) {
    const message = error.response?.data?.detail || error.message || 'Failed to dismiss suggestion';
    console.error('Error dismissing suggestion:', message);
    throw new Error(message);
  }
};

/**
 * Day 12 Smart Swap: Archives an older project and inserts the suggested project
 * to maintain strict 1-page resume limits.
 */
export const swapProjectSuggestion = async (id, archiveProjectId, onResumeInvalidate = null) => {
  try {
    const response = await apiClient.post(`/suggestions/${id}/swap`, {
      archive_project_id: archiveProjectId,
    });
    if (onResumeInvalidate && typeof onResumeInvalidate === 'function') {
      try {
        await onResumeInvalidate();
      } catch (invalErr) {
        console.warn('Resume cache invalidation callback failed:', invalErr);
      }
    }
    return response.data;
  } catch (error) {
    const message = error.response?.data?.detail || error.message || 'Failed to swap project';
    console.error('Error swapping project suggestion:', message);
    throw new Error(message);
  }
};

export default {
  fetchPendingSuggestions,
  acceptSuggestion,
  editSuggestion,
  dismissSuggestion,
  swapProjectSuggestion,
};
