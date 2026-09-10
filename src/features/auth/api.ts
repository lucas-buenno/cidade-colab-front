import { apiClient } from "@/shared/api/client";
import type {
  CreateUserRequest,
  LoginRequest,
  LoginResponse,
} from "@/shared/types/auth";

export async function loginRequest(body: LoginRequest): Promise<LoginResponse> {
  const { data } = await apiClient.post<LoginResponse>("/auth", body);
  return data;
}

export async function registerRequest(body: CreateUserRequest): Promise<void> {
  await apiClient.post("/v1/users", body);
}
