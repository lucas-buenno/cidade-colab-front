import { useMutation } from "@tanstack/react-query";
import { forgotPasswordRequest } from "@/features/auth/api";
import type { AppError } from "@/shared/api/errors";
import type {
  ForgotPasswordRequest,
  ForgotPasswordResponse,
} from "@/shared/types/auth";

export function useForgotPassword() {
  return useMutation<ForgotPasswordResponse, AppError, ForgotPasswordRequest>({
    mutationFn: (payload) => forgotPasswordRequest(payload),
  });
}
