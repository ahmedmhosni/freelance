/**
 * useInvoices Hook
 */

import { useState, useEffect, useCallback } from 'react';
import { invoicesService } from '../services/invoices.service';

export const useInvoices = (filters = {}) => {
  const [invoices, setInvoices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchInvoices = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await invoicesService.getAll(filters);
      setInvoices(data);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to fetch invoices');
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    fetchTasks();
  }, [fetchInvoices]);

  const createInvoice = useCallback(async (invoiceData) => {
    const newInvoice = await invoicesService.create(invoiceData);
    setInvoices(prev => [newInvoice, ...prev]);
    return newInvoice;
  }, []);

  const updateInvoice = useCallback(async (id, invoiceData) => {
    const updatedInvoice = await invoicesService.update(id, invoiceData);
    setInvoices(prev => prev.map(i => i.id === id ? updatedInvoice : i));
    return updatedInvoice;
  }, []);

  const deleteInvoice = useCallback(async (id) => {
    await invoicesService.delete(id);
    setInvoices(prev => prev.filter(i => i.id !== id));
  }, []);

  const updateStatus = useCallback(async (id, status) => {
    const updatedInvoice = await invoicesService.updateStatus(id, status);
    setInvoices(prev => prev.map(i => i.id === id ? updatedInvoice : i));
    return updatedInvoice;
  }, []);

  return {
    invoices,
    loading,
    error,
    fetchInvoices,
    createInvoice,
    updateInvoice,
    deleteInvoice,
    updateStatus
  };
};
