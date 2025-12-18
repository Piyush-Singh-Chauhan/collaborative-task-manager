export interface Task {
  _id: string;
  title: string;
  description: string;
  dueDate: string;
  priority: "Low" | "Medium" | "High" | "Urgent";
  status: "To Do" | "In Progress" | "Review" | "Completed";
  creatorId: string;
  assignedToId: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateTaskPayload {
  title: string;
  description?: string;
  dueDate: string;
  priority: "Low" | "Medium" | "High" | "Urgent";
  assignedToId: string;
}

export interface UpdateTaskPayload {
  title?: string;
  description?: string;
  dueDate?: string;
  priority?: "Low" | "Medium" | "High" | "Urgent";
  status?: "To Do" | "In Progress" | "Review" | "Completed";
  assignedToId?: string;
}

export interface DashboardData {
  totalTask: number;
  statusCounts: { _id: string; count: number }[];
  overdueTasks: number;
}