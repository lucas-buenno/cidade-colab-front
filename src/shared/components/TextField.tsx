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
    <div className={`flex flex-col ${hint ? "gap-2" : "gap-1"}`}>
      <label
        htmlFor={id}
        className="text-base font-normal tracking-[-0.8px] text-field-ink"
      >
        {label}
      </label>
      <div className="relative">
        <input
          {...props}
          id={id}
          ref={ref}
          aria-invalid={Boolean(error)}
          aria-describedby={[hintId, errorId].filter(Boolean).join(" ") || undefined}
          className={`min-h-12 w-full rounded border-2 bg-white p-4 text-base font-normal tracking-[-0.8px] text-black shadow-[2px_2px_0_0_#000] outline-none placeholder:text-field-placeholder focus-visible:shadow-[2px_2px_0_0_#000] ${
            trailing ? "pr-14" : ""
          } ${error ? "border-destructive" : "border-field-ink"} ${className}`}
        />
        {trailing ? (
          <div className="absolute inset-y-0 right-0 flex items-center pr-4">
            {trailing}
          </div>
        ) : null}
      </div>
      {hint ? (
        <div id={hintId} className="text-[12px] tracking-[-0.6px] text-field-ink">
          {hint}
        </div>
      ) : null}
      <p
        id={errorId}
        role={error ? "alert" : undefined}
        aria-live="polite"
        data-testid={errorId}
        className="text-base text-destructive"
      >
        {error ?? ""}
      </p>
    </div>
  );
});
