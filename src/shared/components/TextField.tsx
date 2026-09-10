import type { InputHTMLAttributes, ReactNode } from "react";
import { forwardRef } from "react";

type Props = InputHTMLAttributes<HTMLInputElement> & {
  label: string;
  error?: string;
  hint?: ReactNode;
  trailing?: ReactNode;
};

export const TextField = forwardRef<HTMLInputElement, Props>(function TextField(
  { id, label, error, hint, trailing, className = "", ...props },
  ref,
) {
  const errorId = error ? `${id}-error` : undefined;
  const hintId = hint ? `${id}-hint` : undefined;

  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={id} className="text-sm font-bold text-foreground">
        {label}
      </label>
      <div className="relative">
        <input
          {...props}
          id={id}
          ref={ref}
          aria-invalid={Boolean(error)}
          aria-describedby={[hintId, errorId].filter(Boolean).join(" ") || undefined}
          className={`min-h-11 w-full rounded-lg border bg-card px-3 py-2.5 text-base text-card-foreground placeholder:text-muted-foreground outline-none ${
            trailing ? "pr-12" : ""
          } ${error ? "border-destructive" : "border-border"} ${className}`}
        />
        {trailing ? (
          <div className="absolute inset-y-0 right-0 flex items-center pr-1.5">
            {trailing}
          </div>
        ) : null}
      </div>
      {hint ? (
        <div id={hintId} className="text-sm text-muted-foreground">
          {hint}
        </div>
      ) : null}
      <p
        id={errorId}
        role={error ? "alert" : undefined}
        aria-live="polite"
        data-testid={errorId}
        className="min-h-5 text-sm text-destructive"
      >
        {error ?? ""}
      </p>
    </div>
  );
});
