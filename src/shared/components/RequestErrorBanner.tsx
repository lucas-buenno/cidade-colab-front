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
      className="rounded-xl border-[3px] border-foreground bg-accent p-4 text-on-accent shadow-card"
    >
      <div className="flex gap-3">
        <Icon className="mt-0.5 size-6 shrink-0 text-on-accent" aria-hidden="true" />
        <div className="flex flex-col gap-2">
          <p className="text-sm font-bold">{error.message}</p>
          {showRetry ? (
            <button
              type="button"
              onClick={onRetry}
              data-testid={`${testId}-retry`}
              className="min-h-11 w-fit cursor-pointer rounded-xl border-[3px] border-foreground bg-surface px-3 text-left font-mono text-xs font-bold tracking-wider text-foreground uppercase"
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
