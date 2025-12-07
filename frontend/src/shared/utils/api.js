import axios from 'axios';
import { handleRateLimitError, parseRateLimitHeaders, showRateLimitWarning } from './rateLimitHandler';

// Use environment variable for API URL, fallback to localhost for development
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add token to requests if it exists
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Handle responses and rate limit warnings
api.interceptors.response.use(
  (response) => {
    // Check rate limit headers and warn if approaching limit
    const rateLimitInfo = parseRateLimitHeaders(response);
    if (rateLimitInfo) {
      showRateLimitWarning(
        rateLimitInfo.remaining,
        rateLimitInfo.limit,
        rateLimitInfo.resetTime
      );
    }
    return response;
  },
  (error) => {
    // Handle rate limit errors with user-friendly messages
    if (handleRateLimitError(error)) {
      // Error was handled, still reject but with better UX
      return Promise.reject(error);
    }
    
    // Pass through other errors
    return Promise.reject(error);
  }
);

export default api;
