import axios, { type AxiosError, type InternalAxiosRequestConfig } from "axios";
import { useSessionStore } from "@/features/auth/sessionStore";
import { normalizeHttpError } from "@/shared/api/errors";

const AUTH_PUBLIC_PATHS = [
  "/auth",
  "/auth/forgot-password",
  "/auth/reset-password",
  "/v1/users",
];

function isPublicAuthRequest(config: InternalAxiosRequestConfig): boolean {
  const url = config.url ?? "";
  return AUTH_PUBLIC_PATHS.some((path) => url === path || url.endsWith(path));
}

function resolveApiBaseUrl(): string {
  if (import.meta.env.DEV) {
    return "";
  }

  const configured = import.meta.env.VITE_API_BASE_URL?.trim();
  if (!configured) {
    throw new Error("VITE_API_BASE_URL is not configured for this build.");
  }

  return configured;
}

export const apiClient = axios.create({
  baseURL: resolveApiBaseUrl(),
  timeout: 10_000,
  headers: {
    "Content-Type": "application/json",
  },
});

apiClient.interceptors.request.use((config) => {
  if (typeof FormData !== "undefined" && config.data instanceof FormData) {
    config.headers.delete("Content-Type");
  }

  const token = useSessionStore.getState().accessToken;
  if (token && !isPublicAuthRequest(config)) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

apiClient.interceptors.response.use(
  (response) => response,
  (error: AxiosError) => {
    const status = error.response?.status;
    const config = error.config;

    if (
      status === 401 &&
      config &&
      !isPublicAuthRequest(config) &&
      useSessionStore.getState().accessToken
    ) {
      useSessionStore.getState().clear();
      const current = window.location.pathname + window.location.search;
      if (!current.startsWith("/login")) {
        const redirectTo = encodeURIComponent(current);
        window.location.assign(`/login?redirectTo=${redirectTo}`);
      }
    }

    return Promise.reject(normalizeHttpError(error));
  },
);
