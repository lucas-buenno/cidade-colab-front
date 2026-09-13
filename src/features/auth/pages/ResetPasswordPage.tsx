import { useEffect, useMemo, useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { PasswordStrengthMeter } from "@/features/auth/components/PasswordStrengthMeter";
import { LoginLayout } from "@/features/auth/components/LoginLayout";
import { useResetPassword } from "@/features/auth/hooks/useResetPassword";
import {
  resetPasswordSchema,
  type ResetPasswordFormValues,
} from "@/features/auth/schemas";
import arrowRightAltUrl from "@/assets/icons/arrow-right-alt.svg";
import { Button } from "@/shared/components/Button";
import { FormErrorSummary } from "@/shared/components/FormErrorSummary";
import { PasswordField } from "@/shared/components/PasswordField";
import { RequestErrorBanner } from "@/shared/components/RequestErrorBanner";
import { messages } from "@/shared/i18n/pt-BR";
import type { AppError } from "@/shared/api/errors";
import { getPasswordStrength } from "@/shared/utils/passwordStrength";

function readResetToken(value: string | null): string {
  return value?.trim() ?? "";
}

export function ResetPasswordPage() {
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const token = readResetToken(params.get("token"));
  const missingToken = token.length === 0;
  const resetPassword = useResetPassword();
  const [requestError, setRequestError] = useState<AppError | null>(null);
  const [linkInvalid, setLinkInvalid] = useState(missingToken);
  const lastSubmitAt = useRef(0);

  const form = useForm<ResetPasswordFormValues>({
    resolver: zodResolver(resetPasswordSchema),
    mode: "onBlur",
    reValidateMode: "onChange",
    shouldFocusError: true,
    defaultValues: { password: "", confirmPassword: "" },
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
    if (linkInvalid || submitCount === 0 || fieldErrors.length === 0) return;
    const summary = document.getElementById("form-error-summary");
    if (summary) {
      summary.focus();
      return;
    }
    setFocus(fieldErrors[0].href.slice(1) as keyof ResetPasswordFormValues);
  }, [linkInvalid, submitCount, fieldErrors, setFocus]);

  const onInvalid = () => {
    const order: Array<keyof ResetPasswordFormValues> = [
      "password",
      "confirmPassword",
    ];
    const first = order.find((key) => form.formState.errors[key]);
    if (first) setFocus(first);
  };

  const submitResetPassword = (values: ResetPasswordFormValues) => {
    if (linkInvalid || missingToken) return;

    const now = Date.now();
    if (now - lastSubmitAt.current < 800) return;
    lastSubmitAt.current = now;

    setRequestError(null);
    resetPassword.mutate(
      { token, password: values.password },
      {
        onSuccess: () => {
          navigate("/login", {
            replace: true,
            state: { passwordReset: true },
          });
        },
        onError: (error) => {
          if (error.field === "password") {
            setError("password", { type: "server", message: error.message });
            setFocus("password");
            return;
          }
          const invalidLink = error.status === 400 || error.status === 401;
          if (invalidLink) {
            setLinkInvalid(true);
            return;
          }
          setRequestError(error);
          window.requestAnimationFrame(() => {
            document
              .querySelector<HTMLElement>("[data-testid='reset-error-banner']")
              ?.focus();
          });
        },
      },
    );
  };

  const loading = isSubmitting || resetPassword.isPending;

  return (
    <LoginLayout>
      {linkInvalid ? (
        <div className="flex flex-col gap-[25px]" data-testid="reset-invalid-link">
          <div className="flex max-w-[334px] flex-col gap-2">
            <h1 className="text-[40px] leading-[1.031] font-extrabold tracking-[-2px] text-black">
              {messages.login.resetInvalidLink}
            </h1>
            <p className="text-base tracking-[-0.8px] text-field-ink">
              {messages.login.resetInvalidLinkBody}
            </p>
          </div>
          <p className="text-center text-base tracking-[-0.8px] text-black">
            <Link
              to="/esqueci-senha"
              data-testid="reset-forgot-link"
              className="font-semibold text-black underline decoration-solid underline-offset-2"
            >
              {messages.login.goToForgot}
            </Link>
          </p>
          <p className="text-center text-base tracking-[-0.8px] text-black">
            <Link
              to="/login"
              data-testid="reset-login-link"
              className="font-semibold text-black underline decoration-solid underline-offset-2"
            >
              {messages.login.backToLogin}
            </Link>
          </p>
        </div>
      ) : (
        <>
          <RequestErrorBanner
            error={requestError}
            testId="reset-error-banner"
            onRetry={
              requestError?.retryable
                ? () => void handleSubmit(submitResetPassword, onInvalid)()
                : undefined
            }
          />

          <form
            className="flex flex-col gap-[25px]"
            onSubmit={handleSubmit(submitResetPassword, onInvalid)}
            noValidate
            data-testid="reset-form"
          >
            <div className="flex max-w-[334px] flex-col gap-2">
              <h1 className="text-[40px] leading-[1.031] font-extrabold tracking-[-2px] text-black">
                {messages.login.resetHeadline}
              </h1>
              <p className="text-base tracking-[-0.8px] text-field-ink">
                {messages.login.resetSubtitle}
              </p>
            </div>

            {submitCount > 0 ? (
              <FormErrorSummary
                title={messages.errors.summaryTitle}
                items={fieldErrors}
              />
            ) : null}

            <div className="flex flex-col gap-[25px]">
              <PasswordField
                id="password"
                label={messages.fields.password}
                placeholder={messages.register.passwordPlaceholder}
                autoComplete="new-password"
                data-testid="reset-password"
                error={errors.password?.message}
                hint={<PasswordStrengthMeter strength={strength} />}
                {...register("password")}
              />

              <PasswordField
                id="confirmPassword"
                label={messages.register.confirmPassword}
                placeholder={messages.register.confirmPasswordPlaceholder}
                autoComplete="new-password"
                data-testid="reset-confirm"
                error={errors.confirmPassword?.message}
                {...register("confirmPassword")}
              />
            </div>

            <div className="py-6">
              <Button
                type="submit"
                loading={loading}
                loadingLabel={messages.login.resetSubmitting}
                data-testid="reset-submit"
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
                {messages.login.resetSubmit}
              </Button>
            </div>
          </form>

          <p className="text-center text-base tracking-[-0.8px] text-black">
            <Link
              to="/login"
              data-testid="reset-login-link"
              className="font-semibold text-black underline decoration-solid underline-offset-2"
            >
              {messages.login.backToLogin}
            </Link>
          </p>
        </>
      )}
    </LoginLayout>
  );
}
