/**
 * Clients Service
 */

import api from '../../../shared/services/api';

export const clientsService = {
  async getAll() {
    const response = await api.get('/clients');
    return response.data;
  },

  async getById(id) {
    const response = await api.get(`/clients/${id}`);
    return response.data;
  },

  async create(clientData) {
    const response = await api.post('/clients', clientData);
    return response.data;
  },

  async update(id, clientData) {
    const response = await api.put(`/clients/${id}`, clientData);
    return response.data;
  },

  async delete(id) {
    const response = await api.delete(`/clients/${id}`);
    return response.data;
  }
};
