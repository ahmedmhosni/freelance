import { useState, useEffect, useRef } from 'react';
import { useTheme } from '../context/ThemeContext';
import { MdAccessTime, MdPlayArrow, MdStop } from 'react-icons/md';
import api from '../utils/api';
import logger from '../utils/logger';

const TimerWidget = () => {
  const [showPopup, setShowPopup] = useState(false);
  const [activeEntry, setActiveEntry] = useState(null);
  const [elapsedTime, setElapsedTime] = useState(0);
  const [formData, setFormData] = useState({ description: '', task_id: '', project_id: '' });
  const [tasks, setTasks] = useState([]);
  const [projects, setProjects] = useState([]);
  const { isDark } = useTheme();
  const popupRef = useRef(null);

  useEffect(() => {
    fetchActiveTimer();
    fetchTasks();
    fetchProjects();
    const interval = setInterval(fetchActiveTimer, 5000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (activeEntry) {
      const calculateElapsed = () => {
        const now = Date.now(); // Current time in milliseconds
        const startDateTime = new Date(activeEntry.start_time).getTime(); // Convert to milliseconds
        const elapsed = Math.floor((now - startDateTime) / 1000); // Convert to seconds
        setElapsedTime(elapsed > 0 ? elapsed : 0);
      };
      
      calculateElapsed();
      const interval = setInterval(calculateElapsed, 1000);
      return () => clearInterval(interval);
    } else {
      setElapsedTime(0);
    }
  }, [activeEntry]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (popupRef.current && !popupRef.current.contains(event.target)) {
        setShowPopup(false);
      }
    };

    if (showPopup) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showPopup]);

  const fetchActiveTimer = async () => {
    try {
      const response = await api.get('/time-tracking');
      const entries = response.data.data || response.data;
      const running = entries.find(e => e.is_running === 1);
      setActiveEntry(running || null);
    } catch (error) {
      logger.error('Error fetching timer:', error);
    }
  };

  const fetchTasks = async () => {
    try {
      const response = await api.get('/tasks');
      const data = response.data.data || response.data;
      setTasks(Array.isArray(data) ? data : []);
    } catch (error) {
      logger.error('Error fetching tasks:', error);
    }
  };

  const fetchProjects = async () => {
    try {
      const response = await api.get('/projects');
      const data = response.data.data || response.data;
      setProjects(Array.isArray(data) ? data : []);
    } catch (error) {
      logger.error('Error fetching projects:', error);
    }
  };

  const startTimer = async () => {
    if (!formData.description && !formData.task_id && !formData.project_id) {
      alert('Please provide a description, task, or project');
      return;
    }
    try {
      await api.post('/time-tracking/start', formData);
      setFormData({ description: '', task_id: '', project_id: '' });
      await fetchActiveTimer();
      setShowPopup(false);
    } catch (error) {
      logger.error('Error starting timer:', error);
      alert('Failed to start timer');
    }
  };

  const stopTimer = async () => {
    if (!activeEntry) return;
    try {
      await api.post(`/time-tracking/stop/${activeEntry.id}`);
      await fetchActiveTimer();
      setElapsedTime(0);
    } catch (error) {
      logger.error('Error stopping timer:', error);
      alert('Failed to stop timer');
    }
  };

  const formatTime = (seconds) => {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = seconds % 60;
    return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  return (
    <div ref={popupRef} style={{ position: 'relative' }}>
      <button
        onClick={() => setShowPopup(!showPopup)}
        className={activeEntry ? 'timer-active' : ''}
        style={{
          background: activeEntry 
            ? '#28a745'
            : (isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(55, 53, 47, 0.08)'),
          color: activeEntry 
            ? 'white' 
            : (isDark ? 'rgba(255, 255, 255, 0.8)' : '#37352f'),
          border: activeEntry
            ? '1px solid #28a745'
            : (isDark ? '1px solid rgba(255, 255, 255, 0.15)' : '1px solid rgba(55, 53, 47, 0.16)'),
          padding: '8px 12px',
          borderRadius: '3px',
          cursor: 'pointer',
          fontSize: '16px',
          display: 'flex',
          alignItems: 'center',
          gap: '6px',
          fontWeight: '500',
          transition: 'all 0.15s ease',
          minWidth: activeEntry ? '100px' : '40px',
          height: '40px'
        }}
        onMouseEnter={(e) => {
          if (activeEntry) {
            e.target.style.setProperty('background', '#218838', 'important');
          } else {
            e.target.style.background = isDark ? 'rgba(255, 255, 255, 0.15)' : 'rgba(55, 53, 47, 0.12)';
          }
        }}
        onMouseLeave={(e) => {
          if (activeEntry) {
            e.target.style.setProperty('background', '#28a745', 'important');
          } else {
            e.target.style.background = isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(55, 53, 47, 0.08)';
          }
        }}
      >
        <MdAccessTime size={16} />
        {activeEntry && <span style={{ fontVariantNumeric: 'tabular-nums', fontSize: '13px' }}>{formatTime(elapsedTime)}</span>}
      </button>

      {showPopup && (
        <div className="timer-popup" style={{
          position: 'fixed',
          top: '60px',
          right: '80px',
          background: isDark ? '#202020' : 'white',
          borderRadius: '3px',
          boxShadow: '0 8px 24px rgba(0, 0, 0, 0.15)',
          width: '320px',
          maxWidth: 'calc(100vw - 40px)',
          zIndex: 1000,
          border: isDark ? '1px solid rgba(255, 255, 255, 0.1)' : '1px solid rgba(55, 53, 47, 0.09)'
        }}>
          <div style={{
            padding: '12px 16px',
            borderBottom: isDark ? '1px solid rgba(255, 255, 255, 0.1)' : '1px solid rgba(55, 53, 47, 0.09)'
          }}>
            <h3 style={{ margin: 0, fontSize: '14px', fontWeight: '600' }}>Time Tracker</h3>
          </div>

          {activeEntry ? (
            <div style={{ padding: '16px' }}>
              <div style={{
                textAlign: 'center',
                padding: '20px',
                background: isDark ? 'rgba(40, 167, 69, 0.1)' : 'rgba(40, 167, 69, 0.05)',
                borderRadius: '3px',
                marginBottom: '16px'
              }}>
                <div style={{
                  fontSize: '32px',
                  fontWeight: '600',
                  color: '#28a745',
                  fontVariantNumeric: 'tabular-nums',
                  marginBottom: '8px'
                }}>
                  {formatTime(elapsedTime)}
                </div>
                <div style={{ fontSize: '13px', color: isDark ? 'rgba(255, 255, 255, 0.6)' : 'rgba(55, 53, 47, 0.65)' }}>
                  {activeEntry.description || 'Timer running'}
                </div>
              </div>
              <button
                onClick={stopTimer}
                style={{
                  width: '100%',
                  padding: '10px',
                  background: '#eb5757',
                  color: 'white',
                  border: 'none',
                  borderRadius: '3px',
                  cursor: 'pointer',
                  fontSize: '14px',
                  fontWeight: '500',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '6px'
                }}
              >
                <MdStop size={18} /> Stop Timer
              </button>
            </div>
          ) : (
            <div style={{ padding: '16px' }}>
              <input
                type="text"
                placeholder="What are you working on?"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                style={{
                  width: '100%',
                  padding: '8px 10px',
                  marginBottom: '10px',
                  fontSize: '14px',
                  border: isDark ? '1px solid rgba(255, 255, 255, 0.15)' : '1px solid rgba(55, 53, 47, 0.16)',
                  borderRadius: '3px',
                  background: isDark ? '#191919' : 'white',
                  color: isDark ? 'rgba(255, 255, 255, 0.9)' : '#37352f'
                }}
              />
              <select
                value={formData.project_id}
                onChange={(e) => setFormData({ ...formData, project_id: e.target.value })}
                style={{
                  width: '100%',
                  padding: '8px 10px',
                  marginBottom: '10px',
                  fontSize: '14px',
                  border: isDark ? '1px solid rgba(255, 255, 255, 0.15)' : '1px solid rgba(55, 53, 47, 0.16)',
                  borderRadius: '3px',
                  background: isDark ? '#191919' : 'white',
                  color: isDark ? 'rgba(255, 255, 255, 0.9)' : '#37352f'
                }}
              >
                <option value="">Select Project (Optional)</option>
                {projects.map(project => (
                  <option key={project.id} value={project.id}>{project.name}</option>
                ))}
              </select>
              <select
                value={formData.task_id}
                onChange={(e) => setFormData({ ...formData, task_id: e.target.value })}
                style={{
                  width: '100%',
                  padding: '8px 10px',
                  marginBottom: '16px',
                  fontSize: '14px',
                  border: isDark ? '1px solid rgba(255, 255, 255, 0.15)' : '1px solid rgba(55, 53, 47, 0.16)',
                  borderRadius: '3px',
                  background: isDark ? '#191919' : 'white',
                  color: isDark ? 'rgba(255, 255, 255, 0.9)' : '#37352f'
                }}
              >
                <option value="">Select Task (Optional)</option>
                {tasks.map(task => (
                  <option key={task.id} value={task.id}>{task.title}</option>
                ))}
              </select>
              <button
                onClick={startTimer}
                style={{
                  width: '100%',
                  padding: '10px',
                  background: '#28a745',
                  color: 'white',
                  border: 'none',
                  borderRadius: '3px',
                  cursor: 'pointer',
                  fontSize: '14px',
                  fontWeight: '500',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '6px'
                }}
              >
                <MdPlayArrow size={18} /> Start Timer
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default TimerWidget;
