import { CheckCircle } from "@phosphor-icons/react";

type Props = {
  message: string;
  testId?: string;
};

export function SuccessBanner({ message, testId = "auth-success-banner" }: Props) {
  return (
    <div
      role="status"
      aria-live="polite"
      data-testid={testId}
      className="flex items-start gap-3 rounded-lg border border-success/30 bg-success/10 p-4 text-foreground"
    >
      <CheckCircle className="mt-0.5 size-6 shrink-0 text-success" aria-hidden="true" />
      <p className="text-sm font-bold">{message}</p>
    </div>
  );
}
