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
      <div className="flex flex-col gap-1">
        <label
          htmlFor={id}
          className="text-base font-normal tracking-[-0.8px] text-field-ink"
        >
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
          className={`h-56 min-h-56 w-full resize-none rounded border-2 bg-white p-4 text-base font-normal tracking-[-0.8px] text-black shadow-[2px_2px_0_0_#000] outline-none placeholder:text-field-placeholder focus-visible:shadow-[2px_2px_0_0_#000] ${
            error ? "border-destructive" : "border-field-ink"
          } ${className}`}
        />
        {hint ? (
          <div
            id={hintId}
            className="text-[12px] tracking-[-0.6px] text-field-ink"
          >
            {hint}
          </div>
        ) : null}
        <p
          id={errorId}
          role={error ? "alert" : undefined}
          aria-live="polite"
          className="min-h-6 text-base text-destructive"
        >
          {error ?? ""}
        </p>
      </div>
    );
  },
);
