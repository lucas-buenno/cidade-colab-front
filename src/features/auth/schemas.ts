import { z } from "zod";
import { messages } from "@/shared/i18n/pt-BR";
import { normalizeEmail, normalizeUsername } from "@/shared/utils/sanitize";

export const loginSchema = z.object({
  username: z
    .string()
    .transform(normalizeUsername)
    .pipe(z.string().min(1, messages.validation.required)),
  password: z.string().min(1, messages.validation.required),
});

export const registerSchema = z
  .object({
    username: z
      .string()
      .transform(normalizeUsername)
      .pipe(z.string().min(1, messages.validation.required)),
    email: z
      .string()
      .transform(normalizeEmail)
      .pipe(
        z
          .string()
          .min(1, messages.validation.required)
          .email(messages.validation.email),
      ),
    password: z
      .string()
      .min(1, messages.validation.required)
      .min(8, messages.validation.passwordMin),
    confirmPassword: z.string().min(1, messages.validation.required),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: messages.validation.passwordMismatch,
    path: ["confirmPassword"],
  });

export type LoginFormValues = z.infer<typeof loginSchema>;
export type RegisterFormValues = z.infer<typeof registerSchema>;
