import { z } from "zod";

export const createTaskSchema = z.object({
    title : z.string().min(2).max(100),
    description : z.string().optional(),
    dueDate : z.string(),
    priority : z.enum(["Low", "Medium", "High", "Urgent"]),
    assignedToIds : z.array(z.string()).min(1, "At least one user must be assigned"),
})

export const updateTaskSchema = z.object({
  title: z.string().max(100).optional(),
  description: z.string().optional(),
  dueDate: z.string().optional(),
  priority: z.enum(["Low", "Medium", "High", "Urgent"]).optional(),
  status: z
    .enum(["To Do", "In Progress", "Review", "Completed"])
    .optional(),
  assignedToIds: z.array(z.string()).optional(),
});