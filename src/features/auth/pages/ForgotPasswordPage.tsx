import { useEffect, useMemo, useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Link, useSearchParams } from "react-router-dom";
import { LoginLayout } from "@/features/auth/components/LoginLayout";
import { useForgotPassword } from "@/features/auth/hooks/useForgotPassword";
import {
  forgotPasswordSchema,
  type ForgotPasswordFormValues,
} from "@/features/auth/schemas";
import arrowRightAltUrl from "@/assets/icons/arrow-right-alt.svg";
import { Button } from "@/shared/components/Button";
import { FormErrorSummary } from "@/shared/components/FormErrorSummary";
import { RequestErrorBanner } from "@/shared/components/RequestErrorBanner";
import { SuccessBanner } from "@/shared/components/SuccessBanner";
import { TextField } from "@/shared/components/TextField";
import { messages } from "@/shared/i18n/pt-BR";
import type { AppError } from "@/shared/api/errors";
import { getSafeRedirectTo, withRedirectQuery } from "@/shared/utils/redirect";

export function ForgotPasswordPage() {
  const [params] = useSearchParams();
  const redirectTo = getSafeRedirectTo(params.get("redirectTo")) ?? "/";
  const forgotPassword = useForgotPassword();
  const [requestError, setRequestError] = useState<AppError | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const lastSubmitAt = useRef(0);

  const form = useForm<ForgotPasswordFormValues>({
    resolver: zodResolver(forgotPasswordSchema),
    mode: "onBlur",
    reValidateMode: "onChange",
    shouldFocusError: true,
    defaultValues: { email: "" },
  });

  const {
    register,
    handleSubmit,
    setFocus,
    setError,
    formState: { errors, isSubmitting, submitCount },
  } = form;

  const fieldErrors = useMemo(
    () =>
      ([{ key: "email", label: messages.fields.email }] as const)
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
    setFocus("email");
  }, [submitCount, fieldErrors, setFocus]);

  const onInvalid = () => {
    setFocus("email");
  };

  const submitForgotPassword = (values: ForgotPasswordFormValues) => {
    if (successMessage) return;

    const now = Date.now();
    if (now - lastSubmitAt.current < 800) return;
    lastSubmitAt.current = now;

    setRequestError(null);
    forgotPassword.mutate(
      { email: values.email },
      {
        onSuccess: (data) => {
          setSuccessMessage(data.message || messages.login.forgotSuccess);
          window.requestAnimationFrame(() => {
            document
              .querySelector<HTMLElement>("[data-testid='forgot-success']")
              ?.focus();
          });
        },
        onError: (error) => {
          if (error.kind === "validation") {
            setError("email", {
              type: "server",
              message: error.message || messages.validation.email,
            });
            setFocus("email");
            return;
          }
          setRequestError(error);
          window.requestAnimationFrame(() => {
            document
              .querySelector<HTMLElement>("[data-testid='forgot-error-banner']")
              ?.focus();
          });
        },
      },
    );
  };

  const loading = isSubmitting || forgotPassword.isPending;
  const submitted = Boolean(successMessage);

  return (
    <LoginLayout>
      {successMessage ? (
        <SuccessBanner message={successMessage} testId="forgot-success" />
      ) : (
        <RequestErrorBanner
          error={requestError}
          testId="forgot-error-banner"
          onRetry={
            requestError?.retryable
              ? () => void handleSubmit(submitForgotPassword, onInvalid)()
              : undefined
          }
        />
      )}

      <form
        className="flex flex-col gap-[25px]"
        onSubmit={handleSubmit(submitForgotPassword, onInvalid)}
        noValidate
        data-testid="forgot-form"
      >
        <div className="flex max-w-[334px] flex-col gap-2">
          <h1 className="text-[40px] leading-[1.031] font-extrabold tracking-[-2px] text-black">
            {messages.login.forgotHeadline}
          </h1>
          <p className="text-base tracking-[-0.8px] text-field-ink">
            {messages.login.forgotSubtitle}
          </p>
        </div>

        {submitCount > 0 && !submitted ? (
          <FormErrorSummary title={messages.errors.summaryTitle} items={fieldErrors} />
        ) : null}

        <TextField
          id="email"
          label={messages.fields.email}
          placeholder={messages.register.emailPlaceholder}
          type="email"
          inputMode="email"
          autoComplete="email"
          autoCapitalize="none"
          spellCheck={false}
          data-testid="forgot-email"
          error={errors.email?.message}
          {...register("email")}
        />

        <div className="py-6">
          <Button
            type="submit"
            loading={loading && !submitted}
            disabled={submitted}
            loadingLabel={messages.login.forgotSubmitting}
            data-testid="forgot-submit"
            icon={
              <img
                src={arrowRightAltUrl}
                alt=""
                width={32}
                height={32}
                className="block size-8 shrink-0"
                aria-hidden="true"
              />
            }
          >
            {messages.login.forgotSubmit}
          </Button>
        </div>
      </form>

      <p className="text-center text-base tracking-[-0.8px] text-black">
        <Link
          to={withRedirectQuery("/login", redirectTo)}
          data-testid="forgot-login-link"
          className="font-semibold text-black underline decoration-solid underline-offset-2"
        >
          {messages.login.backToLogin}
        </Link>
      </p>
    </LoginLayout>
  );
}
