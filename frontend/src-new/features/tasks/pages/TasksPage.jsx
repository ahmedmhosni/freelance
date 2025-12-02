/**
 * Tasks Page
 */

import { useTasks } from '../hooks/useTasks';
import { LoadingSpinner, ErrorMessage } from '../../../shared/components';

const TasksPage = () => {
  const { tasks, loading, error, createTask, updateTask, deleteTask, markComplete } = useTasks();

  if (loading) return <LoadingSpinner />;
  if (error) return <ErrorMessage message={error} />;

  return (
    <div className="tasks-page">
      <div className="page-header">
        <h1>Tasks</h1>
        <button>Add Task</button>
      </div>

      {tasks.length === 0 ? (
        <div className="empty-state">
          <p>No tasks yet. Create your first task!</p>
        </div>
      ) : (
        <div className="tasks-list">
          {tasks.map(task => (
            <div key={task.id} className="task-card">
              <h3>{task.title}</h3>
              <p>{task.description}</p>
              <span className={`status-badge status-${task.status}`}>
                {task.status}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default TasksPage;
