import { useSocket } from "../context/SocketContext";

// Utility function to send custom notifications
export const sendNotification = (socket: any, message: string, type: "info" | "success" | "warning" | "error" = "info") => {
  if (socket) {
    socket.emit("notification", { message, type });
  }
};

// Utility function to send task notifications
export const sendTaskNotification = (
  socket: any, 
  eventType: "Task:assigned" | "Task:updated" | "Task:deleted", 
  data: any
) => {
  if (socket) {
    socket.emit(eventType, data);
  }
};

// Predefined notification templates
export const NotificationTemplates = {
  TASK_ASSIGNED: (taskTitle: string) => `You have been assigned to task "${taskTitle}"`,
  TASK_COMPLETED: (taskTitle: string) => `Task "${taskTitle}" has been completed`,
  TASK_OVERDUE: (taskTitle: string) => `Task "${taskTitle}" is overdue`,
  PROFILE_UPDATED: () => "Your profile has been updated successfully",
  TASK_DELETED: (taskTitle: string) => `Task "${taskTitle}" has been deleted`,
  TASK_PRIORITY_CHANGED: (taskTitle: string, priority: string) => `Task "${taskTitle}" priority changed to ${priority}`,
  TASK_STATUS_CHANGED: (taskTitle: string, status: string) => `Task "${taskTitle}" status changed to ${status}`
};