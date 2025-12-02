/**
 * Invoices Page
 */

import { useInvoices } from '../hooks/useInvoices';
import { LoadingSpinner, ErrorMessage } from '../../../shared/components';
import { formatCurrency, formatDate } from '../../../shared/utils';

const InvoicesPage = () => {
  const { invoices, loading, error } = useInvoices();

  if (loading) return <LoadingSpinner />;
  if (error) return <ErrorMessage message={error} />;

  return (
    <div className="invoices-page">
      <div className="page-header">
        <h1>Invoices</h1>
        <button>Create Invoice</button>
      </div>

      {invoices.length === 0 ? (
        <div className="empty-state">
          <p>No invoices yet. Create your first invoice!</p>
        </div>
      ) : (
        <div className="invoices-list">
          {invoices.map(invoice => (
            <div key={invoice.id} className="invoice-card">
              <div className="invoice-header">
                <h3>Invoice #{invoice.invoice_number}</h3>
                <span className={`status-badge status-${invoice.status}`}>
                  {invoice.status}
                </span>
              </div>
              <p>Client: {invoice.client_name}</p>
              <p>Amount: {formatCurrency(invoice.total)}</p>
              <p>Due: {formatDate(invoice.due_date)}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default InvoicesPage;
