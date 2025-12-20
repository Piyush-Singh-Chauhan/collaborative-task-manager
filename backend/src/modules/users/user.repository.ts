import User, { IUser } from "./user.model";

export const getAllUsers = async (): Promise<Pick<IUser, "id" | "name" | "email">[]> => {
    const users = await User.find({}, { password: 0 }); // Exclude password field
    // Transform _id to id for frontend compatibility
    return users.map(user => ({
        id: user._id.toString(),
        name: user.name,
        email: user.email
    }));
}

export const updateUserProfile = async (userId: string, data: Partial<IUser>): Promise<Pick<IUser, "id" | "name" | "email">> => {
    const user = await User.findByIdAndUpdate(
        userId,
        { $set: data },
        { new: true, projection: { password: 0 } }
    );
    
    if (!user) {
        throw new Error("User not found");
    }
    
    return {
        id: user._id.toString(),
        name: user.name,
        email: user.email
    };
}