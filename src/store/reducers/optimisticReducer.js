import {
  CREATE_TASK_OPTIMISTIC,
  UPDATE_TASK_OPTIMISTIC,
  DELETE_TASK_OPTIMISTIC,
  CREATE_TASK_SUCCESS,
  UPDATE_TASK_SUCCESS,
  DELETE_TASK_SUCCESS,
  CREATE_TASK_FAILURE,
  UPDATE_TASK_FAILURE,
  DELETE_TASK_FAILURE,
} from '../actions/taskActions';

const initialState = {
  pendingCreates: [],
  pendingUpdates: {},
  pendingDeletes: [],
};

const optimisticReducer = (state = initialState, action) => {
  switch (action.type) {
    case CREATE_TASK_OPTIMISTIC:
      return {
        ...state,
        pendingCreates: [...state.pendingCreates, action.payload],
      };
    
    case CREATE_TASK_SUCCESS:
    case CREATE_TASK_FAILURE:
      return {
        ...state,
        pendingCreates: state.pendingCreates.filter(
          task => task.tempId !== action.payload.tempId
        ),
      };
    
    case UPDATE_TASK_OPTIMISTIC:
      return {
        ...state,
        pendingUpdates: {
          ...state.pendingUpdates,
          [action.payload.taskId]: action.payload.updates,
        },
      };
    
    case UPDATE_TASK_SUCCESS:
    case UPDATE_TASK_FAILURE: {
      const { [action.payload.id]: _, ...remainingUpdates } = state.pendingUpdates;
      return {
        ...state,
        pendingUpdates: remainingUpdates,
      };
    }
    
    case DELETE_TASK_OPTIMISTIC:
      return {
        ...state,
        pendingDeletes: [...state.pendingDeletes, action.payload],
      };
    
    case DELETE_TASK_SUCCESS:
    case DELETE_TASK_FAILURE:
      return {
        ...state,
        pendingDeletes: state.pendingDeletes.filter(
          id => id !== action.payload
        ),
      };
    
    default:
      return state;
  }
};

export default optimisticReducer;
