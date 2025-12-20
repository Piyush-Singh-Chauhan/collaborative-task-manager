import { Router } from "express"
import {register, login, logout, forgotPasswordController, resetPasswordController, verifyOtp, resendOtpController} from "./auth.controller"
import { authMiddleware } from "../../middlewares/auth.middleware";

const router = Router();

router.post("/register", register);
router.post("/verify-otp", verifyOtp);
router.post("/resend-otp", resendOtpController);
router.post("/login", login);
router.post("/logout", authMiddleware ,logout);
router.post("/forgot-password", forgotPasswordController);
router.post("/reset-password", resetPasswordController);

export default router;