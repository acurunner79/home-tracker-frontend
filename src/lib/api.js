// client/src/lib/api.js
import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL
  ? `${import.meta.env.VITE_API_URL}/api`
  : '/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 15000,
  withCredentials: true,
});

export const AUTH_EXPIRED_EVENT = 'home-tracker:auth-expired';

let authExpiredNotified = false;

export function resetAuthExpiredNotice() {
  authExpiredNotified = false;
}

api.interceptors.response.use(
  response => response,
  error => {
    const status = error.response?.status;
    const url = error.config?.url || '';

    const isLoginRequest = url.includes('/auth/login');
    const isSessionCheck = url.includes('/auth/me');

    if (status === 401 && !isLoginRequest && !isSessionCheck) {
      if (!authExpiredNotified) {
        authExpiredNotified = true;

        window.dispatchEvent(new CustomEvent(AUTH_EXPIRED_EVENT, {
          detail: {
            message: 'Your session expired. Please log in again.',
          },
        }));
      }
    }

    return Promise.reject(error);
  }
);

// ── Auth ──────────────────────────────────────────────────────────────
export const login = (email, password) =>
  api.post('/auth/login', { email, password }).then(r => r.data);

export const logout = () =>
  api.post('/auth/logout').then(r => r.data);

export const getMe = () =>
  api.get('/auth/me').then(r => r.data);

// ── Projects ──────────────────────────────────────────────────────────
export const getProjects = () => api.get('/projects').then(r => r.data);
export const getProject = id => api.get(`/projects/${id}`).then(r => r.data);
export const createProject = data => api.post('/projects', data).then(r => r.data);
export const updateProject = (id, data) => api.put(`/projects/${id}`, data).then(r => r.data);
export const updateStage = (id, stage) => api.patch(`/projects/${id}/stage`, { stage }).then(r => r.data);
export const deleteProject = id => api.delete(`/projects/${id}`).then(r => r.data);

// ── Images ────────────────────────────────────────────────────────────
export const uploadImages = (projectId, files, labels = []) => {
  const form = new FormData();
  files.forEach(f => form.append('images', f));
  form.append('labels', JSON.stringify(labels));

  return api.post(`/images/${projectId}`, form, {
    headers: { 'Content-Type': 'multipart/form-data' },
  }).then(r => r.data);
};

export const updateImageLabel = (imageId, label) =>
  api.patch(`/images/${imageId}`, { label }).then(r => r.data);

export const deleteImage = imageId =>
  api.delete(`/images/${imageId}`).then(r => r.data);

// ── Admin Users ───────────────────────────────────────────────────────
export const getAdminUsers = () =>
  api.get('/admin/users').then(r => r.data);

export const createAdminUser = data =>
  api.post('/admin/users', data).then(r => r.data);

export const updateAdminUser = (id, data) =>
  api.patch(`/admin/users/${id}`, data).then(r => r.data);

export const resetAdminUserPassword = (id, password) =>
  api.post(`/admin/users/${id}/reset-password`, { password }).then(r => r.data);

export default api;
