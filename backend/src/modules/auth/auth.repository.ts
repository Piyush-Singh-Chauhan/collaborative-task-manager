import User, { IUser } from "../users/user.model"

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