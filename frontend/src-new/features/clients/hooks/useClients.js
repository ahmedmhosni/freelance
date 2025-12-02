/**
 * useClients Hook
 */

import { useState, useEffect, useCallback } from 'react';
import { clientsService } from '../services/clients.service';

export const useClients = () => {
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchClients = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await clientsService.getAll();
      setClients(data);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to fetch clients');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchClients();
  }, [fetchClients]);

  const createClient = useCallback(async (clientData) => {
    const newClient = await clientsService.create(clientData);
    setClients(prev => [newClient, ...prev]);
    return newClient;
  }, []);

  const updateClient = useCallback(async (id, clientData) => {
    const updatedClient = await clientsService.update(id, clientData);
    setClients(prev => prev.map(c => c.id === id ? updatedClient : c));
    return updatedClient;
  }, []);

  const deleteClient = useCallback(async (id) => {
    await clientsService.delete(id);
    setClients(prev => prev.filter(c => c.id !== id));
  }, []);

  return {
    clients,
    loading,
    error,
    fetchClients,
    createClient,
    updateClient,
    deleteClient
  };
};
