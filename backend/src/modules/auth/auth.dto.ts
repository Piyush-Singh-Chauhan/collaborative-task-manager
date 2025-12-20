import { z } from "zod";

export const registerSchema = z.object({
    name : z.string().min(2).max(50),
    email: z.string().email(),
    password : z.string().min(6)
});

export type RegisterDto = z.infer<typeof registerSchema>;

export const loginSchema = z.object({
    email : z.string().email(),
    password : z.string().min(6),
}) 

export type LoginDto = z.infer<typeof loginSchema>;

export const forgotPasswordSchema = z.object({
    email: z.string().email(),
});

export type ForgotPasswordDto = z.infer<typeof forgotPasswordSchema>;

export const verifyOtpSchema = z.object({
    email: z.string().email(),
    otp: z.string().length(6),
});

export type VerifyOtpDto = z.infer<typeof verifyOtpSchema>;

export const resetPasswordSchema = z.object({
    email: z.string().email(),
    otp: z.string().length(6),
    newPassword: z.string().min(6),
});

export type ResetPasswordDto = z.infer<typeof resetPasswordSchema>;