import { useState, useEffect } from 'react';
import api from '../utils/api';
import toast from 'react-hot-toast';
import Pagination from '../components/Pagination';
import ConfirmDialog from '../components/ConfirmDialog';
import LoadingSkeleton from '../components/LoadingSkeleton';
import { MdPeople, MdFileDownload } from 'react-icons/md';
import { exportClientsCSV } from '../utils/exportCSV';

const Clients = () => {
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editingClient, setEditingClient] = useState(null);
  const [deleteDialog, setDeleteDialog] = useState({ isOpen: false, clientId: null });
  const [pagination, setPagination] = useState({ page: 1, limit: 20, total: 0, pages: 1 });
  const [formData, setFormData] = useState({
    name: '', email: '', phone: '', company: '', notes: '', tags: ''
  });

  useEffect(() => {
    fetchClients();
  }, [pagination.page, searchTerm]);

  const fetchClients = async () => {
    setLoading(true);
    try {
      const response = await api.get(`/api/clients?page=${pagination.page}&limit=${pagination.limit}&search=${searchTerm}`);
      const data = response.data.data || response.data;
      setClients(Array.isArray(data) ? data : []);
      if (response.data.pagination) {
        setPagination(prev => ({ ...prev, ...response.data.pagination }));
      }
    } catch (error) {
      console.error('Error fetching clients:', error);
      toast.error('Failed to load clients');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingClient) {
        await api.put(`/api/clients/${editingClient.id}`, formData);
        toast.success('Client updated successfully!');
      } else {
        await api.post('/api/clients', formData);
        toast.success('Client created successfully!');
      }
      setShowForm(false);
      setEditingClient(null);
      setFormData({ name: '', email: '', phone: '', company: '', notes: '', tags: '' });
      fetchClients();
    } catch (error) {
      console.error('Error saving client:', error);
      toast.error('Failed to save client');
    }
  };

  const handleEdit = (client) => {
    setEditingClient(client);
    setFormData(client);
    setShowForm(true);
  };

  const confirmDelete = (id) => {
    setDeleteDialog({ isOpen: true, clientId: id });
  };

  const handleDelete = async () => {
    try {
      await api.delete(`/api/clients/${deleteDialog.clientId}`);
      toast.success('Client deleted successfully!');
      setDeleteDialog({ isOpen: false, clientId: null });
      fetchClients();
    } catch (error) {
      console.error('Error deleting client:', error);
      toast.error('Failed to delete client');
    }
  };

  const handleExportCSV = () => {
    try {
      exportClientsCSV(clients);
      toast.success('Clients exported successfully!');
    } catch (error) {
      toast.error('Failed to export clients');
    }
  };

  return (
    <div className="container">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <div>
          <h1 style={{ marginBottom: '4px' }}>Clients</h1>
          <p className="page-subtitle">
            Manage your client relationships
          </p>
        </div>
        <div style={{ display: 'flex', gap: '8px' }}>
          {clients.length > 0 && (
            <button 
              className="btn-edit" 
              onClick={handleExportCSV}
              style={{ display: 'flex', alignItems: 'center', gap: '6px' }}
            >
              <MdFileDownload size={18} />
              Export CSV
            </button>
          )}
          <button className="btn-primary" onClick={() => setShowForm(true)}>Add Client</button>
        </div>
      </div>

      <div style={{ marginBottom: '20px' }}>
        <input
          type="text"
          placeholder="Search clients..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          style={{ maxWidth: '400px' }}
        />
      </div>

      {showForm && (
        <div className="card" style={{ marginBottom: '20px', animation: 'slideIn 0.2s ease-out' }}>
          <h3>{editingClient ? 'Edit Client' : 'New Client'}</h3>
          <form onSubmit={handleSubmit}>
            <input placeholder="Name *" value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} required style={{ marginBottom: '10px' }} />
            <input type="email" placeholder="Email" value={formData.email} onChange={(e) => setFormData({...formData, email: e.target.value})} style={{ marginBottom: '10px' }} />
            <input placeholder="Phone" value={formData.phone} onChange={(e) => setFormData({...formData, phone: e.target.value})} style={{ marginBottom: '10px' }} />
            <input placeholder="Company" value={formData.company} onChange={(e) => setFormData({...formData, company: e.target.value})} style={{ marginBottom: '10px' }} />
            <textarea placeholder="Notes" value={formData.notes} onChange={(e) => setFormData({...formData, notes: e.target.value})} style={{ marginBottom: '10px', minHeight: '80px' }} />
            <input placeholder="Tags (comma separated)" value={formData.tags} onChange={(e) => setFormData({...formData, tags: e.target.value})} style={{ marginBottom: '10px' }} />
            <div>
              <button type="submit" className="btn-primary" style={{ marginRight: '10px' }}>
                {editingClient ? 'Update' : 'Create'}
              </button>
              <button type="button" onClick={() => { setShowForm(false); setEditingClient(null); setFormData({ name: '', email: '', phone: '', company: '', notes: '', tags: '' }); }}>
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {loading ? (
        <LoadingSkeleton type="table" count={5} />
      ) : (
        <>
          <div className="card">
            {clients.length === 0 ? (
              <div className="empty-state">
                <div className="empty-state-icon"><MdPeople /></div>
                <p>{searchTerm ? 'No clients found matching your search.' : 'No clients yet. Add your first client to get started!'}</p>
              </div>
            ) : (
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ borderBottom: '2px solid #ddd' }}>
                    <th style={{ textAlign: 'left', padding: '12px' }}>Name</th>
                    <th style={{ textAlign: 'left', padding: '12px' }}>Email</th>
                    <th style={{ textAlign: 'left', padding: '12px' }}>Company</th>
                    <th style={{ textAlign: 'left', padding: '12px' }}>Phone</th>
                    <th style={{ textAlign: 'right', padding: '12px' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {clients.map(client => (
                    <tr key={client.id} style={{ borderBottom: '1px solid #eee' }}>
                      <td style={{ padding: '12px' }}>
                        <strong>{client.name}</strong>
                      </td>
                      <td style={{ padding: '12px' }}>{client.email || '-'}</td>
                      <td style={{ padding: '12px' }}>{client.company || '-'}</td>
                      <td style={{ padding: '12px' }}>{client.phone || '-'}</td>
                      <td style={{ padding: '12px', textAlign: 'right' }}>
                        <button 
                          onClick={() => handleEdit(client)} 
                          className="btn-edit"
                          style={{ marginRight: '8px' }}
                        >
                          Edit
                        </button>
                        <button 
                          onClick={() => confirmDelete(client.id)} 
                          className="btn-delete"
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>

          {pagination.pages > 1 && (
            <Pagination
              currentPage={pagination.page}
              totalPages={pagination.pages}
              totalItems={pagination.total}
              itemsPerPage={pagination.limit}
              onPageChange={(page) => setPagination(prev => ({ ...prev, page }))}
            />
          )}
        </>
      )}

      <ConfirmDialog
        isOpen={deleteDialog.isOpen}
        title="Delete Client"
        message="Are you sure you want to delete this client? This action cannot be undone."
        onConfirm={handleDelete}
        onCancel={() => setDeleteDialog({ isOpen: false, clientId: null })}
        confirmText="Delete"
        type="danger"
      />
    </div>
  );
};

export default Clients;
