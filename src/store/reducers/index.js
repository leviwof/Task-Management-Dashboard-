import entitiesReducer from './entitiesReducer';
import uiReducer from './uiReducer';
import optimisticReducer from './optimisticReducer';
import { combineReducers } from 'redux';

const rootReducer = combineReducers({
  entities: entitiesReducer,
  ui: uiReducer,
  optimistic: optimisticReducer,
});

export default rootReducer;
