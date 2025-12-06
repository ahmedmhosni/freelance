import { useState, useEffect } from 'react';
import { api, logger } from '../../../shared';
import { 
  BarChart, Bar, PieChart, Pie, LineChart, Line, 
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, 
  ResponsiveContainer, Cell 
} from 'recharts';

// Chart colors
const COLORS = {
  primary: '#2eaadc',
  success: '#28a745',
  warning: '#ffc107',
  danger: '#dc3545',
  info: '#17a2b8',
  secondary: '#6c757d',
  purple: '#6f42c1',
  orange: '#fd7e14'
};

const STATUS_COLORS = {
  draft: COLORS.secondary,
  sent: COLORS.info,
  paid: COLORS.success,
  overdue: COLORS.danger,
  cancelled: COLORS.secondary,
  active: COLORS.success,
  completed: COLORS.primary,
  'on-hold': COLORS.warning,
  todo: COLORS.secondary,
  'in-progress': COLORS.info,
  review: COLORS.warning,
  done: COLORS.success
};

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
        api.get('/reports/financial'),
        api.get('/reports/projects'),
        api.get('/reports/clients'),
        api.get('/reports/time-tracking/tasks'),
        api.get('/reports/time-tracking/projects'),
        api.get('/reports/time-tracking/clients')
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

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '20px' }}>
            <div className="card">
              <h3 style={{ fontSize: '16px', fontWeight: '600', marginBottom: '16px' }}>Invoice Status Distribution</h3>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={Object.entries(financialReport.byStatus).map(([status, count]) => ({
                      name: status.charAt(0).toUpperCase() + status.slice(1),
                      value: count
                    }))}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {Object.keys(financialReport.byStatus).map((status, index) => (
                      <Cell key={`cell-${index}`} fill={STATUS_COLORS[status] || COLORS.secondary} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>

            <div className="card">
              <h3 style={{ fontSize: '16px', fontWeight: '600', marginBottom: '16px' }}>Revenue Overview</h3>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart
                  data={[
                    { name: 'Paid', amount: financialReport.totalRevenue, color: COLORS.success },
                    { name: 'Pending', amount: financialReport.pendingAmount, color: COLORS.info },
                    { name: 'Overdue', amount: financialReport.overdueAmount, color: COLORS.danger }
                  ]}
                  margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip formatter={(value) => `$${value.toFixed(2)}`} />
                  <Bar dataKey="amount" fill={COLORS.primary}>
                    {[
                      { name: 'Paid', amount: financialReport.totalRevenue },
                      { name: 'Pending', amount: financialReport.pendingAmount },
                      { name: 'Overdue', amount: financialReport.overdueAmount }
                    ].map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={index === 0 ? COLORS.success : index === 1 ? COLORS.info : COLORS.danger} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
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
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '16px', marginBottom: '20px' }}>
            <div className="card">
              <h3 style={{ fontSize: '16px', fontWeight: '600', marginBottom: '16px' }}>Projects by Status</h3>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={Object.entries(projectReport.byStatus).map(([status, count]) => ({
                      name: status.charAt(0).toUpperCase() + status.slice(1).replace('-', ' '),
                      value: count
                    }))}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => percent > 0 ? `${name}: ${(percent * 100).toFixed(0)}%` : ''}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {Object.keys(projectReport.byStatus).map((status, index) => (
                      <Cell key={`cell-${index}`} fill={STATUS_COLORS[status] || COLORS.secondary} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
              <div style={{ textAlign: 'center', marginTop: '16px' }}>
                <p style={{ fontSize: '32px', fontWeight: '600', color: '#37352f' }}>{projectReport.totalProjects}</p>
                <p style={{ fontSize: '13px', color: 'rgba(55, 53, 47, 0.65)' }}>Total Projects</p>
              </div>
            </div>

            <div className="card">
              <h3 style={{ fontSize: '16px', fontWeight: '600', marginBottom: '16px' }}>Tasks by Status</h3>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart
                  data={Object.entries(projectReport.tasksByStatus).map(([status, count]) => ({
                    name: status.charAt(0).toUpperCase() + status.slice(1).replace('-', ' '),
                    count: count,
                    status: status
                  }))}
                  margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="count" fill={COLORS.primary}>
                    {Object.keys(projectReport.tasksByStatus).map((status, index) => (
                      <Cell key={`cell-${index}`} fill={STATUS_COLORS[status] || COLORS.secondary} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
              <div style={{ textAlign: 'center', marginTop: '16px' }}>
                <p style={{ fontSize: '32px', fontWeight: '600', color: '#37352f' }}>{projectReport.totalTasks}</p>
                <p style={{ fontSize: '13px', color: 'rgba(55, 53, 47, 0.65)' }}>Total Tasks</p>
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
        <div>
          {clientReport.length > 0 && (
            <div className="card" style={{ marginBottom: '20px' }}>
              <h3 style={{ fontSize: '16px', fontWeight: '600', marginBottom: '16px' }}>Top Clients by Revenue</h3>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart
                  data={clientReport
                    .sort((a, b) => b.totalRevenue - a.totalRevenue)
                    .slice(0, 10)
                    .map(client => ({
                      name: client.name.length > 15 ? client.name.substring(0, 15) + '...' : client.name,
                      revenue: client.totalRevenue,
                      projects: client.projectCount,
                      invoices: client.invoiceCount
                    }))}
                  margin={{ top: 20, right: 30, left: 20, bottom: 60 }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" angle={-45} textAnchor="end" height={100} />
                  <YAxis />
                  <Tooltip 
                    formatter={(value, name) => {
                      if (name === 'revenue') return [`$${value.toFixed(2)}`, 'Revenue'];
                      if (name === 'projects') return [value, 'Projects'];
                      if (name === 'invoices') return [value, 'Invoices'];
                      return value;
                    }}
                  />
                  <Legend />
                  <Bar dataKey="revenue" fill={COLORS.success} name="Revenue" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}

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

          {/* Time Tracking Charts */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '20px' }}>
            {timeTrackingTasks.length > 0 && (
              <div className="card">
                <h3 style={{ fontSize: '16px', fontWeight: '600', marginBottom: '16px' }}>Top 10 Tasks by Hours</h3>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart
                    data={timeTrackingTasks
                      .sort((a, b) => parseFloat(b.total_hours) - parseFloat(a.total_hours))
                      .slice(0, 10)
                      .map(task => ({
                        name: (task.task_title || 'No Task').length > 20 
                          ? (task.task_title || 'No Task').substring(0, 20) + '...' 
                          : (task.task_title || 'No Task'),
                        hours: parseFloat(task.total_hours || 0)
                      }))}
                    margin={{ top: 20, right: 30, left: 20, bottom: 60 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" angle={-45} textAnchor="end" height={100} />
                    <YAxis />
                    <Tooltip formatter={(value) => [`${value}h`, 'Hours']} />
                    <Bar dataKey="hours" fill={COLORS.primary} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            )}

            {timeTrackingProjects.length > 0 && (
              <div className="card">
                <h3 style={{ fontSize: '16px', fontWeight: '600', marginBottom: '16px' }}>Top 10 Projects by Hours</h3>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart
                    data={timeTrackingProjects
                      .sort((a, b) => parseFloat(b.total_hours) - parseFloat(a.total_hours))
                      .slice(0, 10)
                      .map(project => ({
                        name: (project.project_name || 'No Project').length > 20 
                          ? (project.project_name || 'No Project').substring(0, 20) + '...' 
                          : (project.project_name || 'No Project'),
                        hours: parseFloat(project.total_hours || 0)
                      }))}
                    margin={{ top: 20, right: 30, left: 20, bottom: 60 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" angle={-45} textAnchor="end" height={100} />
                    <YAxis />
                    <Tooltip formatter={(value) => [`${value}h`, 'Hours']} />
                    <Bar dataKey="hours" fill={COLORS.success} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            )}
          </div>

          {timeTrackingClients.length > 0 && (
            <div className="card" style={{ marginBottom: '20px' }}>
              <h3 style={{ fontSize: '16px', fontWeight: '600', marginBottom: '16px' }}>Time Distribution by Client</h3>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={timeTrackingClients
                      .sort((a, b) => parseFloat(b.total_hours) - parseFloat(a.total_hours))
                      .slice(0, 8)
                      .map(client => ({
                        name: client.client_name || 'No Client',
                        value: parseFloat(client.total_hours || 0)
                      }))}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => percent > 0.05 ? `${name}: ${(percent * 100).toFixed(0)}%` : ''}
                    outerRadius={100}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {timeTrackingClients.slice(0, 8).map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={Object.values(COLORS)[index % Object.values(COLORS).length]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value) => [`${value}h`, 'Hours']} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          )}

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
