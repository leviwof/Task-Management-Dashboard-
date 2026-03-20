import {
  FETCH_TASKS_SUCCESS,
  CREATE_TASK_SUCCESS,
  UPDATE_TASK_SUCCESS,
  DELETE_TASK_SUCCESS,
  FETCH_USERS_SUCCESS,
  FETCH_PROJECTS_SUCCESS,
} from '../actions/taskActions';

import {
  FETCH_USERS_SUCCESS as USERS_SUCCESS,
} from '../actions/userActions';

import {
  FETCH_PROJECTS_SUCCESS as PROJECTS_SUCCESS,
} from '../actions/projectActions';

const initialState = {
  tasks: { byId: {}, allIds: [] },
  users: { byId: {}, allIds: [] },
  projects: { byId: {}, allIds: [] },
};

const normalizeEntities = (data) => {
  const byId = {};
  const allIds = [];
  
  data.forEach(item => {
    byId[item.id] = item;
    allIds.push(item.id);
  });
  
  return { byId, allIds };
};

const entitiesReducer = (state = initialState, action) => {
  switch (action.type) {
    case FETCH_TASKS_SUCCESS: {
      return {
        ...state,
        tasks: normalizeEntities(action.payload),
      };
    }
    
    case CREATE_TASK_SUCCESS: {
      const newTask = action.payload;
      return {
        ...state,
        tasks: {
          byId: { ...state.tasks.byId, [newTask.id]: newTask },
          allIds: [...state.tasks.allIds, newTask.id],
        },
      };
    }
    
    case UPDATE_TASK_SUCCESS: {
      const updatedTask = action.payload;
      return {
        ...state,
        tasks: {
          ...state.tasks,
          byId: {
            ...state.tasks.byId,
            [updatedTask.id]: updatedTask,
          },
        },
      };
    }
    
    case DELETE_TASK_SUCCESS: {
      const deletedId = action.payload;
      const { [deletedId]: _, ...remainingById } = state.tasks.byId;
      return {
        ...state,
        tasks: {
          byId: remainingById,
          allIds: state.tasks.allIds.filter(id => id !== deletedId),
        },
      };
    }
    
    case USERS_SUCCESS: {
      return {
        ...state,
        users: normalizeEntities(action.payload),
      };
    }
    
    case PROJECTS_SUCCESS: {
      return {
        ...state,
        projects: normalizeEntities(action.payload),
      };
    }
    
    default:
      return state;
  }
};

export default entitiesReducer;
