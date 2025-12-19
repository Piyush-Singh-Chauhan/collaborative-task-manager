import { Request, Response } from "express";
import { getAllUsers } from "./user.repository";

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