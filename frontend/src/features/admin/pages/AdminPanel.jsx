import { useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';
import { Link } from 'react-router-dom';
import { api, logger, Pagination } from '../../../shared';
import QuotesManager from '../components/QuotesManager';
import MaintenanceEditor from '../components/MaintenanceEditor';
import LegalEditor from '../components/LegalEditor';
import { ChangelogEditor } from '../../changelog';
import VersionNamesManager from '../components/VersionNamesManager';
import FeedbackManager from '../components/FeedbackManager';
import AIAssistantManager from '../components/AIAssistantManager';
import { AnnouncementsManager } from '../../announcements';
import { MdCheckCircle, MdError, MdWarning, MdTrendingUp } from 'react-icons/md';
import { FaUsers, FaFolder, FaFileInvoice, FaDollarSign, FaServer } from 'react-icons/fa';

const AdminPanel = () => {
  const [users, setUsers] = useState([]);
  const [stats, setStats] = useState({ users: 0, projects: 0, invoices: 0, revenue: 0 });
  const [systemStatus, setSystemStatus] = useState(null);
  const [activeTab, setActiveTab] = useState('users');
  const [inactiveUsers, setInactiveUsers] = useState([]);
  const [inactiveDays, setInactiveDays] = useState(90);
  const [activityStats, setActivityStats] = useState(null);
  const [showInactive, setShowInactive] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(25);

  useEffect(() => {
    fetchUsers();
    fetchStats();
    fetchSystemStatus();
    fetchActivityStats();
  }, []);

  useEffect(() => {
    if (showInactive) {
      fetchInactiveUsers();
    }
  }, [showInactive, inactiveDays]);

  const fetchSystemStatus = async () => {
    try {
      const response = await api.get('/status');
      setSystemStatus(response.data);
    } catch (error) {
      logger.error('Error fetching system status:', error);
    }
  };

  const fetchUsers = async () => {
    try {
      const response = await api.get('/admin/users');
      setUsers(response.data);
    } catch (error) {
      logger.error('Error fetching users:', error);
    }
  };

  const fetchInactiveUsers = async () => {
    try {
      const response = await api.get(`/admin/activity/inactive-users?days=${inactiveDays}`);
      setInactiveUsers(response.data.users);
    } catch (error) {
      logger.error('Error fetching inactive users:', error);
    }
  };

  const fetchActivityStats = async () => {
    try {
      const response = await api.get('/admin/activity/stats');
      setActivityStats(response.data);
    } catch (error) {
      logger.error('Error fetching activity stats:', error);
    }
  };

  const handleDeleteInactiveUsers = async (userIds) => {
    if (!confirm(`Delete ${userIds.length} inactive user(s)? This action can be undone from the GDPR panel.`)) {
      return;
    }

    try {
      await api.post('/admin/activity/delete-inactive', { userIds });
      fetchUsers();
      fetchInactiveUsers();
      fetchActivityStats();
      toast.success('Inactive users deleted successfully');
    } catch (error) {
      logger.error('Error deleting inactive users:', error);
      toast.error('Failed to delete inactive users');
    }
  };

  const handleBulkDeleteInactive = async () => {
    if (!confirm(`Delete ALL users inactive for ${inactiveDays}+ days? This action can be undone from the GDPR panel.`)) {
      return;
    }

    try {
      await api.post('/admin/activity/delete-inactive', { days: inactiveDays });
      fetchUsers();
      fetchInactiveUsers();
      fetchActivityStats();
      toast.success('Inactive users deleted successfully');
    } catch (error) {
      logger.error('Error deleting inactive users:', error);
      toast.error('Failed to delete inactive users');
    }
  };

  const fetchStats = async () => {
    try {
      const response = await api.get('/admin/reports');
      setStats(response.data);
    } catch (error) {
      logger.error('Error fetching stats:', error);
    }
  };

  const handleRoleChange = async (userId, newRole) => {
    try {
      await api.put(`/admin/users/${userId}/role`, { role: newRole });
      fetchUsers();
      toast.success('User role updated');
    } catch (error) {
      logger.error('Error updating role:', error);
      toast.error('Failed to update user role');
    }
  };

  const handleDeleteUser = async (userId) => {
    if (confirm('Delete this user? This will delete all their data.')) {
      try {
        await api.delete(`/admin/users/${userId}`);
        fetchUsers();
        toast.success('User deleted successfully');
      } catch (error) {
        logger.error('Error deleting user:', error);
        toast.error('Failed to delete user');
      }
    }
  };

  const handleVerificationChange = async (userId, newStatus) => {
    // Optimistic update
    setUsers(users.map(user =>
      user.id === userId ? { ...user, email_verified: newStatus } : user
    ));

    try {
      await api.put(`/admin/users/${userId}/verification`, { email_verified: newStatus });
      // No need to fetchUsers() because we already updated the state
      toast.success('Verification status updated');
    } catch (error) {
      logger.error('Error updating verification status:', error);
      // Revert on error
      fetchUsers();
      toast.error('Failed to update verification status');
    }
  };

  return (
    <div className="container">
      <div style={{ marginBottom: '24px' }}>
        <h1 style={{ marginBottom: '4px' }}>Admin Panel</h1>
        <p className="page-subtitle">
          Manage users, content, and view system stats
        </p>
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: '8px', marginBottom: '24px', flexWrap: 'wrap' }}>
        <button
          onClick={() => setActiveTab('users')}
          className={`view-toggle ${activeTab === 'users' ? 'active' : ''}`}
        >
          Users
        </button>
        <button
          onClick={() => setActiveTab('quotes')}
          className={`view-toggle ${activeTab === 'quotes' ? 'active' : ''}`}
        >
          Daily Quotes
        </button>
        <button
          onClick={() => setActiveTab('maintenance')}
          className={`view-toggle ${activeTab === 'maintenance' ? 'active' : ''}`}
        >
          Maintenance Page
        </button>
        <button
          onClick={() => setActiveTab('legal')}
          className={`view-toggle ${activeTab === 'legal' ? 'active' : ''}`}
        >
          Terms & Privacy
        </button>
        <button
          onClick={() => setActiveTab('changelog')}
          className={`view-toggle ${activeTab === 'changelog' ? 'active' : ''}`}
        >
          Changelog
        </button>
        <button
          onClick={() => setActiveTab('version-names')}
          className={`view-toggle ${activeTab === 'version-names' ? 'active' : ''}`}
        >
          Version Names
        </button>
        <button
          onClick={() => setActiveTab('feedback')}
          className={`view-toggle ${activeTab === 'feedback' ? 'active' : ''}`}
        >
          Feedback
        </button>
        <button
          onClick={() => setActiveTab('announcements')}
          className={`view-toggle ${activeTab === 'announcements' ? 'active' : ''}`}
        >
          Announcements
        </button>
        <button
          onClick={() => setActiveTab('ai-assistant')}
          className={`view-toggle ${activeTab === 'ai-assistant' ? 'active' : ''}`}
        >
          AI Assistant
        </button>
        <Link to="/app/admin/gdpr" style={{ textDecoration: 'none' }}>
          <button className="view-toggle" style={{ width: '100%' }}>
            GDPR Management
          </button>
        </Link>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '12px', marginBottom: '32px' }}>
        <div className="card" style={{ padding: '16px', display: 'flex', alignItems: 'start', gap: '12px' }}>
          <div style={{ fontSize: '32px', color: 'rgba(55, 53, 47, 0.4)' }}>
            <FaUsers />
          </div>
          <div style={{ flex: 1 }}>
            <div className="stat-label" style={{ fontSize: '12px', marginBottom: '8px', fontWeight: '500' }}>TOTAL USERS</div>
            <div className="stat-value" style={{ fontSize: '28px', fontWeight: '600', marginBottom: '4px' }}>
              {typeof stats.users === 'object' ? stats.users?.total || 0 : stats.users || 0}
            </div>
            <div className="stat-description" style={{ fontSize: '13px' }}>Registered accounts</div>
          </div>
        </div>
        <div className="card" style={{ padding: '16px', display: 'flex', alignItems: 'start', gap: '12px' }}>
          <div style={{ fontSize: '32px', color: 'rgba(55, 53, 47, 0.4)' }}>
            <FaFolder />
          </div>
          <div style={{ flex: 1 }}>
            <div className="stat-label" style={{ fontSize: '12px', marginBottom: '8px', fontWeight: '500' }}>TOTAL PROJECTS</div>
            <div className="stat-value" style={{ fontSize: '28px', fontWeight: '600', marginBottom: '4px' }}>
              {typeof stats.projects === 'object' ? stats.projects?.total || 0 : stats.projects || 0}
            </div>
            <div className="stat-description" style={{ fontSize: '13px' }}>All projects</div>
          </div>
        </div>
        <div className="card" style={{ padding: '16px', display: 'flex', alignItems: 'start', gap: '12px' }}>
          <div style={{ fontSize: '32px', color: 'rgba(55, 53, 47, 0.4)' }}>
            <FaFileInvoice />
          </div>
          <div style={{ flex: 1 }}>
            <div className="stat-label" style={{ fontSize: '12px', marginBottom: '8px', fontWeight: '500' }}>TOTAL INVOICES</div>
            <div className="stat-value" style={{ fontSize: '28px', fontWeight: '600', marginBottom: '4px' }}>
              {typeof stats.invoices === 'object' ? stats.invoices?.total || 0 : stats.invoices || 0}
            </div>
            <div className="stat-description" style={{ fontSize: '13px' }}>All invoices</div>
          </div>
        </div>
        <div className="card" style={{ padding: '16px', display: 'flex', alignItems: 'start', gap: '12px' }}>
          <div style={{ fontSize: '32px', color: 'rgba(55, 53, 47, 0.4)' }}>
            <FaDollarSign />
          </div>
          <div style={{ flex: 1 }}>
            <div className="stat-label" style={{ fontSize: '12px', marginBottom: '8px', fontWeight: '500' }}>TOTAL REVENUE</div>
            <div className="stat-value" style={{ fontSize: '28px', fontWeight: '600', marginBottom: '4px' }}>
              ${typeof stats.revenue === 'object' ? stats.revenue?.total || 0 : stats.revenue || 0}
            </div>
            <div className="stat-description" style={{ fontSize: '13px' }}>System-wide</div>
          </div>
        </div>

        {/* System Status Card */}
        <Link to="/app/admin/status" style={{ textDecoration: 'none' }}>
          <div className="card" style={{
            display: 'flex',
            alignItems: 'start',
            gap: '12px',
            cursor: 'pointer',
            transition: 'transform 0.2s ease, box-shadow 0.2s ease',
            height: '100%'
          }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'translateY(-2px)';
              e.currentTarget.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.1)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = '';
            }}>
            <div style={{ fontSize: '32px', color: 'rgba(55, 53, 47, 0.4)' }}>
              <FaServer />
            </div>
            <div style={{ flex: 1 }}>
              <div className="stat-label">SYSTEM STATUS</div>
              <div style={{
                fontSize: '32px',
                marginBottom: '4px',
                color: systemStatus?.status === 'operational' ? '#28a745' : '#ffc107'
              }}>
                {systemStatus?.status === 'operational' ? <MdCheckCircle /> :
                  systemStatus?.status === 'degraded' ? <MdWarning /> : <MdError />}
              </div>
              <div className="stat-description" style={{
                fontSize: '13px',
                color: systemStatus?.status === 'operational' ? '#28a745' : '#ffc107',
                fontWeight: '500',
                textTransform: 'capitalize'
              }}>
                {systemStatus?.status || 'Loading...'}
              </div>
              <div style={{
                fontSize: '11px',
                marginTop: '8px',
                opacity: 0.7,
                display: 'flex',
                alignItems: 'center',
                gap: '4px'
              }}>
                <MdTrendingUp /> View Details
              </div>
            </div>
          </div>
        </Link>
      </div>

      {activeTab === 'users' && (
        <>
          {/* Activity Stats */}
          {activityStats && activityStats.userStats && (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px', marginBottom: '24px' }}>
              <div className="card">
                <div className="stat-label">ACTIVE (7 DAYS)</div>
                <div className="stat-value">
                  {typeof activityStats.userStats.active_7_days === 'object' 
                    ? activityStats.userStats.active_7_days?.total || 0 
                    : activityStats.userStats.active_7_days || 0}
                </div>
              </div>
              <div className="card">
                <div className="stat-label">ACTIVE (30 DAYS)</div>
                <div className="stat-value">
                  {typeof activityStats.userStats.active_30_days === 'object' 
                    ? activityStats.userStats.active_30_days?.total || 0 
                    : activityStats.userStats.active_30_days || 0}
                </div>
              </div>
              <div className="card">
                <div className="stat-label">NEVER LOGGED IN</div>
                <div className="stat-value">
                  {typeof activityStats.userStats.never_logged_in === 'object' 
                    ? activityStats.userStats.never_logged_in?.total || 0 
                    : activityStats.userStats.never_logged_in || 0}
                </div>
              </div>
              <div className="card">
                <div className="stat-label">INACTIVE (90+ DAYS)</div>
                <div className="stat-value">
                  {typeof activityStats.userStats.inactive_90_days === 'object' 
                    ? activityStats.userStats.inactive_90_days?.total || 0 
                    : activityStats.userStats.inactive_90_days || 0}
                </div>
              </div>
            </div>
          )}

          {/* Inactive Users Toggle */}
          <div className="card" style={{ marginBottom: '24px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
              <div>
                <h3 style={{ fontSize: '16px', marginBottom: '4px' }}>Inactive Users Management</h3>
                <p style={{ fontSize: '13px', color: 'var(--text-secondary)', margin: 0 }}>
                  Clean up accounts that haven't logged in for a specified period
                </p>
              </div>
              <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                <select
                  value={inactiveDays}
                  onChange={(e) => setInactiveDays(Number(e.target.value))}
                  className="form-input"
                  style={{ width: 'auto' }}
                >
                  <option value={30}>30 days</option>
                  <option value={60}>60 days</option>
                  <option value={90}>90 days</option>
                  <option value={180}>180 days</option>
                  <option value={365}>1 year</option>
                </select>
                <button
                  onClick={() => setShowInactive(!showInactive)}
                  className="btn-primary"
                >
                  {showInactive ? 'Hide' : 'Show'} Inactive Users
                </button>
              </div>
            </div>

            {showInactive && inactiveUsers.length > 0 && (
              <div style={{ marginTop: '16px' }}>
                <div style={{ marginBottom: '12px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <p style={{ fontSize: '14px', margin: 0 }}>
                    Found <strong>{inactiveUsers.length}</strong> user(s) inactive for {inactiveDays}+ days
                  </p>
                  <button
                    onClick={handleBulkDeleteInactive}
                    className="btn-delete"
                  >
                    Delete All Inactive
                  </button>
                </div>
                <div style={{ maxHeight: '300px', overflowY: 'auto', border: '1px solid var(--border-color)', borderRadius: '6px' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                    <thead style={{ position: 'sticky', top: 0, background: 'var(--background-color)' }}>
                      <tr style={{ borderBottom: '1px solid var(--border-color)' }}>
                        <th style={{ textAlign: 'left', padding: '8px', fontSize: '13px' }}>Name</th>
                        <th style={{ textAlign: 'left', padding: '8px', fontSize: '13px' }}>Email</th>
                        <th style={{ textAlign: 'left', padding: '8px', fontSize: '13px' }}>Last Login</th>
                        <th style={{ textAlign: 'left', padding: '8px', fontSize: '13px' }}>Days Inactive</th>
                        <th style={{ textAlign: 'left', padding: '8px', fontSize: '13px' }}>Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {inactiveUsers.map(user => (
                        <tr key={user.id} style={{ borderBottom: '1px solid var(--border-color)' }}>
                          <td style={{ padding: '8px', fontSize: '13px' }}>{user.name}</td>
                          <td style={{ padding: '8px', fontSize: '13px' }}>{user.email}</td>
                          <td style={{ padding: '8px', fontSize: '13px' }}>
                            {user.last_login_at ? new Date(user.last_login_at).toLocaleDateString() : 'Never'}
                          </td>
                          <td style={{ padding: '8px', fontSize: '13px' }}>{user.days_since_login} days</td>
                          <td style={{ padding: '8px' }}>
                            <button
                              onClick={() => handleDeleteInactiveUsers([user.id])}
                              className="btn-delete"
                              style={{ padding: '4px 8px', fontSize: '12px' }}
                            >
                              Delete
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {showInactive && inactiveUsers.length === 0 && (
              <p style={{ marginTop: '16px', fontSize: '14px', color: 'var(--text-secondary)' }}>
                No inactive users found for {inactiveDays}+ days
              </p>
            )}
          </div>

          {/* All Users Table */}
          <div className="card">
            <h2>All Users</h2>
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: '20px' }}>
                <thead>
                  <tr style={{ borderBottom: '2px solid #ddd' }}>
                    <th style={{ textAlign: 'left', padding: '10px' }}>Name</th>
                    <th style={{ textAlign: 'left', padding: '10px' }}>Email</th>
                    <th style={{ textAlign: 'left', padding: '10px' }}>Role</th>
                    <th style={{ textAlign: 'left', padding: '10px' }}>Verification</th>
                    <th style={{ textAlign: 'left', padding: '10px' }}>Last Login</th>
                    <th style={{ textAlign: 'left', padding: '10px' }}>Login Count</th>
                    <th style={{ textAlign: 'left', padding: '10px' }}>Created</th>
                    <th style={{ textAlign: 'left', padding: '10px' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {users
                    .slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage)
                    .map(user => (
                    <tr key={user.id} style={{ borderBottom: '1px solid #eee' }}>
                      <td style={{ padding: '10px' }}>{user.name}</td>
                      <td style={{ padding: '10px' }}>{user.email}</td>
                      <td style={{ padding: '10px' }}>
                        <select
                          value={user.role}
                          onChange={(e) => handleRoleChange(user.id, e.target.value)}
                          style={{ padding: '5px' }}
                        >
                          <option value="freelancer">Freelancer</option>
                          <option value="admin">Admin</option>
                        </select>
                      </td>
                      <td style={{ padding: '10px' }}>
                        <select
                          value={
                            typeof user.email_verified === 'object' 
                              ? (user.email_verified?.verified ? 'verified' : 'unverified')
                              : (user.email_verified ? 'verified' : 'unverified')
                          }
                          onChange={(e) => handleVerificationChange(user.id, e.target.value === 'verified')}
                          style={{
                            padding: '5px',
                            borderColor: (typeof user.email_verified === 'object' ? user.email_verified?.verified : user.email_verified) ? '#28a745' : '#ffc107',
                            color: (typeof user.email_verified === 'object' ? user.email_verified?.verified : user.email_verified) ? '#28a745' : '#856404',
                            backgroundColor: (typeof user.email_verified === 'object' ? user.email_verified?.verified : user.email_verified) ? '#e8f5e9' : '#fff3cd'
                          }}
                        >
                          <option value="verified">Verified</option>
                          <option value="unverified">Unverified</option>
                        </select>
                      </td>
                      <td style={{ padding: '10px', fontSize: '13px' }}>
                        {user.last_login_at ? (
                          <>
                            {new Date(user.last_login_at).toLocaleDateString()}
                            <br />
                            <span style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>
                              {Math.floor((new Date() - new Date(user.last_login_at)) / (1000 * 60 * 60 * 24))} days ago
                            </span>
                          </>
                        ) : (
                          <span style={{ color: 'var(--text-secondary)' }}>Never</span>
                        )}
                      </td>
                      <td style={{ padding: '10px' }}>{user.login_count || 0}</td>
                      <td style={{ padding: '10px' }}>{new Date(user.created_at).toLocaleDateString()}</td>
                      <td style={{ padding: '10px' }}>
                        <button onClick={() => handleDeleteUser(user.id)} className="btn-delete">Delete</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <Pagination
              currentPage={currentPage}
              totalPages={Math.ceil(users.length / itemsPerPage)}
              totalItems={users.length}
              itemsPerPage={itemsPerPage}
              onPageChange={setCurrentPage}
              onItemsPerPageChange={(value) => {
                setItemsPerPage(value);
                setCurrentPage(1);
              }}
            />
          </div>
        </>
      )}

      {activeTab === 'quotes' && <QuotesManager />}

      {activeTab === 'maintenance' && <MaintenanceEditor />}

      {activeTab === 'legal' && <LegalEditor />}

      {activeTab === 'changelog' && <ChangelogEditor />}

      {activeTab === 'version-names' && <VersionNamesManager />}

      {activeTab === 'feedback' && <FeedbackManager />}

      {activeTab === 'announcements' && <AnnouncementsManager />}

      {activeTab === 'ai-assistant' && <AIAssistantManager />}
    </div>
  );
};

export default AdminPanel;
