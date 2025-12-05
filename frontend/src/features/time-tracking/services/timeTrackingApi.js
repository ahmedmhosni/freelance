import api from '../../../utils/api';

/**
 * Time Tracking API Service
 * Encapsulates all API calls related to time tracking
 */

/**
 * Fetch all time entries
 * @param {Object} params - Query parameters
 * @param {string} params.start_date - Filter by start date
 * @param {string} params.end_date - Filter by end date
 * @param {number} params.task_id - Filter by task ID
 * @param {number} params.project_id - Filter by project ID
 * @returns {Promise<Object>} Response with time entries data
 */
export const fetchTimeEntries = async (params = {}) => {
  const queryString = new URLSearchParams(params).toString();
  const url = queryString ? `/time-tracking?${queryString}` : '/time-tracking';
  const response = await api.get(url);
  return response.data;
};

/**
 * Fetch a single time entry by ID
 * @param {number} id - Time entry ID
 * @returns {Promise<Object>} Time entry data
 */
export const fetchTimeEntryById = async (id) => {
  const response = await api.get(`/time-tracking/${id}`);
  return response.data;
};

/**
 * Start a new timer
 * @param {Object} entryData - Time entry data
 * @param {number} entryData.task_id - Associated task ID
 * @param {number} entryData.project_id - Associated project ID
 * @param {string} entryData.description - Entry description
 * @returns {Promise<Object>} Created time entry data
 */
export const startTimer = async (entryData) => {
  const response = await api.post('/time-tracking/start', entryData);
  return response.data;
};

/**
 * Stop a running timer
 * @param {number} id - Time entry ID
 * @returns {Promise<Object>} Updated time entry data
 */
export const stopTimer = async (id) => {
  const response = await api.post(`/time-tracking/stop/${id}`);
  return response.data;
};

/**
 * Create a manual time entry
 * @param {Object} entryData - Time entry data
 * @param {number} entryData.task_id - Associated task ID
 * @param {number} entryData.project_id - Associated project ID
 * @param {string} entryData.description - Entry description
 * @param {string} entryData.start_time - Start time
 * @param {string} entryData.end_time - End time
 * @returns {Promise<Object>} Created time entry data
 */
export const createTimeEntry = async (entryData) => {
  const response = await api.post('/time-tracking', entryData);
  return response.data;
};

/**
 * Update an existing time entry
 * @param {number} id - Time entry ID
 * @param {Object} entryData - Updated time entry data
 * @returns {Promise<Object>} Updated time entry data
 */
export const updateTimeEntry = async (id, entryData) => {
  const response = await api.put(`/time-tracking/${id}`, entryData);
  return response.data;
};

/**
 * Delete a time entry
 * @param {number} id - Time entry ID
 * @returns {Promise<Object>} Deletion confirmation
 */
export const deleteTimeEntry = async (id) => {
  const response = await api.delete(`/time-tracking/${id}`);
  return response.data;
};

/**
 * Fetch time tracking summary
 * @param {Object} params - Query parameters
 * @param {string} params.start_date - Start date for summary
 * @param {string} params.end_date - End date for summary
 * @returns {Promise<Object>} Summary data with total hours and entries
 */
export const fetchTimeTrackingSummary = async (params = {}) => {
  const queryString = new URLSearchParams(params).toString();
  const url = queryString ? `/time-tracking/summary?${queryString}` : '/time-tracking/summary';
  const response = await api.get(url);
  return response.data;
};

/**
 * Fetch grouped time tracking data
 * @param {string} groupBy - Group by field (task, project, client)
 * @param {Object} params - Additional query parameters
 * @returns {Promise<Object>} Grouped time tracking data
 */
export const fetchGroupedTimeTracking = async (groupBy, params = {}) => {
  const queryParams = new URLSearchParams({ ...params, group_by: groupBy }).toString();
  const response = await api.get(`/time-tracking/grouped?${queryParams}`);
  return response.data;
};
