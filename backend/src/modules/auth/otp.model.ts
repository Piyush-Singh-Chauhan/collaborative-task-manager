import mongoose, { Schema, Document } from "mongoose";

export interface IOtp extends Document {
  email: string;
  otp: string;
  purpose: "REGISTER" | "FORGOT_PASSWORD";
  expiresAt: Date;

  userData?: {
    name: string;
    password: string; 
  };

  createdAt: Date;
  updatedAt: Date;
}

const otpSchema = new Schema<IOtp>(
  {
    email: {
      type: String,
      required: true,
      lowercase: true,
      index: true,
    },

    otp: {
      type: String,
      required: true,
    },

    purpose: {
      type: String,
      enum: ["REGISTER", "FORGOT_PASSWORD"],
      required: true,
    },

    expiresAt: {
      type: Date,
      required: true,
    //   default: () => new Date(Date.now() + 10 * 60 * 1000),
    },

    userData: {
      name: {
        type: String,
      },
      password: {
        type: String, // hashed password
      },
    },
  },
  {
    timestamps: true,
  }
);

/**
 * Auto-delete OTP after expiry (Mongo TTL index)
 */
otpSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

const OtpVerification = mongoose.model<IOtp>(
  "OtpVerification",
  otpSchema
);

export default OtpVerification;
