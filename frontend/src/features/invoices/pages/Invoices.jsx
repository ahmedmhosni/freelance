import { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import { ConfirmDialog, LoadingSkeleton, exportInvoicesCSV, generateInvoiceNumber, logger } from '../../../shared';
import InvoiceForm from '../components/InvoiceForm';
import { MdReceipt, MdAttachMoney, MdFileDownload } from 'react-icons/md';
import { fetchInvoices, deleteInvoice, downloadInvoicePDF } from '../services/invoiceApi';
import { fetchClients } from '../../clients/services/clientApi';

const Invoices = () => {
  const [invoices, setInvoices] = useState([]);
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingInvoice, setEditingInvoice] = useState(null);
  const [deleteDialog, setDeleteDialog] = useState({ isOpen: false, invoiceId: null });

  useEffect(() => {
    loadInvoices();
    loadClients();
  }, []);

  const loadInvoices = async () => {
    setLoading(true);
    try {
      const response = await fetchInvoices();
      const data = response.data || response;
      setInvoices(Array.isArray(data) ? data : []);
    } catch (error) {
      logger.error('Error fetching invoices:', error);
      toast.error('Failed to load invoices');
    } finally {
      setLoading(false);
    }
  };

  const loadClients = async () => {
    try {
      const response = await fetchClients();
      const data = response.data || response;
      setClients(Array.isArray(data) ? data : []);
    } catch (error) {
      logger.error('Error fetching clients:', error);
    }
  };



  const handleCreateNew = () => {
    const newInvoiceNumber = generateInvoiceNumber(invoices);
    setEditingInvoice({ invoice_number: newInvoiceNumber });
    setShowForm(true);
  };

  const handleExportCSV = () => {
    try {
      exportInvoicesCSV(invoices);
      toast.success('Invoices exported successfully!');
    } catch (error) {
      toast.error('Failed to export invoices');
    }
  };

  const handleEdit = (invoice) => {
    setEditingInvoice(invoice);
    setShowForm(true);
  };

  const confirmDelete = (id) => {
    setDeleteDialog({ isOpen: true, invoiceId: id });
  };

  const handleDelete = async () => {
    try {
      await deleteInvoice(deleteDialog.invoiceId);
      toast.success('Invoice deleted successfully!');
      setDeleteDialog({ isOpen: false, invoiceId: null });
      loadInvoices();
    } catch (error) {
      logger.error('Error deleting invoice:', error);
      toast.error('Failed to delete invoice');
    }
  };

  const handleDownloadPDF = async (invoiceId) => {
    try {
      const blob = await downloadInvoicePDF(invoiceId);
      
      // Create a blob URL and download
      const url = window.URL.createObjectURL(new Blob([blob]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `invoice-${invoiceId}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
      
      toast.success('PDF downloaded!');
    } catch (error) {
      logger.error('Error downloading PDF:', error);
      toast.error('Failed to download PDF');
    }
  };

  const statusColors = {
    draft: '#6c757d', sent: '#007bff', paid: '#28a745', overdue: '#dc3545', cancelled: '#6c757d'
  };

  const totalRevenue = invoices.filter(inv => inv.status === 'paid').reduce((sum, inv) => sum + parseFloat(inv.total || inv.amount || 0), 0);
  const pendingAmount = invoices.filter(inv => inv.status === 'sent').reduce((sum, inv) => sum + parseFloat(inv.total || inv.amount || 0), 0);

  return (
    <div className="container">
      <div className="page-header" style={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'flex-start', 
        marginBottom: '24px',
        flexDirection: window.innerWidth <= 768 ? 'column' : 'row',
        gap: window.innerWidth <= 768 ? '16px' : '0'
      }}>
        <div>
          <h1 style={{ marginBottom: '4px' }}>Invoices</h1>
          <p className="page-subtitle">
            Manage billing and payments
          </p>
        </div>
        <div className="page-actions" style={{ 
          display: 'flex', 
          gap: '8px',
          flexDirection: window.innerWidth <= 768 ? 'column' : 'row',
          width: window.innerWidth <= 768 ? '100%' : 'auto'
        }}>
          {invoices.length > 0 && (
            <button 
              className="btn-edit" 
              onClick={handleExportCSV}
              style={{ 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center',
                gap: '6px',
                width: window.innerWidth <= 768 ? '100%' : 'auto'
              }}
            >
              <MdFileDownload size={18} />
              Export CSV
            </button>
          )}
          <button 
            className="btn-primary" 
            onClick={handleCreateNew}
            style={{ width: window.innerWidth <= 768 ? '100%' : 'auto' }}
          >
            Create Invoice
          </button>
        </div>
      </div>

      {loading ? (
        <LoadingSkeleton type="stat" count={3} />
      ) : (
        <div className="stats-grid" style={{ 
          display: 'grid', 
          gridTemplateColumns: window.innerWidth <= 768 
            ? '1fr' 
            : window.innerWidth <= 1024 
              ? 'repeat(2, 1fr)' 
              : 'repeat(3, 1fr)', 
          gap: '12px', 
          marginBottom: '32px' 
        }}>
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
        <InvoiceForm
          invoice={editingInvoice?.id ? editingInvoice : null}
          onClose={() => {
            setShowForm(false);
            setEditingInvoice(null);
          }}
          onSuccess={fetchInvoices}
        />
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
            <div className="table-container" style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: window.innerWidth <= 768 ? '700px' : 'auto', fontFamily: 'inherit' }}>
                <thead>
                  <tr style={{ borderBottom: '2px solid #ddd' }}>
                    <th style={{ textAlign: 'left', padding: '12px', fontFamily: 'inherit', fontSize: '13px', fontWeight: '600', color: 'rgba(55, 53, 47, 0.9)' }}>Invoice #</th>
                    <th style={{ textAlign: 'left', padding: '12px', fontFamily: 'inherit', fontSize: '13px', fontWeight: '600', color: 'rgba(55, 53, 47, 0.9)' }}>Client</th>
                    <th style={{ textAlign: 'left', padding: '12px', fontFamily: 'inherit', fontSize: '13px', fontWeight: '600', color: 'rgba(55, 53, 47, 0.9)' }}>Items</th>
                    <th style={{ textAlign: 'right', padding: '12px', fontFamily: 'inherit', fontSize: '13px', fontWeight: '600', color: 'rgba(55, 53, 47, 0.9)' }}>Amount</th>
                    <th style={{ textAlign: 'left', padding: '12px', fontFamily: 'inherit', fontSize: '13px', fontWeight: '600', color: 'rgba(55, 53, 47, 0.9)' }}>Status</th>
                    <th style={{ textAlign: 'left', padding: '12px', fontFamily: 'inherit', fontSize: '13px', fontWeight: '600', color: 'rgba(55, 53, 47, 0.9)' }}>Due Date</th>
                    <th style={{ textAlign: 'right', padding: '12px', fontFamily: 'inherit', fontSize: '13px', fontWeight: '600', color: 'rgba(55, 53, 47, 0.9)' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {invoices.map(invoice => (
                    <tr key={invoice.id} style={{ borderBottom: '1px solid #eee' }}>
                      <td style={{ padding: '12px', fontFamily: 'inherit', fontSize: '13px' }}>
                        <strong style={{ fontFamily: 'inherit' }}>{invoice.invoice_number}</strong>
                      </td>
                      <td style={{ padding: '12px', fontFamily: 'inherit', fontSize: '13px', color: 'rgba(55, 53, 47, 0.9)' }}>
                        {invoice.client_name || '-'}
                      </td>
                      <td style={{ padding: '12px', fontFamily: 'inherit', fontSize: '12px', color: 'rgba(55, 53, 47, 0.65)' }}>
                        {invoice.item_count || 0} {invoice.item_count === 1 ? 'item' : 'items'}
                      </td>
                      <td style={{ padding: '12px', fontFamily: 'inherit', fontSize: '13px', textAlign: 'right', fontWeight: '500' }}>
                        ${parseFloat(invoice.total || invoice.amount || 0).toFixed(2)}
                      </td>
                      <td style={{ padding: '12px', fontFamily: 'inherit' }}>
                        <span className={`status-badge status-${invoice.status}`} style={{ fontFamily: 'inherit' }}>
                          {invoice.status}
                        </span>
                      </td>
                      <td style={{ padding: '12px', fontFamily: 'inherit', fontSize: '13px', color: 'rgba(55, 53, 47, 0.9)' }}>
                        {invoice.due_date ? new Date(invoice.due_date).toLocaleDateString() : '-'}
                      </td>
                      <td style={{ padding: '12px', textAlign: 'right' }}>
                        <div className="table-actions" style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end', flexWrap: 'nowrap' }}>
                          <button 
                            onClick={() => handleDownloadPDF(invoice.id)}
                            className="btn-edit"
                            style={{ fontSize: window.innerWidth <= 768 ? '11px' : '13px', padding: window.innerWidth <= 768 ? '6px 8px' : '6px 12px' }}
                          >
                            PDF
                          </button>
                          <button 
                            onClick={() => handleEdit(invoice)}
                            className="btn-edit"
                            style={{ fontSize: window.innerWidth <= 768 ? '11px' : '13px', padding: window.innerWidth <= 768 ? '6px 8px' : '6px 12px' }}
                          >
                            Edit
                          </button>
                          <button 
                            onClick={() => confirmDelete(invoice.id)}
                            className="btn-delete"
                            style={{ fontSize: window.innerWidth <= 768 ? '11px' : '13px', padding: window.innerWidth <= 768 ? '6px 8px' : '6px 12px' }}
                          >
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
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
