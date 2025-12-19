import Task, {ITask} from "./task.model";
import mongoose from "mongoose";

export const createTask = async( data : Partial<ITask>) => {
    return Task.create(data);
}

export const getTaskByUser = async (userId : string) => {
    const userObjectId = new mongoose.Types.ObjectId(userId);
    return Task.find({
        $or : [{creatorId : userObjectId}, {assignedToIds : userObjectId}],
    });
}

export const findTaskById = async (taskId : string) => {
    return Task.findById(taskId);
}

export const updateTaskById = async (taskId : string, data: Partial<ITask>) => {
    return Task.findByIdAndUpdate (taskId, data, {new : true});
}

export const deleteTaskById= async (taskId : string) => {
    return Task.findByIdAndDelete(taskId);
}

export const getFilteredTasks = async (userId : string, filters : any)=> {
    const userObjectId = new mongoose.Types.ObjectId(userId);

    const query : any = {
        $or : [{ creatorId : userObjectId}, {assignedToIds : userObjectId}]
    };

    if(filters.status){
        query.status = new RegExp(`^${filters.status}$`, "i");
    }
    if(filters.priority) {
        query.priority = new RegExp(`^${filters.priority}$`, 'i');
    }

    let sort : any = {};
    if(filters.sort === "dueDate") sort.dueDate = 1;
    if(filters.sort === "createdAt") sort.createdAt = -1;

    console.log("Filter query : ", query);
    return Task.find(query).sort(sort);
}