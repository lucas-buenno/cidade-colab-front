import type { TextareaHTMLAttributes, ReactNode } from "react";
import { forwardRef } from "react";

type Props = TextareaHTMLAttributes<HTMLTextAreaElement> & {
  label: ReactNode;
  error?: string;
  hint?: ReactNode;
};

export const TextAreaField = forwardRef<HTMLTextAreaElement, Props>(
  function TextAreaField(
    { id, label, error, hint, className = "", ...props },
    ref,
  ) {
    const errorId = error ? `${id}-error` : undefined;
    const hintId = hint ? `${id}-hint` : undefined;

    return (
      <div className="flex flex-col gap-1.5">
        <label htmlFor={id} className="text-sm font-bold text-foreground">
          {label}
        </label>
        <textarea
          {...props}
          id={id}
          ref={ref}
          aria-invalid={Boolean(error)}
          aria-describedby={
            [hintId, errorId].filter(Boolean).join(" ") || undefined
          }
          className={`min-h-36 w-full resize-y rounded-lg border bg-card px-3 py-2.5 text-base text-card-foreground placeholder:text-muted-foreground outline-none ${
            error ? "border-destructive" : "border-border"
          } ${className}`}
        />
        {hint ? (
          <div id={hintId} className="text-sm text-muted-foreground">
            {hint}
          </div>
        ) : null}
        <p
          id={errorId}
          role={error ? "alert" : undefined}
          aria-live="polite"
          className="min-h-5 text-sm text-destructive"
        >
          {error ?? ""}
        </p>
      </div>
    );
  },
);
