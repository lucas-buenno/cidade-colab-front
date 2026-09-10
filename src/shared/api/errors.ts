import { messages } from "@/shared/i18n/pt-BR";

export type AppErrorKind =
  | "validation"
  | "unauthorized"
  | "forbidden"
  | "not_found"
  | "conflict"
  | "timeout"
  | "offline"
  | "network"
  | "unavailable"
  | "unexpected";

export type AppError = {
  kind: AppErrorKind;
  status?: number;
  message: string;
  field?: "username" | "email" | "password";
  fields?: Record<string, string>;
  retryable: boolean;
  code?: "register-login-failed";
};

const SAFE_MESSAGE_MAX = 180;

function isPlainObject(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function extractSafeMessage(data: unknown): string | undefined {
  if (typeof data === "string") {
    const trimmed = data.trim();
    if (!trimmed || looksLikeStack(trimmed)) return undefined;
    return trimmed.slice(0, SAFE_MESSAGE_MAX);
  }
  if (!isPlainObject(data)) return undefined;

  const candidate = data.message ?? data.detail ?? data.title;
  if (typeof candidate !== "string") return undefined;
  const trimmed = candidate.trim();
  if (!trimmed || looksLikeStack(trimmed)) return undefined;
  return trimmed.slice(0, SAFE_MESSAGE_MAX);
}

function looksLikeStack(text: string): boolean {
  return /Exception|at\s+\w+\.|org\.springframework|java\.lang|stackTrace/i.test(
    text,
  );
}

function mentionsUsername(text: string): boolean {
  return /username|usu[aá]rio|user name|login/i.test(text);
}

function mentionsEmail(text: string): boolean {
  return /e-?mail|correo/i.test(text);
}

export function isOffline(): boolean {
  return typeof navigator !== "undefined" && navigator.onLine === false;
}

type AxiosLikeError = {
  code?: string;
  message?: string;
  response?: { status?: number; data?: unknown };
};

export function normalizeHttpError(error: unknown): AppError {
  if (isOffline()) {
    return {
      kind: "offline",
      message: messages.errors.offline,
      retryable: true,
    };
  }

  const err = error as AxiosLikeError;
  const status = err.response?.status;
  const bodyMessage = extractSafeMessage(err.response?.data);

  if (err.code === "ECONNABORTED" || /timeout/i.test(err.message ?? "")) {
    return {
      kind: "timeout",
      message: messages.errors.timeout,
      retryable: true,
    };
  }

  if (!status) {
    return {
      kind: "network",
      message: messages.errors.network,
      retryable: true,
    };
  }

  if (status === 401) {
    return {
      kind: "unauthorized",
      status,
      message: messages.errors.invalidCredentials,
      retryable: false,
    };
  }

  if (status === 403) {
    return {
      kind: "forbidden",
      status,
      message: messages.errors.forbidden,
      retryable: false,
    };
  }

  if (status === 404) {
    return {
      kind: "not_found",
      status,
      message: messages.errors.notFound,
      retryable: false,
    };
  }

  if (status === 413) {
    return {
      kind: "validation",
      status,
      message: messages.create.imageTooLarge,
      retryable: false,
    };
  }

  if (status === 409) {
    return conflictError(bodyMessage, status);
  }

  if (status === 400) {
    const conflict = maybeConflictFromMessage(bodyMessage, status);
    if (conflict) return conflict;
    return {
      kind: "validation",
      status,
      message: bodyMessage ?? messages.errors.validationGeneric,
      fields: extractFieldErrors(err.response?.data),
      retryable: false,
    };
  }

  if (status >= 500) {
    return {
      kind: "unavailable",
      status,
      message: messages.errors.unavailable,
      retryable: true,
    };
  }

  return {
    kind: "unexpected",
    status,
    message: messages.errors.unexpected,
    retryable: true,
  };
}

function extractFieldErrors(data: unknown): Record<string, string> | undefined {
  if (!isPlainObject(data)) return undefined;
  const result: Record<string, string> = {};

  const errors = data.errors;
  if (Array.isArray(errors)) {
    for (const item of errors) {
      if (!isPlainObject(item)) continue;
      const pointer =
        typeof item.pointer === "string"
          ? item.pointer.replace(/^#\//, "").replaceAll("/", ".")
          : undefined;
      const fieldRaw =
        (typeof item.field === "string" && item.field) ||
        pointer ||
        (typeof item.path === "string" && item.path);
      const msg =
        (typeof item.defaultMessage === "string" && item.defaultMessage) ||
        (typeof item.detail === "string" && item.detail) ||
        (typeof item.message === "string" && item.message);
      if (fieldRaw && msg) {
        result[fieldRaw] = msg.slice(0, SAFE_MESSAGE_MAX);
      }
    }
  }

  if (isPlainObject(data.fieldErrors)) {
    for (const [key, value] of Object.entries(data.fieldErrors)) {
      if (typeof value === "string" && value.trim()) {
        result[key] = value.trim().slice(0, SAFE_MESSAGE_MAX);
      }
    }
  }

  return Object.keys(result).length > 0 ? result : undefined;
}

function maybeConflictFromMessage(
  bodyMessage: string | undefined,
  status: number,
): AppError | null {
  if (!bodyMessage) return null;
  if (
    /already|existe|duplic|in use|cadastrad|taken|unique/i.test(bodyMessage)
  ) {
    return conflictError(bodyMessage, status);
  }
  return null;
}

function conflictError(bodyMessage: string | undefined, status: number): AppError {
  const text = bodyMessage ?? "";
  const user = mentionsUsername(text);
  const email = mentionsEmail(text);

  if (user && !email) {
    return {
      kind: "conflict",
      status,
      field: "username",
      message: messages.errors.conflictUsername,
      retryable: false,
    };
  }
  if (email && !user) {
    return {
      kind: "conflict",
      status,
      field: "email",
      message: messages.errors.conflictEmail,
      retryable: false,
    };
  }
  return {
    kind: "conflict",
    status,
    message: messages.errors.conflictGeneric,
    retryable: false,
  };
}
