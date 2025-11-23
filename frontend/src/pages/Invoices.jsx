import { useState, useEffect } from 'react';
import api from '../utils/api';
import toast from 'react-hot-toast';
import ConfirmDialog from '../components/ConfirmDialog';
import LoadingSkeleton from '../components/LoadingSkeleton';
import { MdReceipt, MdAttachMoney } from 'react-icons/md';

const Invoices = () => {
  const [invoices, setInvoices] = useState([]);
  const [clients, setClients] = useState([]);
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingInvoice, setEditingInvoice] = useState(null);
  const [deleteDialog, setDeleteDialog] = useState({ isOpen: false, invoiceId: null });
  const [formData, setFormData] = useState({
    client_id: '', project_id: '', invoice_number: '', amount: '', status: 'draft', due_date: '', notes: ''
  });

  useEffect(() => {
    fetchInvoices();
    fetchClients();
    fetchProjects();
  }, []);

  const fetchInvoices = async () => {
    setLoading(true);
    try {
      const response = await api.get('/api/invoices');
      const data = response.data.data || response.data;
      setInvoices(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Error fetching invoices:', error);
      toast.error('Failed to load invoices');
    } finally {
      setLoading(false);
    }
  };

  const fetchClients = async () => {
    try {
      const response = await api.get('/api/clients');
      const data = response.data.data || response.data;
      setClients(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Error fetching clients:', error);
    }
  };

  const fetchProjects = async () => {
    try {
      const response = await api.get('/api/projects');
      const data = response.data.data || response.data;
      setProjects(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Error fetching projects:', error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingInvoice) {
        await api.put(`/api/invoices/${editingInvoice.id}`, formData);
        toast.success('Invoice updated successfully!');
      } else {
        await api.post('/api/invoices', formData);
        toast.success('Invoice created successfully!');
      }
      setShowForm(false);
      setEditingInvoice(null);
      setFormData({ client_id: '', project_id: '', invoice_number: '', amount: '', status: 'draft', due_date: '', notes: '' });
      fetchInvoices();
    } catch (error) {
      console.error('Error saving invoice:', error);
      toast.error('Failed to save invoice');
    }
  };

  const handleEdit = (invoice) => {
    setEditingInvoice(invoice);
    setFormData(invoice);
    setShowForm(true);
  };

  const confirmDelete = (id) => {
    setDeleteDialog({ isOpen: true, invoiceId: id });
  };

  const handleDelete = async () => {
    try {
      await api.delete(`/api/invoices/${deleteDialog.invoiceId}`);
      toast.success('Invoice deleted successfully!');
      setDeleteDialog({ isOpen: false, invoiceId: null });
      fetchInvoices();
    } catch (error) {
      console.error('Error deleting invoice:', error);
      toast.error('Failed to delete invoice');
    }
  };

  const handleDownloadPDF = async (invoiceId) => {
    try {
      window.open(`http://localhost:5000/api/invoices/${invoiceId}/pdf`, '_blank');
      toast.success('Opening PDF...');
    } catch (error) {
      console.error('Error downloading PDF:', error);
      toast.error('Failed to download PDF');
    }
  };

  const statusColors = {
    draft: '#6c757d', sent: '#007bff', paid: '#28a745', overdue: '#dc3545', cancelled: '#6c757d'
  };

  const totalRevenue = invoices.filter(inv => inv.status === 'paid').reduce((sum, inv) => sum + parseFloat(inv.amount), 0);
  const pendingAmount = invoices.filter(inv => inv.status === 'sent').reduce((sum, inv) => sum + parseFloat(inv.amount), 0);

  return (
    <div className="container">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <div>
          <h1 style={{ marginBottom: '4px' }}>Invoices</h1>
          <p className="page-subtitle">
            Manage billing and payments
          </p>
        </div>
        <button className="btn-primary" onClick={() => setShowForm(true)}>Create Invoice</button>
      </div>

      {loading ? (
        <LoadingSkeleton type="stat" count={3} />
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px', marginBottom: '32px' }}>
          <div className="card" style={{ padding: '16px', display: 'flex', alignItems: 'start', gap: '12px' }}>
            <div style={{ fontSize: '32px', color: 'rgba(55, 53, 47, 0.4)' }}>
              <MdAttachMoney />
            </div>
            <div style={{ flex: 1 }}>
              <div className="stat-label" style={{ fontSize: '12px', marginBottom: '8px', fontWeight: '500' }}>
                TOTAL REVENUE
              </div>
              <div className="stat-value" style={{ fontSize: '28px', fontWeight: '600', marginBottom: '4px' }}>
                ${totalRevenue.toFixed(2)}
              </div>
              <div className="stat-description" style={{ fontSize: '13px' }}>
                From paid invoices
              </div>
            </div>
          </div>
          <div className="card" style={{ padding: '16px', display: 'flex', alignItems: 'start', gap: '12px' }}>
            <div style={{ fontSize: '32px', color: 'rgba(55, 53, 47, 0.4)' }}>
              <MdReceipt />
            </div>
            <div style={{ flex: 1 }}>
              <div className="stat-label" style={{ fontSize: '12px', marginBottom: '8px', fontWeight: '500' }}>
                PENDING
              </div>
              <div className="stat-value" style={{ fontSize: '28px', fontWeight: '600', marginBottom: '4px' }}>
                ${pendingAmount.toFixed(2)}
              </div>
              <div className="stat-description" style={{ fontSize: '13px' }}>
                Awaiting payment
              </div>
            </div>
          </div>
          <div className="card" style={{ padding: '16px', display: 'flex', alignItems: 'start', gap: '12px' }}>
            <div style={{ fontSize: '32px', color: 'rgba(55, 53, 47, 0.4)' }}>
              <MdReceipt />
            </div>
            <div style={{ flex: 1 }}>
              <div className="stat-label" style={{ fontSize: '12px', marginBottom: '8px', fontWeight: '500' }}>
                TOTAL INVOICES
              </div>
              <div className="stat-value" style={{ fontSize: '28px', fontWeight: '600', marginBottom: '4px' }}>
                {invoices.length}
              </div>
              <div className="stat-description" style={{ fontSize: '13px' }}>
                All time
              </div>
            </div>
          </div>
        </div>
      )}

      {showForm && (
        <div className="card" style={{ marginBottom: '20px', animation: 'slideIn 0.2s ease-out' }}>
          <h3>{editingInvoice ? 'Edit Invoice' : 'New Invoice'}</h3>
          <form onSubmit={handleSubmit}>
            <input placeholder="Invoice Number (e.g., INV-002) *" value={formData.invoice_number} onChange={(e) => setFormData({...formData, invoice_number: e.target.value})} required style={{ marginBottom: '10px' }} />
            <select value={formData.client_id} onChange={(e) => setFormData({...formData, client_id: e.target.value})} required style={{ marginBottom: '10px' }}>
              <option value="">Select Client *</option>
              {clients.map(client => (
                <option key={client.id} value={client.id}>{client.name}</option>
              ))}
            </select>
            <select value={formData.project_id} onChange={(e) => setFormData({...formData, project_id: e.target.value})} style={{ marginBottom: '10px' }}>
              <option value="">Select Project (Optional)</option>
              {projects.map(project => (
                <option key={project.id} value={project.id}>{project.title}</option>
              ))}
            </select>
            <input type="number" step="0.01" placeholder="Amount *" value={formData.amount} onChange={(e) => setFormData({...formData, amount: e.target.value})} required style={{ marginBottom: '10px' }} />
            <select value={formData.status} onChange={(e) => setFormData({...formData, status: e.target.value})} style={{ marginBottom: '10px' }}>
              <option value="draft">Draft</option>
              <option value="sent">Sent</option>
              <option value="paid">Paid</option>
              <option value="overdue">Overdue</option>
            </select>
            <input type="date" placeholder="Due Date *" value={formData.due_date} onChange={(e) => setFormData({...formData, due_date: e.target.value})} required style={{ marginBottom: '10px' }} />
            <textarea placeholder="Notes" value={formData.notes} onChange={(e) => setFormData({...formData, notes: e.target.value})} style={{ marginBottom: '10px', minHeight: '60px' }} />
            <div>
              <button type="submit" className="btn-primary" style={{ marginRight: '10px' }}>
                {editingInvoice ? 'Update' : 'Create'}
              </button>
              <button type="button" onClick={() => { setShowForm(false); setEditingInvoice(null); setFormData({ client_id: '', project_id: '', invoice_number: '', amount: '', status: 'draft', due_date: '', notes: '' }); }}>
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {loading ? (
        <LoadingSkeleton type="table" count={5} />
      ) : (
        <div className="card">
          {invoices.length === 0 ? (
            <div className="empty-state">
              <div className="empty-state-icon"><MdReceipt /></div>
              <p>No invoices yet. Create your first invoice to get started!</p>
            </div>
          ) : (
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ borderBottom: '2px solid #ddd' }}>
                  <th style={{ textAlign: 'left', padding: '12px' }}>Invoice #</th>
                  <th style={{ textAlign: 'left', padding: '12px' }}>Amount</th>
                  <th style={{ textAlign: 'left', padding: '12px' }}>Status</th>
                  <th style={{ textAlign: 'left', padding: '12px' }}>Due Date</th>
                  <th style={{ textAlign: 'right', padding: '12px' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {invoices.map(invoice => (
                  <tr key={invoice.id} style={{ borderBottom: '1px solid #eee' }}>
                    <td style={{ padding: '12px' }}><strong>{invoice.invoice_number}</strong></td>
                    <td style={{ padding: '12px' }}>${parseFloat(invoice.amount).toFixed(2)}</td>
                    <td style={{ padding: '12px' }}>
                      <span className={`status-badge status-${invoice.status}`}>
                        {invoice.status}
                      </span>
                    </td>
                    <td style={{ padding: '12px' }}>{invoice.due_date ? new Date(invoice.due_date).toLocaleDateString() : '-'}</td>
                    <td style={{ padding: '12px', textAlign: 'right' }}>
                      <button 
                        onClick={() => handleDownloadPDF(invoice.id)}
                        className="btn-edit"
                        style={{ marginRight: '8px' }}
                      >
                        PDF
                      </button>
                      <button 
                        onClick={() => handleEdit(invoice)}
                        className="btn-edit"
                        style={{ marginRight: '8px' }}
                      >
                        Edit
                      </button>
                      <button 
                        onClick={() => confirmDelete(invoice.id)}
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
      )}

      <ConfirmDialog
        isOpen={deleteDialog.isOpen}
        title="Delete Invoice"
        message="Are you sure you want to delete this invoice? This action cannot be undone."
        onConfirm={handleDelete}
        onCancel={() => setDeleteDialog({ isOpen: false, invoiceId: null })}
        confirmText="Delete"
        type="danger"
      />
    </div>
  );
};

export default Invoices;
