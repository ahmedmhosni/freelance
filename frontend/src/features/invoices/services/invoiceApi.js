import api from '../../../utils/api';

/**
 * Invoice API Service
 * Encapsulates all API calls related to invoices
 */

/**
 * Fetch all invoices
 * @param {Object} params - Query parameters
 * @param {string} params.status - Filter by status
 * @param {number} params.client_id - Filter by client ID
 * @returns {Promise<Object>} Response with invoices data
 */
export const fetchInvoices = async (params = {}) => {
  const queryString = new URLSearchParams(params).toString();
  const url = queryString ? `/api/invoices?${queryString}` : '/api/invoices';
  const response = await api.get(url);
  return response.data;
};

/**
 * Fetch a single invoice by ID
 * @param {number} id - Invoice ID
 * @returns {Promise<Object>} Invoice data
 */
export const fetchInvoiceById = async (id) => {
  const response = await api.get(`/api/invoices/${id}`);
  return response.data;
};

/**
 * Create a new invoice
 * @param {Object} invoiceData - Invoice data
 * @param {string} invoiceData.invoice_number - Invoice number (required)
 * @param {number} invoiceData.client_id - Associated client ID (required)
 * @param {string} invoiceData.status - Invoice status (draft, sent, paid, overdue, cancelled)
 * @param {string} invoiceData.issue_date - Invoice issue date
 * @param {string} invoiceData.due_date - Invoice due date
 * @param {number} invoiceData.amount - Invoice amount
 * @param {string} invoiceData.notes - Invoice notes
 * @returns {Promise<Object>} Created invoice data
 */
export const createInvoice = async (invoiceData) => {
  const response = await api.post('/invoices', invoiceData);
  return response.data;
};

/**
 * Update an existing invoice
 * @param {number} id - Invoice ID
 * @param {Object} invoiceData - Updated invoice data
 * @returns {Promise<Object>} Updated invoice data
 */
export const updateInvoice = async (id, invoiceData) => {
  const response = await api.put(`/api/invoices/${id}`, invoiceData);
  return response.data;
};

/**
 * Delete an invoice
 * @param {number} id - Invoice ID
 * @returns {Promise<Object>} Deletion confirmation
 */
export const deleteInvoice = async (id) => {
  const response = await api.delete(`/api/invoices/${id}`);
  return response.data;
};

/**
 * Download invoice as PDF
 * @param {number} id - Invoice ID
 * @returns {Promise<Blob>} PDF blob data
 */
export const downloadInvoicePDF = async (id) => {
  const response = await api.get(`/api/invoices/${id}/pdf`, {
    responseType: 'blob'
  });
  return response.data;
};
