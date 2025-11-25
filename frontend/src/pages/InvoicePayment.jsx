import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useTheme } from '../context/ThemeContext';
import StripeProvider from '../context/StripeContext';
import PaymentForm from '../components/PaymentForm';
import LoadingSkeleton from '../components/LoadingSkeleton';
import api from '../utils/api';
import toast from 'react-hot-toast';
import { MdArrowBack, MdCheckCircle } from 'react-icons/md';

const InvoicePayment = () => {
  const { invoiceId } = useParams();
  const navigate = useNavigate();
  const { isDark } = useTheme();
  const [invoice, setInvoice] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [paymentStatus, setPaymentStatus] = useState(null);

  useEffect(() => {
    fetchInvoice();
  }, [invoiceId]);

  const fetchInvoice = async () => {
    try {
      setLoading(true);
      const response = await api.get(`/invoices/${invoiceId}`);
      const invoiceData = response.data;
      
      // Check if invoice is already paid
      if (invoiceData.payment_status === 'paid' || invoiceData.status === 'paid') {
        setPaymentStatus('already_paid');
      }
      
      setInvoice(invoiceData);
    } catch (error) {
      console.error('Error fetching invoice:', error);
      if (error.response?.status === 404) {
        setError('Invoice not found');
      } else {
        setError('Failed to load invoice');
      }
    } finally {
      setLoading(false);
    }
  };

  const handlePaymentSuccess = (paymentData) => {
    setPaymentStatus('success');
    setInvoice(prev => ({
      ...prev,
      payment_status: 'paid',
      status: 'paid'
    }));
    
    toast.success('Payment completed successfully!');
    
    // Redirect to success page or invoice list after 3 seconds
    setTimeout(() => {
      navigate('/invoices', { 
        state: { 
          message: `Payment of $${paymentData.amount} completed successfully!` 
        }
      });
    }, 3000);
  };

  const handleCancel = () => {
    navigate('/invoices');
  };

  const formatAmount = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  if (loading) {
    return (
      <div className="container">
        <LoadingSkeleton />
      </div>
    );
  }

  if (error) {
    return (
      <div className="container" style={{ maxWidth: '600px', margin: '40px auto' }}>
        <div className="card" style={{ padding: '40px', textAlign: 'center' }}>
          <div style={{
            fontSize: '48px',
            marginBottom: '16px',
            color: '#eb5757'
          }}>
            ⚠️
          </div>
          <h2 style={{ margin: '0 0 8px 0', fontSize: '20px', fontWeight: '600' }}>
            {error}
          </h2>
          <p style={{ margin: '0 0 20px 0', color: 'rgba(55, 53, 47, 0.65)' }}>
            The invoice you're looking for could not be found or you don't have permission to view it.
          </p>
          <button
            onClick={() => navigate('/invoices')}
            className="btn-primary"
          >
            <MdArrowBack style={{ marginRight: '8px' }} />
            Back to Invoices
          </button>
        </div>
      </div>
    );
  }

  if (!invoice) {
    return null;
  }

  // Already paid status
  if (paymentStatus === 'already_paid' || invoice.payment_status === 'paid') {
    return (
      <div className="container" style={{ maxWidth: '600px', margin: '40px auto' }}>
        <div className="card" style={{ padding: '40px', textAlign: 'center' }}>
          <div style={{
            width: '80px',
            height: '80px',
            backgroundColor: 'rgba(40, 167, 69, 0.1)',
            borderRadius: '50%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 20px',
            fontSize: '32px',
            color: '#28a745'
          }}>
            <MdCheckCircle />
          </div>
          <h2 style={{ margin: '0 0 8px 0', fontSize: '24px', fontWeight: '600' }}>
            Invoice Already Paid
          </h2>
          <p style={{ margin: '0 0 8px 0', color: 'rgba(55, 53, 47, 0.65)' }}>
            This invoice has already been paid.
          </p>
          <p style={{ margin: '0 0 24px 0', fontSize: '18px', fontWeight: '600' }}>
            Amount: {formatAmount(invoice.amount)}
          </p>
          <button
            onClick={() => navigate('/invoices')}
            className="btn-primary"
          >
            <MdArrowBack style={{ marginRight: '8px' }} />
            Back to Invoices
          </button>
        </div>
      </div>
    );
  }

  // Payment success status
  if (paymentStatus === 'success') {
    return (
      <div className="container" style={{ maxWidth: '600px', margin: '40px auto' }}>
        <div className="card" style={{ padding: '40px', textAlign: 'center' }}>
          <div style={{
            width: '80px',
            height: '80px',
            backgroundColor: 'rgba(40, 167, 69, 0.1)',
            borderRadius: '50%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 20px',
            fontSize: '32px',
            color: '#28a745'
          }}>
            <MdCheckCircle />
          </div>
          <h2 style={{ margin: '0 0 8px 0', fontSize: '24px', fontWeight: '600', color: '#28a745' }}>
            Payment Successful!
          </h2>
          <p style={{ margin: '0 0 8px 0', color: 'rgba(55, 53, 47, 0.65)' }}>
            Your payment has been processed successfully.
          </p>
          <p style={{ margin: '0 0 24px 0', fontSize: '18px', fontWeight: '600' }}>
            Amount Paid: {formatAmount(invoice.amount)}
          </p>
          <p style={{ margin: 0, fontSize: '13px', color: 'rgba(55, 53, 47, 0.65)' }}>
            Redirecting to invoices...
          </p>
        </div>
      </div>
    );
  }

  // Payment form
  return (
    <StripeProvider>
      <div className="container" style={{ maxWidth: '600px', margin: '40px auto' }}>
        <button
          onClick={handleCancel}
          className="btn-edit"
          style={{ marginBottom: '20px' }}
        >
          <MdArrowBack style={{ marginRight: '8px' }} />
          Back to Invoices
        </button>
        
        <PaymentForm
          invoice={invoice}
          onSuccess={handlePaymentSuccess}
          onCancel={handleCancel}
        />
      </div>
    </StripeProvider>
  );
};

export default InvoicePayment;
