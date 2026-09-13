import { useEffect, useId, type ReactNode } from "react";
import { createPortal } from "react-dom";
import { X } from "@phosphor-icons/react";

type Props = {
  open: boolean;
  title: string;
  children: ReactNode;
  onClose: () => void;
  footer?: ReactNode;
};

export function BottomSheet({ open, title, children, onClose, footer }: Props) {
  const titleId = useId();

  useEffect(() => {
    if (!open) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKeyDown);
    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [open, onClose]);

  if (!open) return null;

  return createPortal(
    <div className="fixed inset-0 z-50 flex items-end justify-center">
      <button
        type="button"
        aria-label="Fechar"
        className="motion-overlay absolute inset-0 cursor-pointer bg-overlay"
        onClick={onClose}
      />
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        className="motion-sheet relative z-10 flex max-h-[85dvh] w-full max-w-[402px] flex-col rounded-t-2xl border-[3px] border-b-0 border-black bg-white px-4 pt-3 pb-[max(1rem,env(safe-area-inset-bottom))]"
      >
        <div
          className="mx-auto mb-3 h-1.5 w-12 rounded-full bg-black"
          aria-hidden="true"
        />
        <div className="flex items-start justify-between gap-3">
          <h2
            id={titleId}
            tabIndex={-1}
            className="text-xl font-extrabold tracking-[-0.8px] text-black outline-none"
          >
            {title}
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="inline-flex size-11 shrink-0 cursor-pointer items-center justify-center rounded-xl border-2 border-transparent text-black hover:border-black hover:bg-feed-tag"
            aria-label="Fechar"
          >
            <X className="size-5" aria-hidden="true" />
          </button>
        </div>
        <div className="mt-3 min-h-0 flex-1 overflow-auto">{children}</div>
        {footer ? <div className="mt-4">{footer}</div> : null}
      </div>
    </div>,
    document.body,
  );
}
