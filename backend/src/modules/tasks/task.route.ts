import { Router } from "express";
import { authMiddleware } from "../../middlewares/auth.middleware";
import { createTaskHandler, getTaskHandler, getTaskByIdHandler, updateTaskHandler, deleteTaskHandler, getDashboardHandler, getFilteredTasksHandler } from "./task.controller";

const router = Router();

router.use(authMiddleware);

router.post("/", createTaskHandler);
router.get("/", getTaskHandler);
router.get("/dashboard", getDashboardHandler);
router.get("/filter", getFilteredTasksHandler);
router.get("/:id", getTaskByIdHandler);
router.put("/:id", updateTaskHandler);
router.delete("/:id", deleteTaskHandler);

export default router;