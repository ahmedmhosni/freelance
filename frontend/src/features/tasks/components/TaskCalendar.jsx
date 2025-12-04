import { useState, useEffect, useMemo } from 'react';
import { Calendar, dateFnsLocalizer } from 'react-big-calendar';
import { format, parse, startOfWeek, getDay } from 'date-fns';
import { enUS } from 'date-fns/locale';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import { api, logger } from '../../../shared';
import toast from 'react-hot-toast';

const locales = {
  'en-US': enUS
};

const localizer = dateFnsLocalizer({
  format,
  parse,
  startOfWeek,
  getDay,
  locales,
});

const TaskCalendar = ({ onTaskClick, onDateSelect }) => {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchTasks();
  }, []);

  const fetchTasks = async () => {
    setLoading(true);
    try {
      const response = await api.get('/tasks');
      const data = response.data.data || response.data;
      setTasks(Array.isArray(data) ? data : []);
    } catch (error) {
      logger.error('Error fetching tasks:', error);
      toast.error('Failed to load tasks');
    } finally {
      setLoading(false);
    }
  };

  const events = useMemo(() => {
    return tasks
      .filter(task => task.due_date)
      .map(task => ({
        id: task.id,
        title: task.title,
        start: new Date(task.due_date),
        end: new Date(task.due_date),
        resource: task,
        allDay: true,
      }));
  }, [tasks]);

  const eventStyleGetter = (event) => {
    const task = event.resource;
    let backgroundColor = '#2eaadc';
    
    switch (task.priority) {
      case 'urgent':
        backgroundColor = '#eb5757';
        break;
      case 'high':
        backgroundColor = '#ffa344';
        break;
      case 'medium':
        backgroundColor = '#ffd426';
        break;
      case 'low':
        backgroundColor = '#2eaadc';
        break;
      default:
        backgroundColor = '#2eaadc';
    }

    if (task.status === 'completed') {
      backgroundColor = '#28a745';
    }

    return {
      style: {
        backgroundColor,
        borderRadius: '4px',
        opacity: 0.9,
        color: 'white',
        border: 'none',
        display: 'block',
        fontSize: '12px',
        padding: '2px 5px',
      }
    };
  };

  const handleSelectEvent = (event) => {
    if (onTaskClick) {
      onTaskClick(event.resource);
    }
  };

  const handleSelectSlot = (slotInfo) => {
    if (onDateSelect) {
      onDateSelect(slotInfo.start);
    }
  };

  if (loading) {
    return (
      <div style={{ 
        height: '600px', 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center',
        background: 'var(--bg-primary)',
        borderRadius: '3px',
        border: '1px solid var(--border-secondary)'
      }}>
        <p style={{ color: 'var(--text-secondary)' }}>Loading calendar...</p>
      </div>
    );
  }

  return (
    <div style={{ height: '600px' }}>
      <Calendar
        localizer={localizer}
        events={events}
        startAccessor="start"
        endAccessor="end"
        style={{ height: '100%' }}
        eventPropGetter={eventStyleGetter}
        onSelectEvent={handleSelectEvent}
        onSelectSlot={handleSelectSlot}
        selectable
        views={['month', 'week', 'day', 'agenda']}
        defaultView="month"
        popup
        tooltipAccessor={(event) => {
          const task = event.resource;
          return `${task.title} - ${task.priority} priority - ${task.status}`;
        }}
      />
    </div>
  );
};

export default TaskCalendar;
