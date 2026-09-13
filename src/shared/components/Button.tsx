import { CircleNotch } from "@phosphor-icons/react";
import type { ButtonHTMLAttributes, ReactNode } from "react";

type Variant = "primary" | "secondary" | "ghost" | "accent" | "outline";

type Props = ButtonHTMLAttributes<HTMLButtonElement> & {
  loading?: boolean;
  loadingLabel?: string;
  variant?: Variant;
  fullWidth?: boolean;
  icon?: ReactNode;
};

const variantClass: Record<Variant, string> = {
  primary:
    "border-[3px] border-feed-ink bg-feed-fab text-black shadow-[3px_4px_0_0_#0d0d0d] hover:translate-x-px hover:translate-y-px hover:shadow-none",
  secondary:
    "border-[3px] border-foreground bg-secondary text-on-secondary shadow-card hover:translate-x-0.5 hover:translate-y-0.5 hover:shadow-none",
  accent:
    "border-[3px] border-foreground bg-accent text-on-accent shadow-card hover:translate-x-0.5 hover:translate-y-0.5 hover:shadow-none",
  ghost:
    "border-[3px] border-transparent bg-transparent text-foreground underline decoration-solid underline-offset-4 hover:bg-muted",
  outline:
    "border-[3px] border-feed-ink bg-white text-black shadow-[3px_4px_0_0_#0d0d0d] hover:translate-x-px hover:translate-y-px hover:shadow-none",
};

export function Button({
  loading = false,
  loadingLabel,
  variant = "primary",
  fullWidth = true,
  icon,
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
      className={`motion-press inline-flex min-h-11 cursor-pointer items-center justify-center gap-4 rounded-xl px-4 py-3 font-sans text-2xl font-normal disabled:cursor-not-allowed disabled:opacity-60 disabled:hover:translate-x-0 disabled:hover:translate-y-0 disabled:hover:shadow-[3px_4px_0_0_#0d0d0d] ${
        fullWidth ? "w-full" : "w-auto"
      } ${variantClass[variant]} ${className}`}
    >
      {loading ? (
        <>
          <CircleNotch className="size-8" aria-hidden="true" />
          <span>{loadingLabel ?? children}</span>
        </>
      ) : (
        <>
          <span>{children}</span>
          {icon}
        </>
      )}
    </button>
  );
}
