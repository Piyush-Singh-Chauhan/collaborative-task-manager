import nodemailer from "nodemailer";

export const sendEmail = async (
    to : string,
    subject : string,
    html : string
) => {
    console.log("Attempting to send email to:", to);
    console.log("Email user:", process.env.EMAIL_USER);
    
    const transporter = nodemailer.createTransport ({
        service : 'gmail',
        auth : {
            user : process.env.EMAIL_USER,
            pass : process.env.EMAIL_PASS,
        },
    });

    try {
        const info = await transporter.sendMail ({
            from : `"Task Manager" <${process.env.EMAIL_USER}>`,
            to,
            subject,
            html,
        });
        
        console.log("Email sent successfully:", info.messageId);
        return info;
    } catch (error) {
        console.error("Failed to send email:", error);
        throw error;
    }
}