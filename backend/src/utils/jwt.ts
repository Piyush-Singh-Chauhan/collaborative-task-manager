import jwt from "jsonwebtoken"

export const generateToken = (userID : string): string =>{
    if(!process.env.JWT_SECRET) {
        throw new Error ("JWT Secret is not defined.")
    }

    return jwt.sign(
        {userID},
        process.env.JWT_SECRET,
        { expiresIn : "2d"}
    )
}