import api from '../../../utils/api';

/**
 * Task API Service
 * Encapsulates all API calls related to tasks
 */

/**
 * Fetch all tasks
 * @param {Object} params - Query parameters
 * @param {string} params.status - Filter by status
 * @param {string} params.priority - Filter by priority
 * @param {number} params.project_id - Filter by project ID
 * @returns {Promise<Object>} Response with tasks data
 */
export const fetchTasks = async (params = {}) => {
  const queryString = new URLSearchParams(params).toString();
  const url = queryString ? `/tasks?${queryString}` : '/tasks';
  const response = await api.get(url);
  return response.data;
};

/**
 * Fetch a single task by ID
 * @param {number} id - Task ID
 * @returns {Promise<Object>} Task data
 */
export const fetchTaskById = async (id) => {
  const response = await api.get(`/tasks/${id}`);
  return response.data;
};

/**
 * Create a new task
 * @param {Object} taskData - Task data
 * @param {string} taskData.title - Task title (required)
 * @param {string} taskData.description - Task description
 * @param {number} taskData.project_id - Associated project ID
 * @param {string} taskData.status - Task status (todo, in-progress, review, done)
 * @param {string} taskData.priority - Task priority (low, medium, high, urgent)
 * @param {string} taskData.due_date - Task due date
 * @returns {Promise<Object>} Created task data
 */
export const createTask = async (taskData) => {
  const response = await api.post('/tasks', taskData);
  return response.data;
};

/**
 * Update an existing task
 * @param {number} id - Task ID
 * @param {Object} taskData - Updated task data
 * @returns {Promise<Object>} Updated task data
 */
export const updateTask = async (id, taskData) => {
  const response = await api.put(`/tasks/${id}`, taskData);
  return response.data;
};

/**
 * Delete a task
 * @param {number} id - Task ID
 * @returns {Promise<Object>} Deletion confirmation
 */
export const deleteTask = async (id) => {
  const response = await api.delete(`/tasks/${id}`);
  return response.data;
};
