import { useState, useMemo } from "react";
import useSWR from "swr";
import { taskApi } from "../../api/task.api";
import Navbar from "../../components/layout/Navbar";
import Sidebar from "../../components/layout/Sidebar";
import TaskModal from "../../components/TaskModal";
import TaskDetailsModal from "../../components/TaskDetailsModal";
import { useAuth } from "../../context/AuthContext";

const TasksPage = () => {
  const { user } = useAuth();
  const [filters, setFilters] = useState({
    status: "",
    priority: "",
    sortBy: "dueDate",
  });
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
  const [selectedTaskId, setSelectedTaskId] = useState<string | null>(null);
  const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false);
  const [taskToDelete, setTaskToDelete] = useState<{id: string, title: string} | null>(null);

  // Create a cache key based on filters
  const cacheKey = useMemo(() => {
    return [
      "tasks",
      filters.status,
      filters.priority,
      filters.sortBy,
    ].filter(Boolean).join("-");
  }, [filters]);

  // SWR fetcher
  const fetcher = () => taskApi.getFilteredTasks(filters);

  // Use SWR for data fetching
  const { data: tasks, error, isLoading, mutate } = useSWR(cacheKey, fetcher, {
    revalidateOnFocus: false,
    revalidateOnReconnect: true,
  });

  const handleFilterChange = (filterName: string, value: string) => {
    setFilters(prev => ({
      ...prev,
      [filterName]: value,
    }));
  };

  const clearFilters = () => {
    setFilters({
      status: "",
      priority: "",
      sortBy: "dueDate",
    });
  };

  // Optimistic update for task status
  const updateTaskStatusOptimistically = async (taskId: string, newStatus: string) => {
    // Create optimistic data
    const optimisticData = tasks?.map(task => 
      task._id === taskId ? { ...task, status: newStatus } : task
    ) || [];

    // Update UI immediately
    mutate(optimisticData, false);

    try {
      // Make API call
      await taskApi.updateTask(taskId, { status: newStatus });
      
      // Revalidate to ensure consistency
      mutate();
    } catch (error) {
      // Rollback on error
      mutate();
      console.error("Failed to update task status:", error);
    }
  };

  // Optimistic update for task priority
  const updateTaskPriorityOptimistically = async (taskId: string, newPriority: string) => {
    // Create optimistic data
    const optimisticData = tasks?.map(task => 
      task._id === taskId ? { ...task, priority: newPriority } : task
    ) || [];

    // Update UI immediately
    mutate(optimisticData, false);

    try {
      // Make API call
      await taskApi.updateTask(taskId, { priority: newPriority });
      
      // Revalidate to ensure consistency
      mutate();
    } catch (error) {
      // Rollback on error
      mutate();
      console.error("Failed to update task priority:", error);
    }
  };

  // Delete task function
  const deleteTask = async () => {
    if (!taskToDelete) return;
    
    try {
      // Optimistic update - remove task from UI immediately
      const optimisticData = tasks?.filter(task => task._id !== taskToDelete.id) || [];
      mutate(optimisticData, false);
      
      // Close confirmation dialog
      setIsDeleteConfirmOpen(false);
      
      // Make API call
      await taskApi.deleteTask(taskToDelete.id);
      
      // Revalidate to ensure consistency
      mutate();
      
      // Clear task to delete
      setTaskToDelete(null);
      
      // Show success message
      alert("Task deleted successfully!");
    } catch (error: any) {
      // Rollback on error
      mutate();
      console.error("Failed to delete task:", error);
      // Show error message
      alert(`Failed to delete task: ${error.response?.data?.message || error.message || "Please try again."}`);
    }
  };

  // Open delete confirmation dialog
  const openDeleteConfirmation = (taskId: string, taskTitle: string) => {
    setTaskToDelete({ id: taskId, title: taskTitle });
    setIsDeleteConfirmOpen(true);
  };

  // Close delete confirmation dialog
  const closeDeleteConfirmation = () => {
    setIsDeleteConfirmOpen(false);
    setTaskToDelete(null);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "To Do": return "bg-gray-100 text-gray-800";
      case "In Progress": return "bg-blue-100 text-blue-800";
      case "Review": return "bg-yellow-100 text-yellow-800";
      case "Completed": return "bg-green-100 text-green-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "Low": return "bg-green-100 text-green-800";
      case "Medium": return "bg-yellow-100 text-yellow-800";
      case "High": return "bg-orange-100 text-orange-800";
      case "Urgent": return "bg-red-100 text-red-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
        <Navbar />
        <div className="flex flex-col md:flex-row">
          <div className="md:w-64">
            <Sidebar />
          </div>
          <main className="flex-1 p-4 md:p-6">
            <div className="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <h1 className="text-2xl md:text-3xl font-bold text-gray-800">Tasks</h1>
                <p className="text-gray-600 mt-1">Manage your tasks and track progress</p>
              </div>
              <button 
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center"
              >
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"></path>
                </svg>
                Create Task
              </button>
            </div>
            
            <div className="animate-pulse space-y-6">
              {/* Filters Skeleton */}
              <div className="bg-white rounded-xl shadow-sm p-5">
                <div className="h-5 bg-gray-200 rounded w-1/4 mb-4"></div>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  {[1, 2, 3, 4].map((i) => (
                    <div key={i} className="h-10 bg-gray-200 rounded"></div>
                  ))}
                </div>
              </div>
              
              {/* Task Cards Skeleton */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {[1, 2, 3, 4, 5, 6].map((i) => (
                  <div key={i} className="bg-white rounded-xl shadow-sm p-5">
                    <div className="flex justify-between items-start mb-3">
                      <div className="h-5 bg-gray-200 rounded w-3/4"></div>
                      <div className="h-6 w-16 bg-gray-200 rounded-full"></div>
                    </div>
                    <div className="h-4 bg-gray-200 rounded w-full mb-2"></div>
                    <div className="h-4 bg-gray-200 rounded w-2/3 mb-4"></div>
                    <div className="flex justify-between items-center">
                      <div className="h-5 w-20 bg-gray-200 rounded-full"></div>
                      <div className="h-5 w-20 bg-gray-200 rounded-full"></div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </main>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
        <Navbar />
        <div className="flex flex-col md:flex-row">
          <div className="md:w-64">
            <Sidebar />
          </div>
          <main className="flex-1 p-4 md:p-6">
            <div className="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <h1 className="text-2xl md:text-3xl font-bold text-gray-800">Tasks</h1>
                <p className="text-gray-600 mt-1">Manage your tasks and track progress</p>
              </div>
              <button 
                onClick={() => setIsModalOpen(true)}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center"
              >
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"></path>
                </svg>
                Create Task
              </button>
            </div>
            
            <div className="max-w-3xl mx-auto">
              <div className="bg-red-50 border border-red-200 rounded-xl p-6 text-center">
                <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-red-100 mb-4">
                  <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path>
                  </svg>
                </div>
                <h3 className="text-lg font-medium text-red-800 mb-2">Error loading tasks</h3>
                <p className="text-red-700 mb-4">{error.message || error}</p>
                <button 
                  onClick={() => window.location.reload()}
                  className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                >
                  Retry
                </button>
              </div>
            </div>
          </main>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <Navbar />
      <div className="flex flex-col md:flex-row">
        <div className="md:w-64">
          <Sidebar />
        </div>
        <main className="flex-1 p-4 md:p-6">
          <div className="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-gray-800">Tasks</h1>
              <p className="text-gray-600 mt-1">Manage your tasks and track progress</p>
            </div>
            <button 
              onClick={() => setIsModalOpen(true)}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center"
              aria-label="Create new task"
            >
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"></path>
              </svg>
              Create Task
            </button>
          </div>

          {/* Filters */}
          <div className="bg-white rounded-xl shadow-sm p-5 mb-6">
            <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4 mb-4">
              <h2 className="text-lg font-semibold text-gray-800">Filter Tasks</h2>
              <button
                onClick={clearFilters}
                className="text-sm text-gray-600 hover:text-gray-800 font-medium flex items-center"
                aria-label="Reset all filters"
              >
                <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"></path>
                </svg>
                Reset Filters
              </button>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div>
                <label htmlFor="filter-status" className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                <select
                  id="filter-status"
                  value={filters.status}
                  onChange={(e) => handleFilterChange("status", e.target.value)}
                  className="w-full p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="">All Statuses</option>
                  <option value="To Do">To Do</option>
                  <option value="In Progress">In Progress</option>
                  <option value="Review">Review</option>
                  <option value="Completed">Completed</option>
                </select>
              </div>

              <div>
                <label htmlFor="filter-priority" className="block text-sm font-medium text-gray-700 mb-1">Priority</label>
                <select
                  id="filter-priority"
                  value={filters.priority}
                  onChange={(e) => handleFilterChange("priority", e.target.value)}
                  className="w-full p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="">All Priorities</option>
                  <option value="Low">Low</option>
                  <option value="Medium">Medium</option>
                  <option value="High">High</option>
                  <option value="Urgent">Urgent</option>
                </select>
              </div>

              <div>
                <label htmlFor="filter-sort" className="block text-sm font-medium text-gray-700 mb-1">Sort By</label>
                <select
                  id="filter-sort"
                  value={filters.sortBy}
                  onChange={(e) => handleFilterChange("sortBy", e.target.value)}
                  className="w-full p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="dueDate">Due Date</option>
                  <option value="priority">Priority</option>
                  <option value="status">Status</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Results</label>
                <div className="p-2.5 bg-gray-100 rounded-lg text-sm text-gray-600">
                  {tasks?.length || 0} tasks
                </div>
              </div>
            </div>
          </div>

          {!tasks || tasks.length === 0 ? (
            <div className="bg-white rounded-xl shadow-sm p-12 text-center">
              <div className="mx-auto w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 012-2h2a2 2 0 012 2"></path>
                </svg>
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-1">No tasks found</h3>
              <p className="text-gray-500 mb-6">Get started by creating a new task</p>
              <button 
                onClick={() => setIsModalOpen(true)}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors inline-flex items-center"
              >
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"></path>
                </svg>
                Create Task
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {tasks && tasks.map((task) => (
                <div 
                  key={task._id} 
                  className="bg-white rounded-xl shadow-sm overflow-hidden hover:shadow-md transition-shadow"
                  role="article"
                  aria-labelledby={`task-title-${task._id}`}
                >
                  <div className="p-5">
                    <div className="flex justify-between items-start mb-3">
                      <h3 id={`task-title-${task._id}`} className="font-semibold text-lg text-gray-800">{task.title}</h3>
                      <span className={`text-xs px-2.5 py-0.5 rounded-full ${getStatusColor(task.status)}`}>
                        {task.status}
                      </span>
                    </div>
                    <p className="text-gray-600 text-sm mb-4 line-clamp-2">{task.description}</p>
                    <div className="flex justify-between items-center">
                      <div className="flex flex-col space-y-1">
                        <div className="relative">
                          <label htmlFor={`task-status-${task._id}`} className="sr-only">Task Status</label>
                          <select 
                            id={`task-status-${task._id}`}
                            value={task.status}
                            onChange={(e) => updateTaskStatusOptimistically(task._id, e.target.value)}
                            className={`text-xs px-2.5 py-0.5 rounded-full appearance-none pr-6 ${getStatusColor(task.status)}`}
                            aria-label={`Change status for task ${task.title}`}
                          >
                            <option value="To Do">To Do</option>
                            <option value="In Progress">In Progress</option>
                            <option value="Review">Review</option>
                            <option value="Completed">Completed</option>
                          </select>
                          <div className="absolute inset-y-0 right-0 flex items-center px-1 pointer-events-none">
                            <svg className="w-3 h-3 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path>
                            </svg>
                          </div>
                        </div>
                        <div className="relative">
                          <label htmlFor={`task-priority-${task._id}`} className="sr-only">Task Priority</label>
                          <select 
                            id={`task-priority-${task._id}`}
                            value={task.priority}
                            onChange={(e) => updateTaskPriorityOptimistically(task._id, e.target.value)}
                            className={`text-xs px-2.5 py-0.5 rounded-full appearance-none pr-6 ${getPriorityColor(task.priority)}`}
                            aria-label={`Change priority for task ${task.title}`}
                          >
                            <option value="Low">Low</option>
                            <option value="Medium">Medium</option>
                            <option value="High">High</option>
                            <option value="Urgent">Urgent</option>
                          </select>
                          <div className="absolute inset-y-0 right-0 flex items-center px-1 pointer-events-none">
                            <svg className="w-3 h-3 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path>
                            </svg>
                          </div>
                        </div>
                      </div>
                      <div className="text-xs text-gray-500 flex items-center">
                        <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
                        </svg>
                        {new Date(task.dueDate).toLocaleDateString()}
                      </div>
                    </div>
                  </div>
                  <div className="px-5 py-3 bg-gray-50 border-t border-gray-100 flex justify-between items-center">
                    <div className="text-xs text-gray-500">
                      Created {new Date(task.createdAt).toLocaleDateString()}
                    </div>
                    <div className="flex space-x-2">
                      <button 
                        onClick={() => {
                          setSelectedTaskId(task._id);
                          setIsDetailsModalOpen(true);
                        }}
                        className="text-xs text-blue-600 hover:text-blue-800 font-medium"
                        aria-label={`View details for task ${task.title}`}
                      >
                        View Details
                      </button>
                      {/* Only show delete button if user is the task creator */}
                      {task.creatorId === user?.id && (
                        <button 
                          onClick={() => openDeleteConfirmation(task._id, task.title)}
                          className="text-xs text-red-600 hover:text-red-800 font-medium"
                          aria-label={`Delete task ${task.title}`}
                        >
                          Delete
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </main>
      </div>
      
      <TaskModal 
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onTaskCreated={() => mutate()}
        mutate={mutate}
      />
      
      <TaskDetailsModal
        isOpen={isDetailsModalOpen}
        onClose={() => {
          setIsDetailsModalOpen(false);
          setSelectedTaskId(null);
        }}
        taskId={selectedTaskId}
        onTaskUpdated={() => mutate()}
        mutate={mutate}
      />

      {/* Delete Confirmation Modal */}
      {isDeleteConfirmOpen && (
        <div className="fixed inset-0 bg-black/40 bg-opacity-30 flex items-center justify-center p-4 z-50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md">
            <div className="p-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-xl font-bold text-gray-900">Confirm Deletion</h3>
                <button 
                  onClick={closeDeleteConfirmation}
                  className="text-gray-400 hover:text-gray-500"
                  aria-label="Close"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
                  </svg>
                </button>
              </div>
              
              <div className="mb-6">
                <p className="text-gray-600">
                  Are you sure you want to delete the task <span className="font-semibold">"{taskToDelete?.title}"</span>? 
                  This action cannot be undone.
                </p>
              </div>
              
              <div className="flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={closeDeleteConfirmation}
                  className="px-5 py-2.5 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={deleteTask}
                  className="px-5 py-2.5 text-sm font-medium text-white bg-red-600 rounded-lg hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transition-colors flex items-center"
                >
                  Delete Task
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TasksPage;