import { WarningCircle, WifiSlash } from "@phosphor-icons/react";
import { messages } from "@/shared/i18n/pt-BR";
import type { AppError } from "@/shared/api/errors";

type Props = {
  error: AppError | null;
  onRetry?: () => void;
  testId?: string;
};

export function RequestErrorBanner({
  error,
  onRetry,
  testId = "auth-error-banner",
}: Props) {
  if (!error) return null;

  const Icon = error.kind === "offline" ? WifiSlash : WarningCircle;
  const showRetry = error.retryable && onRetry;

  return (
    <div
      role="alert"
      tabIndex={-1}
      data-testid={testId}
      className="rounded-lg border border-destructive/30 bg-destructive/5 p-4 text-foreground"
    >
      <div className="flex gap-3">
        <Icon className="mt-0.5 size-6 shrink-0 text-destructive" aria-hidden="true" />
        <div className="flex flex-col gap-2">
          <p className="text-sm font-bold">{error.message}</p>
          {showRetry ? (
            <button
              type="button"
              onClick={onRetry}
              data-testid={`${testId}-retry`}
              className="min-h-11 w-fit cursor-pointer rounded-md px-3 text-left text-sm font-bold text-accent underline-offset-2 hover:underline"
            >
              {error.kind === "offline"
                ? messages.actions.retryWhenOnline
                : messages.actions.retry}
            </button>
          ) : null}
        </div>
      </div>
    </div>
  );
}
