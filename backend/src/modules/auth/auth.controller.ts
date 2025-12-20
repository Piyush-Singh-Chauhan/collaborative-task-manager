import { Request, Response } from "express";
import { registerSchema, loginSchema, forgotPasswordSchema, resetPasswordSchema, verifyOtpSchema } from "./auth.dto";
import { registerUser, loginUser, forgotPassword, resetPassword, verifyOtpAndCreateUser, resendOtp } from "./auth.service";

export const register = async ( req : Request, res: Response)=>{
    try {
        const validatedData = registerSchema.parse(req.body);
        const result = await registerUser(validatedData);

        res.status(201).json(result);

    } catch(err : any){
        res.status(400).json({
            message : err.message || "Registration Failed."
        })
        console.log(err);
    }
}

export const login = async(req : Request, res: Response)=>{
    try{
        const validatedData = loginSchema.parse(req.body);
        const { token, user } = await loginUser(validatedData);
        
        res.cookie("token", token, {
            httpOnly: true,
            secure : false, // in production true
            sameSite : "strict",
            maxAge : 7 * 24 * 60 * 60 * 1000,
        })

        res.status(200).json({
            message : "Login Successful.",
            user,
        })
    }catch (err : any){
        res.status(491).json({
            message : err.mesaage || "Login Failed."
        })
    }
}

// Verify OTP controller
export const verifyOtp = async (req: Request, res: Response) => {
    try {
        const validatedData = verifyOtpSchema.parse(req.body);
        const result = await verifyOtpAndCreateUser(validatedData);
        
        res.status(200).json(result);
    } catch (err: any) {
        res.status(400).json({
            message: err.message || "OTP verification failed"
        });
    }
};

// Resend OTP controller
export const resendOtpController = async (req: Request, res: Response) => {
    try {
        // Expect email in request body
        const { email } = req.body;
        
        if (!email) {
            return res.status(400).json({
                message: "Email is required"
            });
        }
        
        const result = await resendOtp({ email });
        
        res.status(200).json(result);
    } catch (err: any) {
        res.status(400).json({
            message: err.message || "Failed to resend OTP"
        });
    }
};

export const logout = (req : Request, res : Response) =>{
    res.clearCookie("token" , {
        httpOnly : true,
        sameSite : "strict",
        secure: false,
    })

    res.status(200).json({
        message : "Logout Successfully.",
    })
}

export const forgotPasswordController = async (req: Request, res: Response) => {
    try {
        const validatedData = forgotPasswordSchema.parse(req.body);
        const result = await forgotPassword(validatedData);
        
        res.status(200).json(result);
    } catch (err: any) {
        res.status(400).json({
            message: err.message || "Failed to process forgot password request"
        });
    }
};

export const resetPasswordController = async (req: Request, res: Response) => {
    try {
        const validatedData = resetPasswordSchema.parse(req.body);
        const result = await resetPassword(validatedData);
        
        res.status(200).json(result);
    } catch (err: any) {
        res.status(400).json({
            message: err.message || "Failed to reset password"
        });
    }
};