import { useMutation } from "@tanstack/react-query";
import { loginRequest } from "@/features/auth/api";
import { useSessionStore } from "@/features/auth/sessionStore";
import type { AppError } from "@/shared/api/errors";
import type { LoginRequest } from "@/shared/types/auth";

export function useLogin() {
  const setSession = useSessionStore((state) => state.setSession);

  return useMutation<string, AppError, LoginRequest>({
    mutationFn: async (payload) => {
      const { accessToken } = await loginRequest(payload);
      return accessToken;
    },
    onSuccess: (accessToken) => {
      setSession(accessToken);
    },
  });
}
