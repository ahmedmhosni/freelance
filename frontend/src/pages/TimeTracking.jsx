import { useState, useEffect } from 'react';
import api from '../utils/api';

const TimeTracking = () => {
  const [entries, setEntries] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [projects, setProjects] = useState([]);
  const [activeEntry, setActiveEntry] = useState(null);
  const [summary, setSummary] = useState({ total_hours: 0, total_entries: 0 });
  const [formData, setFormData] = useState({
    task_id: '', project_id: '', description: ''
  });

  useEffect(() => {
    fetchEntries();
    fetchTasks();
    fetchProjects();
    fetchSummary();
    
    // Check for running timer
    const interval = setInterval(checkActiveTimer, 1000);
    return () => clearInterval(interval);
  }, []);

  const fetchEntries = async () => {
    try {
      const response = await api.get('/api/time-tracking');
      const data = response.data.data || response.data;
      setEntries(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Error fetching entries:', error);
      setEntries([]);
    }
  };

  const fetchTasks = async () => {
    try {
      const response = await api.get('/api/tasks');
      const data = response.data.data || response.data;
      setTasks(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Error fetching tasks:', error);
      setTasks([]);
    }
  };

  const fetchProjects = async () => {
    try {
      const response = await api.get('/api/projects');
      const data = response.data.data || response.data;
      setProjects(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Error fetching projects:', error);
      setProjects([]);
    }
  };

  const fetchSummary = async () => {
    try {
      const response = await api.get('/api/time-tracking/summary');
      setSummary(response.data || { total_hours: 0, total_entries: 0 });
    } catch (error) {
      console.error('Error fetching summary:', error);
      setSummary({ total_hours: 0, total_entries: 0 });
    }
  };

  const checkActiveTimer = () => {
    const running = entries.find(e => e.is_running === 1);
    setActiveEntry(running);
  };

  const startTimer = async () => {
    if (!formData.description && !formData.task_id && !formData.project_id) {
      alert('Please provide a description, task, or project');
      return;
    }
    try {
      await api.post('/api/time-tracking/start', formData);
      setFormData({ task_id: '', project_id: '', description: '' });
      await fetchEntries();
      await fetchSummary();
    } catch (error) {
      console.error('Error starting timer:', error);
      alert('Failed to start timer');
    }
  };

  const stopTimer = async (id) => {
    try {
      await api.post(`/api/time-tracking/stop/${id}`);
      await fetchEntries();
      await fetchSummary();
      setActiveEntry(null);
    } catch (error) {
      console.error('Error stopping timer:', error);
      alert('Failed to stop timer');
    }
  };

  const deleteEntry = async (id) => {
    if (!confirm('Delete this time entry?')) return;
    try {
      await api.delete(`/api/time-tracking/${id}`);
      await fetchEntries();
      await fetchSummary();
    } catch (error) {
      console.error('Error deleting entry:', error);
      alert('Failed to delete entry');
    }
  };

  const formatDuration = (hours) => {
    if (!hours) return '0h 0m';
    const h = Math.floor(hours);
    const m = Math.round((hours - h) * 60);
    return `${h}h ${m}m`;
  };

  return (
    <div className="container">
      <div style={{ marginBottom: '24px' }}>
        <h1 style={{ marginBottom: '4px' }}>Time Tracking</h1>
        <p className="page-subtitle">
          Track your billable hours
        </p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px', marginBottom: '32px' }}>
        <div className="card" style={{ padding: '16px' }}>
          <div className="stat-label" style={{ fontSize: '12px', marginBottom: '8px', fontWeight: '500' }}>
            TOTAL HOURS
          </div>
          <div className="stat-value" style={{ fontSize: '28px', fontWeight: '600', marginBottom: '4px' }}>
            {formatDuration(summary.total_hours)}
          </div>
          <div className="stat-description" style={{ fontSize: '13px' }}>
            All time tracked
          </div>
        </div>
        <div className="card" style={{ padding: '16px' }}>
          <div className="stat-label" style={{ fontSize: '12px', marginBottom: '8px', fontWeight: '500' }}>
            TOTAL ENTRIES
          </div>
          <div className="stat-value" style={{ fontSize: '28px', fontWeight: '600', marginBottom: '4px' }}>
            {summary.total_entries || 0}
          </div>
          <div className="stat-description" style={{ fontSize: '13px' }}>
            Time sessions
          </div>
        </div>
        <div className="card" style={{ padding: '16px' }}>
          <div className="stat-label" style={{ fontSize: '12px', marginBottom: '8px', fontWeight: '500' }}>
            STATUS
          </div>
          <div className="stat-value" style={{ fontSize: '28px', fontWeight: '600', marginBottom: '4px' }}>
            {activeEntry ? 'Running' : 'Stopped'}
          </div>
          <div className="stat-description" style={{ fontSize: '13px' }}>
            {activeEntry ? 'Timer active' : 'No active timer'}
          </div>
        </div>
      </div>

      <div className="card" style={{ marginBottom: '30px' }}>
        <h2>Start New Timer</h2>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 2fr auto', gap: '10px', marginTop: '15px' }}>
          <select value={formData.task_id} onChange={(e) => setFormData({...formData, task_id: e.target.value})}>
            <option value="">Select Task (Optional)</option>
            {tasks.map(task => (
              <option key={task.id} value={task.id}>{task.title}</option>
            ))}
          </select>
          <select value={formData.project_id} onChange={(e) => setFormData({...formData, project_id: e.target.value})}>
            <option value="">Select Project (Optional)</option>
            {projects.map(project => (
              <option key={project.id} value={project.id}>{project.title}</option>
            ))}
          </select>
          <input
            placeholder="What are you working on?"
            value={formData.description}
            onChange={(e) => setFormData({...formData, description: e.target.value})}
          />
          <button
            onClick={activeEntry ? () => stopTimer(activeEntry.id) : startTimer}
            className="btn-primary"
            style={{ minWidth: '120px' }}
          >
            {activeEntry ? 'Stop' : 'Start'}
          </button>
        </div>
      </div>

      <div className="card">
        <h2>Time Entries</h2>
        <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: '20px' }}>
          <thead>
            <tr style={{ borderBottom: '2px solid #ddd' }}>
              <th style={{ textAlign: 'left', padding: '10px' }}>Date</th>
              <th style={{ textAlign: 'left', padding: '10px' }}>Description</th>
              <th style={{ textAlign: 'left', padding: '10px' }}>Start</th>
              <th style={{ textAlign: 'left', padding: '10px' }}>End</th>
              <th style={{ textAlign: 'left', padding: '10px' }}>Duration</th>
              <th style={{ textAlign: 'left', padding: '10px' }}>Status</th>
              <th style={{ textAlign: 'right', padding: '10px' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {entries.map(entry => (
              <tr key={entry.id} style={{ borderBottom: '1px solid #eee' }}>
                <td style={{ padding: '10px' }}>{new Date(entry.date).toLocaleDateString()}</td>
                <td style={{ padding: '10px' }}>{entry.description || '-'}</td>
                <td style={{ padding: '10px' }}>{entry.start_time}</td>
                <td style={{ padding: '10px' }}>{entry.end_time || '-'}</td>
                <td style={{ padding: '10px', fontWeight: '600' }}>{formatDuration(entry.duration)}</td>
                <td style={{ padding: '10px' }}>
                  {entry.is_running ? (
                    <span className="status-badge status-active">Running</span>
                  ) : (
                    <span className="status-badge status-completed">Completed</span>
                  )}
                </td>
                <td style={{ padding: '10px', textAlign: 'right' }}>
                  {entry.is_running ? (
                    <button 
                      onClick={() => stopTimer(entry.id)}
                      className="btn-primary"
                      style={{ marginRight: '8px', fontSize: '13px' }}
                    >
                      Stop
                    </button>
                  ) : null}
                  <button 
                    onClick={() => deleteEntry(entry.id)}
                    className="btn-delete"
                    style={{ fontSize: '13px' }}
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
  );
};

export default TimeTracking;
