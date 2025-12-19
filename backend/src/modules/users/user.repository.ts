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