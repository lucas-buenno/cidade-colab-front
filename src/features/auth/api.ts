import { apiClient } from "@/shared/api/client";
import type {
  CreateUserRequest,
  ForgotPasswordRequest,
  ForgotPasswordResponse,
  LoginRequest,
  LoginResponse,
  ResetPasswordRequest,
} from "@/shared/types/auth";

export async function loginRequest(body: LoginRequest): Promise<LoginResponse> {
  const { data } = await apiClient.post<LoginResponse>("/auth", body);
  return data;
}

export async function registerRequest(body: CreateUserRequest): Promise<void> {
  await apiClient.post("/v1/users", body);
}

export async function forgotPasswordRequest(
  body: ForgotPasswordRequest,
): Promise<ForgotPasswordResponse> {
  const { data } = await apiClient.post<ForgotPasswordResponse>(
    "/auth/forgot-password",
    body,
  );
  return data;
}

export async function resetPasswordRequest(
  body: ResetPasswordRequest,
): Promise<void> {
  await apiClient.post("/auth/reset-password", body);
}
