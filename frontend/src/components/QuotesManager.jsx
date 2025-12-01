import { useState, useEffect } from 'react';
import api from '../utils/api';
import toast from 'react-hot-toast';
import {
  MdAdd,
  MdEdit,
  MdDelete,
  MdCheck,
  MdClose,
  MdVisibility,
} from 'react-icons/md';
import Pagination from './Pagination';
import QuoteViewModal from './QuoteViewModal';
import logger from '../utils/logger';

const QuotesManager = () => {
  const [quotes, setQuotes] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [editingQuote, setEditingQuote] = useState(null);
  const [formData, setFormData] = useState({
    text: '',
    author: '',
    is_active: 1,
  });
  const [viewingQuote, setViewingQuote] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const [pagination, setPagination] = useState({ total: 0, totalPages: 0 });

  const fetchQuotes = async () => {
    try {
      const response = await api.get(
        `/api/quotes?page=${currentPage}&limit=${itemsPerPage}`
      );
      setQuotes(response.data.data || []);
      setPagination(response.data.pagination || { total: 0, totalPages: 0 });
    } catch (error) {
      logger.error('Error fetching quotes:', error);
      toast.error('Failed to load quotes');
    }
  };

  useEffect(() => {
    fetchQuotes();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentPage]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingQuote) {
        await api.put(`/api/quotes/${editingQuote.id}`, formData);
        toast.success('Quote updated successfully!');
      } else {
        await api.post('/api/quotes', formData);
        toast.success('Quote created successfully!');
        setCurrentPage(1); // Reset to first page for new quotes
      }
      setShowForm(false);
      setEditingQuote(null);
      setFormData({ text: '', author: '', is_active: 1 });
      fetchQuotes();
    } catch (error) {
      logger.error('Error saving quote:', error);
      toast.error('Failed to save quote');
    }
  };

  const handleEdit = (quote) => {
    setEditingQuote(quote);
    setFormData({
      text: quote.text,
      author: quote.author || '',
      is_active: quote.is_active,
    });
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this quote?')) {
      try {
        await api.delete(`/api/quotes/${id}`);
        toast.success('Quote deleted successfully!');

        // If we're on a page that will be empty after deletion, go to previous page
        if (quotes.length === 1 && currentPage > 1) {
          setCurrentPage(currentPage - 1);
        } else {
          fetchQuotes();
        }
      } catch (error) {
        logger.error('Error deleting quote:', error);
        toast.error('Failed to delete quote');
      }
    }
  };

  const toggleActive = async (quote) => {
    try {
      await api.put(`/api/quotes/${quote.id}`, {
        ...quote,
        is_active: quote.is_active ? 0 : 1,
      });
      toast.success('Quote status updated!');
      fetchQuotes();
    } catch (error) {
      logger.error('Error updating quote:', error);
      toast.error('Failed to update quote');
    }
  };

  const handleView = (quote) => {
    setViewingQuote(quote);
  };

  const handleViewEdit = () => {
    handleEdit(viewingQuote);
    setViewingQuote(null);
  };

  const handleViewDelete = async () => {
    setViewingQuote(null);
    await handleDelete(viewingQuote.id);
  };

  const handleViewToggleActive = async () => {
    await toggleActive(viewingQuote);
    setViewingQuote({
      ...viewingQuote,
      is_active: viewingQuote.is_active ? 0 : 1,
    });
  };

  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div>
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '20px',
        }}
      >
        <div>
          <h2 style={{ marginBottom: '4px' }}>Daily Quotes</h2>
          <p style={{ fontSize: '14px', color: 'rgba(55, 53, 47, 0.65)' }}>
            Manage motivational quotes shown on the login page
          </p>
        </div>
        <button
          onClick={() => {
            setShowForm(true);
            setEditingQuote(null);
            setFormData({ text: '', author: '', is_active: 1 });
          }}
          className="btn-primary"
          style={{ display: 'flex', alignItems: 'center', gap: '6px' }}
        >
          <MdAdd size={18} />
          <span>Add Quote</span>
        </button>
      </div>

      {showForm && (
        <div
          className="card"
          style={{ marginBottom: '20px', animation: 'slideIn 0.2s ease-out' }}
        >
          <h3>{editingQuote ? 'Edit Quote' : 'New Quote'}</h3>
          <form onSubmit={handleSubmit}>
            <textarea
              placeholder="Quote text *"
              value={formData.text}
              onChange={(e) =>
                setFormData({ ...formData, text: e.target.value })
              }
              required
              style={{ marginBottom: '10px', minHeight: '80px' }}
            />
            <input
              placeholder="Author (optional)"
              value={formData.author}
              onChange={(e) =>
                setFormData({ ...formData, author: e.target.value })
              }
              style={{ marginBottom: '10px' }}
            />
            <div style={{ marginBottom: '10px' }}>
              <label
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  cursor: 'pointer',
                }}
              >
                <input
                  type="checkbox"
                  checked={formData.is_active === 1}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      is_active: e.target.checked ? 1 : 0,
                    })
                  }
                />
                <span style={{ fontSize: '14px' }}>
                  Active (show in rotation)
                </span>
              </label>
            </div>
            <div style={{ display: 'flex', gap: '10px' }}>
              <button type="submit" className="btn-primary">
                {editingQuote ? 'Update' : 'Create'}
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowForm(false);
                  setEditingQuote(null);
                  setFormData({ text: '', author: '', is_active: 1 });
                }}
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="card">
        <table style={{ width: '100%' }}>
          <thead>
            <tr>
              <th style={{ textAlign: 'left', padding: '12px' }}>Quote</th>
              <th style={{ textAlign: 'left', padding: '12px' }}>Author</th>
              <th style={{ textAlign: 'center', padding: '12px' }}>Status</th>
              <th style={{ textAlign: 'right', padding: '12px' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {quotes.map((quote) => (
              <tr key={quote.id}>
                <td style={{ padding: '12px', maxWidth: '400px' }}>
                  <div
                    style={{
                      fontSize: '14px',
                      fontStyle: 'italic',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      display: '-webkit-box',
                      WebkitLineClamp: 2,
                      WebkitBoxOrient: 'vertical',
                    }}
                  >
                    "{quote.text}"
                  </div>
                </td>
                <td style={{ padding: '12px' }}>
                  <div
                    style={{
                      fontSize: '13px',
                      color: 'rgba(55, 53, 47, 0.65)',
                    }}
                  >
                    {quote.author || '—'}
                  </div>
                </td>
                <td style={{ padding: '12px', textAlign: 'center' }}>
                  <button
                    onClick={() => toggleActive(quote)}
                    style={{
                      padding: '4px 12px',
                      fontSize: '12px',
                      borderRadius: '12px',
                      border: 'none',
                      cursor: 'pointer',
                      background: quote.is_active
                        ? 'rgba(46, 170, 220, 0.1)'
                        : 'rgba(55, 53, 47, 0.1)',
                      color: quote.is_active
                        ? '#2eaadc'
                        : 'rgba(55, 53, 47, 0.5)',
                      fontWeight: '500',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '4px',
                    }}
                  >
                    {quote.is_active ? (
                      <MdCheck size={14} />
                    ) : (
                      <MdClose size={14} />
                    )}
                    {quote.is_active ? 'Active' : 'Inactive'}
                  </button>
                </td>
                <td style={{ padding: '12px', textAlign: 'right' }}>
                  <button
                    onClick={() => handleView(quote)}
                    className="btn-view"
                    style={{ marginRight: '8px' }}
                    title="View details"
                  >
                    <MdVisibility size={14} />
                  </button>
                  <button
                    onClick={() => handleEdit(quote)}
                    className="btn-edit"
                    style={{ marginRight: '8px' }}
                  >
                    <MdEdit size={14} />
                  </button>
                  <button
                    onClick={() => handleDelete(quote.id)}
                    className="btn-delete"
                  >
                    <MdDelete size={14} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {quotes.length === 0 && (
          <div
            style={{
              textAlign: 'center',
              padding: '40px',
              color: 'rgba(55, 53, 47, 0.4)',
            }}
          >
            No quotes yet. Add your first motivational quote!
          </div>
        )}

        {pagination.totalPages > 1 && (
          <Pagination
            currentPage={currentPage}
            totalPages={pagination.totalPages}
            onPageChange={handlePageChange}
            totalItems={pagination.total}
            itemsPerPage={itemsPerPage}
          />
        )}
      </div>

      {viewingQuote && (
        <QuoteViewModal
          quote={viewingQuote}
          onClose={() => setViewingQuote(null)}
          onEdit={handleViewEdit}
          onDelete={handleViewDelete}
          onToggleActive={handleViewToggleActive}
        />
      )}
    </div>
  );
};

export default QuotesManager;
