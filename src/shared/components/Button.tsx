import { CircleNotch } from "@phosphor-icons/react";
import type { ButtonHTMLAttributes } from "react";

type Variant = "primary" | "secondary" | "ghost";

type Props = ButtonHTMLAttributes<HTMLButtonElement> & {
  loading?: boolean;
  loadingLabel?: string;
  variant?: Variant;
  fullWidth?: boolean;
};

const variantClass: Record<Variant, string> = {
  primary:
    "bg-accent text-on-accent shadow-card hover:opacity-90",
  secondary:
    "border-2 border-primary bg-transparent text-primary hover:bg-primary/5",
  ghost: "bg-transparent text-accent hover:underline",
};

export function Button({
  loading = false,
  loadingLabel,
  variant = "primary",
  fullWidth = true,
  children,
  className = "",
  disabled,
  ...props
}: Props) {
  return (
    <button
      {...props}
      disabled={disabled || loading}
      aria-busy={loading}
      className={`inline-flex min-h-11 cursor-pointer items-center justify-center gap-2 rounded-lg px-4 py-3 text-base font-bold transition-opacity duration-200 disabled:cursor-not-allowed disabled:opacity-60 ${
        fullWidth ? "w-full" : "w-auto"
      } ${variantClass[variant]} ${className}`}
    >
      {loading ? (
        <>
          <CircleNotch className="size-5 animate-spin" aria-hidden="true" />
          <span>{loadingLabel ?? children}</span>
        </>
      ) : (
        children
      )}
    </button>
  );
}
