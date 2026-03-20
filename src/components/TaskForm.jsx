import React, { useEffect, useMemo, useCallback } from 'react';
import { useForm, useFieldArray } from 'react-hook-form';
import { TASK_TYPES, PRIORITIES, BUG_SEVERITIES, STATUSES } from '../api/mockApi';
import { useSelector } from 'react-redux';
import { selectAllUsers, selectTaskById } from '../store/selectors';

const STORAGE_KEY = 'taskForm_autosave';

const TaskForm = ({ 
  isOpen, 
  mode,
  taskId,
  onSubmit,
  onClose,
  projects = [],
  loading = false 
}) => {
  const existingTask = useSelector(state => taskId ? selectTaskById(taskId)(state) : null);
  const allUsers = useSelector(selectAllUsers);
  
  const {
    register,
    control,
    handleSubmit,
    watch,
    reset,
    formState: { errors, isValid }
  } = useForm({
    mode: 'onChange',
    defaultValues: {
      title: '',
      description: '',
      taskType: 'Feature',
      priority: 'Medium',
      status: 'Todo',
      projectId: '',
      assigneeId: '',
      dueDate: '',
      severity: 'Medium',
      stepsToReproduce: '',
      businessValue: '',
      acceptanceCriteria: [{ value: '' }],
      currentBehavior: '',
      proposedBehavior: '',
      researchQuestions: [{ value: '' }],
      expectedOutcomes: '',
      subtasks: [{ title: '' }],
      attachments: [],
    }
  });

  const watchedProjectId = watch('projectId');
  const watchedTaskType = watch('taskType');

  const availableUsers = useMemo(() => {
    if (!watchedProjectId) return allUsers;
    const project = projects.find(p => p.id === watchedProjectId);
    if (!project) return allUsers;
    return allUsers.filter(user => project.userIds.includes(user.id));
  }, [watchedProjectId, allUsers, projects]);

  const { fields: criteriaFields, append: appendCriteria, remove: removeCriteria } = useFieldArray({
    control,
    name: 'acceptanceCriteria'
  });

  const { fields: questionFields, append: appendQuestion, remove: removeQuestion } = useFieldArray({
    control,
    name: 'researchQuestions'
  });

  const { fields: subtaskFields, append: appendSubtask, remove: removeSubtask } = useFieldArray({
    control,
    name: 'subtasks'
  });

  useEffect(() => {
    if (isOpen && mode === 'edit' && existingTask) {
      reset({
        ...existingTask,
        acceptanceCriteria: existingTask.acceptanceCriteria?.length > 0 
          ? existingTask.acceptanceCriteria.map(c => ({ value: c }))
          : [{ value: '' }],
        researchQuestions: existingTask.researchQuestions?.length > 0
          ? existingTask.researchQuestions.map(q => ({ value: q }))
          : [{ value: '' }],
        subtasks: existingTask.subtasks?.length > 0
          ? existingTask.subtasks
          : [{ title: '' }],
      });
    } else if (isOpen && mode === 'create') {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        try {
          const parsed = JSON.parse(saved);
          reset(parsed);
        } catch {
          reset();
        }
      } else {
        reset({
          title: '',
          description: '',
          taskType: 'Feature',
          priority: 'Medium',
          status: 'Todo',
          projectId: '',
          assigneeId: '',
          dueDate: '',
          severity: 'Medium',
          stepsToReproduce: '',
          businessValue: '',
          acceptanceCriteria: [{ value: '' }],
          currentBehavior: '',
          proposedBehavior: '',
          researchQuestions: [{ value: '' }],
          expectedOutcomes: '',
          subtasks: [{ title: '' }],
          attachments: [],
        });
      }
    }
  }, [isOpen, mode, existingTask, reset]);

  useEffect(() => {
    if (!isOpen) return;
    
    const interval = setInterval(() => {
      const formData = watch();
      localStorage.setItem(STORAGE_KEY, JSON.stringify(formData));
    }, 5000);

    return () => clearInterval(interval);
  }, [isOpen, watch]);

  const clearSavedForm = useCallback(() => {
    localStorage.removeItem(STORAGE_KEY);
  }, []);

  const handleFormSubmit = (data) => {
    const submission = {
      ...data,
      acceptanceCriteria: data.acceptanceCriteria
        .filter(c => c.value.trim())
        .map(c => c.value),
      researchQuestions: data.researchQuestions
        .filter(q => q.value.trim())
        .map(q => q.value),
      subtasks: data.subtasks
        .filter(s => s.title.trim())
        .map((s, idx) => ({ id: s.id || `sub_${Date.now()}_${idx}`, title: s.title, completed: s.completed || false })),
    };
    clearSavedForm();
    onSubmit(submission);
  };

  const handleClose = () => {
    clearSavedForm();
    onClose();
  };

  const renderDynamicFields = () => {
    switch (watchedTaskType) {
      case 'Bug':
        return (
          <div className="dynamic-fields">
            <div className="form-group">
              <label>Severity *</label>
              <select
                {...register('severity', { required: true })}
                className="form-select"
              >
                {BUG_SEVERITIES.map(sev => (
                  <option key={sev} value={sev}>{sev}</option>
                ))}
              </select>
            </div>
            <div className="form-group">
              <label>Steps to Reproduce</label>
              <textarea
                {...register('stepsToReproduce')}
                className="form-textarea"
                rows={4}
                placeholder="Describe how to reproduce this bug..."
              />
            </div>
          </div>
        );
      
      case 'Feature':
        return (
          <div className="dynamic-fields">
            <div className="form-group">
              <label>Business Value</label>
              <textarea
                {...register('businessValue')}
                className="form-textarea"
                rows={3}
                placeholder="Describe the business value of this feature..."
              />
            </div>
            <div className="form-group">
              <label>Acceptance Criteria</label>
              {criteriaFields.map((field, index) => (
                <div key={field.id} className="field-array-item">
                  <input
                    {...register(`acceptanceCriteria.${index}.value`)}
                    placeholder={`Criterion ${index + 1}`}
                    className="form-input"
                  />
                  {index > 0 && (
                    <button type="button" onClick={() => removeCriteria(index)} className="btn-remove">
                      Remove
                    </button>
                  )}
                </div>
              ))}
              <button type="button" onClick={() => appendCriteria({ value: '' })} className="btn-add">
                + Add Criterion
              </button>
            </div>
          </div>
        );
      
      case 'Enhancement':
        return (
          <div className="dynamic-fields">
            <div className="form-group">
              <label>Current Behavior</label>
              <textarea
                {...register('currentBehavior')}
                className="form-textarea"
                rows={3}
                placeholder="Describe the current behavior..."
              />
            </div>
            <div className="form-group">
              <label>Proposed Behavior</label>
              <textarea
                {...register('proposedBehavior')}
                className="form-textarea"
                rows={3}
                placeholder="Describe the proposed behavior..."
              />
            </div>
          </div>
        );
      
      case 'Research':
        return (
          <div className="dynamic-fields">
            <div className="form-group">
              <label>Research Questions</label>
              {questionFields.map((field, index) => (
                <div key={field.id} className="field-array-item">
                  <input
                    {...register(`researchQuestions.${index}.value`)}
                    placeholder={`Question ${index + 1}`}
                    className="form-input"
                  />
                  {index > 0 && (
                    <button type="button" onClick={() => removeQuestion(index)} className="btn-remove">
                      Remove
                    </button>
                  )}
                </div>
              ))}
              <button type="button" onClick={() => appendQuestion({ value: '' })} className="btn-add">
                + Add Question
              </button>
            </div>
            <div className="form-group">
              <label>Expected Outcomes</label>
              <textarea
                {...register('expectedOutcomes')}
                className="form-textarea"
                rows={3}
                placeholder="Describe the expected outcomes of this research..."
              />
            </div>
          </div>
        );
      
      default:
        return null;
    }
  };

  if (!isOpen) return null;

  return (
    <div className="task-form-overlay">
      <div className="task-form">
        <div className="task-form-header">
          <h2>{mode === 'create' ? 'Create New Task' : 'Edit Task'}</h2>
          <button onClick={handleClose} className="btn-close">×</button>
        </div>

        <form onSubmit={handleSubmit(handleFormSubmit)}>
          <div className="form-row">
            <div className="form-group">
              <label>Title *</label>
              <input
                {...register('title', { 
                  required: 'Title is required',
                  minLength: { value: 3, message: 'Title must be at least 3 characters' }
                })}
                className="form-input"
                placeholder="Enter task title"
              />
              {errors.title && <span className="error-message">{errors.title.message}</span>}
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Task Type *</label>
              <select {...register('taskType')} className="form-select">
                {TASK_TYPES.map(type => (
                  <option key={type} value={type}>{type}</option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label>Priority *</label>
              <select {...register('priority')} className="form-select">
                {PRIORITIES.map(priority => (
                  <option key={priority} value={priority}>{priority}</option>
                ))}
              </select>
            </div>

            {mode === 'edit' && (
              <div className="form-group">
                <label>Status</label>
                <select {...register('status')} className="form-select">
                  {STATUSES.map(status => (
                    <option key={status} value={status}>{status}</option>
                  ))}
                </select>
              </div>
            )}
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Project</label>
              <select {...register('projectId')} className="form-select">
                <option value="">Select Project</option>
                {projects.map(project => (
                  <option key={project.id} value={project.id}>{project.name}</option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label>Assignee</label>
              <select {...register('assigneeId')} className="form-select">
                <option value="">Select Assignee</option>
                {availableUsers.map(user => (
                  <option key={user.id} value={user.id}>{user.name}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="form-group">
            <label>Description</label>
            <textarea
              {...register('description', {
                maxLength: { value: 500, message: 'Description cannot exceed 500 characters' }
              })}
              className="form-textarea"
              rows={3}
              placeholder="Enter task description (max 500 characters)"
            />
            {errors.description && <span className="error-message">{errors.description.message}</span>}
          </div>

          <div className="form-group">
            <label>Due Date</label>
            <input
              type="date"
              {...register('dueDate')}
              className="form-input"
            />
          </div>

          {renderDynamicFields()}

          <div className="form-group">
            <label>Subtasks</label>
            {subtaskFields.map((field, index) => (
              <div key={field.id} className="field-array-item">
                <input
                  {...register(`subtasks.${index}.title`)}
                  placeholder={`Subtask ${index + 1}`}
                  className="form-input"
                />
                <label className="checkbox-label">
                  <input type="checkbox" {...register(`subtasks.${index}.completed`)} />
                  Done
                </label>
                {index > 0 && (
                  <button type="button" onClick={() => removeSubtask(index)} className="btn-remove">
                    Remove
                  </button>
                )}
              </div>
            ))}
            <button type="button" onClick={() => appendSubtask({ title: '', completed: false })} className="btn-add">
              + Add Subtask
            </button>
          </div>

          <div className="form-actions">
            <button type="button" onClick={handleClose} className="btn-cancel">
              Cancel
            </button>
            <button type="submit" disabled={loading || !isValid} className="btn-submit">
              {loading ? 'Saving...' : mode === 'create' ? 'Create Task' : 'Update Task'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default TaskForm;
