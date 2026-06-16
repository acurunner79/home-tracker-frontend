// client/src/hooks/useProjects.js
import { useState, useEffect, useCallback } from 'react';
import * as api from '../lib/api';

export function useProjects() {
  const [projects, setProjects]   = useState([]);
  const [loading, setLoading]     = useState(true);
  const [error, setError]         = useState(null);

  const fetch = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await api.getProjects();
      setProjects(data);
    } catch (e) {
      setError(e.message || 'Failed to load projects');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetch(); }, [fetch]);

  const createProject = async (data) => {
    const project = await api.createProject(data);
    setProjects(prev => [project, ...prev]);
    return project;
  };

  const updateProject = async (id, data) => {
    const project = await api.updateProject(id, data);
    setProjects(prev => prev.map(p => p.id === id ? project : p));
    return project;
  };

  const updateStage = async (id, stage) => {
    const project = await api.updateStage(id, stage);
    setProjects(prev => prev.map(p => p.id === id ? project : p));
    return project;
  };

  const deleteProject = async (id) => {
    await api.deleteProject(id);
    setProjects(prev => prev.filter(p => p.id !== id));
  };

  const uploadImages = async (projectId, files, labels) => {
    const images = await api.uploadImages(projectId, files, labels);
    setProjects(prev => prev.map(p =>
      p.id === projectId
        ? { ...p, images: [...(p.images || []), ...images] }
        : p
    ));
    return images;
  };

  const updateImageLabel = async (projectId, imageId, label) => {
  const updated = await api.updateImageLabel(imageId, label);

  setProjects(prev => prev.map(p =>
    p.id === projectId
      ? {
          ...p,
          images: (p.images || []).map(img =>
            img.id === imageId ? { ...img, label: updated.label } : img
          ),
        }
      : p
  ));

  return updated;
};

  const deleteImage = async (projectId, imageId) => {
    await api.deleteImage(imageId);
    setProjects(prev => prev.map(p =>
      p.id === projectId
        ? { ...p, images: p.images.filter(img => img.id !== imageId) }
        : p
    ));
  };

  return {
    projects, loading, error, refetch: fetch,
    createProject, updateProject, updateStage,
    deleteProject, uploadImages, updateImageLabel, deleteImage,
  };
}
