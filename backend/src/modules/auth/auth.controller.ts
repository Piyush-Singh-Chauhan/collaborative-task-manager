import { Request, Response } from "express";
import { registerSchema, loginSchema } from "./auth.dto";
import { registerUser, loginUser } from "./auth.service";

export const register = async ( req : Request, res: Response)=>{
    try {
        const validatedData = registerSchema.parse(req.body);
        const user = await registerUser(validatedData);

        res.status(201).json({
            message : "User register successfully.",
            user,
        })

    } catch(err : any){
        res.status(400).json({
            message : err.mesaage || "Registration Faild."
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