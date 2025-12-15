import jwt from "jsonwebtoken"

export const generateToken = (userId : string): string =>{
    if(!process.env.JWT_SECRET) {
        throw new Error ("JWT Secret is not defined.")
    }

    return jwt.sign(
        {userId},
        process.env.JWT_SECRET,
        { expiresIn : "7d"}
    )
}