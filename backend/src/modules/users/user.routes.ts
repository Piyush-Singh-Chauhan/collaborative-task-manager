import { Router } from "express";
import { authMiddleware } from "../../middlewares/auth.middleware";
import { getAllUsersHandler } from "./user.controller";

const router = Router();

router.use(authMiddleware);

router.get("/", getAllUsersHandler);

export default router;