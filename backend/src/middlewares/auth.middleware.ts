import { Request, Response, NextFunction } from "express";
import  jwt  from "jsonwebtoken";

interface JwtPayload {
    userId: string;
}

export const authMiddleware = ( req : Request, res: Response, next : NextFunction) => {
    try {
        const token = req.cookies?.token;

        if(!token){
            return res.status(401).json({
                message : "Unauthorized."
            })
        }
        
        if (!process.env.JWT_SECRET) {
            throw new Error ("Jwt secret not configured.");
        }

        const decoded = jwt.verify(
            token,
            process.env.JWT_SECRET
        ) as { userId : string};

        // console.log("Decoded",decoded);
        (req as any).user = {id : decoded.userId};
        next();
    }catch (err){
        return res.status(401).json({
            message : "Invalid or expired token."
        });
    }
}