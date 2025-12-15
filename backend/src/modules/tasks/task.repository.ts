import Task, {ITask} from "./task.model";

export const createTask = async( data : Partial<ITask>) => {
    return Task.create(data);
}

export const getTaskByUser = async (userId : string) => {
    return Task.find({
        $or : [{creatorId : userId}, {assginedToId : userId}],
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