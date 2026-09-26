import { getAuthHeader } from './auth';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://127.0.0.1:8000';

export const uploadResume = (file, onUploadProgress) => {
  return new Promise((resolve, reject) => {
    const formData = new FormData();
    formData.append('file', file);

    const xhr = new XMLHttpRequest();
    xhr.open('POST', `${API_BASE_URL}/resumes/upload`);

    const headers = getAuthHeader();
    Object.keys(headers).forEach((key) => {
      xhr.setRequestHeader(key, headers[key]);
    });

    if (xhr.upload && onUploadProgress) {
      xhr.upload.onprogress = (event) => {
        if (event.lengthComputable) {
          const percent = Math.round((event.loaded * 100) / event.total);
          onUploadProgress(percent);
        }
      };
    }

    xhr.onload = () => {
      let data;
      try {
        data = JSON.parse(xhr.responseText);
      } catch {
        data = {};
      }

      if (xhr.status >= 200 && xhr.status < 300) {
        resolve(data);
      } else {
        reject(new Error(data.detail || 'Resume upload failed. Please try again.'));
      }
    };

    xhr.onerror = () => {
      reject(new Error('Network error during upload. Please check backend connection.'));
    };

    xhr.send(formData);
  });
};

export const getCurrentResume = async () => {
  const response = await fetch(`${API_BASE_URL}/resumes/current`, {
    headers: { ...getAuthHeader() },
  });
  if (!response.ok) {
    if (response.status === 404) return null;
    const errData = await response.json().catch(() => ({}));
    throw new Error(errData.detail || 'Failed to fetch current resume.');
  }
  return await response.json();
};

export const regenerateResume = async () => {
  const response = await fetch(`${API_BASE_URL}/resumes/regenerate`, {
    method: 'POST',
    headers: { ...getAuthHeader(), 'Content-Type': 'application/json' },
  });
  if (!response.ok) {
    const errData = await response.json().catch(() => ({}));
    throw new Error(errData.detail || 'Resume regeneration failed.');
  }
  return await response.json();
};

export const getResumeVersions = async (resumeId) => {
  if (!resumeId) return [];
  const response = await fetch(`${API_BASE_URL}/resumes/${resumeId}/versions`, {
    headers: { ...getAuthHeader() },
  });
  if (!response.ok) {
    const errData = await response.json().catch(() => ({}));
    throw new Error(errData.detail || 'Failed to fetch resume versions.');
  }
  return await response.json();
};

export const getDownloadUrl = (versionId) => {
  return `${API_BASE_URL}/resumes/download/${versionId}`;
};

