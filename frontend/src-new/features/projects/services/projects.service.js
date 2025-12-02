/**
 * Projects Service
 */

import api from '../../../shared/services/api';

export const projectsService = {
  async getAll(filters = {}) {
    const params = new URLSearchParams(filters);
    const response = await api.get(`/projects?${params}`);
    return response.data;
  },

  async getById(id) {
    const response = await api.get(`/projects/${id}`);
    return response.data;
  },

  async create(projectData) {
    const response = await api.post('/projects', projectData);
    return response.data;
  },

  async update(id, projectData) {
    const response = await api.put(`/projects/${id}`, projectData);
    return response.data;
  },

  async delete(id) {
    const response = await api.delete(`/projects/${id}`);
    return response.data;
  },

  async updateStatus(id, status) {
    const response = await api.patch(`/projects/${id}/status`, { status });
    return response.data;
  }
};
