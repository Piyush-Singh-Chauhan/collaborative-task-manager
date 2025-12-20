import { Request, Response } from "express";
import { createTaskSchema, updateTaskSchema } from "./task.dto";
import { createTask, findTaskById, updateTask, deleteTask, getTasks, getDashboardData, getFilteredTasks } from "./task.service";

export const createTaskHandler = async (req: Request, res: Response) => {
  try {
    const validatedData = createTaskSchema.parse(req.body);
    const userId = (req as any).user.id;
    const task = await createTask(validatedData, userId);
    res.status(201).json(task);
  } catch (err: any) {
    res.status(400).json({ message: err.message || "Failed to create task." });
  }
};

export const getTaskHandler = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.id;
    const tasks = await getTasks(userId);
    res.json(tasks);
  } catch (err: any) {
    res.status(400).json({ message: err.message || "Failed to fetch tasks." });
  }
};

export const getTaskByIdHandler = async (req: Request, res: Response) => {
  try {
    const taskId = req.params.id;
    const userId = (req as any).user.id;
    
    const task = await findTaskById(taskId);
    
    if(!task) {
      return res.status(404).json({message : "Task not found."})
    }
    
    // Check if user is authorized to view this task
    const isCreator = task.creatorId.toString() === userId;
    const isAssigned = task.assignedToIds.some(id => id.toString() === userId);
    
    if(!isCreator && !isAssigned) {
      return res.status(403).json({message : "Unauthorized to view this task."})
    }
    
    res.json(task);
  } catch (err: any) {
    res.status(400).json({ message: err.message || "Failed to fetch task." });
  }
};

export const updateTaskHandler = async (req : Request, res : Response) => {
    try {
        const taskId = req.params.id;

        if(!taskId){
            return res.status(400).json({message : "Task id is required."})
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
            return res.status(400).json({message : "Task id is required."})
        }

    const userId = (req as any).user.id;
    await deleteTask(taskId, userId);
    res.json({ message: "Task deleted" });
  } catch (error: any) {
    res.status(400).json({ message: error.message });
  }
};

export const getDashboardHandler = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.id;
    const dashboardData = await getDashboardData(userId);
    res.json(dashboardData);
  } catch (error: any) {
    res.status(400).json({ message: error.message });
  }
};

export const getFilteredTasksHandler = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.id;
    const { status, priority, sortBy } = req.query;
    const tasks = await getFilteredTasks(userId, { status, priority, sortBy });
    res.json(tasks);
  } catch (error: any) {
    res.status(400).json({ message: error.message });
  }
};