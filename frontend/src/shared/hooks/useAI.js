/**
 * useAI Hook
 * React hook for AI assistant functionality
 */

import { useState, useEffect } from 'react';
import axios from 'axios';
import { logger } from '../utils/logger';

export const useAI = () => {
  const [isEnabled, setIsEnabled] = useState(false);
  const [loading, setLoading] = useState(false);
  const [usage, setUsage] = useState(null);
  const [error, setError] = useState(null);

  // Check AI status on mount
  useEffect(() => {
    checkStatus();
  }, []);

  const checkStatus = async () => {
    try {
      const apiUrl = import.meta.env.VITE_API_URL || '';
      const response = await axios.get(`${apiUrl}/api/ai/status`);
      
      if (response.data.success) {
        setIsEnabled(response.data.data.enabled);
        setUsage(response.data.data.usage);
      }
    } catch (error) {
      logger.error('Failed to check AI status:', error);
      setIsEnabled(false);
    }
  };

  const sendMessage = async (message, context = {}) => {
    setLoading(true);
    setError(null);

    try {
      const apiUrl = import.meta.env.VITE_API_URL || '';
      const response = await axios.post(`${apiUrl}/api/ai/chat`, {
        message,
        context
      });

      if (response.data.success) {
        // Refresh usage after successful message
        await checkStatus();
        return response.data.data;
      }
    } catch (error) {
      logger.error('AI chat error:', error);
      const errorMessage = error.response?.data?.error || 'Failed to send message';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return {
    isEnabled,
    loading,
    usage,
    error,
    sendMessage,
    checkStatus
  };
};
