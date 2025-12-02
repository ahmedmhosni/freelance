/**
 * useTasks Hook
 */

import { useState, useEffect, useCallback } from 'react';
import { tasksService } from '../services/tasks.service';

export const useTasks = (filters = {}) => {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchTasks = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await tasksService.getAll(filters);
      setTasks(data);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to fetch tasks');
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    fetchTasks();
  }, [fetchTasks]);

  const createTask = useCallback(async (taskData) => {
    const newTask = await tasksService.create(taskData);
    setTasks(prev => [newTask, ...prev]);
    return newTask;
  }, []);

  const updateTask = useCallback(async (id, taskData) => {
    const updatedTask = await tasksService.update(id, taskData);
    setTasks(prev => prev.map(t => t.id === id ? updatedTask : t));
    return updatedTask;
  }, []);

  const deleteTask = useCallback(async (id) => {
    await tasksService.delete(id);
    setTasks(prev => prev.filter(t => t.id !== id));
  }, []);

  const updateStatus = useCallback(async (id, status) => {
    const updatedTask = await tasksService.updateStatus(id, status);
    setTasks(prev => prev.map(t => t.id === id ? updatedTask : t));
    return updatedTask;
  }, []);

  const markComplete = useCallback(async (id) => {
    const updatedTask = await tasksService.markComplete(id);
    setTasks(prev => prev.map(t => t.id === id ? updatedTask : t));
    return updatedTask;
  }, []);

  return {
    tasks,
    loading,
    error,
    fetchTasks,
    createTask,
    updateTask,
    deleteTask,
    updateStatus,
    markComplete
  };
};
