import api from '../../../utils/api';

/**
 * Project API Service
 * Encapsulates all API calls related to projects
 */

/**
 * Fetch all projects
 * @param {Object} params - Query parameters
 * @param {string} params.status - Filter by status
 * @param {number} params.client_id - Filter by client ID
 * @returns {Promise<Object>} Response with projects data
 */
export const fetchProjects = async (params = {}) => {
  const queryString = new URLSearchParams(params).toString();
  const url = queryString ? `/projects?${queryString}` : '/projects';
  const response = await api.get(url);
  return response.data;
};

/**
 * Fetch a single project by ID
 * @param {number} id - Project ID
 * @returns {Promise<Object>} Project data
 */
export const fetchProjectById = async (id) => {
  const response = await api.get(`/projects/${id}`);
  return response.data;
};

/**
 * Create a new project
 * @param {Object} projectData - Project data
 * @param {string} projectData.name - Project name (required)
 * @param {string} projectData.description - Project description
 * @param {number} projectData.client_id - Associated client ID
 * @param {string} projectData.status - Project status (active, completed, on-hold, cancelled)
 * @param {string} projectData.start_date - Project start date
 * @param {string} projectData.end_date - Project end date
 * @returns {Promise<Object>} Created project data
 */
export const createProject = async (projectData) => {
  const response = await api.post('/projects', projectData);
  return response.data;
};

/**
 * Update an existing project
 * @param {number} id - Project ID
 * @param {Object} projectData - Updated project data
 * @returns {Promise<Object>} Updated project data
 */
export const updateProject = async (id, projectData) => {
  const response = await api.put(`/projects/${id}`, projectData);
  return response.data;
};

/**
 * Delete a project
 * @param {number} id - Project ID
 * @returns {Promise<Object>} Deletion confirmation
 */
export const deleteProject = async (id) => {
  const response = await api.delete(`/projects/${id}`);
  return response.data;
};
