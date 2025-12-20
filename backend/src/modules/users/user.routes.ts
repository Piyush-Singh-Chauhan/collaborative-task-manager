import { Router } from "express";
import { authMiddleware } from "../../middlewares/auth.middleware";
import { getAllUsersHandler, updateUserProfileHandler } from "./user.controller";

const router = Router();

router.use(authMiddleware);

router.get("/", getAllUsersHandler);
router.put("/profile", updateUserProfileHandler);

export default router;