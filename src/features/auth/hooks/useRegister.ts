import { useMutation, useQueryClient } from "@tanstack/react-query";
import { loginRequest, registerRequest } from "@/features/auth/api";
import { useSessionStore } from "@/features/auth/sessionStore";
import { invalidateColabQueries } from "@/features/feed/hooks/useSupportColab";
import type { AppError } from "@/shared/api/errors";
import { messages } from "@/shared/i18n/pt-BR";
import type { CreateUserRequest } from "@/shared/types/auth";

export type RegisterResult = {
  accessToken: string;
};

export function useRegister() {
  const queryClient = useQueryClient();
  const setSession = useSessionStore((state) => state.setSession);

  return useMutation<RegisterResult, AppError, CreateUserRequest>({
    mutationFn: async (payload) => {
      await registerRequest(payload);
      try {
        const { accessToken } = await loginRequest({
          username: payload.username,
          password: payload.password,
        });
        return { accessToken };
      } catch (error) {
        const appError = error as AppError;
        throw {
          ...appError,
          message: messages.register.createdButLoginFailed,
          retryable: false,
          code: "register-login-failed",
        } satisfies AppError;
      }
    },
    onSuccess: ({ accessToken }) => {
      setSession(accessToken);
      invalidateColabQueries(queryClient);
    },
  });
}
