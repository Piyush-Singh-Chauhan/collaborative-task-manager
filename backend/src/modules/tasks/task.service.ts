import { createTask,getTaskByUser,findTaskById,updateTaskById, deleteTaskById } from "./task.repository";
import Task from "./task.model"
import mongoose from "mongoose";
import { io } from '../../server';
import taskModel from "./task.model";

export const createNewTask = async(data : any, creatorId : string) => {
   const task = await createTask({
    ...data,
    creatorId,
    assignedToIds : data.assignedToIds,
   });

   // Notify all assigned users
   if(task.assignedToIds && task.assignedToIds.length > 0) {
    task.assignedToIds.forEach(assignedUserId => {
      io.to(assignedUserId.toString()).emit("Task:assigned", {
          message : `A new task "${task.title}" has been assigned to you.`,
          task: task
      })
    });
   }
   
   return task;
}

export const getUserTasks = async (userId : string)=>{
    return getTaskByUser(userId);
}

export const updateTask = async(taskId : string, userId : string, data : any) => {
    const task = await findTaskById(taskId);

    if(!task) throw new Error("Task not found.");

    // Check if user is the creator (owner) of the task
    // Only the task owner can update the task
    const isCreator = task.creatorId.toString() === userId;
    
    if(!isCreator) {
        throw new Error ("Only the task owner can update this task.");
    }

    // Store previous assigned users to compare later
    const previousAssignedUsers = task.assignedToIds || [];
    
    const updatedTask = await updateTaskById(taskId, data);

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
    const userObjectId = new mongoose.Types.ObjectId(userId);

    const totalTask = await Task.countDocuments({
        $or : [{creatorId : userObjectId}, {assignedToIds : userObjectId}]
    });

    const statusCounts = await Task.aggregate([
        {
            $match : {
                $or : [
                    {creatorId : userObjectId},
                    {assignedToIds : userObjectId}
                ]
            }
        },
        {
            $group : {
                _id : "$status",
                count : { $sum : 1},
            }
        }
    ]);

    const overdueTasks = await Task.countDocuments({
        dueDate : { $lt : new Date()},
        status : {$ne : "Completed"},
        $or : [{creatorId : userObjectId}, { assignedToIds : userObjectId}]
    });
    
    return {totalTask, statusCounts, overdueTasks};
}