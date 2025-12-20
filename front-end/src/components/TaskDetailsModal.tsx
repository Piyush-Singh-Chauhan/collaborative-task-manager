import { useState, useEffect, useRef } from "react";
import { useForm } from "react-hook-form";
import { taskApi } from "../api/task.api";
import { getAllUsers } from "../api/auth.api";
import type { Task, UpdateTaskPayload } from "../types/task.types";
import type { User } from "../types/auth.types";
import { useAuth } from "../context/AuthContext";

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

  const onSubmit = async (data: UpdateTaskPayload) => {
    try {
      if (!taskId) return;
      
      setLoading(true);
      setError(null);
      
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

  const toggleUserSelection = (userId: string) => {
    const newAssignedToIds = assignedToIds && assignedToIds.includes(userId)
      ? assignedToIds.filter(id => id !== userId)
      : [...assignedToIds, userId];
    
    setValue("assignedToIds", newAssignedToIds);
  };

  if (!isOpen) return null;

  return (
    <div 
      ref={modalRef}
      tabIndex={-1}
      className="fixed inset-0 bg-opacity-30 flex items-center justify-center p-4 z-50 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-title"
    >
      <div 
        className="bg-white rounded-2xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto transform transition-all duration-300 scale-100"
        role="document"
      >
        <div className="p-6">
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
          ) : error ? (
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
          ) : task ? (
            <form onSubmit={handleSubmit(onSubmit)}>
              <div className="mb-5">
                <label htmlFor="task-title" className="block text-sm font-medium text-gray-700 mb-2">
                  Title
                </label>
                <input
                  id="task-title"
                  {...register("title", { required: "Title is required" })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
                  placeholder="Enter task title"
                  aria-invalid={errors.title ? "true" : "false"}
                  aria-describedby={errors.title ? "title-error" : undefined}
                />
                {errors.title && (
                  <p id="title-error" className="mt-2 text-sm text-red-600 flex items-center">
                    <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                    </svg>
                    {errors.title.message}
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
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
                  placeholder="Describe your task..."
                  rows={4}
                  aria-describedby="description-help"
                />
                <p id="description-help" className="mt-1 text-sm text-gray-500">Optional</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-5">
                <div>
                  <label htmlFor="task-due-date" className="block text-sm font-medium text-gray-700 mb-2">
                    Due Date
                  </label>
                  <input
                    id="task-due-date"
                    type="date"
                    {...register("dueDate", { required: "Due date is required" })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
                    aria-invalid={errors.dueDate ? "true" : "false"}
                    aria-describedby={errors.dueDate ? "due-date-error" : undefined}
                  />
                  {errors.dueDate && (
                    <p id="due-date-error" className="mt-2 text-sm text-red-600 flex items-center">
                      <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                      </svg>
                      {errors.dueDate.message}
                    </p>
                  )}
                </div>

                <div>
                  <label htmlFor="task-status" className="block text-sm font-medium text-gray-700 mb-2">
                    Status
                  </label>
                  <select
                    id="task-status"
                    {...register("status", { required: "Status is required" })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
                    aria-invalid={errors.status ? "true" : "false"}
                    aria-describedby={errors.status ? "status-error" : undefined}
                  >
                    <option value="To Do">To Do</option>
                    <option value="In Progress">In Progress</option>
                    <option value="Review">Review</option>
                    <option value="Completed">Completed</option>
                  </select>
                  {errors.status && (
                    <p id="status-error" className="mt-2 text-sm text-red-600 flex items-center">
                      <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                      </svg>
                      {errors.status.message}
                    </p>
                  )}
                </div>
              </div>

              <div className="mb-6">
                <label htmlFor="task-priority" className="block text-sm font-medium text-gray-700 mb-2">
                  Priority
                </label>
                <select
                  id="task-priority"
                  {...register("priority", { required: "Priority is required" })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
                  aria-invalid={errors.priority ? "true" : "false"}
                  aria-describedby={errors.priority ? "priority-error" : undefined}
                >
                  <option value="Low">Low</option>
                  <option value="Medium">Medium</option>
                  <option value="High">High</option>
                  <option value="Urgent">Urgent</option>
                </select>
                {errors.priority && (
                  <p id="priority-error" className="mt-2 text-sm text-red-600 flex items-center">
                    <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                    </svg>
                    {errors.priority.message}
                  </p>
                )}
              </div>

              <div className="mb-6">
                <fieldset>
                  <legend className="block text-sm font-medium text-gray-700 mb-2">
                    Assign To
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
                            key={u._id} 
                            className="flex items-center p-3 hover:bg-gray-50 cursor-pointer"
                            onClick={() => toggleUserSelection(u._id)}
                            role="checkbox"
                            aria-checked={assignedToIds.includes(u._id)}
                            tabIndex={0}
                            onKeyDown={(e) => {
                              if (e.key === 'Enter' || e.key === ' ') {
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
                {errors.assignedToIds && (
                  <p id="assign-error" className="mt-2 text-sm text-red-600 flex items-center">
                    <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                    </svg>
                    {errors.assignedToIds.message}
                  </p>
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

              <div className="flex justify-end space-x-3 pt-2">
                <button
                  type="button"
                  onClick={onClose}
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
                      Updating...
                    </>
                  ) : "Update Task"}
                </button>
              </div>
            </form>
          ) : null}
        </div>
      </div>
    </div>
  );
};

export default TaskDetailsModal;