import bcrypt from "bcrypt"
import { RegisterDto, LoginDto, ForgotPasswordDto, VerifyOtpDto, ResetPasswordDto } from "./auth.dto"
import { createUser, findUserByEmail, updateUserPassword } from "./auth.repository"
import { email } from "zod";
import { generateToken } from "../../utils/jwt";
import { generateOtp, hashvalue, getOtpExpiry } from "../../utils/otp";
import { sendEmail } from "../../utils/email";
import OtpVerification from "./otp.model";


export const registerUser = async ( data: RegisterDto) => {
    const existingUser = await findUserByEmail (data.email);

    if(existingUser) {
        throw new Error ("User already exists.");
    }

    // Generate OTP for email verification
    const otp = generateOtp().toString();
    
    // Hash the password
    const salt = process.env.SALTVALUE || "10";

    if(!salt) {
        throw new Error ("Salt Value is not defind.")
    }
    const saltValue = parseInt(salt)

    const hashedPassword = await bcrypt.hash(data.password, saltValue)

    // Store user data temporarily with OTP (not in main user collection yet)
    // Delete any existing OTP for this email and purpose
    await OtpVerification.deleteMany({
        email: data.email,
        purpose: "REGISTER"
    });
    
    // Save OTP with user data
    const newOtp = new OtpVerification({
        email: data.email,
        otp: otp,
        purpose: "REGISTER",
        expiresAt: getOtpExpiry(),
        userData: {
            name: data.name,
            password: hashedPassword
        }
    });
    
    await newOtp.save();
    
    // Send OTP via email
    try {
        await sendEmail(
            data.email,
            "Email Verification - Task Manager",
            `<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                <h2 style="color: #3b82f6;">Task Manager Email Verification</h2>
                <p>Hello ${data.name},</p>
                <p>Thank you for registering with Task Manager. Please use the following OTP to verify your email address:</p>
                <div style="background-color: #f3f4f6; padding: 15px; text-align: center; border-radius: 5px; margin: 20px 0;">
                    <h3 style="margin: 0; font-size: 24px; letter-spacing: 5px; color: #1f2937;">${otp}</h3>
                </div>
                <p>This OTP will expire in 5 minutes.</p>
                <p>If you didn't request this, please ignore this email.</p>
                <hr style="margin: 30px 0;">
                <p style="font-size: 12px; color: #6b7280;">This is an automated email from Task Manager. Please do not reply.</p>
            </div>`
        );
    } catch (emailError) {
        console.error("Failed to send email:", emailError);
        // Don't throw error here, as we still want to allow registration to proceed
    }
    
    return {
        message: "OTP sent to your email",
        email: data.email
        // Remove otp from production
    };
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

export const forgotPassword = async (data: ForgotPasswordDto) => {
    // Check if user exists
    const user = await findUserByEmail(data.email);
    
    if (!user) {
        throw new Error("User not found");
    }
    
    // Generate OTP
    const otp = generateOtp().toString();
    
    // Delete any existing OTP for this email and purpose
    await OtpVerification.deleteMany({
        email: data.email,
        purpose: "FORGOT_PASSWORD"
    });
    
    // Save new OTP
    const newOtp = new OtpVerification({
        email: data.email,
        otp: otp,
        purpose: "FORGOT_PASSWORD",
        expiresAt: getOtpExpiry()
    });
    
    await newOtp.save();
    
    // Send OTP via email
    try {
        await sendEmail(
            data.email,
            "Password Reset - Task Manager",
            `<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                <h2 style="color: #3b82f6;">Task Manager Password Reset</h2>
                <p>Hello,</p>
                <p>We received a request to reset your password. Please use the following OTP to reset your password:</p>
                <div style="background-color: #f3f4f6; padding: 15px; text-align: center; border-radius: 5px; margin: 20px 0;">
                    <h3 style="margin: 0; font-size: 24px; letter-spacing: 5px; color: #1f2937;">${otp}</h3>
                </div>
                <p>This OTP will expire in 5 minutes.</p>
                <p>If you didn't request this, please ignore this email.</p>
                <hr style="margin: 30px 0;">
                <p style="font-size: 12px; color: #6b7280;">This is an automated email from Task Manager. Please do not reply.</p>
            </div>`
        );
    } catch (emailError) {
        console.error("Failed to send email:", emailError);
        // Don't throw error here, as we still want to allow password reset to proceed
    }
    
    return {
        message: "OTP sent to your email",
        email: data.email
        // Remove otp from production
    };
};

// Verify OTP and create user for registration
export const verifyOtpAndCreateUser = async (data: { email: string, otp: string }) => {
    // Verify OTP for registration
    const otpRecord = await OtpVerification.findOne({
        email: data.email,
        otp: data.otp,
        purpose: "REGISTER"
    });
    
    if (!otpRecord) {
        throw new Error("Invalid or expired OTP");
    }
    
    // Check if OTP is expired
    if (otpRecord.expiresAt < new Date()) {
        throw new Error("OTP has expired");
    }
    
    // Check if user already exists
    const existingUser = await findUserByEmail(data.email);
    if (existingUser) {
        throw new Error("User already exists.");
    }
    
    // Create the user now that OTP is verified
    const user = await createUser({
        name: otpRecord.userData?.name || "",
        email: data.email,
        password: otpRecord.userData?.password || ""
    });
    
    // Delete the OTP record
    await OtpVerification.deleteOne({
        email: data.email,
        otp: data.otp
    });
    
    return {
        message: "User registered successfully",
        user: {
            id: user?._id.toString(),
            name: user?.name,
            email: user?.email,
        }
    };
};

// Resend OTP for registration
export const resendOtp = async (data: { email: string }) => {
    // Check if there's an existing OTP for registration
    const existingOtp = await OtpVerification.findOne({
        email: data.email,
        purpose: "REGISTER"
    });
    
    if (!existingOtp) {
        throw new Error("No pending registration found for this email");
    }
    
    // Generate new OTP
    const newOtp = generateOtp().toString();
    
    // Update the OTP
    await OtpVerification.updateOne(
        { email: data.email, purpose: "REGISTER" },
        { 
            otp: newOtp,
            expiresAt: getOtpExpiry()
        }
    );
    
    // Send new OTP via email
    try {
        await sendEmail(
            data.email,
            "Email Verification - Task Manager",
            `<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                <h2 style="color: #3b82f6;">Task Manager Email Verification</h2>
                <p>Hello,</p>
                <p>Here is your new OTP to verify your email address:</p>
                <div style="background-color: #f3f4f6; padding: 15px; text-align: center; border-radius: 5px; margin: 20px 0;">
                    <h3 style="margin: 0; font-size: 24px; letter-spacing: 5px; color: #1f2937;">${newOtp}</h3>
                </div>
                <p>This OTP will expire in 5 minutes.</p>
                <p>If you didn't request this, please ignore this email.</p>
                <hr style="margin: 30px 0;">
                <p style="font-size: 12px; color: #6b7280;">This is an automated email from Task Manager. Please do not reply.</p>
            </div>`
        );
    } catch (emailError) {
        console.error("Failed to send email:", emailError);
        // Don't throw error here, as we still want to allow registration to proceed
    }
    
    return {
        message: "New OTP sent to your email",
        email: data.email
        // Remove otp from production
    };
};

export const resetPassword = async (data: ResetPasswordDto) => {
    // Verify OTP
    const otpRecord = await OtpVerification.findOne({
        email: data.email,
        otp: data.otp,
        purpose: "FORGOT_PASSWORD"
    });
    
    if (!otpRecord) {
        throw new Error("Invalid or expired OTP");
    }
    
    // Check if OTP is expired
    if (otpRecord.expiresAt < new Date()) {
        throw new Error("OTP has expired");
    }
    
    // Update user password
    const updatedUser = await updateUserPassword(data.email, data.newPassword);
    
    if (!updatedUser) {
        throw new Error("Failed to update password");
    }
    
    // Delete the OTP record
    await OtpVerification.deleteOne({
        email: data.email,
        otp: data.otp
    });
    
    return {
        message: "Password reset successfully"
    };
};