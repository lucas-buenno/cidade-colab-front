import { useEffect, useMemo, useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Link, useLocation, useNavigate, useSearchParams } from "react-router-dom";
import { AuthLayout } from "@/features/auth/components/AuthLayout";
import { useLogin } from "@/features/auth/hooks/useLogin";
import { loginSchema, type LoginFormValues } from "@/features/auth/schemas";
import { Button } from "@/shared/components/Button";
import { FormErrorSummary } from "@/shared/components/FormErrorSummary";
import { PasswordField } from "@/shared/components/PasswordField";
import { RequestErrorBanner } from "@/shared/components/RequestErrorBanner";
import { TextField } from "@/shared/components/TextField";
import { messages } from "@/shared/i18n/pt-BR";
import type { AppError } from "@/shared/api/errors";
import { SuccessBanner } from "@/shared/components/SuccessBanner";
import { getSafeRedirectTo, withRedirectQuery } from "@/shared/utils/redirect";
import { sanitizeText } from "@/shared/utils/sanitize";

type LoginLocationState = {
  username?: string;
  accountCreated?: boolean;
};

function fingerprint(values: LoginFormValues): string {
  return `${values.username}\u0000${values.password}`;
}

export function LoginPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const [params] = useSearchParams();
  const redirectTo = getSafeRedirectTo(params.get("redirectTo")) ?? "/";
  const locationState = (location.state as LoginLocationState | null) ?? null;
  const prefilledUsername = sanitizeText(locationState?.username ?? "");
  const login = useLogin();
  const [requestError, setRequestError] = useState<AppError | null>(null);
  const [blockedFingerprint, setBlockedFingerprint] = useState<string | null>(
    null,
  );
  const lastSubmitAt = useRef(0);
  const bannerRef = useRef<HTMLDivElement>(null);

  const form = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    mode: "onBlur",
    reValidateMode: "onChange",
    shouldFocusError: true,
    defaultValues: { username: prefilledUsername, password: "" },
  });

  const {
    register,
    handleSubmit,
    setFocus,
    resetField,
    watch,
    formState: { errors, isSubmitting, submitCount },
  } = form;

  const fieldErrors = useMemo(
    () =>
      (
        [
          { key: "username", label: messages.fields.username },
          { key: "password", label: messages.fields.password },
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
    const summary = document.getElementById("form-error-summary");
    if (summary) {
      summary.focus();
      return;
    }
    setFocus(fieldErrors[0].href.slice(1) as keyof LoginFormValues);
  }, [submitCount, fieldErrors, setFocus]);

  const onInvalid = () => {
    const order: Array<keyof LoginFormValues> = ["username", "password"];
    const first = order.find((key) => form.formState.errors[key]);
    if (first) setFocus(first);
  };

  const submitLogin = (values: LoginFormValues) => {
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
    login.mutate(
      { username: values.username, password: values.password },
      {
        onSuccess: () => {
          setBlockedFingerprint(null);
          navigate(redirectTo, { replace: true });
        },
        onError: (error) => {
          setRequestError(error);
          setBlockedFingerprint(fingerprint(values));
          resetField("password");
          window.requestAnimationFrame(() => {
            document.querySelector<HTMLElement>("[data-testid='login-error-banner']")?.focus();
          });
        },
      },
    );
  };

  const loading = isSubmitting || login.isPending;
  const currentFingerprint = fingerprint({
    username: watch("username"),
    password: watch("password"),
  });
  const unchangedBlocked =
    Boolean(blockedFingerprint) && currentFingerprint === blockedFingerprint;

  return (
    <AuthLayout title={messages.login.title} subtitle={messages.login.subtitle}>
      <div ref={bannerRef} tabIndex={-1} className="outline-none">
        {locationState?.accountCreated && !requestError ? (
          <SuccessBanner
            message={messages.register.success}
            testId="login-account-created-banner"
          />
        ) : (
          <RequestErrorBanner
            error={requestError}
            testId="login-error-banner"
            onRetry={
              requestError?.retryable
                ? () => void handleSubmit(submitLogin, onInvalid)()
                : undefined
            }
          />
        )}
      </div>

      <form
        className="mt-6 flex flex-col gap-4"
        onSubmit={handleSubmit(submitLogin, onInvalid)}
        noValidate
        data-testid="login-form"
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
          data-testid="login-username"
          error={errors.username?.message}
          {...register("username")}
        />

        <PasswordField
          id="password"
          label={messages.fields.password}
          autoComplete="current-password"
          data-testid="login-password"
          error={errors.password?.message}
          {...register("password")}
        />

        <Button
          type="submit"
          loading={loading}
          disabled={unchangedBlocked}
          loadingLabel={messages.login.submitting}
          data-testid="login-submit"
        >
          {messages.login.submit}
        </Button>
      </form>

      <p className="mt-6 text-center text-sm text-muted-foreground">
        {messages.login.noAccount}{" "}
        <Link
          to={withRedirectQuery("/cadastro", redirectTo)}
          data-testid="login-register-link"
          className="inline-flex min-h-11 items-center font-bold text-accent underline-offset-2 hover:underline"
        >
          {messages.login.goToRegister}
        </Link>
      </p>
    </AuthLayout>
  );
}
