import { useMutation } from "@tanstack/react-query";
import { resetPasswordRequest } from "@/features/auth/api";
import type { AppError } from "@/shared/api/errors";
import type { ResetPasswordRequest } from "@/shared/types/auth";

export function useResetPassword() {
  return useMutation<void, AppError, ResetPasswordRequest>({
    mutationFn: (payload) => resetPasswordRequest(payload),
  });
}
