/**
 * useProjects Hook
 */

import { useState, useEffect, useCallback } from 'react';
import { projectsService } from '../services/projects.service';

export const useProjects = (filters = {}) => {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchProjects = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await projectsService.getAll(filters);
      setProjects(data);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to fetch projects');
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    fetchProjects();
  }, [fetchProjects]);

  const createProject = useCallback(async (projectData) => {
    const newProject = await projectsService.create(projectData);
    setProjects(prev => [newProject, ...prev]);
    return newProject;
  }, []);

  const updateProject = useCallback(async (id, projectData) => {
    const updatedProject = await projectsService.update(id, projectData);
    setProjects(prev => prev.map(p => p.id === id ? updatedProject : p));
    return updatedProject;
  }, []);

  const deleteProject = useCallback(async (id) => {
    await projectsService.delete(id);
    setProjects(prev => prev.filter(p => p.id !== id));
  }, []);

  const updateStatus = useCallback(async (id, status) => {
    const updatedProject = await projectsService.updateStatus(id, status);
    setProjects(prev => prev.map(p => p.id === id ? updatedProject : p));
    return updatedProject;
  }, []);

  return {
    projects,
    loading,
    error,
    fetchProjects,
    createProject,
    updateProject,
    deleteProject,
    updateStatus
  };
};
