import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../utils/api';
import DashboardCharts from '../components/DashboardCharts';
import LogoLoader from '../components/LogoLoader';
import { MdPeople, MdFolder, MdCheckCircle, MdAttachMoney, MdAccessTime } from 'react-icons/md';

const Dashboard = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({ clients: 0, projects: 0, tasks: 0, invoices: 0 });
  const [recentTasks, setRecentTasks] = useState([]);
  const [taskData, setTaskData] = useState([]);
  const [invoiceData, setInvoiceData] = useState([]);

  useEffect(() => {
    const loadDashboard = async () => {
      setLoading(true);
      await Promise.all([
        fetchStats(),
        fetchRecentTasks(),
        fetchChartData()
      ]);
      setLoading(false);
    };
    loadDashboard();
  }, []);

  const fetchStats = async () => {
    try {
      const response = await api.get('/api/dashboard/stats');
      setStats(response.data);
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  const fetchRecentTasks = async () => {
    try {
      const response = await api.get('/api/dashboard/recent-tasks?limit=5');
      const tasks = response.data.map(task => ({
        ...task,
        projectName: task.project_name || 'No Project'
      }));
      setRecentTasks(tasks);
    } catch (error) {
      console.error('Error fetching tasks:', error);
      setRecentTasks([]);
    }
  };

  const fetchChartData = async () => {
    try {
      const response = await api.get('/api/dashboard/charts');
      setTaskData(response.data.taskData || []);
      setInvoiceData(response.data.invoiceData || []);
    } catch (error) {
      console.error('Error fetching chart data:', error);
      setTaskData([]);
      setInvoiceData([]);
    }
  };

  if (loading) {
    return (
      <div className="container" style={{ 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center', 
        minHeight: '60vh' 
      }}>
        <LogoLoader size={80} text="" />
      </div>
    );
  }

  return (
    <div className="container">
      <div style={{ marginBottom: '32px' }}>
        <h1 style={{ marginBottom: '4px' }}>Dashboard</h1>
        <p className="page-subtitle">
          Welcome back, {user?.name}
        </p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '12px', marginBottom: '32px' }}>
        <div className="card" style={{ padding: '16px', display: 'flex', alignItems: 'start', gap: '12px' }}>
          <div style={{ fontSize: '32px', color: 'rgba(55, 53, 47, 0.4)' }}>
            <MdPeople />
          </div>
          <div style={{ flex: 1 }}>
            <div className="stat-label" style={{ fontSize: '12px', marginBottom: '8px', fontWeight: '500' }}>
              CLIENTS
            </div>
            <div className="stat-value" style={{ fontSize: '28px', fontWeight: '600', marginBottom: '4px' }}>
              {stats.clients}
            </div>
            <div className="stat-description" style={{ fontSize: '13px' }}>
              Total clients
            </div>
          </div>
        </div>
        
        <div className="card" style={{ padding: '16px', display: 'flex', alignItems: 'start', gap: '12px' }}>
          <div style={{ fontSize: '32px', color: 'rgba(55, 53, 47, 0.4)' }}>
            <MdFolder />
          </div>
          <div style={{ flex: 1 }}>
            <div className="stat-label" style={{ fontSize: '12px', marginBottom: '8px', fontWeight: '500' }}>
              PROJECTS
            </div>
            <div className="stat-value" style={{ fontSize: '28px', fontWeight: '600', marginBottom: '4px' }}>
              {stats.projects}
            </div>
            <div className="stat-description" style={{ fontSize: '13px' }}>
              {stats.activeProjects} active
            </div>
          </div>
        </div>
        
        <div className="card" style={{ padding: '16px', display: 'flex', alignItems: 'start', gap: '12px' }}>
          <div style={{ fontSize: '32px', color: 'rgba(55, 53, 47, 0.4)' }}>
            <MdCheckCircle />
          </div>
          <div style={{ flex: 1 }}>
            <div className="stat-label" style={{ fontSize: '12px', marginBottom: '8px', fontWeight: '500' }}>
              TASKS
            </div>
            <div className="stat-value" style={{ fontSize: '28px', fontWeight: '600', marginBottom: '4px' }}>
              {stats.tasks}
            </div>
            <div className="stat-description" style={{ fontSize: '13px' }}>
              {stats.activeTasks} pending
            </div>
          </div>
        </div>
        
        <div className="card" style={{ padding: '16px', display: 'flex', alignItems: 'start', gap: '12px' }}>
          <div style={{ fontSize: '32px', color: 'rgba(55, 53, 47, 0.4)' }}>
            <MdAttachMoney />
          </div>
          <div style={{ flex: 1 }}>
            <div className="stat-label" style={{ fontSize: '12px', marginBottom: '8px', fontWeight: '500' }}>
              REVENUE
            </div>
            <div className="stat-value" style={{ fontSize: '28px', fontWeight: '600', marginBottom: '4px' }}>
              ${stats.totalRevenue?.toFixed(0) || 0}
            </div>
            <div className="stat-description" style={{ fontSize: '13px' }}>
              {stats.pendingInvoices} pending
            </div>
          </div>
        </div>
      </div>

      {taskData.length > 0 && invoiceData.length > 0 && (
        <DashboardCharts taskData={taskData} invoiceData={invoiceData} />
      )}

      <div className="card" style={{ marginTop: '24px', padding: '20px' }}>
        <div style={{ marginBottom: '16px' }}>
          <h2 style={{ margin: 0, fontSize: '16px', fontWeight: '600' }}>Upcoming Tasks</h2>
          <p className="page-subtitle" style={{ margin: '4px 0 0 0' }}>
            Next 5 tasks by due date
          </p>
        </div>
        {recentTasks.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '40px', color: 'rgba(55, 53, 47, 0.4)' }}>
            <div style={{ fontSize: '48px', marginBottom: '8px' }}><MdCheckCircle /></div>
            <p style={{ fontSize: '14px' }}>No pending tasks</p>
          </div>
        ) : (
          <div>
            {recentTasks.map(task => {
              const isOverdue = task.due_date && new Date(task.due_date) < new Date();
              
              return (
                <div key={task.id} style={{ 
                  padding: '12px 0', 
                  borderBottom: '1px solid rgba(55, 53, 47, 0.09)',
                  display: 'flex', 
                  justifyContent: 'space-between',
                  alignItems: 'start',
                  transition: 'all 0.15s ease'
                }}>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                      <span style={{ fontSize: '14px', fontWeight: '500', color: '#37352f' }}>
                        {task.title}
                      </span>
                      <span style={{ 
                        fontSize: '11px',
                        padding: '2px 6px',
                        borderRadius: '2px',
                        background: task.priority === 'urgent' ? 'rgba(55, 53, 47, 0.16)' : 
                                   task.priority === 'high' ? 'rgba(55, 53, 47, 0.12)' :
                                   task.priority === 'medium' ? 'rgba(55, 53, 47, 0.08)' : 'rgba(55, 53, 47, 0.06)',
                        color: task.priority === 'urgent' ? 'rgba(55, 53, 47, 0.9)' : 
                               task.priority === 'high' ? 'rgba(55, 53, 47, 0.8)' :
                               task.priority === 'medium' ? 'rgba(55, 53, 47, 0.7)' : 'rgba(55, 53, 47, 0.65)',
                        fontWeight: task.priority === 'urgent' || task.priority === 'high' ? '600' : '500'
                      }}>
                        {task.priority}
                      </span>
                    </div>
                    {task.description && (
                      <p style={{ fontSize: '13px', color: 'rgba(55, 53, 47, 0.65)', margin: '4px 0' }}>
                        {task.description}
                      </p>
                    )}
                    <div style={{ display: 'flex', gap: '12px', fontSize: '12px', color: 'rgba(55, 53, 47, 0.5)', marginTop: '6px' }}>
                      {task.projectName && (
                        <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                          <MdFolder size={14} /> {task.projectName}
                        </span>
                      )}
                      {task.due_date && (
                        <span style={{ 
                          color: isOverdue ? 'rgba(55, 53, 47, 0.9)' : 'rgba(55, 53, 47, 0.5)', 
                          display: 'flex', 
                          alignItems: 'center', 
                          gap: '4px',
                          fontWeight: isOverdue ? '600' : '400'
                        }}>
                          <MdAccessTime size={14} /> {new Date(task.due_date).toLocaleDateString()}
                          {isOverdue && ' • Overdue'}
                        </span>
                      )}
                    </div>
                  </div>
                  <div style={{ marginLeft: '16px' }}>
                    <span style={{ 
                      fontSize: '11px', 
                      padding: '3px 8px',
                      borderRadius: '2px',
                      background: task.status === 'done' ? 'rgba(55, 53, 47, 0.16)' : 'rgba(55, 53, 47, 0.08)',
                      color: task.status === 'done' ? 'rgba(55, 53, 47, 0.9)' : 'rgba(55, 53, 47, 0.65)',
                      fontWeight: task.status === 'done' ? '600' : '500'
                    }}>
                      {task.status.replace('-', ' ')}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
