import { getAuthHeader } from './auth';
import { API_BASE_URL } from './config';

const request = async (endpoint, options = {}) => {
  const headers = {
    'Content-Type': 'application/json',
    ...getAuthHeader(),
    ...(options.headers || {}),
  };

  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers,
  });

  if (!response.ok) {
    const errData = await response.json().catch(() => ({}));
    const message = errData.detail || `Request failed with status ${response.status}`;
    throw new Error(message);
  }

  return await response.json();
};

/**
 * Fetch all pending bullet suggestions for the current user.
 */
export const fetchPendingSuggestions = async () => {
  try {
    return await request('/suggestions');
  } catch (error) {
    console.error('Error fetching pending suggestions:', error.message);
    throw error;
  }
};

/**
 * Accept a pending suggestion and insert it into the active resume.
 * Optionally provide customText to overwrite the generated bullet.
 */
export const acceptSuggestion = async (id, customText = null, onResumeInvalidate = null) => {
  try {
    const payload = customText ? { custom_bullet: customText } : {};
    const data = await request(`/suggestions/${id}/accept`, {
      method: 'POST',
      body: JSON.stringify(payload),
    });
    if (onResumeInvalidate && typeof onResumeInvalidate === 'function') {
      try {
        await onResumeInvalidate();
      } catch (invalErr) {
        console.warn('Resume cache invalidation callback failed:', invalErr);
      }
    }
    return data;
  } catch (error) {
    console.error('Error accepting suggestion:', error.message);
    throw error;
  }
};

/**
 * Edit the proposed bullet text of a suggestion in the database.
 */
export const editSuggestion = async (id, text) => {
  try {
    return await request(`/suggestions/${id}`, {
      method: 'PUT',
      body: JSON.stringify({ proposed_bullet: text }),
    });
  } catch (error) {
    console.error('Error editing suggestion:', error.message);
    throw error;
  }
};

/**
 * Dismiss a suggestion so it leaves the review queue without altering the resume.
 */
export const dismissSuggestion = async (id) => {
  try {
    return await request(`/suggestions/${id}/dismiss`, {
      method: 'POST',
    });
  } catch (error) {
    console.error('Error dismissing suggestion:', error.message);
    throw error;
  }
};

/**
 * Day 12 Smart Swap: Archives an older project and inserts the suggested project
 * to maintain strict 1-page resume limits.
 */
export const swapProjectSuggestion = async (id, archiveProjectId, onResumeInvalidate = null) => {
  try {
    const data = await request(`/suggestions/${id}/swap`, {
      method: 'POST',
      body: JSON.stringify({ archive_project_id: archiveProjectId }),
    });
    if (onResumeInvalidate && typeof onResumeInvalidate === 'function') {
      try {
        await onResumeInvalidate();
      } catch (invalErr) {
        console.warn('Resume cache invalidation callback failed:', invalErr);
      }
    }
    return data;
  } catch (error) {
    console.error('Error swapping project suggestion:', error.message);
    throw error;
  }
};

export default {
  fetchPendingSuggestions,
  acceptSuggestion,
  editSuggestion,
  dismissSuggestion,
  swapProjectSuggestion,
};
