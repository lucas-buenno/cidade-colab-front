import { useEffect, useId, useRef, type ReactNode } from "react";
import { X } from "@phosphor-icons/react";

type Props = {
  open: boolean;
  title: string;
  children: ReactNode;
  onClose: () => void;
  footer?: ReactNode;
};

export function Modal({ open, title, children, onClose, footer }: Props) {
  const titleId = useId();
  const headingRef = useRef<HTMLHeadingElement>(null);

  useEffect(() => {
    if (!open) return;
    headingRef.current?.focus();

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <button
        type="button"
        aria-label="Fechar"
        className="absolute inset-0 cursor-pointer bg-overlay"
        onClick={onClose}
      />
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        className="relative z-10 w-[90%] max-w-lg rounded-2xl border border-border bg-surface p-8 shadow-xl"
      >
        <div className="flex items-start justify-between gap-4">
          <h2
            id={titleId}
            ref={headingRef}
            tabIndex={-1}
            className="text-xl font-bold text-foreground outline-none"
          >
            {title}
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="inline-flex min-h-11 min-w-11 cursor-pointer items-center justify-center rounded-lg text-muted-foreground transition-colors duration-200 hover:bg-muted hover:text-foreground"
            aria-label="Fechar"
          >
            <X className="size-5" aria-hidden="true" />
          </button>
        </div>
        <div className="mt-4 text-base text-muted-foreground">{children}</div>
        {footer ? <div className="mt-6">{footer}</div> : null}
      </div>
    </div>
  );
}
