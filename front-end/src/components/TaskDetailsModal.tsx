import { useState, useEffect, useRef } from "react";
import { useForm } from "react-hook-form";
import { taskApi } from "../api/task.api";
import { getAllUsers } from "../api/auth.api";
import type { Task, UpdateTaskPayload } from "../types/task.types";
import type { User } from "../types/auth.types";
import { useAuth } from "../context/AuthContext";
import { ValidationService } from "../utils/validation";

interface TaskDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  taskId: string | null;
  onTaskUpdated: () => void;
  mutate?: (data?: any, shouldRevalidate?: boolean) => Promise<any>;
}

const TaskDetailsModal = ({ isOpen, onClose, taskId, onTaskUpdated, mutate }: TaskDetailsModalProps) => {
  const [loading, setLoading] = useState(false);
  const [taskLoading, setTaskLoading] = useState(false);
  const [usersLoading, setUsersLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [task, setTask] = useState<Task | null>(null);
  const [users, setUsers] = useState<User[]>([]);
  const { user } = useAuth();
  const modalRef = useRef<HTMLDivElement>(null);

  // Handle escape key to close modal
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      // Focus the modal when it opens
      setTimeout(() => {
        if (modalRef.current) {
          modalRef.current.focus();
        }
      }, 0);
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
    };
  }, [isOpen, onClose]);
  
  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors },
  } = useForm<UpdateTaskPayload>({
    defaultValues: {
      assignedToIds: [],
    }
  });

  const assignedToIds = watch("assignedToIds", []);

  // Fetch task details when taskId changes
  useEffect(() => {
    if (isOpen && taskId) {
      fetchTaskDetails();
      fetchUsers();
    } else {
      setTask(null);
      reset();
    }
  }, [isOpen, taskId]);

  const fetchUsers = async () => {
    try {
      setUsersLoading(true);
      const usersData = await getAllUsers();
      setUsers(usersData);
    } catch (err: any) {
      console.error("Failed to fetch users:", err);
    } finally {
      setUsersLoading(false);
    }
  };

  const fetchTaskDetails = async () => {
    try {
      setTaskLoading(true);
      setError(null);
      const taskData = await taskApi.getTaskById(taskId!);
      setTask(taskData);
      
      // Populate form with task data
      setValue("title", taskData.title);
      setValue("description", taskData.description || "");
      setValue("dueDate", taskData.dueDate.split("T")[0]); // Format date for input
      setValue("priority", taskData.priority);
      setValue("status", taskData.status);
      setValue("assignedToIds", taskData.assignedToIds || []);
    } catch (err: any) {
      setError(err.response?.data?.message || err.message || "Failed to load task details");
      console.error(err);
    } finally {
      setTaskLoading(false);
    }
  };

  // Field-specific errors (shown on blur and submit)
  const [titleError, setTitleError] = useState<string | null>(null);
  const [descriptionError, setDescriptionError] = useState<string | null>(null);
  const [dueDateError, setDueDateError] = useState<string | null>(null);
  const [priorityError, setPriorityError] = useState<string | null>(null);
  const [statusError, setStatusError] = useState<string | null>(null);
  const [assignedToError, setAssignedToError] = useState<string | null>(null);

  // Helper function to auto-capitalize first letter of title
  const autoCapitalizeTitle = (value: string): string => {
    if (!value) return value;
    return value.charAt(0).toUpperCase() + value.slice(1);
  };

  // Handle title change with auto-capitalization
  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    // Auto-capitalize first letter
    const capitalizedValue = autoCapitalizeTitle(value);
    setValue("title", capitalizedValue);
  };

  // Handle description change without real-time validation
  const handleDescriptionChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const value = e.target.value;
    setValue("description", value);
  };

  // Handle due date change without real-time validation
  const handleDueDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setValue("dueDate", value);
  };

  // Handle priority change without real-time validation
  const handlePriorityChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const value = e.target.value;
    setValue("priority", value);
  };

  // Handle status change without real-time validation
  const handleStatusChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const value = e.target.value;
    setValue("status", value);
  };

  // Validation on blur (when user leaves the field)
  const handleTitleBlur = () => {
    const value = watch("title") || "";
    if (value) {
      const error = ValidationService.validateTaskTitle(value);
      setTitleError(error?.message ?? null);
    } else {
      setTitleError(null);
    }
  };

  const handleDescriptionBlur = () => {
    const value = watch("description") || "";
    if (value) {
      const error = ValidationService.validateTaskDescription(value);
      setDescriptionError(error?.message ?? null);
    } else {
      setDescriptionError(null);
    }
  };

  const handleDueDateBlur = () => {
    const value = watch("dueDate") || "";
    if (value) {
      const error = ValidationService.validateTaskDueDate(value);
      setDueDateError(error?.message ?? null);
    } else {
      setDueDateError(null);
    }
  };

  const handlePriorityBlur = () => {
    const value = watch("priority") || "";
    if (value) {
      const error = ValidationService.validateTaskPriority(value);
      setPriorityError(error?.message ?? null);
    } else {
      setPriorityError(null);
    }
  };

  const handleStatusBlur = () => {
    const value = watch("status") || "";
    if (value) {
      const error = ValidationService.validateTaskStatus(value);
      setStatusError(error?.message ?? null);
    } else {
      setStatusError(null);
    }
  };

  const onSubmit = async (data: UpdateTaskPayload) => {
    try {
      if (!taskId) return;
      
      // Check if user is the task creator (owner)
      if (task?.creatorId !== user?.id) {
        throw new Error("Only the task owner can update this task");
      }
      
      setLoading(true);
      setError(null);
      
      // Clear previous field errors
      setTitleError(null);
      setDescriptionError(null);
      setDueDateError(null);
      setPriorityError(null);
      setStatusError(null);
      setAssignedToError(null);
      
      // Validation on submit - only validate fields that are present
      let hasValidationErrors = false;
      
      if (data.title) {
        const titleValidationError = ValidationService.validateTaskTitle(data.title);
        setTitleError(titleValidationError?.message ?? null);
        if (titleValidationError) hasValidationErrors = true;
      }
      
      if (data.description) {
        const descriptionValidationError = ValidationService.validateTaskDescription(data.description);
        setDescriptionError(descriptionValidationError?.message ?? null);
        if (descriptionValidationError) hasValidationErrors = true;
      }
      
      if (data.dueDate) {
        const dueDateValidationError = ValidationService.validateTaskDueDate(data.dueDate);
        setDueDateError(dueDateValidationError?.message ?? null);
        if (dueDateValidationError) hasValidationErrors = true;
      }
      
      if (data.priority) {
        const priorityValidationError = ValidationService.validateTaskPriority(data.priority);
        setPriorityError(priorityValidationError?.message ?? null);
        if (priorityValidationError) hasValidationErrors = true;
      }
      
      if (data.status) {
        const statusValidationError = ValidationService.validateTaskStatus(data.status);
        setStatusError(statusValidationError?.message ?? null);
        if (statusValidationError) hasValidationErrors = true;
      }
      
      // Check if at least one user is assigned
      if (data.assignedToIds && data.assignedToIds.length === 0) {
        setAssignedToError("At least one user must be assigned to the task");
        hasValidationErrors = true;
      }
      
      // If any validation fails, prevent submission
      if (hasValidationErrors) {
        return;
      }
      
      // Optimistic update if mutate function is provided
      if (mutate) {
        // Update UI immediately
        mutate(async (currentData: any) => {
          if (!currentData) return currentData;
          
          // Update the specific task optimistically
          return currentData.map((task: Task) => 
            task._id === taskId ? { ...task, ...data } : task
        );
        }, false);
      }
      
      await taskApi.updateTask(taskId, data);
      
      // Revalidate if mutate function is provided
      if (mutate) {
        mutate();
      }
      
      onTaskUpdated();
      onClose();
    } catch (err: any) {
      setError(err.response?.data?.message || err.message || "Failed to update task");
      console.error(err);
      
      // Revalidate on error to rollback if mutate function is provided
      if (mutate) {
        mutate();
      }
    } finally {
      setLoading(false);
    }
  };

  // Delete task function
  const onDeleteTask = async () => {
    if (!taskId || !task) return;
    
    try {
      // Check if user is the task creator (owner)
      if (task.creatorId !== user?.id) {
        throw new Error("Only the task owner can delete this task");
      }
      
      if (window.confirm(`Are you sure you want to delete the task "${task.title}"? This action cannot be undone.`)) {
        // Optimistic update if mutate function is provided
        if (mutate) {
          // Remove task from UI immediately
          mutate(async (currentData: any) => {
            if (!currentData) return currentData;
            return currentData.filter((t: Task) => t._id !== taskId);
          }, false);
        }
        
        // Make API call
        await taskApi.deleteTask(taskId);
        
        // Revalidate if mutate function is provided
        if (mutate) {
          mutate();
        }
        
        // Close modal and notify parent
        onClose();
        onTaskUpdated();
        
        // Show success message
        alert("Task deleted successfully!");
      }
    } catch (err: any) {
      setError(err.response?.data?.message || err.message || "Failed to delete task");
      console.error(err);
      
      // Revalidate on error to rollback if mutate function is provided
      if (mutate) {
        mutate();
      }
      
    }
  };

  const toggleUserSelection = (userId: string) => {
    // Only allow task owner to modify assignments
    if (task?.creatorId !== user?.id) {
      return;
    }
    
    const newAssignedToIds = assignedToIds && assignedToIds.includes(userId)
      ? assignedToIds.filter(id => id !== userId)
      : [...assignedToIds, userId];
    
    setValue("assignedToIds", newAssignedToIds);
    
    // Clear assigned to error when a user is selected
    if (newAssignedToIds.length > 0) {
      setAssignedToError(null);
    }
  };

  // Check if current user is the task owner
  const isTaskOwner = task?.creatorId === user?.id;
  
  // Check if current user is assigned to the task
  const isAssignedToTask = task?.assignedToIds?.includes(user?.id || '') || false;

  if (!isOpen) return null;

  return (
    <div 
      ref={modalRef}
      tabIndex={-1}
      className="fixed inset-0 bg-black/40 bg-opacity-30 flex items-center justify-center p-4 z-50 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-title"
    >
      <div 
        className="bg-white rounded-2xl shadow-xl w-full max-w-2xl max-h-[90vh] flex flex-col"
        role="document"
      >
        <div className="p-6 flex-shrink-0">
          <div className="flex justify-between items-center mb-4">
            <h3 id="modal-title" className="text-xl font-bold text-gray-900">Task Details</h3>
            <button 
              onClick={onClose}
              className="text-gray-400 hover:text-gray-500"
              aria-label="Close"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
              </svg>
            </button>
          </div>
          
          {taskLoading ? (
            <div className="flex justify-center items-center py-12">
              <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600"></div>
            </div>
          ) : error && !task ? (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl">
              <div className="flex items-center">
                <svg className="w-5 h-5 text-red-400 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                </svg>
                <h4 className="text-sm font-medium text-red-800">Error loading task</h4>
              </div>
              <p className="mt-2 text-sm text-red-700">{error}</p>
              <div className="mt-4">
                <button
                  onClick={fetchTaskDetails}
                  className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors text-sm"
                >
                  Retry
                </button>
              </div>
            </div>
          ) : null}
        </div>

        {task && (
          <div className="flex-grow overflow-y-auto px-6 pb-6">
            <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col h-full">
              <div className="mb-5">
                <label htmlFor="task-title" className="block text-sm font-medium text-gray-700 mb-2">
                  Title *
                </label>
                <input
                  id="task-title"
                  {...register("title")}
                  className={`w-full px-4 py-3 border ${titleError ? 'border-red-500' : 'border-gray-300'} rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition ${!isTaskOwner ? 'bg-gray-100 cursor-not-allowed' : ''}`}
                  placeholder="Enter task title"
                  aria-invalid={titleError ? "true" : "false"}
                  aria-describedby={titleError ? "title-error" : undefined}
                  disabled={!isTaskOwner}
                  onChange={handleTitleChange}
                  onBlur={handleTitleBlur}
                />
                {titleError && (
                  <p id="title-error" className="mt-2 text-sm text-red-600 flex items-center">
                    <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                    </svg>
                    {titleError}
                  </p>
                )}
              </div>

              <div className="mb-5">
                <label htmlFor="task-description" className="block text-sm font-medium text-gray-700 mb-2">
                  Description
                </label>
                <textarea
                  id="task-description"
                  {...register("description")}
                  className={`w-full px-4 py-3 border ${descriptionError ? 'border-red-500' : 'border-gray-300'} rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition ${!isTaskOwner ? 'bg-gray-100 cursor-not-allowed' : ''}`}
                  placeholder="Describe your task..."
                  rows={4}
                  aria-invalid={descriptionError ? "true" : "false"}
                  aria-describedby={descriptionError ? "description-error" : "description-help"}
                  disabled={!isTaskOwner}
                  onChange={handleDescriptionChange}
                  onBlur={handleDescriptionBlur}
                />
                <p id="description-help" className="mt-1 text-sm text-gray-500">Optional (max 150 characters)</p>
                {descriptionError && (
                  <p id="description-error" className="mt-2 text-sm text-red-600 flex items-center">
                    <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                    </svg>
                    {descriptionError}
                  </p>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-5">
                <div>
                  <label htmlFor="task-due-date" className="block text-sm font-medium text-gray-700 mb-2">
                    Due Date *
                  </label>
                  <input
                    id="task-due-date"
                    type="date"
                    {...register("dueDate")}
                    className={`w-full px-4 py-3 border ${dueDateError ? 'border-red-500' : 'border-gray-300'} rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition ${!isTaskOwner ? 'bg-gray-100 cursor-not-allowed' : ''}`}
                    aria-invalid={dueDateError ? "true" : "false"}
                    aria-describedby={dueDateError ? "due-date-error" : undefined}
                    disabled={!isTaskOwner}
                    onChange={handleDueDateChange}
                    onBlur={handleDueDateBlur}
                  />
                  {dueDateError && (
                    <p id="due-date-error" className="mt-2 text-sm text-red-600 flex items-center">
                      <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                      </svg>
                      {dueDateError}
                    </p>
                  )}
                </div>

                <div>
                  <label htmlFor="task-status" className="block text-sm font-medium text-gray-700 mb-2">
                    Status *
                  </label>
                  <select
                    id="task-status"
                    {...register("status")}
                    className={`w-full px-4 py-3 border ${statusError ? 'border-red-500' : 'border-gray-300'} rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition ${!isTaskOwner ? 'bg-gray-100 cursor-not-allowed' : ''}`}
                    aria-invalid={statusError ? "true" : "false"}
                    aria-describedby={statusError ? "status-error" : undefined}
                    disabled={!isTaskOwner}
                    onChange={handleStatusChange}
                    onBlur={handleStatusBlur}
                  >
                    <option value="To Do">To Do</option>
                    <option value="In Progress">In Progress</option>
                    <option value="Review">Review</option>
                    <option value="Completed">Completed</option>
                  </select>
                  {statusError && (
                    <p id="status-error" className="mt-2 text-sm text-red-600 flex items-center">
                      <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                      </svg>
                      {statusError}
                    </p>
                  )}
                </div>
              </div>

              <div className="mb-6">
                <label htmlFor="task-priority" className="block text-sm font-medium text-gray-700 mb-2">
                  Priority *
                </label>
                <select
                  id="task-priority"
                  {...register("priority")}
                  className={`w-full px-4 py-3 border ${priorityError ? 'border-red-500' : 'border-gray-300'} rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition ${!isTaskOwner ? 'bg-gray-100 cursor-not-allowed' : ''}`}
                  aria-invalid={priorityError ? "true" : "false"}
                  aria-describedby={priorityError ? "priority-error" : undefined}
                  disabled={!isTaskOwner}
                  onChange={handlePriorityChange}
                  onBlur={handlePriorityBlur}
                >
                  <option value="Low">Low</option>
                  <option value="Medium">Medium</option>
                  <option value="High">High</option>
                  <option value="Urgent">Urgent</option>
                </select>
                {priorityError && (
                  <p id="priority-error" className="mt-2 text-sm text-red-600 flex items-center">
                    <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                    </svg>
                    {priorityError}
                  </p>
                )}
              </div>

              <div className="mb-6 flex-grow">
                <fieldset>
                  <legend className="block text-sm font-medium text-gray-700 mb-2">
                    Assign To *
                  </legend>
                  <div className={`border border-gray-300 rounded-lg max-h-40 overflow-y-auto ${!isTaskOwner ? 'opacity-70' : ''}`} role="group" aria-label="Assign task to users">
                    {usersLoading ? (
                      <div className="p-4 text-center text-gray-500">
                        Loading users...
                      </div>
                    ) : (
                      <div className="divide-y divide-gray-200">
                        {users.map(u => (
                          <div 
                            key={u._id} 
                            className={`flex items-center p-3 hover:${isTaskOwner ? 'bg-gray-50' : 'bg-white'} cursor-${isTaskOwner ? 'pointer' : 'not-allowed'}`}
                            onClick={() => isTaskOwner && toggleUserSelection(u._id)}
                            role="checkbox"
                            aria-checked={assignedToIds.includes(u._id)}
                            tabIndex={isTaskOwner ? 0 : -1}
                            onKeyDown={(e) => {
                              if (isTaskOwner && (e.key === 'Enter' || e.key === ' ')) {
                                toggleUserSelection(u._id);
                              }
                            }}
                          >
                            <div className="flex items-center h-5">
                              <input
                                type="checkbox"
                                id={`user-${u._id}`}
                                checked={assignedToIds.includes(u._id)}
                                className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                                readOnly
                                aria-label={`Assign task to ${u.name}`}
                                disabled={!isTaskOwner}
                              />
                            </div>
                            <div className="ml-3 flex items-center">
                              <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-800 font-semibold text-xs mr-3" aria-hidden="true">
                                {u.name?.charAt(0)?.toUpperCase() || 'U'}
                              </div>
                              <div>
                                <label htmlFor={`user-${u._id}`} className="text-sm font-medium text-gray-900">{u.name}</label>
                                <p className="text-xs text-gray-500">{u.email}</p>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </fieldset>
                {assignedToError && (
                  <p id="assign-error" className="mt-2 text-sm text-red-600 flex items-center">
                    <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                    </svg>
                    {assignedToError}
                  </p>
                )}
                
                {/* Permission notice for non-owners */}
                {!isTaskOwner && (
                  <div className="mt-2 text-sm text-gray-500">
                    Only the task owner can modify assignments
                  </div>
                )}
              </div>

              <div className="mb-6 p-4 bg-gray-50 rounded-lg">
                <div className="flex items-center mb-2">
                  <svg className="w-5 h-5 text-gray-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path>
                  </svg>
                  <label className="block text-sm font-medium text-gray-700">
                    Task Information
                  </label>
                </div>
                <div className="text-sm text-gray-600 space-y-1">
                  <p><span className="font-medium">Created:</span> {new Date(task.createdAt).toLocaleString()}</p>
                  <p><span className="font-medium">Last Updated:</span> {new Date(task.updatedAt).toLocaleString()}</p>
                  <p><span className="font-medium">Creator:</span> {task.creatorId === user?.id ? "You" : "Someone else"}</p>
                  <div>
                    <span className="font-medium">Assigned To:</span>
                    <ul className="list-disc list-inside ml-2">
                      {task.assignedToIds && task.assignedToIds.map((id, index) => {
                        const assignedUser = users.find(u => u._id === id);
                        return (
                          <li key={id}>
                            {assignedUser ? assignedUser.name : "Unknown user"}
                            {id === user?.id ? " (You)" : ""}
                          </li>
                        );
                      })}
                    </ul>
                  </div>
                </div>
              </div>

              {/* Permission notice for non-owners */}
              {!isTaskOwner && (
                <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                  <div className="flex">
                    <svg className="w-5 h-5 text-blue-400 mr-2 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                    </svg>
                    <div>
                      <p className="text-sm font-medium text-blue-800">View-only Mode</p>
                      <p className="text-sm text-blue-700">Only the task owner can make changes to this task.</p>
                    </div>
                  </div>
                </div>
              )}

              {error && (
                <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl">
                  <div className="flex items-center">
                    <svg className="w-5 h-5 text-red-400 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                    </svg>
                    <h4 className="text-sm font-medium text-red-800">Error updating task</h4>
                  </div>
                  <p className="mt-2 text-sm text-red-700">{error}</p>
                </div>
              )}

              <div className="flex justify-end space-x-3 pt-2 mt-auto">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-5 py-2.5 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                >
                  Close
                </button>
                {isTaskOwner && (
                  <>
                    <button
                      type="button"
                      onClick={onDeleteTask}
                      className="px-5 py-2.5 text-sm font-medium text-white bg-red-600 rounded-lg hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transition-colors flex items-center"
                      disabled={loading}
                    >
                      <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path>
                      </svg>
                      Delete Task
                    </button>
                    <button
                      type="submit"
                      disabled={loading}
                      className="px-5 py-2.5 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
                    >
                      {loading ? (
                        <>
                          <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                          </svg>
                          Updating...
                        </>
                      ) : "Update Task"}
                    </button>
                  </>
                )}
              </div>
            </form>
          </div>
        )}
      </div>
    </div>
  );
};

export default TaskDetailsModal;