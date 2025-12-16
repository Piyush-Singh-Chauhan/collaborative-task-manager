import { Request, Response } from "express";
import { createTaskSchema, updateTaskSchema } from "./task.dto";
import { createNewTask, getUserTasks, updateTask, deleteTask, getDashboardData } from "./task.service";
import { getFilteredTasks } from "./task.repository";

export const createTaskHandler = async (req:Request, res: Response)=>{
    try {
        const data = createTaskSchema.parse(req.body);
        const userId = (req as any).user.id;

        const task = await createNewTask( data, userId);

        res.status(201).json(task);
    }catch(err : any) {
        res.status(400).json({ message : err.message })
    }
}

export const getTaskHandler = async (req : Request, res : Response) => {
    const userId = (req as any).user.id;
    const tasks = await getUserTasks(userId);
    res.json(tasks);
}

export const updateTaskHandler = async (req : Request, res : Response) => {
    try {
        const taskId = req.params.id;

        if(!taskId){
            return res.status(400).json({messgae : "Task id is required."})
        }

        const data = updateTaskSchema.parse(req.body);
        const userId = ( req as any).user.id;

        const task = await updateTask(taskId, userId, data);
        res.json(task);
    } catch (err : any) {
        res.status(400).json({message : err.message});
    }
}


export const deleteTaskHandler = async (req: Request, res: Response) => {
  try {
    const taskId = req.params.id;

        if(!taskId){
            return res.status(400).json({messgae : "Task id is required."})
        }

    const userId = (req as any).user.id;
    await deleteTask(taskId, userId);
    res.json({ message: "Task deleted" });
  } catch (error: any) {
    res.status(400).json({ message: error.message });
  }
};

export const getDashboardHandler = async (req : Request , res : Response) => {
    try {
        const userId = (req as any).user.id;
        const data = await getDashboardData(userId);
        res.json(data);
    } catch (err : any){
        res.status(400).json({
            message : err.message
        })
    }
}

export const getFilteredTasksHandler = async (req: Request, res : Response) =>{
    const userId = (req as any).user.id;
    const tasks = await getFilteredTasks(userId, req.query);

    res.json (tasks);
}