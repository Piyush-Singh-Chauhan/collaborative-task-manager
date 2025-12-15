import { createTask,getTaskByUser,findTaskById,updateTaskById, deleteTaskById } from "./task.repository";

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

    if(task.creatorId.toString() !== userId && task.assginedToId.toString() !== userId) {
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
