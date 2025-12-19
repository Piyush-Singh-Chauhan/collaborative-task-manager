export interface Task {
  _id: string;
  title: string;
  description: string;
  dueDate: string;
  priority: "Low" | "Medium" | "High" | "Urgent";
  status: "To Do" | "In Progress" | "Review" | "Completed";
  creatorId: string;
  assignedToIds: string[];
  createdAt: string;
  updatedAt: string;
}

export interface CreateTaskPayload {
  title: string;
  description?: string;
  dueDate: string;
  priority: "Low" | "Medium" | "High" | "Urgent";
  assignedToIds: string[];
}

export interface UpdateTaskPayload {
  title?: string;
  description?: string;
  dueDate?: string;
  priority?: "Low" | "Medium" | "High" | "Urgent";
  status?: "To Do" | "In Progress" | "Review" | "Completed";
  assignedToIds?: string[];
}

export interface DashboardData {
  totalTask: number;
  statusCounts: { _id: string; count: number }[];
  overdueTasks: number;
}