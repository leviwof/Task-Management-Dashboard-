import { call, put, takeEvery, takeLatest, fork, cancel } from 'redux-saga/effects';
import { mockApi } from '../../api/mockApi';
import {
  fetchTasksRequest,
  fetchTasksSuccess,
  fetchTasksFailure,
  createTaskFailure,
  createTaskOptimistic,
  updateTaskSuccess,
  updateTaskFailure,
  updateTaskOptimistic,
  deleteTaskSuccess,
  deleteTaskFailure,
  deleteTaskOptimistic,
} from '../actions/taskActions';
import {
  fetchUsersSuccess,
  fetchUsersFailure,
} from '../actions/userActions';
import {
  fetchProjectsSuccess,
  fetchProjectsFailure,
} from '../actions/projectActions';
import { setLoading, setError, clearError } from '../actions/uiActions';

let currentFetchTasksTask = null;

function* fetchTasksSaga(action) {
  if (currentFetchTasksTask) {
    yield cancel(currentFetchTasksTask);
  }
  
  try {
    yield put(setLoading({ tasks: true }));
    yield put(clearError());
    
    const result = yield call(mockApi.fetchTasks, action.payload);
    
    yield put(fetchTasksSuccess(result.data));
  } catch (error) {
    yield put(fetchTasksFailure(error.message));
    yield put(setError('tasks', error.message));
  } finally {
    yield put(setLoading({ tasks: false }));
  }
}

function* fetchUsersSaga() {
  try {
    yield put(setLoading({ users: true }));
    
    const result = yield call(mockApi.fetchUsers);
    yield put(fetchUsersSuccess(result.data));
  } catch (error) {
    yield put(fetchUsersFailure(error.message));
    yield put(setError('users', error.message));
  } finally {
    yield put(setLoading({ users: false }));
  }
}

function* fetchProjectsSaga() {
  try {
    yield put(setLoading({ projects: true }));
    
    const result = yield call(mockApi.fetchProjects);
    yield put(fetchProjectsSuccess(result.data));
  } catch (error) {
    yield put(fetchProjectsFailure(error.message));
    yield put(setError('projects', error.message));
  } finally {
    yield put(setLoading({ projects: false }));
  }
}

function* createTaskSaga(action) {
  const tempId = `temp_${Date.now()}`;
  const taskData = action.payload;
  
  yield put(createTaskOptimistic(taskData, tempId));
  
  try {
    yield put(setLoading({ tasks: true }));
    
    yield call(mockApi.createTask, taskData);
    
    yield put(fetchTasksRequest({}));
  } catch (error) {
    yield put(createTaskFailure(error.message, tempId));
    yield put(setError('form', error.message));
  } finally {
    yield put(setLoading({ tasks: false }));
  }
}

function* updateTaskSaga(action) {
  const { taskId, updates } = action.payload;
  
  yield put(updateTaskOptimistic(taskId, updates));
  
  try {
    yield put(setLoading({ tasks: true }));
    
    yield call(mockApi.updateTask, taskId, updates);
    yield put(updateTaskSuccess({ id: taskId, ...updates }));
    yield put(fetchTasksRequest({}));
  } catch (error) {
    yield put(updateTaskFailure(error.message, taskId));
    yield put(setError('form', error.message));
  } finally {
    yield put(setLoading({ tasks: false }));
  }
}

function* deleteTaskSaga(action) {
  const taskId = action.payload;
  
  yield put(deleteTaskOptimistic(taskId));
  
  try {
    yield put(setLoading({ tasks: true }));
    
    yield call(mockApi.deleteTask, taskId);
    yield put(deleteTaskSuccess(taskId));
    yield put(fetchTasksRequest({}));
  } catch (error) {
    yield put(deleteTaskFailure(error.message, taskId));
    yield put(setError('tasks', error.message));
  } finally {
    yield put(setLoading({ tasks: false }));
  }
}

function* watchFetchTasks() {
  yield takeLatest('FETCH_TASKS_REQUEST', fetchTasksSaga);
}

function* watchFetchUsers() {
  yield takeLatest('FETCH_USERS_REQUEST', fetchUsersSaga);
}

function* watchFetchProjects() {
  yield takeLatest('FETCH_PROJECTS_REQUEST', fetchProjectsSaga);
}

function* watchCreateTask() {
  yield takeEvery('CREATE_TASK_REQUEST', createTaskSaga);
}

function* watchUpdateTask() {
  yield takeEvery('UPDATE_TASK_REQUEST', updateTaskSaga);
}

function* watchDeleteTask() {
  yield takeEvery('DELETE_TASK_REQUEST', deleteTaskSaga);
}

export default function* rootSaga() {
  yield fork(watchFetchTasks);
  yield fork(watchFetchUsers);
  yield fork(watchFetchProjects);
  yield fork(watchCreateTask);
  yield fork(watchUpdateTask);
  yield fork(watchDeleteTask);
}
