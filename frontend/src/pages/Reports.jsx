import { useState, useEffect } from 'react';
import api from '../utils/api';
import logger from '../utils/logger';

const Reports = () => {
  const [activeTab, setActiveTab] = useState('financial');
  const [financialReport, setFinancialReport] = useState(null);
  const [projectReport, setProjectReport] = useState(null);
  const [clientReport, setClientReport] = useState(null);
  const [timeTrackingTasks, setTimeTrackingTasks] = useState([]);
  const [timeTrackingProjects, setTimeTrackingProjects] = useState([]);
  const [timeTrackingClients, setTimeTrackingClients] = useState([]);

  useEffect(() => {
    fetchReports();
  }, []);

  const fetchReports = async () => {
    try {
      const [financial, projects, clients, timeTasks, timeProjects, timeClients] = await Promise.all([
        api.get('/api/reports/financial'),
        api.get('/api/reports/projects'),
        api.get('/api/reports/clients'),
        api.get('/api/reports/time-tracking/tasks'),
        api.get('/api/reports/time-tracking/projects'),
        api.get('/api/reports/time-tracking/clients')
      ]);
      setFinancialReport(financial.data);
      setProjectReport(projects.data);
      setClientReport(clients.data);
      setTimeTrackingTasks(timeTasks.data || []);
      setTimeTrackingProjects(timeProjects.data || []);
      setTimeTrackingClients(timeClients.data || []);
    } catch (error) {
      logger.error('Error fetching reports:', error);
    }
  };

  const exportToCSV = (data, filename) => {
    const csv = convertToCSV(data);
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
  };

  const convertToCSV = (data) => {
    if (!data || data.length === 0) return '';
    const headers = Object.keys(data[0]).join(',');
    const rows = data.map(row => Object.values(row).join(','));
    return [headers, ...rows].join('\n');
  };

  return (
    <div className="container">
      <div style={{ marginBottom: '24px' }}>
        <h1 style={{ marginBottom: '4px' }}>Reports & Analytics</h1>
        <p className="page-subtitle">
          View insights and export data
        </p>
      </div>

      <div style={{ display: 'flex', gap: '8px', marginBottom: '32px' }}>
        <button
          onClick={() => setActiveTab('financial')}
          className={`view-toggle ${activeTab === 'financial' ? 'active' : ''}`}
        >
          Financial
        </button>
        <button
          onClick={() => setActiveTab('projects')}
          className={`view-toggle ${activeTab === 'projects' ? 'active' : ''}`}
        >
          Projects
        </button>
        <button
          onClick={() => setActiveTab('clients')}
          className={`view-toggle ${activeTab === 'clients' ? 'active' : ''}`}
        >
          Clients
        </button>
        <button
          onClick={() => setActiveTab('time-tracking')}
          className={`view-toggle ${activeTab === 'time-tracking' ? 'active' : ''}`}
        >
          Time Tracking
        </button>
      </div>

      {activeTab === 'financial' && financialReport && (
        <div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '12px', marginBottom: '32px' }}>
            <div className="card" style={{ padding: '16px' }}>
              <div className="stat-label" style={{ fontSize: '12px', marginBottom: '8px', fontWeight: '500' }}>
                TOTAL REVENUE
              </div>
              <div className="stat-value" style={{ fontSize: '28px', fontWeight: '600', marginBottom: '4px' }}>
                ${financialReport.totalRevenue.toFixed(2)}
              </div>
              <div className="stat-description" style={{ fontSize: '13px' }}>
                Paid invoices
              </div>
            </div>
            <div className="card" style={{ padding: '16px' }}>
              <div className="stat-label" style={{ fontSize: '12px', marginBottom: '8px', fontWeight: '500' }}>
                PENDING
              </div>
              <div className="stat-value" style={{ fontSize: '28px', fontWeight: '600', marginBottom: '4px' }}>
                ${financialReport.pendingAmount.toFixed(2)}
              </div>
              <div className="stat-description" style={{ fontSize: '13px' }}>
                Awaiting payment
              </div>
            </div>
            <div className="card" style={{ padding: '16px' }}>
              <div className="stat-label" style={{ fontSize: '12px', marginBottom: '8px', fontWeight: '500' }}>
                OVERDUE
              </div>
              <div className="stat-value" style={{ fontSize: '28px', fontWeight: '600', marginBottom: '4px' }}>
                ${financialReport.overdueAmount.toFixed(2)}
              </div>
              <div className="stat-description" style={{ fontSize: '13px' }}>
                Past due date
              </div>
            </div>
            <div className="card" style={{ padding: '16px' }}>
              <div className="stat-label" style={{ fontSize: '12px', marginBottom: '8px', fontWeight: '500' }}>
                TOTAL INVOICES
              </div>
              <div className="stat-value" style={{ fontSize: '28px', fontWeight: '600', marginBottom: '4px' }}>
                {financialReport.totalInvoices}
              </div>
              <div className="stat-description" style={{ fontSize: '13px' }}>
                All time
              </div>
            </div>
          </div>

          <div className="card">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <h2>Invoice Breakdown</h2>
              <button
                onClick={() => exportToCSV(financialReport.invoices, 'financial-report.csv')}
                className="btn-primary"
              >
                Export CSV
              </button>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '12px' }}>
              {Object.entries(financialReport.byStatus).map(([status, count]) => (
                <div key={status} style={{ textAlign: 'center', padding: '16px', background: 'rgba(55, 53, 47, 0.03)', borderRadius: '3px', border: '1px solid rgba(55, 53, 47, 0.09)' }}>
                  <p style={{ fontSize: '24px', fontWeight: '600', marginBottom: '4px', color: '#37352f' }}>{count}</p>
                  <p style={{ fontSize: '12px', color: 'rgba(55, 53, 47, 0.65)', textTransform: 'capitalize' }}>{status}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {activeTab === 'projects' && projectReport && (
        <div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '12px', marginBottom: '32px' }}>
            <div className="card" style={{ padding: '20px' }}>
              <h2 style={{ fontSize: '16px', fontWeight: '600', marginBottom: '16px' }}>Projects Overview</h2>
              <p style={{ fontSize: '48px', fontWeight: '600', color: '#37352f', margin: '20px 0' }}>{projectReport.totalProjects}</p>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '8px', marginTop: '20px' }}>
                {Object.entries(projectReport.byStatus).map(([status, count]) => (
                  <div key={status} style={{ padding: '12px', background: 'rgba(55, 53, 47, 0.03)', borderRadius: '3px', border: '1px solid rgba(55, 53, 47, 0.09)' }}>
                    <p style={{ fontSize: '20px', fontWeight: '600', color: '#37352f' }}>{count}</p>
                    <p style={{ fontSize: '12px', color: 'rgba(55, 53, 47, 0.65)', textTransform: 'capitalize' }}>{status}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="card" style={{ padding: '20px' }}>
              <h2 style={{ fontSize: '16px', fontWeight: '600', marginBottom: '16px' }}>Tasks Overview</h2>
              <p style={{ fontSize: '48px', fontWeight: '600', color: '#37352f', margin: '20px 0' }}>{projectReport.totalTasks}</p>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '8px', marginTop: '20px' }}>
                {Object.entries(projectReport.tasksByStatus).map(([status, count]) => (
                  <div key={status} style={{ padding: '12px', background: 'rgba(55, 53, 47, 0.03)', borderRadius: '3px', border: '1px solid rgba(55, 53, 47, 0.09)' }}>
                    <p style={{ fontSize: '20px', fontWeight: '600', color: '#37352f' }}>{count}</p>
                    <p style={{ fontSize: '12px', color: 'rgba(55, 53, 47, 0.65)', textTransform: 'capitalize' }}>{status.replace('-', ' ')}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="card">
            <button
              onClick={() => exportToCSV(projectReport.projects, 'projects-report.csv')}
              className="btn-primary"
              style={{ marginBottom: '20px' }}
            >
              Export Projects CSV
            </button>
          </div>
        </div>
      )}

      {activeTab === 'clients' && clientReport && (
        <div className="card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
            <h2>Client Performance</h2>
            <button
              onClick={() => exportToCSV(clientReport, 'clients-report.csv')}
              className="btn-primary"
            >
              Export CSV
            </button>
          </div>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ borderBottom: '2px solid #ddd' }}>
                <th style={{ textAlign: 'left', padding: '10px' }}>Client</th>
                <th style={{ textAlign: 'left', padding: '10px' }}>Company</th>
                <th style={{ textAlign: 'left', padding: '10px' }}>Projects</th>
                <th style={{ textAlign: 'left', padding: '10px' }}>Invoices</th>
                <th style={{ textAlign: 'left', padding: '10px' }}>Total Revenue</th>
              </tr>
            </thead>
            <tbody>
              {clientReport.map(client => (
                <tr key={client.id} style={{ borderBottom: '1px solid #eee' }}>
                  <td style={{ padding: '10px' }}><strong>{client.name}</strong></td>
                  <td style={{ padding: '10px' }}>{client.company || '-'}</td>
                  <td style={{ padding: '10px' }}>{client.projectCount}</td>
                  <td style={{ padding: '10px' }}>{client.invoiceCount}</td>
                  <td style={{ padding: '10px', fontWeight: '600' }}>${client.totalRevenue.toFixed(2)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {activeTab === 'time-tracking' && (
        <div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px', marginBottom: '32px' }}>
            <div className="card" style={{ padding: '16px' }}>
              <div className="stat-label" style={{ fontSize: '12px', marginBottom: '8px', fontWeight: '500' }}>
                TOTAL HOURS (TASKS)
              </div>
              <div className="stat-value" style={{ fontSize: '28px', fontWeight: '600', marginBottom: '4px' }}>
                {timeTrackingTasks.reduce((sum, t) => sum + parseFloat(t.total_hours || 0), 0).toFixed(1)}h
              </div>
              <div className="stat-description" style={{ fontSize: '13px' }}>
                Across {timeTrackingTasks.length} tasks
              </div>
            </div>
            <div className="card" style={{ padding: '16px' }}>
              <div className="stat-label" style={{ fontSize: '12px', marginBottom: '8px', fontWeight: '500' }}>
                TOTAL HOURS (PROJECTS)
              </div>
              <div className="stat-value" style={{ fontSize: '28px', fontWeight: '600', marginBottom: '4px' }}>
                {timeTrackingProjects.reduce((sum, p) => sum + parseFloat(p.total_hours || 0), 0).toFixed(1)}h
              </div>
              <div className="stat-description" style={{ fontSize: '13px' }}>
                Across {timeTrackingProjects.length} projects
              </div>
            </div>
            <div className="card" style={{ padding: '16px' }}>
              <div className="stat-label" style={{ fontSize: '12px', marginBottom: '8px', fontWeight: '500' }}>
                TOTAL HOURS (CLIENTS)
              </div>
              <div className="stat-value" style={{ fontSize: '28px', fontWeight: '600', marginBottom: '4px' }}>
                {timeTrackingClients.reduce((sum, c) => sum + parseFloat(c.total_hours || 0), 0).toFixed(1)}h
              </div>
              <div className="stat-description" style={{ fontSize: '13px' }}>
                Across {timeTrackingClients.length} clients
              </div>
            </div>
          </div>

          <div className="card" style={{ marginBottom: '20px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <h2>Time by Task</h2>
              <button
                onClick={() => exportToCSV(timeTrackingTasks, 'time-by-task.csv')}
                className="btn-primary"
              >
                Export CSV
              </button>
            </div>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ borderBottom: '2px solid #ddd' }}>
                  <th style={{ textAlign: 'left', padding: '10px' }}>Task</th>
                  <th style={{ textAlign: 'left', padding: '10px' }}>Project</th>
                  <th style={{ textAlign: 'left', padding: '10px' }}>Client</th>
                  <th style={{ textAlign: 'center', padding: '10px' }}>Sessions</th>
                  <th style={{ textAlign: 'right', padding: '10px' }}>Total Hours</th>
                </tr>
              </thead>
              <tbody>
                {timeTrackingTasks.map((task, idx) => (
                  <tr key={idx} style={{ borderBottom: '1px solid #eee' }}>
                    <td style={{ padding: '10px', fontWeight: '500' }}>{task.task_title || 'No Task'}</td>
                    <td style={{ padding: '10px' }}>{task.project_name || '-'}</td>
                    <td style={{ padding: '10px' }}>{task.client_name || '-'}</td>
                    <td style={{ padding: '10px', textAlign: 'center' }}>{task.session_count}</td>
                    <td style={{ padding: '10px', textAlign: 'right', fontWeight: '600' }}>{task.total_hours}h</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="card" style={{ marginBottom: '20px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <h2>Time by Project</h2>
              <button
                onClick={() => exportToCSV(timeTrackingProjects, 'time-by-project.csv')}
                className="btn-primary"
              >
                Export CSV
              </button>
            </div>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ borderBottom: '2px solid #ddd' }}>
                  <th style={{ textAlign: 'left', padding: '10px' }}>Project</th>
                  <th style={{ textAlign: 'left', padding: '10px' }}>Client</th>
                  <th style={{ textAlign: 'center', padding: '10px' }}>Tasks</th>
                  <th style={{ textAlign: 'center', padding: '10px' }}>Sessions</th>
                  <th style={{ textAlign: 'right', padding: '10px' }}>Total Hours</th>
                </tr>
              </thead>
              <tbody>
                {timeTrackingProjects.map((project, idx) => (
                  <tr key={idx} style={{ borderBottom: '1px solid #eee' }}>
                    <td style={{ padding: '10px', fontWeight: '500' }}>{project.project_name || 'No Project'}</td>
                    <td style={{ padding: '10px' }}>{project.client_name || '-'}</td>
                    <td style={{ padding: '10px', textAlign: 'center' }}>{project.task_count}</td>
                    <td style={{ padding: '10px', textAlign: 'center' }}>{project.session_count}</td>
                    <td style={{ padding: '10px', textAlign: 'right', fontWeight: '600' }}>{project.total_hours}h</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="card">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <h2>Time by Client</h2>
              <button
                onClick={() => exportToCSV(timeTrackingClients, 'time-by-client.csv')}
                className="btn-primary"
              >
                Export CSV
              </button>
            </div>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ borderBottom: '2px solid #ddd' }}>
                  <th style={{ textAlign: 'left', padding: '10px' }}>Client</th>
                  <th style={{ textAlign: 'center', padding: '10px' }}>Projects</th>
                  <th style={{ textAlign: 'center', padding: '10px' }}>Tasks</th>
                  <th style={{ textAlign: 'center', padding: '10px' }}>Sessions</th>
                  <th style={{ textAlign: 'right', padding: '10px' }}>Total Hours</th>
                </tr>
              </thead>
              <tbody>
                {timeTrackingClients.map((client, idx) => (
                  <tr key={idx} style={{ borderBottom: '1px solid #eee' }}>
                    <td style={{ padding: '10px', fontWeight: '500' }}>{client.client_name || 'No Client'}</td>
                    <td style={{ padding: '10px', textAlign: 'center' }}>{client.project_count}</td>
                    <td style={{ padding: '10px', textAlign: 'center' }}>{client.task_count}</td>
                    <td style={{ padding: '10px', textAlign: 'center' }}>{client.session_count}</td>
                    <td style={{ padding: '10px', textAlign: 'right', fontWeight: '600' }}>{client.total_hours}h</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default Reports;
