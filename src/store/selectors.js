import { createSelector } from 'reselect';

const selectEntities = (state) => state.entities;
const selectUi = (state) => state.ui;
const selectOptimistic = (state) => state.optimistic;

export const selectTasksById = createSelector(
  [selectEntities],
  (entities) => entities.tasks.byId
);

export const selectTasksAllIds = createSelector(
  [selectEntities],
  (entities) => entities.tasks.allIds
);

export const selectUsersById = createSelector(
  [selectEntities],
  (entities) => entities.users.byId
);

export const selectUsersAllIds = createSelector(
  [selectEntities],
  (entities) => entities.users.allIds
);

export const selectProjectsById = createSelector(
  [selectEntities],
  (entities) => entities.projects.byId
);

export const selectProjectsAllIds = createSelector(
  [selectEntities],
  (entities) => entities.projects.allIds
);

export const selectAllTasks = createSelector(
  [selectTasksById, selectTasksAllIds],
  (byId, allIds) => allIds.map(id => byId[id]).filter(Boolean)
);

export const selectAllUsers = createSelector(
  [selectUsersById, selectUsersAllIds],
  (byId, allIds) => allIds.map(id => byId[id]).filter(Boolean)
);

export const selectAllProjects = createSelector(
  [selectProjectsById, selectProjectsAllIds],
  (byId, allIds) => allIds.map(id => byId[id]).filter(Boolean)
);

export const selectFilters = createSelector(
  [selectUi],
  (ui) => ui.filters
);

export const selectTaskForm = createSelector(
  [selectUi],
  (ui) => ui.taskForm
);

export const selectLoading = createSelector(
  [selectUi],
  (ui) => ui.loading
);

export const selectErrors = createSelector(
  [selectUi],
  (ui) => ui.errors
);

export const selectOptimisticState = createSelector(
  [selectOptimistic],
  (optimistic) => optimistic
);

export const selectFilteredTasks = createSelector(
  [selectAllTasks, selectFilters],
  (tasks, filters) => {
    let filtered = [...tasks];
    
    if (filters.projectId) {
      filtered = filtered.filter(task => task.projectId === filters.projectId);
    }
    
    if (filters.assigneeId) {
      filtered = filtered.filter(task => task.assigneeId === filters.assigneeId);
    }
    
    if (filters.status && filters.status !== 'all') {
      filtered = filtered.filter(task => task.status === filters.status);
    }
    
    if (filters.taskType && filters.taskType !== 'all') {
      filtered = filtered.filter(task => task.taskType === filters.taskType);
    }
    
    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      filtered = filtered.filter(task =>
        task.title.toLowerCase().includes(searchLower) ||
        (task.description && task.description.toLowerCase().includes(searchLower))
      );
    }
    
    return filtered;
  }
);

export const selectPendingTasks = createSelector(
  [selectOptimisticState],
  (optimistic) => ({
    pendingCreates: optimistic.pendingCreates,
    pendingUpdates: optimistic.pendingUpdates,
    pendingDeletes: optimistic.pendingDeletes,
  })
);

export const selectUserById = (userId) => createSelector(
  [selectUsersById],
  (usersById) => usersById[userId]
);

export const selectProjectById = (projectId) => createSelector(
  [selectProjectsById],
  (projectsById) => projectsById[projectId]
);

export const selectTaskById = (taskId) => createSelector(
  [selectTasksById],
  (tasksById) => tasksById[taskId]
);

export const selectUsersByProject = (projectId) => createSelector(
  [selectAllUsers, selectAllProjects],
  (users, projects) => {
    if (!projectId) return users;
    const project = projects.find(p => p.id === projectId);
    if (!project) return users;
    return users.filter(user => project.userIds.includes(user.id));
  }
);

export const selectActiveFilterCount = createSelector(
  [selectFilters],
  (filters) => {
    let count = 0;
    if (filters.projectId) count++;
    if (filters.assigneeId) count++;
    if (filters.status && filters.status !== 'all') count++;
    if (filters.taskType && filters.taskType !== 'all') count++;
    if (filters.search) count++;
    return count;
  }
);
