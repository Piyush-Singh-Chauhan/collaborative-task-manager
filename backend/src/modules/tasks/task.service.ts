import { Types } from "mongoose";
import { ITask } from "./task.model";
import { createTask as createTaskRepo, findTaskById, updateTaskById, deleteTaskById, getTasksByUserId, getDashboardStats, getFilteredTasks as getFilteredTasksRepo } from "./task.repository";
import { io } from "../../server";

export const createTask = async (data: Partial<ITask>, userId: string) => {
  const taskData = {
    ...data,
    creatorId: new Types.ObjectId(userId),
    assignedToIds: data.assignedToIds?.map(id => new Types.ObjectId(id)) || []
  };

  const task = await createTaskRepo(taskData);

  // Notify assigned users
  if (task.assignedToIds && task.assignedToIds.length > 0) {
    task.assignedToIds.forEach(assignedUserId => {
      if (assignedUserId.toString() !== userId) {
        io.to(assignedUserId.toString()).emit("Task:created", {
          message: `You have been assigned to task "${task.title}".`,
          task,
        });
      }
    });
  }

  return task;
};

export const getTasks = async (userId: string) => {
  return await getTasksByUserId(userId);
};

export const updateTask = async (taskId: string, userId: string, data: Partial<ITask>) => {
  // First, get the current task to check permissions and previous assignments
  const task = await findTaskById(taskId);
  
  if (!task) {
    throw new Error("Task not found.");
  }

  // Check if user is the creator of the task
  if (task.creatorId.toString() !== userId) {
    throw new Error("Only the creator can update the task.");
  }

  // Convert assignedToIds to ObjectId if present
  if (data.assignedToIds) {
    data.assignedToIds = data.assignedToIds.map(id => new Types.ObjectId(id));
  }

  const previousAssignedUsers = task.assignedToIds || [];
  
  const updatedTask = await updateTaskById(taskId, data);
  
  // Check if update was successful
  if (!updatedTask) {
    throw new Error("Failed to update task.");
  }

  // Check if assigned users have changed
  const newAssignedUsers = updatedTask.assignedToIds || [];
  const assignedUsersChanged = JSON.stringify(previousAssignedUsers.map(id => id.toString())) !== 
                               JSON.stringify(newAssignedUsers.map(id => id.toString()));

  // Notify newly assigned users
  if (assignedUsersChanged && newAssignedUsers.length > 0) {
    newAssignedUsers.forEach(assignedUserId => {
      // Skip notification for the user who made the change (task owner)
      if (assignedUserId.toString() !== userId) {
        // Check if this user was newly assigned (not in previous assignment)
        const isNewlyAssigned = !previousAssignedUsers.some(prevId => prevId.toString() === assignedUserId.toString());
        
        if (isNewlyAssigned) {
          io.to(assignedUserId.toString()).emit("Task:assigned", {
            message: `You have been assigned to task "${updatedTask.title}".`,
            task: updatedTask,
          });
        }
      }
    });
  }

  // Notify all assigned users about other updates (status, priority, etc.)
  if(newAssignedUsers.length > 0) {
    newAssignedUsers.forEach(assignedUserId => {
      // Skip notification for the user who made the change (task owner)
      if (assignedUserId.toString() !== userId) {
        let message = `Task "${task.title}" has been updated.`;
        
        // Specific messages for different types of updates
        if (data.status) {
          message = `Task "${task.title}" status updated to ${data.status}.`;
        } else if (data.priority) {
          message = `Task "${task.title}" priority changed to ${data.priority}.`;
        } else if (data.title) {
          message = `Task renamed to "${data.title}".`;
        }
        
        // Only send update notifications for non-assignment changes
        if (!assignedUsersChanged || (data.status || data.priority || data.title || data.description || data.dueDate)) {
          io.to(assignedUserId.toString()).emit("Task:updated", {
            message: message,
            task: updatedTask,
          });
        }
      }
    });
  }

  return updatedTask; 
}

export const deleteTask = async (taskId : string, userId: string) => {
  const task = await findTaskById(taskId);

  if(!task) throw new Error ("Task not found.");

  if(task.creatorId.toString() !== userId){
    throw new Error ("Only creator can delete task.");
  }

  // Notify all assigned users about task deletion
  if(task.assignedToIds && task.assignedToIds.length > 0) {
    task.assignedToIds.forEach(assignedUserId => {
      // Skip notification for the user who deleted the task
      if (assignedUserId.toString() !== userId) {
        io.to(assignedUserId.toString()).emit("Task:deleted", {
          message: `Task "${task.title}" has been deleted by the creator.`,
          taskId: taskId
        });
      }
    });
  }

  return deleteTaskById(taskId);
}

export const getDashboardData = async (userId : string) => {
  const userObjectId = new Types.ObjectId(userId);

  const totalTask = await getTasksByUserId(userId).then(tasks => tasks.length);
  const statusCounts = await getDashboardStats(userObjectId, "status");
  const overdueTasks = await getTasksByUserId(userId).then(tasks => 
    tasks.filter(task => new Date(task.dueDate) < new Date() && task.status !== "Completed").length
  );

  return {
    totalTask,
    statusCounts,
    overdueTasks,
  };
};

export const getFilteredTasksService = async (userId: string, filters: { status?: string; priority?: string; sortBy?: string }) => {
  return await getFilteredTasksRepo(userId, filters);
};