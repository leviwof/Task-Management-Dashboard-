import React, { useEffect, useCallback } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import TaskForm from './TaskForm';
import TaskList from './TaskList';
import FilterBar from './FilterBar';
import {
  selectFilteredTasks,
  selectTaskForm,
  selectAllUsers,
  selectAllProjects,
  selectFilters,
  selectLoading,
  selectErrors,
} from '../store/selectors';
import {
  fetchTasksRequest,
  createTaskRequest,
  updateTaskRequest,
  deleteTaskRequest,
} from '../store/actions/taskActions';
import {
  openTaskForm,
  closeTaskForm,
  setFilters,
} from '../store/actions/uiActions';
import {
  fetchUsersRequest,
} from '../store/actions/userActions';
import {
  fetchProjectsRequest,
} from '../store/actions/projectActions';

const TaskDashboard = () => {
  const dispatch = useDispatch();
  
  const tasks = useSelector(selectFilteredTasks);
  const taskForm = useSelector(selectTaskForm);
  const users = useSelector(selectAllUsers);
  const projects = useSelector(selectAllProjects);
  const filters = useSelector(selectFilters);
  const loading = useSelector(selectLoading);
  const errors = useSelector(selectErrors);

  useEffect(() => {
    dispatch(fetchTasksRequest({}));
    dispatch(fetchUsersRequest());
    dispatch(fetchProjectsRequest());
  }, [dispatch]);

  const handleCreateTask = useCallback(() => {
    dispatch(openTaskForm('create', null));
  }, [dispatch]);

  const handleEditTask = useCallback((taskId) => {
    dispatch(openTaskForm('edit', taskId));
  }, [dispatch]);

  const handleDeleteTask = useCallback((taskId) => {
    if (window.confirm('Are you sure you want to delete this task?')) {
      dispatch(deleteTaskRequest(taskId));
    }
  }, [dispatch]);

  const handleFormSubmit = useCallback((formData) => {
    if (taskForm.mode === 'create') {
      dispatch(createTaskRequest(formData));
    } else {
      dispatch(updateTaskRequest(taskForm.taskId, formData));
    }
    dispatch(closeTaskForm());
  }, [dispatch, taskForm.mode, taskForm.taskId]);

  const handleFormClose = useCallback(() => {
    dispatch(closeTaskForm());
  }, [dispatch]);

  const handleFiltersChange = useCallback((newFilters) => {
    dispatch(setFilters(newFilters));
    dispatch(fetchTasksRequest(newFilters));
  }, [dispatch]);

  return (
    <div className="task-dashboard">
      <header className="dashboard-header">
        <h1>Task Management Dashboard</h1>
        <button 
          className="create-task-btn"
          onClick={handleCreateTask}
        >
          + Create Task
        </button>
      </header>

      {errors.tasks && (
        <div className="error-banner">
          Error: {errors.tasks}
          <button onClick={() => dispatch(fetchTasksRequest(filters))}>Retry</button>
        </div>
      )}

      <FilterBar
        filters={filters}
        projects={projects}
        users={users}
        onFiltersChange={handleFiltersChange}
      />

      <TaskList
        tasks={tasks}
        loading={loading.tasks}
        onEditTask={handleEditTask}
        onDeleteTask={handleDeleteTask}
      />

      <TaskForm
        isOpen={taskForm.isOpen}
        mode={taskForm.mode}
        taskId={taskForm.taskId}
        users={users}
        projects={projects}
        loading={loading.tasks}
        onSubmit={handleFormSubmit}
        onClose={handleFormClose}
      />
    </div>
  );
};

export default TaskDashboard;
