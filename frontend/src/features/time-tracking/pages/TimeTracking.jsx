import { useState, useEffect } from 'react';
import { logger, api, Pagination } from '../../../shared';
import { 
  fetchTimeEntries, 
  startTimer, 
  stopTimer, 
  deleteTimeEntry, 
  fetchTimeTrackingSummary, 
  fetchGroupedTimeTracking 
} from '../services/timeTrackingApi';
import { fetchTasks } from '../../tasks/services/taskApi';
import { fetchProjects } from '../../projects/services/projectApi';

const TimeTracking = () => {
  const [entries, setEntries] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [projects, setProjects] = useState([]);
  const [activeEntry, setActiveEntry] = useState(null);
  const [summary, setSummary] = useState({ total_hours: 0, total_entries: 0 });
  const [viewMode, setViewMode] = useState('entries'); // 'entries', 'tasks', 'projects', 'clients'
  const [groupedData, setGroupedData] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(25);
  const [formData, setFormData] = useState({
    task_id: '', project_id: '', description: ''
  });
  const [currentTime, setCurrentTime] = useState(Date.now());

  useEffect(() => {
    loadEntries();
    loadTasks();
    loadProjects();
    loadSummary();
    
    // Update current time every second for live timer display
    const timeInterval = setInterval(() => {
      setCurrentTime(Date.now());
    }, 1000);
    
    // Refresh active timer every 30 seconds to catch changes
    const timerInterval = setInterval(() => {
      loadActiveTimer();
    }, 30000);
    
    return () => {
      clearInterval(timeInterval);
      clearInterval(timerInterval);
    };
  }, []);

  const loadEntries = async () => {
    try {
      const response = await fetchTimeEntries();
      const data = response.data || response;
      const entriesData = Array.isArray(data) ? data : [];
      setEntries(entriesData);
      
      // Check for active timer using the dedicated endpoint
      await loadActiveTimer();
    } catch (error) {
      logger.error('Error fetching entries:', error);
      setEntries([]);
      setActiveEntry(null);
    }
  };

  const loadActiveTimer = async () => {
    try {
      const response = await fetchTimeEntries();
      const data = response.data || response;
      const entriesData = Array.isArray(data) ? data : [];
      const running = entriesData.find(e => e.is_running === 1 || e.is_running === true);
      setActiveEntry(running || null);
    } catch (error) {
      logger.error('Error fetching active timer:', error);
      setActiveEntry(null);
    }
  };

  const loadTasks = async () => {
    try {
      const response = await fetchTasks();
      const data = response.data || response;
      setTasks(Array.isArray(data) ? data : []);
    } catch (error) {
      logger.error('Error fetching tasks:', error);
      setTasks([]);
    }
  };

  const loadProjects = async () => {
    try {
      const response = await fetchProjects();
      const data = response.data || response;
      setProjects(Array.isArray(data) ? data : []);
    } catch (error) {
      logger.error('Error fetching projects:', error);
      setProjects([]);
    }
  };

  const loadSummary = async () => {
    try {
      const response = await fetchTimeTrackingSummary();
      setSummary(response.data || response || { total_hours: 0, total_entries: 0 });
    } catch (error) {
      logger.error('Error fetching summary:', error);
      setSummary({ total_hours: 0, total_entries: 0 });
    }
  };

  const loadGroupedData = async (groupBy) => {
    try {
      const response = await fetchGroupedTimeTracking(groupBy);
      const data = response.data || response;
      setGroupedData(Array.isArray(data) ? data : []);
    } catch (error) {
      logger.error('Error fetching grouped data:', error);
      setGroupedData([]);
    }
  };

  useEffect(() => {
    if (viewMode === 'tasks') {
      loadGroupedData('task');
    } else if (viewMode === 'projects') {
      loadGroupedData('project');
    } else if (viewMode === 'clients') {
      loadGroupedData('client');
    }
    // Reset to page 1 when changing views
    setCurrentPage(1);
  }, [viewMode]);

  // State to track existing time for selected task
  const [taskExistingTime, setTaskExistingTime] = useState(null);

  // Fetch existing time when task is selected
  useEffect(() => {
    if (formData.task_id) {
      fetchTaskExistingTime(formData.task_id);
    } else {
      setTaskExistingTime(null);
    }
  }, [formData.task_id]);

  const fetchTaskExistingTime = async (taskId) => {
    try {
      const response = await api.get(`/time-tracking/duration/task/${taskId}`);
      const data = response.data?.data || response.data;
      if (data && data.minutes) {
        setTaskExistingTime({
          minutes: data.minutes,
          hours: (data.minutes / 60).toFixed(2)
        });
      } else {
        setTaskExistingTime(null);
      }
    } catch (error) {
      logger.error('Error fetching task time:', error);
      setTaskExistingTime(null);
    }
  };



  const handleStartTimer = async () => {
    if (!formData.description && !formData.task_id && !formData.project_id) {
      alert('Please provide a description, task, or project');
      return;
    }
    try {
      await startTimer(formData);
      setFormData({ task_id: '', project_id: '', description: '' });
      await loadEntries();
      await loadSummary();
    } catch (error) {
      logger.error('Error starting timer:', error);
      alert('Failed to start timer');
    }
  };

  const handleStopTimer = async (id) => {
    try {
      await stopTimer(id);
      await loadEntries();
      await loadSummary();
      setActiveEntry(null);
    } catch (error) {
      logger.error('Error stopping timer:', error);
      alert('Failed to stop timer');
    }
  };

  const handleDeleteEntry = async (id) => {
    if (!confirm('Delete this time entry?')) return;
    try {
      await deleteTimeEntry(id);
      await loadEntries();
      await loadSummary();
    } catch (error) {
      logger.error('Error deleting entry:', error);
      alert('Failed to delete entry');
    }
  };

  const formatDuration = (minutes) => {
    if (!minutes) return '0h 0m';
    const h = Math.floor(minutes / 60);
    const m = Math.round(minutes % 60);
    return `${h}h ${m}m`;
  };

  const calculateElapsedTime = (startTime) => {
    if (!startTime) return 0;
    const start = new Date(startTime).getTime();
    const elapsed = Math.floor((currentTime - start) / 1000); // seconds
    return elapsed > 0 ? elapsed : 0;
  };

  const formatElapsedTime = (seconds) => {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = seconds % 60;
    return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const formatDate = (dateString) => {
    if (!dateString) return '-';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric', 
      year: 'numeric' 
    });
  };

  const formatTime = (dateString) => {
    if (!dateString) return '-';
    const date = new Date(dateString);
    return date.toLocaleTimeString('en-US', { 
      hour: '2-digit', 
      minute: '2-digit',
      hour12: true
    });
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
            {activeEntry ? 'CURRENT TIMER' : 'STATUS'}
          </div>
          <div className="stat-value" style={{ 
            fontSize: '28px', 
            fontWeight: '600', 
            marginBottom: '4px',
            color: activeEntry ? '#28a745' : undefined,
            fontVariantNumeric: 'tabular-nums'
          }}>
            {activeEntry ? formatElapsedTime(calculateElapsedTime(activeEntry.start_time)) : 'Stopped'}
          </div>
          <div className="stat-description" style={{ fontSize: '13px' }}>
            {activeEntry ? (activeEntry.description || 'Timer running') : 'No active timer'}
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
              <option key={project.id} value={project.id}>{project.name}</option>
            ))}
          </select>
          <input
            placeholder="What are you working on?"
            value={formData.description}
            onChange={(e) => setFormData({...formData, description: e.target.value})}
          />
          <button
            onClick={activeEntry ? () => handleStopTimer(activeEntry.id) : handleStartTimer}
            className="btn-primary"
            style={{ minWidth: '120px' }}
          >
            {activeEntry ? 'Stop' : 'Start'}
          </button>
        </div>
        {taskExistingTime && formData.task_id && (
          <div style={{ 
            marginTop: '12px', 
            padding: '10px 12px', 
            background: 'rgba(40, 167, 69, 0.1)', 
            borderRadius: '4px',
            border: '1px solid rgba(40, 167, 69, 0.2)',
            fontSize: '13px',
            color: '#28a745',
            display: 'flex',
            alignItems: 'center',
            gap: '6px'
          }}>
            <span style={{ fontWeight: '600' }}>⏱️ Existing time on this task:</span>
            <span style={{ fontWeight: '700' }}>{taskExistingTime.hours} hours</span>
            <span style={{ color: 'rgba(40, 167, 69, 0.7)' }}>({taskExistingTime.minutes} minutes)</span>
            <span style={{ marginLeft: 'auto', fontSize: '12px', color: 'rgba(40, 167, 69, 0.8)' }}>
              New timer will add to this total
            </span>
          </div>
        )}
      </div>

      <div className="card">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
          <h2>Time Entries</h2>
          <div style={{ display: 'flex', gap: '8px' }}>
            <button 
              onClick={() => setViewMode('entries')}
              className={viewMode === 'entries' ? 'btn-primary' : 'btn-secondary'}
              style={{ fontSize: '13px', padding: '6px 12px' }}
            >
              All Entries
            </button>
            <button 
              onClick={() => setViewMode('tasks')}
              className={viewMode === 'tasks' ? 'btn-primary' : 'btn-secondary'}
              style={{ fontSize: '13px', padding: '6px 12px' }}
            >
              By Task
            </button>
            <button 
              onClick={() => setViewMode('projects')}
              className={viewMode === 'projects' ? 'btn-primary' : 'btn-secondary'}
              style={{ fontSize: '13px', padding: '6px 12px' }}
            >
              By Project
            </button>
            <button 
              onClick={() => setViewMode('clients')}
              className={viewMode === 'clients' ? 'btn-primary' : 'btn-secondary'}
              style={{ fontSize: '13px', padding: '6px 12px' }}
            >
              By Client
            </button>
          </div>
        </div>

        {viewMode === 'entries' ? (
          <>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
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
                {entries.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage).map(entry => (
                <tr key={entry.id} style={{ borderBottom: '1px solid #eee' }}>
                  <td style={{ padding: '10px' }}>{formatDate(entry.start_time)}</td>
                  <td style={{ padding: '10px' }}>
                    <div style={{ fontWeight: '500' }}>{entry.description || 'No description'}</div>
                    {entry.task_title && (
                      <div style={{ fontSize: '12px', color: '#666', marginTop: '2px' }}>
                        Task: {entry.task_title}
                      </div>
                    )}
                    {entry.project_name && (
                      <div style={{ fontSize: '12px', color: '#666', marginTop: '2px' }}>
                        Project: {entry.project_name}
                        {entry.client_name && ` • ${entry.client_name}`}
                      </div>
                    )}
                  </td>
                  <td style={{ padding: '10px' }}>{formatTime(entry.start_time)}</td>
                  <td style={{ padding: '10px' }}>{formatTime(entry.end_time)}</td>
                  <td style={{ padding: '10px', fontWeight: '600' }}>
                    {entry.is_running ? (
                      <span style={{ color: '#28a745', fontVariantNumeric: 'tabular-nums' }}>
                        {formatElapsedTime(calculateElapsedTime(entry.start_time))}
                      </span>
                    ) : (
                      formatDuration(entry.duration)
                    )}
                  </td>
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
                        onClick={() => handleStopTimer(entry.id)}
                        className="btn-primary"
                        style={{ marginRight: '8px', fontSize: '13px' }}
                      >
                        Stop
                      </button>
                    ) : null}
                    <button 
                      onClick={() => handleDeleteEntry(entry.id)}
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

            {Math.ceil(entries.length / itemsPerPage) > 1 && (
              <Pagination
                currentPage={currentPage}
                totalPages={Math.ceil(entries.length / itemsPerPage)}
                totalItems={entries.length}
                itemsPerPage={itemsPerPage}
                onPageChange={setCurrentPage}
                onItemsPerPageChange={(value) => {
                  setItemsPerPage(value);
                  setCurrentPage(1);
                }}
              />
            )}
          </>
        ) : viewMode === 'tasks' ? (
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ borderBottom: '2px solid #ddd' }}>
                <th style={{ textAlign: 'left', padding: '10px' }}>Task</th>
                <th style={{ textAlign: 'left', padding: '10px' }}>Project</th>
                <th style={{ textAlign: 'left', padding: '10px' }}>Client</th>
                <th style={{ textAlign: 'center', padding: '10px' }}>Sessions</th>
                <th style={{ textAlign: 'right', padding: '10px' }}>Total Time</th>
              </tr>
            </thead>
            <tbody>
              {groupedData.map((item, idx) => (
                <tr key={idx} style={{ borderBottom: '1px solid #eee' }}>
                  <td style={{ padding: '10px', fontWeight: '500' }}>{item.task_title || 'No Task'}</td>
                  <td style={{ padding: '10px' }}>{item.project_name || '-'}</td>
                  <td style={{ padding: '10px' }}>{item.client_name || '-'}</td>
                  <td style={{ padding: '10px', textAlign: 'center' }}>{item.session_count}</td>
                  <td style={{ padding: '10px', textAlign: 'right', fontWeight: '600' }}>
                    {item.total_hours}h
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : viewMode === 'projects' ? (
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ borderBottom: '2px solid #ddd' }}>
                <th style={{ textAlign: 'left', padding: '10px' }}>Project</th>
                <th style={{ textAlign: 'left', padding: '10px' }}>Client</th>
                <th style={{ textAlign: 'center', padding: '10px' }}>Sessions</th>
                <th style={{ textAlign: 'right', padding: '10px' }}>Total Time</th>
              </tr>
            </thead>
            <tbody>
              {groupedData.map((item, idx) => (
                <tr key={idx} style={{ borderBottom: '1px solid #eee' }}>
                  <td style={{ padding: '10px', fontWeight: '500' }}>{item.project_name || 'No Project'}</td>
                  <td style={{ padding: '10px' }}>{item.client_name || '-'}</td>
                  <td style={{ padding: '10px', textAlign: 'center' }}>{item.session_count}</td>
                  <td style={{ padding: '10px', textAlign: 'right', fontWeight: '600' }}>
                    {item.total_hours}h
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ borderBottom: '2px solid #ddd' }}>
                <th style={{ textAlign: 'left', padding: '10px' }}>Client</th>
                <th style={{ textAlign: 'center', padding: '10px' }}>Sessions</th>
                <th style={{ textAlign: 'right', padding: '10px' }}>Total Time</th>
              </tr>
            </thead>
            <tbody>
              {groupedData.map((item, idx) => (
                <tr key={idx} style={{ borderBottom: '1px solid #eee' }}>
                  <td style={{ padding: '10px', fontWeight: '500' }}>{item.client_name || 'No Client'}</td>
                  <td style={{ padding: '10px', textAlign: 'center' }}>{item.session_count}</td>
                  <td style={{ padding: '10px', textAlign: 'right', fontWeight: '600' }}>
                    {item.total_hours}h
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

export default TimeTracking;
