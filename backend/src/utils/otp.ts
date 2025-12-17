import bcrypt from "bcrypt";

const saltValue = process.env.SALTVALUE

if(!saltValue) {
    throw new Error ("Salt Value is not defined.")
}
export const generateOtp = () : String => {
    return Math.floor(100000 + Math.random()* 900000).toString(); 
}

export const hashvalue = async (value : string) : Promise<string> =>{
    return bcrypt.hash(value, saltValue);
}

export const getOtpExpiry = () : Date => {
    const expiresAt = new Date();
    expiresAt.setMinutes(expiresAt.getMinutes() + 5);
    return expiresAt;
};