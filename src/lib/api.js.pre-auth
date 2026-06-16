// client/src/lib/api.js
import axios from 'axios';

// const api = axios.create({
//   baseURL: '/api',
//   timeout: 15000,
// });
const api = axios.create({
  baseURL: `${import.meta.env.VITE_API_URL}/api`,
  timeout: 15000,
});

// ── Projects ──────────────────────────────────────────────────────────
export const getProjects = () => api.get('/projects').then(r => r.data);
export const getProject  = id => api.get(`/projects/${id}`).then(r => r.data);
export const createProject = data => api.post('/projects', data).then(r => r.data);
export const updateProject = (id, data) => api.put(`/projects/${id}`, data).then(r => r.data);
export const updateStage   = (id, stage) => api.patch(`/projects/${id}/stage`, { stage }).then(r => r.data);
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

export default api;
