/**
 * Invoices Service
 */

import api from '../../../shared/services/api';

export const invoicesService = {
  async getAll(filters = {}) {
    const params = new URLSearchParams(filters);
    const response = await api.get(`/invoices?${params}`);
    return response.data;
  },

  async getById(id) {
    const response = await api.get(`/invoices/${id}`);
    return response.data;
  },

  async create(invoiceData) {
    const response = await api.post('/invoices', invoiceData);
    return response.data;
  },

  async update(id, invoiceData) {
    const response = await api.put(`/invoices/${id}`, invoiceData);
    return response.data;
  },

  async delete(id) {
    const response = await api.delete(`/invoices/${id}`);
    return response.data;
  },

  async updateStatus(id, status) {
    const response = await api.patch(`/invoices/${id}/status`, { status });
    return response.data;
  },

  async downloadPDF(id) {
    const response = await api.get(`/invoices/${id}/pdf`, {
      responseType: 'blob'
    });
    return response.data;
  }
};
