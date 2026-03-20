import React from 'react';
import { useSelector } from 'react-redux';
import { selectUsersById, selectProjectsById, selectOptimisticState } from '../store/selectors';

const TaskCard = ({ task, onEdit, onDelete }) => {
  const usersById = useSelector(selectUsersById);
  const projectsById = useSelector(selectProjectsById);
  const optimistic = useSelector(selectOptimisticState);

  const isPendingCreate = optimistic.pendingCreates.some(t => t.id === task.id || t.tempId === task.tempId);
  const isPendingUpdate = optimistic.pendingUpdates[task.id];
  const isPendingDelete = optimistic.pendingDeletes.includes(task.id);

  const assignee = task.assigneeId ? usersById[task.assigneeId] : null;
  const project = task.projectId ? projectsById[task.projectId] : null;

  const getPriorityColor = (priority) => {
    const colors = {
      'Low': '#22c55e',
      'Medium': '#f59e0b', 
      'High': '#ef4444',
      'Critical': '#dc2626'
    };
    return colors[priority] || '#6b7280';
  };

  const getStatusColor = (status) => {
    const colors = {
      'Todo': '#6b7280',
      'In Progress': '#3b82f6',
      'Review': '#f59e0b',
      'Done': '#22c55e'
    };
    return colors[status] || '#6b7280';
  };

  const getTypeIcon = (type) => {
    const icons = {
      'Bug': '🐛',
      'Feature': '✨',
      'Enhancement': '⚡',
      'Research': '🔬'
    };
    return icons[type] || '📋';
  };

  if (isPendingDelete) {
    return (
      <div className="task-card pending-delete">
        <div className="pending-indicator">Deleting...</div>
        <div className="task-content">
          <h3 className="task-title">{task.title}</h3>
        </div>
      </div>
    );
  }

  return (
    <div className={`task-card ${task.taskType?.toLowerCase()} ${isPendingUpdate ? 'pending-update' : ''}`}>
      {(isPendingCreate || isPendingUpdate) && (
        <div className="pending-indicator">Saving...</div>
      )}

      <div className="task-card-header">
        <div className="task-meta">
          <span 
            className="task-type"
            title={task.taskType}
          >
            {getTypeIcon(task.taskType)} {task.taskType}
          </span>
          <span 
            className="task-status"
            style={{ color: getStatusColor(task.status) }}
          >
            {task.status}
          </span>
        </div>
        
        <div className="task-actions">
          <button onClick={onEdit} className="btn-edit" title="Edit task">✏️</button>
          <button onClick={onDelete} className="btn-delete" title="Delete task">🗑️</button>
        </div>
      </div>

      <div className="task-content">
        <h3 className="task-title">{task.title}</h3>
        
        {task.description && (
          <p className="task-description">
            {task.description.length > 100 
              ? `${task.description.substring(0, 100)}...`
              : task.description
            }
          </p>
        )}

        {task.taskType === 'Bug' && task.severity && (
          <div className="task-severity">
            <span className={`severity-badge severity-${task.severity?.toLowerCase()}`}>
              {task.severity} Severity
            </span>
          </div>
        )}

        {task.taskType === 'Feature' && task.acceptanceCriteria?.length > 0 && (
          <div className="task-criteria">
            <span className="criteria-count">{task.acceptanceCriteria.length} criteria</span>
          </div>
        )}

        {task.subtasks?.length > 0 && (
          <div className="task-subtasks">
            <div className="subtask-progress">
              <div 
                className="subtask-progress-bar"
                style={{ 
                  width: `${(task.subtasks.filter(st => st.completed).length / task.subtasks.length) * 100}%` 
                }}
              />
            </div>
            <span className="subtask-text">
              {task.subtasks.filter(st => st.completed).length}/{task.subtasks.length} subtasks
            </span>
          </div>
        )}
      </div>

      <div className="task-footer">
        <div className="task-assignee">
          {assignee ? (
            <span className="assignee-badge" title={assignee.email}>
              👤 {assignee.name}
            </span>
          ) : (
            <span className="unassigned">Unassigned</span>
          )}
        </div>

        <div className="task-project">
          {project && <span title={project.name}>📁 {project.name}</span>}
        </div>
        
        {task.dueDate && (
          <div className={`task-due-date ${new Date(task.dueDate) < new Date() ? 'overdue' : ''}`}>
            📅 {new Date(task.dueDate).toLocaleDateString()}
          </div>
        )}

        <div className="task-priority" title={`Priority: ${task.priority}`}>
          <span style={{ color: getPriorityColor(task.priority), fontWeight: 'bold' }}>
            {task.priority === 'Critical' || task.priority === 'High' ? '🔴' : task.priority === 'Medium' ? '🟡' : '🟢'}
          </span>
          <span className="priority-text">{task.priority}</span>
        </div>
      </div>
    </div>
  );
};

export default TaskCard;
