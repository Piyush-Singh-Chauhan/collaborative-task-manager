import { Router } from "express";
import { authMiddleware } from "../../middlewares/auth.middleware";
import { createTaskHandler, getTaskHandler, updateTaskHandler, deleteTaskHandler, getDashboardHandler, getFilteredTasksHandler } from "./task.controller";

const router = Router();

router.use(authMiddleware);

router.post("/", createTaskHandler);
router.get("/", getTaskHandler);
router.put("/:id", updateTaskHandler);
router.delete("/:id", deleteTaskHandler);
router.get("/dashboard", getDashboardHandler);
router.get("/filter", getFilteredTasksHandler);

export default router;