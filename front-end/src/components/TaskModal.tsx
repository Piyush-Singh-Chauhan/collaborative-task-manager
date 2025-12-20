import { useState } from "react";
import { useForm } from "react-hook-form";
import { taskApi } from "../api/task.api";
import { getAllUsers } from "../api/auth.api";
import type { CreateTaskPayload } from "../types/task.types";
import type { User } from "../types/auth.types";
import { ValidationService } from "../utils/validation";

interface TaskModalProps {
  isOpen: boolean;
  onClose: () => void;
  onTaskCreated: () => void;
  mutate?: (data?: any, shouldRevalidate?: boolean) => Promise<any>;
}

const TaskModal = ({ isOpen, onClose, onTaskCreated, mutate }: TaskModalProps) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [users, setUsers] = useState<User[]>([]);
  const [usersLoading, setUsersLoading] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
  } = useForm<CreateTaskPayload>({
    defaultValues: {
      assignedToIds: [],
    }
  });

  const assignedToIds = watch("assignedToIds", []);

  // Fetch users when modal opens
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

  // Load users when modal opens
  if (isOpen && users.length === 0 && !usersLoading) {
    fetchUsers();
  }

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
    const value = e.target.value as "Low" | "Medium" | "High" | "Urgent";
    setValue("priority", value);
  };

  // Toggle user selection
  const toggleUserSelection = (userId: string) => {
    const newAssignedToIds = assignedToIds && assignedToIds.includes(userId)
      ? assignedToIds.filter(id => id !== userId)
      : [...(assignedToIds || []), userId];
    
    setValue("assignedToIds", newAssignedToIds);
    
    // Clear assigned to error when a user is selected
    if (newAssignedToIds.length > 0) {
      setAssignedToError(null);
    }
  };

  // Field-specific errors (shown on blur and submit)
  const [titleError, setTitleError] = useState<string | null>(null);
  const [descriptionError, setDescriptionError] = useState<string | null>(null);
  const [dueDateError, setDueDateError] = useState<string | null>(null);
  const [priorityError, setPriorityError] = useState<string | null>(null);
  const [assignedToError, setAssignedToError] = useState<string | null>(null);

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

  const onSubmit = async (data: CreateTaskPayload) => {
    try {
      setLoading(true);
      setError(null);
      
      // Clear previous field errors
      setTitleError(null);
      setDescriptionError(null);
      setDueDateError(null);
      setPriorityError(null);
      setAssignedToError(null);
      
      // Validation on submit
      const titleValidationError = ValidationService.validateTaskTitle(data.title);
      const descriptionValidationError = ValidationService.validateTaskDescription(data.description || "");
      const dueDateValidationError = ValidationService.validateTaskDueDate(data.dueDate);
      const priorityValidationError = ValidationService.validateTaskPriority(data.priority);
      
      // Check if at least one user is assigned
      if (!data.assignedToIds || data.assignedToIds.length === 0) {
        setAssignedToError("At least one user must be assigned to the task");
        return;
      }

      setTitleError(titleValidationError?.message ?? null);
      setDescriptionError(descriptionValidationError?.message ?? null);
      setDueDateError(dueDateValidationError?.message ?? null);
      setPriorityError(priorityValidationError?.message ?? null);
      
      // If any validation fails, prevent submission
      if (titleValidationError || descriptionValidationError || dueDateValidationError || priorityValidationError) {
        return;
      }
      
      // Optimistic update if mutate function is provided
      if (mutate) {
        // Add new task to UI immediately
        mutate(async (currentData: any) => {
          if (!currentData) return [data as any];
          return [...currentData, data];
        }, false);
      }
      
      await taskApi.createTask(data);
      
      // Revalidate if mutate function is provided
      if (mutate) {
        mutate();
      }
      
      reset();
      onTaskCreated();
      onClose();
    } catch (err: any) {
      setError(err.response?.data?.message || err.message || "Failed to create task");
      console.error(err);
      
      // Revalidate on error to rollback if mutate function is provided
      if (mutate) {
        mutate();
      }
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center p-4 z-50 backdrop-blur-sm"
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
            <h3 id="modal-title" className="text-xl font-bold text-gray-900">Create New Task</h3>
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
        </div>

        <div className="flex-grow overflow-y-auto px-6 pb-6">
          <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col h-full">
            <div className="mb-5">
              <label htmlFor="task-title" className="block text-sm font-medium text-gray-700 mb-2">
                Title *
              </label>
              <input
                id="task-title"
                {...register("title", { required: "Title is required" })}
                className={`w-full px-4 py-3 border ${titleError ? 'border-red-500' : 'border-gray-300'} rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition`}
                placeholder="Enter task title"
                aria-invalid={titleError ? "true" : "false"}
                aria-describedby={titleError ? "title-error" : undefined}
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
                className={`w-full px-4 py-3 border ${descriptionError ? 'border-red-500' : 'border-gray-300'} rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition`}
                placeholder="Describe your task..."
                rows={4}
                aria-invalid={descriptionError ? "true" : "false"}
                aria-describedby={descriptionError ? "description-error" : "description-help"}
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
                  {...register("dueDate", { required: "Due date is required" })}
                  className={`w-full px-4 py-3 border ${dueDateError ? 'border-red-500' : 'border-gray-300'} rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition`}
                  aria-invalid={dueDateError ? "true" : "false"}
                  aria-describedby={dueDateError ? "due-date-error" : undefined}
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
                <label htmlFor="task-priority" className="block text-sm font-medium text-gray-700 mb-2">
                  Priority *
                </label>
                <select
                  id="task-priority"
                  {...register("priority", { required: "Priority is required" })}
                  className={`w-full px-4 py-3 border ${priorityError ? 'border-red-500' : 'border-gray-300'} rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition`}
                  aria-invalid={priorityError ? "true" : "false"}
                  aria-describedby={priorityError ? "priority-error" : undefined}
                  onChange={handlePriorityChange}
                  onBlur={handlePriorityBlur}
                >
                  <option value="">Select priority</option>
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
            </div>

            <div className="mb-6 flex-grow">
              <fieldset>
                <legend className="block text-sm font-medium text-gray-700 mb-2">
                  Assign To *
                </legend>
                <div className="border border-gray-300 rounded-lg max-h-40 overflow-y-auto" role="group" aria-label="Assign task to users">
                  {usersLoading ? (
                    <div className="p-4 text-center text-gray-500">
                      Loading users...
                    </div>
                  ) : (
                    <div className="divide-y divide-gray-200">
                      {users.map(u => (
                        <div 
                          key={u.id} 
                          className="flex items-center p-3 hover:bg-gray-50 cursor-pointer"
                          onClick={() => toggleUserSelection(u.id)}
                          role="checkbox"
                          aria-checked={assignedToIds?.includes(u.id) || false}
                          tabIndex={0}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter' || e.key === ' ') {
                              toggleUserSelection(u.id);
                            }
                          }}
                        >
                          <div className="flex items-center h-5">
                            <input
                              type="checkbox"
                              id={`user-${u.id}`}
                              checked={assignedToIds?.includes(u.id) || false}
                              className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                              readOnly
                              aria-label={`Assign task to ${u.name}`}
                            />
                          </div>
                          <div className="ml-3 flex items-center">
                            <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-800 font-semibold text-xs mr-3" aria-hidden="true">
                              {u.name?.charAt(0)?.toUpperCase() || 'U'}
                            </div>
                            <div>
                              <label htmlFor={`user-${u.id}`} className="text-sm font-medium text-gray-900">{u.name}</label>
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
            </div>

            {error && (
              <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl">
                <div className="flex items-center">
                  <svg className="w-5 h-5 text-red-400 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                  </svg>
                  <h4 className="text-sm font-medium text-red-800">Error creating task</h4>
                </div>
                <p className="mt-2 text-sm text-red-700">{error}</p>
              </div>
            )}

            <div className="flex justify-end space-x-3 pt-2 mt-auto">
              <button
                type="button"
                onClick={() => {
                  reset();
                  onClose();
                }}
                className="px-5 py-2.5 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
              >
                Cancel
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
                    Creating...
                  </>
                ) : "Create Task"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default TaskModal;