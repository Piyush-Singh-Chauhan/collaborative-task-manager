import User, { IUser } from "../users/user.model"
import bcrypt from "bcrypt"

export const createUser = async (
    data : Partial<IUser>
): Promise<IUser | null> =>{
    return await User.create( data );
};

export const findUserByEmail = async (
    email : string
) : Promise<IUser | null > => {
    return await User.findOne ({email});
};

export const updateUserPassword = async (
    email: string,
    newPassword: string
): Promise<IUser | null> => {
    const salt = process.env.SALTVALUE || "10";
    const saltValue = parseInt(salt);
    const hashedPassword = await bcrypt.hash(newPassword, saltValue);
    
    return await User.findOneAndUpdate(
        { email },
        { password: hashedPassword },
        { new: true }
    );
};