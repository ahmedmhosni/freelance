/**
 * Rate Limit Error Handler
 * 
 * Provides user-friendly messages and guidance when rate limits are hit
 */

import toast from 'react-hot-toast';

/**
 * Format seconds into human-readable time
 */
const formatTime = (seconds) => {
  if (!seconds || seconds <= 0) return 'a few moments';
  
  if (seconds < 60) {
    return `${seconds} second${seconds !== 1 ? 's' : ''}`;
  }
  
  const minutes = Math.ceil(seconds / 60);
  if (minutes < 60) {
    return `${minutes} minute${minutes !== 1 ? 's' : ''}`;
  }
  
  const hours = Math.ceil(minutes / 60);
  return `${hours} hour${hours !== 1 ? 's' : ''}`;
};

/**
 * Get icon for rate limit type
 */
const getRateLimitIcon = (errorType) => {
  const icons = {
    'Too Many Login Attempts': '🔒',
    'Registration Limit Reached': '📝',
    'Too Many Reset Requests': '🔑',
    'Upload Limit Reached': '📁',
    'Email Limit Reached': '📧',
    'Rate Limit Exceeded': '⏱️'
  };
  
  return icons[errorType] || '⚠️';
};

/**
 * Handle rate limit error from API
 */
export const handleRateLimitError = (error) => {
  // Check if it's a rate limit error (429 status)
  if (error.response?.status !== 429) {
    return false; // Not a rate limit error
  }
  
  const data = error.response.data;
  const errorType = data.error || 'Rate Limit Exceeded';
  const message = data.message || 'Too many requests. Please try again later.';
  const details = data.details;
  const suggestion = data.suggestion;
  const retryAfter = data.retryAfter; // in seconds
  
  const icon = getRateLimitIcon(errorType);
  const timeString = formatTime(retryAfter);
  
  // Create detailed message
  let fullMessage = `${icon} ${message}`;
  
  if (details) {
    fullMessage += `\n\n${details}`;
  }
  
  if (suggestion) {
    fullMessage += `\n\n💡 ${suggestion}`;
  }
  
  // Show toast with longer duration for rate limit errors
  toast.error(fullMessage, {
    duration: 8000, // 8 seconds
    style: {
      maxWidth: '500px',
      whiteSpace: 'pre-line'
    },
    icon: icon
  });
  
  return true; // Handled
};

/**
 * Check if error is a rate limit error
 */
export const isRateLimitError = (error) => {
  return error.response?.status === 429;
};

/**
 * Get retry time from rate limit error
 */
export const getRetryTime = (error) => {
  if (!isRateLimitError(error)) return null;
  
  const retryAfter = error.response?.data?.retryAfter;
  return retryAfter ? retryAfter * 1000 : null; // Convert to milliseconds
};

/**
 * Show rate limit warning (before hitting limit)
 */
export const showRateLimitWarning = (remaining, limit, resetTime) => {
  if (remaining <= 0) return;
  
  const percentage = (remaining / limit) * 100;
  
  // Warn when 90% of limit is used
  if (percentage <= 10 && percentage > 0) {
    const timeString = formatTime(Math.ceil((resetTime - Date.now()) / 1000));
    
    toast.warning(
      `⚠️ You're approaching the rate limit.\n\nRemaining requests: ${remaining}/${limit}\nResets in: ${timeString}`,
      {
        duration: 5000,
        style: {
          maxWidth: '500px',
          whiteSpace: 'pre-line'
        }
      }
    );
  }
};

/**
 * Parse rate limit headers from response
 */
export const parseRateLimitHeaders = (response) => {
  if (!response?.headers) return null;
  
  const limit = parseInt(response.headers['ratelimit-limit'] || response.headers['x-ratelimit-limit']);
  const remaining = parseInt(response.headers['ratelimit-remaining'] || response.headers['x-ratelimit-remaining']);
  const reset = parseInt(response.headers['ratelimit-reset'] || response.headers['x-ratelimit-reset']);
  
  if (isNaN(limit) || isNaN(remaining)) return null;
  
  return {
    limit,
    remaining,
    resetTime: reset ? reset * 1000 : null // Convert to milliseconds
  };
};

export default {
  handleRateLimitError,
  isRateLimitError,
  getRetryTime,
  showRateLimitWarning,
  parseRateLimitHeaders
};
