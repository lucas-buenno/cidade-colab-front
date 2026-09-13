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
      className="flex items-start gap-3 rounded-xl border-[3px] border-foreground bg-primary p-4 text-on-primary shadow-card"
    >
      <CheckCircle className="mt-0.5 size-6 shrink-0 text-on-primary" aria-hidden="true" />
      <p className="text-sm font-bold text-on-primary">{message}</p>
    </div>
  );
}
