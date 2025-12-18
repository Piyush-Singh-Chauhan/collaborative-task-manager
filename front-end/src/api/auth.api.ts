import api from "./axios";
import type {
  RegisterPayload,
  LoginPayload,
  VerifyOtpPayload,
  AuthResponse,
} from "../types/auth.types";

export const registerUser = async (
  payload: RegisterPayload
): Promise<{ message: string }> => {
  const response = await api.post("/auth/register", payload);
  return response.data;
};

export const verifyOtp = async (
  payload: VerifyOtpPayload
): Promise<{ message: string }> => {
  const response = await api.post("/auth/verify-otp", payload);
  return response.data;
};

export const loginUser = async (
  payload: LoginPayload
): Promise<AuthResponse> => {
  const response = await api.post("/auth/login", payload);
  return response.data;
};
