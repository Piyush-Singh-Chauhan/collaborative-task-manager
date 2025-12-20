import { Request, Response } from "express";
import { getAllUsers, updateUserProfile } from "./user.repository";

export const getAllUsersHandler = async (req: Request, res: Response) => {
    try {
        const users = await getAllUsers();
        res.json(users);
    } catch (err: any) {
        res.status(500).json({
            message: err.message || "Failed to fetch users."
        });
    }
};

export const updateUserProfileHandler = async (req: Request, res: Response) => {
    try {
        const userId = (req as any).user.id;
        const { name } = req.body;
        
        const updatedUser = await updateUserProfile(userId, { name });
        
        res.json({
            message: "Profile updated successfully",
            user: updatedUser
        });
    } catch (err: any) {
        res.status(400).json({
            message: err.message || "Failed to update profile."
        });
    }
};