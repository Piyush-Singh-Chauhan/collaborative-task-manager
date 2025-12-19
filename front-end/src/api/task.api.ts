import api from "./axios";
import type { Task, CreateTaskPayload, UpdateTaskPayload, DashboardData } from "../types/task.types";

export const taskApi = {
  // Get all tasks for the current user
  getAllTasks: async (): Promise<Task[]> => {
    const response = await api.get("/tasks");
    return response.data;
  },

  // Get a single task by ID
  getTaskById: async (taskId: string): Promise<Task> => {
    const response = await api.get(`/tasks/${taskId}`);
    return response.data;
  },

  // Create a new task
  createTask: async (payload: CreateTaskPayload): Promise<Task> => {
    const response = await api.post("/tasks", payload);
    return response.data;
  },

  // Update a task
  updateTask: async (taskId: string, payload: UpdateTaskPayload): Promise<Task> => {
    const response = await api.put(`/tasks/${taskId}`, payload);
    return response.data;
  },

  // Delete a task
  deleteTask: async (taskId: string): Promise<void> => {
    await api.delete(`/tasks/${taskId}`);
    },

  // Get dashboard data
  getDashboardData: async (): Promise<DashboardData> => {
    const response = await api.get("/tasks/dashboard");
    return response.data;
  },

  // Get filtered tasks
  getFilteredTasks: async (filters: {
    status?: string;
    priority?: string;
    sortBy?: string;
  }): Promise<Task[]> => {
    const params = new URLSearchParams();
    if (filters.status) params.append("status", filters.status);
    if (filters.priority) params.append("priority", filters.priority);
    if (filters.sortBy) params.append("sortBy", filters.sortBy);

    const response = await api.get(`/tasks/filter?${params.toString()}`);
    return response.data;
  },
};