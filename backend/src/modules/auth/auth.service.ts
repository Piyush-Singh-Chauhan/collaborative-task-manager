import bcrypt from "bcrypt"
import { RegisterDto, LoginDto } from "./auth.dto"
import { createUser, findUserByEmail } from "./auth.repository"
import { email } from "zod";
import { generateToken } from "../../utils/jwt";

export const registerUser = async ( data: RegisterDto) => {
    const existingUser = await findUserByEmail (data.email);

    if(existingUser) {
        throw new Error ("User already exists.");
    }

    const salt = process.env.SALTVALUE || "10";

    if(!salt) {
        throw new Error ("Salt Value is not defind.")
    }
    const saltValue = parseInt(salt)

    const hashedPassword = await bcrypt.hash(data.password, saltValue)

    const user = await createUser({
        name : data.name,
        email : data.email,
        password : hashedPassword
    });

    return {
        id : user?._id.toString(),
        name : user?.name,
        email : user?.email,
    }
}

export const loginUser = async (data : LoginDto) =>{
    const user = await findUserByEmail(data.email);

    if(!user){
        throw new Error ("Invalid email or password.");
    }

    const isPasswordMatch = await bcrypt.compare(
        data.password,
        user.password
    )

    if(!isPasswordMatch) {
        throw new Error ("Invalid email or password.");
    }

    const token = generateToken(user._id.toString());

    return {
        token, 
        user : {
            id : user._id.toString(),
            name : user.name,
            email : user.email,
        }
    }
};