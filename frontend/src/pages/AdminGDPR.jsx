import { useState, useEffect } from 'react';
import { useTheme } from '../context/ThemeContext';
import axios from 'axios';
import toast from 'react-hot-toast';
import { MdDownload, MdDelete, MdRestore, MdEmail, MdPeople } from 'react-icons/md';

const AdminGDPR = () => {
  const { isDark } = useTheme();
  const [activeTab, setActiveTab] = useState('exports');
  const [loading, setLoading] = useState(true);
  
  // Export requests
  const [exportRequests, setExportRequests] = useState([]);
  const [exportStats, setExportStats] = useState({});
  
  // Deleted accounts
  const [deletedAccounts, setDeletedAccounts] = useState([]);
  const [deletedStats, setDeletedStats] = useState({});
  
  // Email preferences
  const [emailStats, setEmailStats] = useState({});
  
  // Deletion reasons
  const [deletionReasons, setDeletionReasons] = useState([]);

  useEffect(() => {
    fetchData();
  }, [activeTab]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const apiUrl = import.meta.env.VITE_API_URL || '';
      const token = localStorage.getItem('token');
      const headers = { Authorization: `Bearer ${token}` };

      if (activeTab === 'exports') {
        const response = await axios.get(`${apiUrl}/admin/gdpr/export-requests`, { headers });
        setExportRequests(response.data.requests);
        setExportStats(response.data.stats);
      } else if (activeTab === 'deleted') {
        const response = await axios.get(`${apiUrl}/admin/gdpr/deleted-accounts`, { headers });
        setDeletedAccounts(response.data.accounts);
        setDeletedStats(response.data.stats);
      } else if (activeTab === 'email') {
        const response = await axios.get(`${apiUrl}/admin/gdpr/email-preferences-stats`, { headers });
        setEmailStats(response.data);
      } else if (activeTab === 'reasons') {
        const response = await axios.get(`${apiUrl}/admin/gdpr/deletion-reasons`, { headers });
        setDeletionReasons(response.data.reasons);
      }
    } catch (error) {
      console.error('Failed to fetch data:', error);
      toast.error('Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  const handleRestoreAccount = async (userId, email) => {
    if (!confirm(`Are you sure you want to restore account: ${email}?`)) {
      return;
    }

    try {
      const apiUrl = import.meta.env.VITE_API_URL || '';
      const token = localStorage.getItem('token');
      
      await axios.post(
        `${apiUrl}/admin/gdpr/restore-account`,
        { userId },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      toast.success('Account restored successfully');
      fetchData();
    } catch (error) {
      console.error('Failed to restore account:', error);
      toast.error('Failed to restore account');
    }
  };

  const tabs = [
    { id: 'exports', label: 'Data Exports', icon: <MdDownload /> },
    { id: 'deleted', label: 'Deleted Accounts', icon: <MdDelete /> },
    { id: 'email', label: 'Email Preferences', icon: <MdEmail /> },
    { id: 'reasons', label: 'Deletion Reasons', icon: <MdPeople /> }
  ];

  return (
    <div className="container">
      <div style={{ marginBottom: '24px' }}>
        <h1 style={{ marginBottom: '4px' }}>GDPR Management</h1>
        <p className="page-subtitle">
          Monitor data exports, deleted accounts, and email preferences
        </p>
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: '8px', marginBottom: '24px', flexWrap: 'wrap' }}>
        {tabs.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`view-toggle ${activeTab === tab.id ? 'active' : ''}`}
            style={{ display: 'flex', alignItems: 'center', gap: '8px' }}
          >
            {tab.icon}
            {tab.label}
          </button>
        ))}
      </div>

      {loading ? (
        <div style={{
          textAlign: 'center',
          padding: '48px',
          color: isDark ? 'rgba(255, 255, 255, 0.6)' : 'rgba(55, 53, 47, 0.6)'
        }}>
          Loading...
        </div>
      ) : (
        <>
          {/* Data Exports Tab */}
          {activeTab === 'exports' && (
            <div>
              {/* Stats */}
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                gap: '16px',
                marginBottom: '24px'
              }}>
                {Object.entries(exportStats).map(([key, value]) => (
                  <div key={key} className="card" style={{ padding: '16px' }}>
                    <div className="stat-label" style={{ textTransform: 'uppercase' }}>{key}</div>
                    <div className="stat-value">{value}</div>
                  </div>
                ))}
              </div>

              {/* Requests Table */}
              <div className="card" style={{ overflow: 'hidden' }}>
                <div style={{ overflowX: 'auto' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                    <thead>
                      <tr style={{
                        background: isDark ? 'rgba(255, 255, 255, 0.03)' : 'rgba(55, 53, 47, 0.03)',
                        borderBottom: isDark ? '1px solid rgba(255, 255, 255, 0.1)' : '1px solid rgba(55, 53, 47, 0.09)'
                      }}>
                        <th style={{ padding: '12px', textAlign: 'left', fontSize: '13px', fontWeight: '600' }}>User</th>
                        <th style={{ padding: '12px', textAlign: 'left', fontSize: '13px', fontWeight: '600' }}>Status</th>
                        <th style={{ padding: '12px', textAlign: 'left', fontSize: '13px', fontWeight: '600' }}>Requested</th>
                        <th style={{ padding: '12px', textAlign: 'left', fontSize: '13px', fontWeight: '600' }}>Completed</th>
                        <th style={{ padding: '12px', textAlign: 'left', fontSize: '13px', fontWeight: '600' }}>Expires</th>
                      </tr>
                    </thead>
                    <tbody>
                      {exportRequests.map(request => (
                        <tr key={request.id} style={{
                          borderBottom: isDark ? '1px solid rgba(255, 255, 255, 0.05)' : '1px solid rgba(55, 53, 47, 0.05)'
                        }}>
                          <td style={{ padding: '12px' }}>
                            <div style={{ fontSize: '14px', fontWeight: '500' }}>{request.user_name}</div>
                            <div style={{ fontSize: '12px', color: isDark ? 'rgba(255, 255, 255, 0.5)' : 'rgba(55, 53, 47, 0.5)' }}>
                              {request.user_email}
                            </div>
                          </td>
                          <td style={{ padding: '12px' }}>
                            <span style={{
                              padding: '4px 8px',
                              borderRadius: '4px',
                              fontSize: '12px',
                              fontWeight: '500',
                              background: request.status === 'completed' ? 'rgba(16, 185, 129, 0.1)' :
                                         request.status === 'failed' ? 'rgba(239, 68, 68, 0.1)' :
                                         request.status === 'processing' ? 'rgba(251, 191, 36, 0.1)' :
                                         'rgba(139, 92, 246, 0.1)',
                              color: request.status === 'completed' ? '#10b981' :
                                    request.status === 'failed' ? '#ef4444' :
                                    request.status === 'processing' ? '#fbbf24' :
                                    '#8b5cf6'
                            }}>
                              {request.status}
                            </span>
                          </td>
                          <td style={{ padding: '12px', fontSize: '13px' }}>
                            {new Date(request.requested_at).toLocaleString()}
                          </td>
                          <td style={{ padding: '12px', fontSize: '13px' }}>
                            {request.completed_at ? new Date(request.completed_at).toLocaleString() : '-'}
                          </td>
                          <td style={{ padding: '12px', fontSize: '13px' }}>
                            {request.expires_at ? (
                              <span style={{ color: request.is_expired ? '#ef4444' : 'inherit' }}>
                                {new Date(request.expires_at).toLocaleDateString()}
                                {request.is_expired && ' (Expired)'}
                              </span>
                            ) : '-'}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* Deleted Accounts Tab */}
          {activeTab === 'deleted' && (
            <div>
              {/* Stats */}
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                gap: '16px',
                marginBottom: '24px'
              }}>
                <div className="card" style={{ padding: '16px' }}>
                  <div className="stat-label">TOTAL DELETED</div>
                  <div className="stat-value">{deletedStats.total_deleted || 0}</div>
                </div>
                <div className="card" style={{ padding: '16px' }}>
                  <div className="stat-label">LAST 7 DAYS</div>
                  <div className="stat-value">{deletedStats.deleted_last_7_days || 0}</div>
                </div>
                <div className="card" style={{ padding: '16px' }}>
                  <div className="stat-label">LAST 30 DAYS</div>
                  <div className="stat-value">{deletedStats.deleted_last_30_days || 0}</div>
                </div>
              </div>

              {/* Accounts Table */}
              <div className="card" style={{ overflow: 'hidden' }}>
                <div style={{ overflowX: 'auto' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                    <thead>
                      <tr style={{
                        background: isDark ? 'rgba(255, 255, 255, 0.03)' : 'rgba(55, 53, 47, 0.03)',
                        borderBottom: isDark ? '1px solid rgba(255, 255, 255, 0.1)' : '1px solid rgba(55, 53, 47, 0.09)'
                      }}>
                        <th style={{ padding: '12px', textAlign: 'left', fontSize: '13px', fontWeight: '600' }}>User</th>
                        <th style={{ padding: '12px', textAlign: 'left', fontSize: '13px', fontWeight: '600' }}>Deleted</th>
                        <th style={{ padding: '12px', textAlign: 'left', fontSize: '13px', fontWeight: '600' }}>Days Ago</th>
                        <th style={{ padding: '12px', textAlign: 'left', fontSize: '13px', fontWeight: '600' }}>Reason</th>
                        <th style={{ padding: '12px', textAlign: 'left', fontSize: '13px', fontWeight: '600' }}>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {deletedAccounts.map(account => (
                        <tr key={account.id} style={{
                          borderBottom: isDark ? '1px solid rgba(255, 255, 255, 0.05)' : '1px solid rgba(55, 53, 47, 0.05)'
                        }}>
                          <td style={{ padding: '12px' }}>
                            <div style={{ fontSize: '14px', fontWeight: '500' }}>{account.name}</div>
                            <div style={{ fontSize: '12px', color: isDark ? 'rgba(255, 255, 255, 0.5)' : 'rgba(55, 53, 47, 0.5)' }}>
                              {account.email}
                            </div>
                          </td>
                          <td style={{ padding: '12px', fontSize: '13px' }}>
                            {new Date(account.deleted_at).toLocaleDateString()}
                          </td>
                          <td style={{ padding: '12px', fontSize: '13px' }}>
                            {Math.floor(account.days_since_deletion)} days
                          </td>
                          <td style={{ padding: '12px', fontSize: '13px', maxWidth: '200px' }}>
                            {account.deletion_reason || '-'}
                          </td>
                          <td style={{ padding: '12px' }}>
                            <button
                              onClick={() => handleRestoreAccount(account.id, account.email)}
                              className="btn-primary"
                              style={{
                                padding: '6px 12px',
                                fontSize: '12px',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '4px'
                              }}
                            >
                              <MdRestore /> Restore
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* Email Preferences Tab */}
          {activeTab === 'email' && (
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
              gap: '24px'
            }}>
              {['marketing', 'notifications', 'updates'].map(type => (
                <div key={type} className="card" style={{ padding: '24px' }}>
                  <h3 style={{
                    fontSize: '16px',
                    fontWeight: '600',
                    color: isDark ? 'rgba(255, 255, 255, 0.9)' : '#37352f',
                    marginBottom: '16px',
                    textTransform: 'capitalize'
                  }}>
                    {type} Emails
                  </h3>
                  
                  <div style={{ marginBottom: '16px' }}>
                    <div style={{
                      fontSize: '32px',
                      fontWeight: '600',
                      color: '#10b981',
                      marginBottom: '4px'
                    }}>
                      {emailStats[type]?.enabled || 0}
                    </div>
                    <div style={{
                      fontSize: '13px',
                      color: isDark ? 'rgba(255, 255, 255, 0.6)' : 'rgba(55, 53, 47, 0.6)'
                    }}>
                      Subscribed
                    </div>
                  </div>

                  <div style={{ marginBottom: '16px' }}>
                    <div style={{
                      fontSize: '32px',
                      fontWeight: '600',
                      color: '#ef4444',
                      marginBottom: '4px'
                    }}>
                      {emailStats[type]?.disabled || 0}
                    </div>
                    <div style={{
                      fontSize: '13px',
                      color: isDark ? 'rgba(255, 255, 255, 0.6)' : 'rgba(55, 53, 47, 0.6)'
                    }}>
                      Unsubscribed ({emailStats[type]?.disabledPercentage || 0}%)
                    </div>
                  </div>

                  <div style={{
                    height: '8px',
                    background: isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(55, 53, 47, 0.1)',
                    borderRadius: '4px',
                    overflow: 'hidden'
                  }}>
                    <div style={{
                      height: '100%',
                      width: `${100 - (emailStats[type]?.disabledPercentage || 0)}%`,
                      background: '#10b981',
                      transition: 'width 0.3s ease'
                    }} />
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Deletion Reasons Tab */}
          {activeTab === 'reasons' && (
            <div className="card" style={{ padding: '24px' }}>
              <h3 style={{
                fontSize: '18px',
                fontWeight: '600',
                color: isDark ? 'rgba(255, 255, 255, 0.9)' : '#37352f',
                marginBottom: '16px'
              }}>
                Why Users Are Leaving
              </h3>
              
              {deletionReasons.length === 0 ? (
                <p style={{
                  fontSize: '14px',
                  color: isDark ? 'rgba(255, 255, 255, 0.6)' : 'rgba(55, 53, 47, 0.6)',
                  textAlign: 'center',
                  padding: '32px'
                }}>
                  No deletion reasons recorded yet
                </p>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  {deletionReasons.map((reason, index) => (
                    <div key={index} style={{
                      padding: '16px',
                      background: isDark ? 'rgba(255, 255, 255, 0.03)' : 'rgba(55, 53, 47, 0.03)',
                      borderRadius: '8px',
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center'
                    }}>
                      <div style={{ flex: 1 }}>
                        <div style={{
                          fontSize: '14px',
                          color: isDark ? 'rgba(255, 255, 255, 0.9)' : '#37352f',
                          marginBottom: '4px'
                        }}>
                          {reason.deletion_reason}
                        </div>
                        <div style={{
                          fontSize: '12px',
                          color: isDark ? 'rgba(255, 255, 255, 0.5)' : 'rgba(55, 53, 47, 0.5)'
                        }}>
                          Last: {new Date(reason.deletion_dates[0]).toLocaleDateString()}
                        </div>
                      </div>
                      <div style={{
                        fontSize: '20px',
                        fontWeight: '600',
                        color: '#8b5cf6',
                        minWidth: '40px',
                        textAlign: 'right'
                      }}>
                        {reason.count}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default AdminGDPR;
