import { useEffect, useMemo, useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { AuthLayout } from "@/features/auth/components/AuthLayout";
import { PasswordStrengthMeter } from "@/features/auth/components/PasswordStrengthMeter";
import { useRegister } from "@/features/auth/hooks/useRegister";
import {
  registerSchema,
  type RegisterFormValues,
} from "@/features/auth/schemas";
import { Button } from "@/shared/components/Button";
import { FormErrorSummary } from "@/shared/components/FormErrorSummary";
import { PasswordField } from "@/shared/components/PasswordField";
import { RequestErrorBanner } from "@/shared/components/RequestErrorBanner";
import { SuccessBanner } from "@/shared/components/SuccessBanner";
import { TextField } from "@/shared/components/TextField";
import { messages } from "@/shared/i18n/pt-BR";
import type { AppError } from "@/shared/api/errors";
import { getPasswordStrength } from "@/shared/utils/passwordStrength";
import { getSafeRedirectTo, withRedirectQuery } from "@/shared/utils/redirect";

function fingerprint(values: RegisterFormValues): string {
  return [values.username, values.email, values.password, values.confirmPassword].join(
    "\u0000",
  );
}

export function RegisterPage() {
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const redirectTo = getSafeRedirectTo(params.get("redirectTo")) ?? "/";
  const registerUser = useRegister();
  const [requestError, setRequestError] = useState<AppError | null>(null);
  const [accountCreated, setAccountCreated] = useState(false);
  const [blockedFingerprint, setBlockedFingerprint] = useState<string | null>(
    null,
  );
  const lastSubmitAt = useRef(0);

  const form = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
    mode: "onBlur",
    reValidateMode: "onChange",
    shouldFocusError: true,
    defaultValues: {
      username: "",
      email: "",
      password: "",
      confirmPassword: "",
    },
  });

  const {
    register,
    handleSubmit,
    setFocus,
    setError,
    watch,
    formState: { errors, isSubmitting, submitCount },
  } = form;

  const passwordValue = watch("password");
  const strength = getPasswordStrength(passwordValue);

  const fieldErrors = useMemo(
    () =>
      (
        [
          { key: "username", label: messages.fields.username },
          { key: "email", label: messages.fields.email },
          { key: "password", label: messages.fields.password },
          { key: "confirmPassword", label: messages.fields.confirmPassword },
        ] as const
      )
        .filter((field) => errors[field.key]?.message)
        .map((field) => ({
          href: `#${field.key}`,
          label: errors[field.key]?.message ?? field.label,
        })),
    [errors],
  );

  useEffect(() => {
    if (submitCount === 0 || fieldErrors.length === 0) return;
    document.getElementById("form-error-summary")?.focus();
  }, [submitCount, fieldErrors]);

  const onInvalid = () => {
    const order: Array<keyof RegisterFormValues> = [
      "username",
      "email",
      "password",
      "confirmPassword",
    ];
    const first = order.find((key) => form.formState.errors[key]);
    if (first) setFocus(first);
  };

  const applyServerFieldError = (error: AppError) => {
    if (error.field === "username") {
      setError("username", { type: "server", message: error.message });
      setFocus("username");
      return;
    }
    if (error.field === "email") {
      setError("email", { type: "server", message: error.message });
      setFocus("email");
      return;
    }
    if (error.kind === "conflict") {
      setError("username", { type: "server", message: error.message });
      setError("email", { type: "server", message: error.message });
      setFocus("username");
    }
  };

  const submitRegister = (values: RegisterFormValues) => {
    const now = Date.now();
    if (now - lastSubmitAt.current < 800) return;
    lastSubmitAt.current = now;

    if (blockedFingerprint && fingerprint(values) === blockedFingerprint) {
      setRequestError({
        kind: "validation",
        message: messages.errors.unchangedAfterError,
        retryable: false,
      });
      return;
    }

    setRequestError(null);
    registerUser.mutate(
      {
        username: values.username,
        email: values.email,
        password: values.password,
      },
      {
        onSuccess: () => {
          setAccountCreated(true);
          setBlockedFingerprint(null);
          window.setTimeout(() => {
            navigate(redirectTo, { replace: true });
          }, 900);
        },
        onError: (error) => {
          if (error.code === "register-login-failed") {
            navigate(withRedirectQuery("/login", redirectTo), {
              replace: true,
              state: { username: values.username, accountCreated: true },
            });
            return;
          }
          setRequestError(error);
          setBlockedFingerprint(fingerprint(values));
          applyServerFieldError(error);
        },
      },
    );
  };

  const loading = isSubmitting || registerUser.isPending || accountCreated;
  const currentFingerprint = fingerprint({
    username: watch("username"),
    email: watch("email"),
    password: watch("password"),
    confirmPassword: watch("confirmPassword"),
  });
  const unchangedBlocked =
    Boolean(blockedFingerprint) && currentFingerprint === blockedFingerprint;

  return (
    <AuthLayout title={messages.register.title} subtitle={messages.register.subtitle}>
      {accountCreated ? (
        <SuccessBanner
          message={`${messages.register.success}. ${messages.register.signingIn}`}
          testId="register-success-banner"
        />
      ) : (
        <RequestErrorBanner
          error={requestError}
          testId="register-error-banner"
          onRetry={
            requestError?.retryable
              ? () => void handleSubmit(submitRegister, onInvalid)()
              : undefined
          }
        />
      )}

      <form
        className="mt-6 flex flex-col gap-4"
        onSubmit={handleSubmit(submitRegister, onInvalid)}
        noValidate
        data-testid="register-form"
      >
        {submitCount > 0 ? (
          <FormErrorSummary title={messages.errors.summaryTitle} items={fieldErrors} />
        ) : null}

        <TextField
          id="username"
          label={messages.fields.username}
          autoComplete="username"
          autoCapitalize="none"
          spellCheck={false}
          data-testid="register-username"
          error={errors.username?.message}
          {...register("username")}
        />

        <TextField
          id="email"
          label={messages.fields.email}
          type="email"
          inputMode="email"
          autoComplete="email"
          autoCapitalize="none"
          spellCheck={false}
          data-testid="register-email"
          error={errors.email?.message}
          {...register("email")}
        />

        <PasswordField
          id="password"
          label={messages.fields.password}
          autoComplete="new-password"
          data-testid="register-password"
          error={errors.password?.message}
          hint={<PasswordStrengthMeter strength={strength} />}
          {...register("password")}
        />

        <PasswordField
          id="confirmPassword"
          label={messages.fields.confirmPassword}
          autoComplete="new-password"
          data-testid="register-confirm-password"
          error={errors.confirmPassword?.message}
          {...register("confirmPassword")}
        />

        <Button
          type="submit"
          loading={loading}
          disabled={unchangedBlocked || accountCreated}
          loadingLabel={
            accountCreated ? messages.register.signingIn : messages.register.submitting
          }
          data-testid="register-submit"
        >
          {messages.register.submit}
        </Button>
      </form>

      <p className="mt-6 text-center text-sm text-muted-foreground">
        {messages.register.hasAccount}{" "}
        <Link
          to={withRedirectQuery("/login", redirectTo)}
          data-testid="register-login-link"
          className="inline-flex min-h-11 items-center font-bold text-accent underline-offset-2 hover:underline"
        >
          {messages.register.goToLogin}
        </Link>
      </p>
    </AuthLayout>
  );
}
