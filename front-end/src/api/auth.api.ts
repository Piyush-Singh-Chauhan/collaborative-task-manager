import api from "./axios";
import type {
  RegisterPayload,
  LoginPayload,
  VerifyOtpPayload,
  AuthResponse,
  User,
} from "../types/auth.types";

export const registerUser = async (
  payload: RegisterPayload
): Promise<{ message: string; email: string; otp?: string }> => {
  const response = await api.post("/auth/register", payload);
  return response.data;
};

export const verifyOtp = async (
  payload: VerifyOtpPayload
): Promise<{ message: string; user?: any }> => {
  const response = await api.post("/auth/verify-otp", payload);
  return response.data;
};

export const resendOtp = async (
  email: string
): Promise<{ message: string; otp?: string }> => {
  const response = await api.post("/auth/resend-otp", { email });
  return response.data;
};

export const loginUser = async (
  payload: LoginPayload
): Promise<AuthResponse> => {
  const response = await api.post("/auth/login", payload);
  return response.data;
};

export const forgotPassword = async (
  payload: { email: string }
): Promise<{ message: string; email: string; otp?: string }> => {
  const response = await api.post("/auth/forgot-password", payload);
  return response.data;
};

export const resetPassword = async (
  payload: { email: string; otp: string; newPassword: string }
): Promise<{ message: string }> => {
  const response = await api.post("/auth/reset-password", payload);
  return response.data;
};

export const getAllUsers = async (): Promise<User[]> => {
  const response = await api.get("/users");
  return response.data;
};

export const updateUserProfile = async (payload: { name: string }): Promise<{ message: string; user: User }> => {
  const response = await api.put("/users/profile", payload);
  return response.data;
};
