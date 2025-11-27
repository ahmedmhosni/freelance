import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../utils/api';
import QuotesManager from '../components/QuotesManager';
import MaintenanceEditor from '../components/MaintenanceEditor';
import LegalEditor from '../components/LegalEditor';
import { MdCheckCircle, MdError, MdWarning, MdTrendingUp } from 'react-icons/md';

const AdminPanel = () => {
  const [users, setUsers] = useState([]);
  const [stats, setStats] = useState({ users: 0, projects: 0, invoices: 0, revenue: 0 });
  const [systemStatus, setSystemStatus] = useState(null);
  const [activeTab, setActiveTab] = useState('users');

  useEffect(() => {
    fetchUsers();
    fetchStats();
    fetchSystemStatus();
  }, []);

  const fetchSystemStatus = async () => {
    try {
      const response = await api.get('/api/status');
      setSystemStatus(response.data);
    } catch (error) {
      console.error('Error fetching system status:', error);
    }
  };

  const fetchUsers = async () => {
    try {
      const response = await api.get('/api/admin/users');
      setUsers(response.data);
    } catch (error) {
      console.error('Error fetching users:', error);
    }
  };

  const fetchStats = async () => {
    try {
      const response = await api.get('/api/admin/reports');
      setStats(response.data);
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  const handleRoleChange = async (userId, newRole) => {
    try {
      await api.put(`/api/admin/users/${userId}/role`, { role: newRole });
      fetchUsers();
    } catch (error) {
      console.error('Error updating role:', error);
    }
  };

  const handleDeleteUser = async (userId) => {
    if (confirm('Delete this user? This will delete all their data.')) {
      try {
        await api.delete(`/api/admin/users/${userId}`);
        fetchUsers();
      } catch (error) {
        console.error('Error deleting user:', error);
      }
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
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '12px', marginBottom: '32px' }}>
        <div className="card" style={{ padding: '16px' }}>
          <div className="stat-label" style={{ fontSize: '12px', marginBottom: '8px', fontWeight: '500' }}>
            TOTAL USERS
          </div>
          <div className="stat-value" style={{ fontSize: '28px', fontWeight: '600', marginBottom: '4px' }}>
            {stats.users}
          </div>
          <div className="stat-description" style={{ fontSize: '13px' }}>
            Registered accounts
          </div>
        </div>
        <div className="card" style={{ padding: '16px' }}>
          <div className="stat-label" style={{ fontSize: '12px', marginBottom: '8px', fontWeight: '500' }}>
            TOTAL PROJECTS
          </div>
          <div className="stat-value" style={{ fontSize: '28px', fontWeight: '600', marginBottom: '4px' }}>
            {stats.projects}
          </div>
          <div className="stat-description" style={{ fontSize: '13px' }}>
            All projects
          </div>
        </div>
        <div className="card" style={{ padding: '16px' }}>
          <div className="stat-label" style={{ fontSize: '12px', marginBottom: '8px', fontWeight: '500' }}>
            TOTAL INVOICES
          </div>
          <div className="stat-value" style={{ fontSize: '28px', fontWeight: '600', marginBottom: '4px' }}>
            {stats.invoices}
          </div>
          <div className="stat-description" style={{ fontSize: '13px' }}>
            All invoices
          </div>
        </div>
        <div className="card" style={{ padding: '16px' }}>
          <div className="stat-label" style={{ fontSize: '12px', marginBottom: '8px', fontWeight: '500' }}>
            TOTAL REVENUE
          </div>
          <div className="stat-value" style={{ fontSize: '28px', fontWeight: '600', marginBottom: '4px' }}>
            ${stats.revenue}
          </div>
          <div className="stat-description" style={{ fontSize: '13px' }}>
            System-wide
          </div>
        </div>
        
        {/* System Status Card */}
        <Link to="/admin/status" style={{ textDecoration: 'none' }}>
          <div className="card" style={{ 
            padding: '16px', 
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
            <div className="stat-label" style={{ fontSize: '12px', marginBottom: '8px', fontWeight: '500' }}>
              SYSTEM STATUS
            </div>
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
        </Link>
      </div>

      {activeTab === 'users' && (
        <div className="card">
          <h2>User Management</h2>
          <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: '20px' }}>
            <thead>
              <tr style={{ borderBottom: '2px solid #ddd' }}>
                <th style={{ textAlign: 'left', padding: '10px' }}>Name</th>
                <th style={{ textAlign: 'left', padding: '10px' }}>Email</th>
                <th style={{ textAlign: 'left', padding: '10px' }}>Role</th>
                <th style={{ textAlign: 'left', padding: '10px' }}>Created</th>
                <th style={{ textAlign: 'left', padding: '10px' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.map(user => (
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
                  <td style={{ padding: '10px' }}>{new Date(user.created_at).toLocaleDateString()}</td>
                  <td style={{ padding: '10px' }}>
                    <button onClick={() => handleDeleteUser(user.id)} className="btn-delete">Delete</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {activeTab === 'quotes' && <QuotesManager />}
      
      {activeTab === 'maintenance' && <MaintenanceEditor />}
      
      {activeTab === 'legal' && <LegalEditor />}
    </div>
  );
};

export default AdminPanel;
