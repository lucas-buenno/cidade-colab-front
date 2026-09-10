import { messages } from "@/shared/i18n/pt-BR";
import type { PasswordStrength } from "@/shared/utils/passwordStrength";

const labels: Record<Exclude<PasswordStrength, "empty">, string> = {
  weak: messages.password.weak,
  medium: messages.password.medium,
  strong: messages.password.strong,
};

const barClass: Record<Exclude<PasswordStrength, "empty">, string> = {
  weak: "w-1/3 bg-destructive",
  medium: "w-2/3 bg-warning",
  strong: "w-full bg-success",
};

type Props = {
  strength: PasswordStrength;
};

export function PasswordStrengthMeter({ strength }: Props) {
  if (strength === "empty") {
    return (
      <p className="text-sm text-muted-foreground">{messages.password.hint}</p>
    );
  }

  return (
    <div className="flex flex-col gap-1" data-testid="password-strength">
      <div
        className="h-1.5 overflow-hidden rounded-full bg-muted"
        role="meter"
        aria-valuemin={0}
        aria-valuemax={3}
        aria-valuenow={strength === "weak" ? 1 : strength === "medium" ? 2 : 3}
        aria-label={messages.password.strengthLabel}
        aria-valuetext={labels[strength]}
      >
        <div className={`h-full rounded-full transition-all duration-200 ${barClass[strength]}`} />
      </div>
      <p className="text-sm text-muted-foreground">
        {messages.password.strengthLabel}:{" "}
        <span className="font-bold text-foreground">{labels[strength]}</span>
        . {messages.password.hint}
      </p>
    </div>
  );
}
