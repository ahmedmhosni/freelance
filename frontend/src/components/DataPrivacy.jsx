import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';
import axios from 'axios';
import { MdDownload, MdDelete, MdWarning } from 'react-icons/md';

const DataPrivacy = () => {
  const { isDark } = useTheme();
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
      <div style={{
        background: isDark ? '#1a1a1a' : '#ffffff',
        border: isDark ? '1px solid rgba(255, 255, 255, 0.1)' : '1px solid rgba(55, 53, 47, 0.09)',
        borderRadius: '12px',
        padding: '24px'
      }}>
        <h3 style={{
          fontSize: '18px',
          fontWeight: '600',
          color: isDark ? 'rgba(255, 255, 255, 0.9)' : '#37352f',
          marginBottom: '8px'
        }}>
          Data & Privacy
        </h3>
        <p style={{
          fontSize: '14px',
          color: isDark ? 'rgba(255, 255, 255, 0.6)' : 'rgba(55, 53, 47, 0.6)',
          marginBottom: '24px'
        }}>
          Manage your data and privacy settings
        </p>

        {/* Export Data */}
        <div style={{
          padding: '20px',
          background: isDark ? 'rgba(255, 255, 255, 0.03)' : 'rgba(55, 53, 47, 0.03)',
          borderRadius: '8px',
          marginBottom: '16px'
        }}>
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
            <MdDownload style={{
              fontSize: '24px',
              color: '#8b5cf6',
              marginTop: '2px'
            }} />
            <div style={{ flex: 1 }}>
              <h4 style={{
                fontSize: '15px',
                fontWeight: '600',
                color: isDark ? 'rgba(255, 255, 255, 0.9)' : '#37352f',
                marginBottom: '8px'
              }}>
                Export Your Data
              </h4>
              <p style={{
                fontSize: '13px',
                color: isDark ? 'rgba(255, 255, 255, 0.6)' : 'rgba(55, 53, 47, 0.6)',
                marginBottom: '12px',
                lineHeight: '1.5'
              }}>
                Download a copy of all your data including clients, projects, tasks, invoices, and time entries. 
                You'll receive an email with a download link within 15-30 minutes.
              </p>
              <button
                onClick={handleExportData}
                disabled={exportLoading}
                style={{
                  padding: '8px 16px',
                  background: '#8b5cf6',
                  color: '#ffffff',
                  border: 'none',
                  borderRadius: '6px',
                  fontSize: '14px',
                  fontWeight: '500',
                  cursor: exportLoading ? 'not-allowed' : 'pointer',
                  opacity: exportLoading ? 0.6 : 1,
                  transition: 'all 0.2s ease'
                }}
                onMouseEnter={(e) => !exportLoading && (e.target.style.background = '#7c3aed')}
                onMouseLeave={(e) => !exportLoading && (e.target.style.background = '#8b5cf6')}
              >
                {exportLoading ? 'Requesting...' : 'Request Data Export'}
              </button>
            </div>
          </div>
        </div>

        {/* Delete Account */}
        <div style={{
          padding: '20px',
          background: isDark ? 'rgba(239, 68, 68, 0.05)' : 'rgba(239, 68, 68, 0.03)',
          border: `1px solid ${isDark ? 'rgba(239, 68, 68, 0.2)' : 'rgba(239, 68, 68, 0.1)'}`,
          borderRadius: '8px'
        }}>
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
            <MdWarning style={{
              fontSize: '24px',
              color: '#ef4444',
              marginTop: '2px'
            }} />
            <div style={{ flex: 1 }}>
              <h4 style={{
                fontSize: '15px',
                fontWeight: '600',
                color: isDark ? 'rgba(255, 255, 255, 0.9)' : '#37352f',
                marginBottom: '8px'
              }}>
                Delete Account
              </h4>
              <p style={{
                fontSize: '13px',
                color: isDark ? 'rgba(255, 255, 255, 0.6)' : 'rgba(55, 53, 47, 0.6)',
                marginBottom: '12px',
                lineHeight: '1.5'
              }}>
                Permanently delete your account and all associated data. This action cannot be undone. 
                We recommend exporting your data first.
              </p>
              <button
                onClick={() => setShowDeleteModal(true)}
                style={{
                  padding: '8px 16px',
                  background: 'transparent',
                  color: '#ef4444',
                  border: '1px solid #ef4444',
                  borderRadius: '6px',
                  fontSize: '14px',
                  fontWeight: '500',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease'
                }}
                onMouseEnter={(e) => {
                  e.target.style.background = '#ef4444';
                  e.target.style.color = '#ffffff';
                }}
                onMouseLeave={(e) => {
                  e.target.style.background = 'transparent';
                  e.target.style.color = '#ef4444';
                }}
              >
                Delete Account
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Delete Account Modal */}
      {showDeleteModal && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0, 0, 0, 0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000,
          padding: '20px'
        }}>
          <div style={{
            background: isDark ? '#1a1a1a' : '#ffffff',
            borderRadius: '12px',
            padding: '32px',
            maxWidth: '500px',
            width: '100%',
            boxShadow: '0 20px 60px rgba(0, 0, 0, 0.3)'
          }}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              marginBottom: '16px'
            }}>
              <MdDelete style={{ fontSize: '32px', color: '#ef4444' }} />
              <h3 style={{
                fontSize: '20px',
                fontWeight: '600',
                color: isDark ? 'rgba(255, 255, 255, 0.9)' : '#37352f'
              }}>
                Delete Account
              </h3>
            </div>

            <p style={{
              fontSize: '14px',
              color: isDark ? 'rgba(255, 255, 255, 0.7)' : 'rgba(55, 53, 47, 0.7)',
              marginBottom: '24px',
              lineHeight: '1.6'
            }}>
              This will permanently delete your account and all associated data. This action cannot be undone.
            </p>

            <div style={{ marginBottom: '16px' }}>
              <label style={{
                display: 'block',
                fontSize: '13px',
                fontWeight: '500',
                color: isDark ? 'rgba(255, 255, 255, 0.7)' : 'rgba(55, 53, 47, 0.7)',
                marginBottom: '8px'
              }}>
                Confirm your password
              </label>
              <input
                type="password"
                value={deletePassword}
                onChange={(e) => setDeletePassword(e.target.value)}
                placeholder="Enter your password"
                style={{
                  width: '100%',
                  padding: '10px 12px',
                  background: isDark ? 'rgba(255, 255, 255, 0.05)' : 'rgba(55, 53, 47, 0.05)',
                  border: isDark ? '1px solid rgba(255, 255, 255, 0.1)' : '1px solid rgba(55, 53, 47, 0.16)',
                  borderRadius: '6px',
                  fontSize: '14px',
                  color: isDark ? 'rgba(255, 255, 255, 0.9)' : '#37352f',
                  outline: 'none'
                }}
              />
            </div>

            <div style={{ marginBottom: '24px' }}>
              <label style={{
                display: 'block',
                fontSize: '13px',
                fontWeight: '500',
                color: isDark ? 'rgba(255, 255, 255, 0.7)' : 'rgba(55, 53, 47, 0.7)',
                marginBottom: '8px'
              }}>
                Reason for leaving (optional)
              </label>
              <textarea
                value={deleteReason}
                onChange={(e) => setDeleteReason(e.target.value)}
                placeholder="Help us improve by telling us why you're leaving"
                rows={3}
                style={{
                  width: '100%',
                  padding: '10px 12px',
                  background: isDark ? 'rgba(255, 255, 255, 0.05)' : 'rgba(55, 53, 47, 0.05)',
                  border: isDark ? '1px solid rgba(255, 255, 255, 0.1)' : '1px solid rgba(55, 53, 47, 0.16)',
                  borderRadius: '6px',
                  fontSize: '14px',
                  color: isDark ? 'rgba(255, 255, 255, 0.9)' : '#37352f',
                  outline: 'none',
                  resize: 'vertical',
                  fontFamily: 'inherit'
                }}
              />
            </div>

            <div style={{
              display: 'flex',
              gap: '12px',
              justifyContent: 'flex-end'
            }}>
              <button
                onClick={() => {
                  setShowDeleteModal(false);
                  setDeletePassword('');
                  setDeleteReason('');
                }}
                disabled={deleteLoading}
                style={{
                  padding: '10px 20px',
                  background: 'transparent',
                  border: isDark ? '1px solid rgba(255, 255, 255, 0.2)' : '1px solid rgba(55, 53, 47, 0.2)',
                  borderRadius: '6px',
                  fontSize: '14px',
                  fontWeight: '500',
                  color: isDark ? 'rgba(255, 255, 255, 0.7)' : 'rgba(55, 53, 47, 0.7)',
                  cursor: deleteLoading ? 'not-allowed' : 'pointer'
                }}
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteAccount}
                disabled={deleteLoading || !deletePassword}
                style={{
                  padding: '10px 20px',
                  background: '#ef4444',
                  border: 'none',
                  borderRadius: '6px',
                  fontSize: '14px',
                  fontWeight: '500',
                  color: '#ffffff',
                  cursor: (deleteLoading || !deletePassword) ? 'not-allowed' : 'pointer',
                  opacity: (deleteLoading || !deletePassword) ? 0.5 : 1
                }}
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
