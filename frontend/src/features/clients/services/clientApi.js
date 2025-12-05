import api from '../../../utils/api';

/**
 * Client API Service
 * Encapsulates all API calls related to clients
 */

/**
 * Fetch all clients with optional pagination and search
 * @param {Object} params - Query parameters
 * @param {number} params.page - Page number
 * @param {number} params.limit - Items per page
 * @param {string} params.search - Search term
 * @returns {Promise<Object>} Response with clients data and pagination
 */
export const fetchClients = async ({ page = 1, limit = 20, search = '' } = {}) => {
  const response = await api.get(`/clients?page=${page}&limit=${limit}&search=${search}`);
  return response.data;
};

/**
 * Fetch a single client by ID
 * @param {number} id - Client ID
 * @returns {Promise<Object>} Client data
 */
export const fetchClientById = async (id) => {
  const response = await api.get(`/clients/${id}`);
  return response.data;
};

/**
 * Create a new client
 * @param {Object} clientData - Client data
 * @param {string} clientData.name - Client name (required)
 * @param {string} clientData.email - Client email
 * @param {string} clientData.phone - Client phone
 * @param {string} clientData.company - Client company
 * @param {string} clientData.notes - Client notes
 * @param {string} clientData.tags - Client tags
 * @returns {Promise<Object>} Created client data
 */
export const createClient = async (clientData) => {
  const response = await api.post('/clients', clientData);
  return response.data;
};

/**
 * Update an existing client
 * @param {number} id - Client ID
 * @param {Object} clientData - Updated client data
 * @returns {Promise<Object>} Updated client data
 */
export const updateClient = async (id, clientData) => {
  const response = await api.put(`/clients/${id}`, clientData);
  return response.data;
};

/**
 * Delete a client
 * @param {number} id - Client ID
 * @returns {Promise<Object>} Deletion confirmation
 */
export const deleteClient = async (id) => {
  const response = await api.delete(`/clients/${id}`);
  return response.data;
};
