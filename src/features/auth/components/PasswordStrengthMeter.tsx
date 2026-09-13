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
      <p className="text-[12px] tracking-[-0.6px] text-field-ink">
        {messages.password.hint}
      </p>
    );
  }

  return (
    <div className="flex flex-col gap-1" data-testid="password-strength">
      <div
        className="h-2 overflow-hidden rounded-lg border-[3px] border-foreground bg-muted"
        role="meter"
        aria-valuemin={0}
        aria-valuemax={3}
        aria-valuenow={strength === "weak" ? 1 : strength === "medium" ? 2 : 3}
        aria-label={messages.password.strengthLabel}
        aria-valuetext={labels[strength]}
      >
        <div className={`h-full ${barClass[strength]} transition-[width] duration-200 ease-out`} />
      </div>
      <p className="text-[12px] tracking-[-0.6px] text-field-ink">
        {messages.password.strengthLabel}:{" "}
        <span className="font-bold">{labels[strength]}</span>. {messages.password.hint}
      </p>
    </div>
  );
}
