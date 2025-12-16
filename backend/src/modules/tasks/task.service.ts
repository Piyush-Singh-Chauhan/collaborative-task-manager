import { createTask,getTaskByUser,findTaskById,updateTaskById, deleteTaskById } from "./task.repository";
import Task from "./task.model"
import mongoose from "mongoose";

export const createNewTask = async(data : any, creatorId : string) => {
    return createTask({
        ...data, 
        creatorId,
        assginedToId : data.assginedToId,
    });
}

export const getUserTasks = async (userId : string)=>{
    return getTaskByUser(userId);
}

export const updateTask = async(taskId : string, userId : string, data : any) => {
    const task = await findTaskById(taskId);

    if(!task) throw new Error("Task not found.");

    if(task.creatorId.toString() !== userId && task.assignedToId.toString() !== userId) {
        throw new Error ("Unauthrized");
    }

    return updateTaskById(taskId, data)
}

export const deleteTask = async (taskId : string, userId: string) => {
    const task = await findTaskById(taskId);

    if(!task) throw new Error ("Task not found.");

    if(task.creatorId.toString() !== userId){
        throw new Error ("Only creator can delete task.");
    }

    return deleteTaskById(taskId);
}

export const getDashboardData = async (userId : string) => {
    const userObjectId = new mongoose.Types.ObjectId(userId);

    const totalTask = await Task.countDocuments({
        $or : [{creatorId : userObjectId}, {assignedToId : userObjectId}]
    });

    const statusCounts = await Task.aggregate([
        {
            $match : {
                $or : [
                    {creatorId : userObjectId},
                    {assignedToId : userObjectId}
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
        $or : [{creatorId : userObjectId}, { assignedToId : userObjectId}]
    });
    
    return {totalTask, statusCounts, overdueTasks};
}