import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';
import axios from 'axios';
import { MdDownload, MdDelete, MdWarning } from 'react-icons/md';

const DataPrivacy = () => {
  const { logout } = useAuth();
  const navigate = useNavigate();
  const [exportLoading, setExportLoading] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deletePassword, setDeletePassword] = useState('');
  const [deleteReason, setDeleteReason] = useState('');
  const [deleteLoading, setDeleteLoading] = useState(false);

  const handleExportData = async () => {
    setExportLoading(true);
    try {
      const apiUrl = import.meta.env.VITE_API_URL || '';
      const token = localStorage.getItem('token');

      const response = await axios.post(
        `${apiUrl}/api/gdpr/export`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );

      toast.success(response.data.message);
    } catch (error) {
      if (error.response?.status === 429) {
        toast.error(error.response.data.message);
      } else {
        toast.error('Failed to request data export');
      }
    } finally {
      setExportLoading(false);
    }
  };

  const handleDeleteAccount = async () => {
    if (!deletePassword) {
      toast.error('Please enter your password');
      return;
    }

    setDeleteLoading(true);
    try {
      const apiUrl = import.meta.env.VITE_API_URL || '';
      const token = localStorage.getItem('token');

      await axios.post(
        `${apiUrl}/api/gdpr/delete-account`,
        { password: deletePassword, reason: deleteReason },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      toast.success('Account deleted successfully');
      setTimeout(() => {
        logout();
        navigate('/');
      }, 2000);
    } catch (error) {
      if (error.response?.status === 401) {
        toast.error('Invalid password');
      } else {
        toast.error('Failed to delete account');
      }
    } finally {
      setDeleteLoading(false);
    }
  };

  return (
    <>
      <div className="card" style={{ padding: '24px' }}>
        <h3
          style={{ fontSize: '16px', marginBottom: '8px', fontWeight: '600' }}
        >
          Data & Privacy
        </h3>
        <p className="page-subtitle" style={{ marginBottom: '24px' }}>
          Manage your data and privacy settings
        </p>

        {/* Export Data */}
        <div className="privacy-section">
          <div
            style={{ display: 'flex', alignItems: 'flex-start', gap: '12px' }}
          >
            <MdDownload
              style={{
                fontSize: '24px',
                color: 'var(--primary-color)',
                marginTop: '2px',
                flexShrink: 0,
              }}
            />
            <div style={{ flex: 1 }}>
              <h4 className="privacy-section-title">Export Your Data</h4>
              <p className="privacy-section-description">
                Download a copy of all your data including clients, projects,
                tasks, invoices, and time entries. You'll receive an email with
                a download link within 15-30 minutes.
              </p>
              <button
                onClick={handleExportData}
                disabled={exportLoading}
                className="btn-primary"
                style={{ marginTop: '12px' }}
              >
                {exportLoading ? 'Requesting...' : 'Request Data Export'}
              </button>
            </div>
          </div>
        </div>

        {/* Delete Account */}
        <div className="privacy-section danger">
          <div
            style={{ display: 'flex', alignItems: 'flex-start', gap: '12px' }}
          >
            <MdWarning
              style={{
                fontSize: '24px',
                color: '#ef4444',
                marginTop: '2px',
                flexShrink: 0,
              }}
            />
            <div style={{ flex: 1 }}>
              <h4
                className="privacy-section-title"
                style={{ color: '#ef4444' }}
              >
                Delete Account
              </h4>
              <p className="privacy-section-description">
                Permanently delete your account and all associated data. This
                action cannot be undone. We recommend exporting your data first.
              </p>
              <button
                onClick={() => setShowDeleteModal(true)}
                className="btn-delete"
                style={{ marginTop: '12px' }}
              >
                Delete Account
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Delete Account Modal */}
      {showDeleteModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                marginBottom: '16px',
              }}
            >
              <MdDelete style={{ fontSize: '32px', color: '#ef4444' }} />
              <h3 style={{ fontSize: '20px', fontWeight: '600' }}>
                Delete Account
              </h3>
            </div>

            <p style={{ marginBottom: '24px', lineHeight: '1.6' }}>
              This will permanently delete your account and all associated data.
              This action cannot be undone.
            </p>

            <div style={{ marginBottom: '16px' }}>
              <label className="form-label">Confirm your password</label>
              <input
                type="password"
                value={deletePassword}
                onChange={(e) => setDeletePassword(e.target.value)}
                placeholder="Enter your password"
                className="form-input"
              />
            </div>

            <div style={{ marginBottom: '24px' }}>
              <label className="form-label">
                Reason for leaving (optional)
              </label>
              <textarea
                value={deleteReason}
                onChange={(e) => setDeleteReason(e.target.value)}
                placeholder="Help us improve by telling us why you're leaving"
                rows={3}
                className="form-input"
                style={{ resize: 'vertical' }}
              />
            </div>

            <div
              style={{
                display: 'flex',
                gap: '12px',
                justifyContent: 'flex-end',
              }}
            >
              <button
                onClick={() => {
                  setShowDeleteModal(false);
                  setDeletePassword('');
                  setDeleteReason('');
                }}
                disabled={deleteLoading}
                className="btn-edit"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteAccount}
                disabled={deleteLoading || !deletePassword}
                className="btn-delete"
              >
                {deleteLoading ? 'Deleting...' : 'Delete Account'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default DataPrivacy;
