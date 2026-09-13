import { useEffect, useId, useRef } from "react";
import { X } from "@phosphor-icons/react";
import { messages } from "@/shared/i18n/pt-BR";

type Props = {
  open: boolean;
  src: string;
  alt: string;
  onClose: () => void;
};

export function ImageLightbox({ open, src, alt, onClose }: Props) {
  const titleId = useId();
  const closeRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!open) return;
    closeRef.current?.focus();
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

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <button
        type="button"
        aria-label={messages.detail.closePhoto}
        className="motion-overlay absolute inset-0 cursor-pointer bg-overlay"
        onClick={onClose}
      />
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        className="motion-dialog relative z-10 flex max-h-[90dvh] w-full max-w-4xl flex-col items-end gap-3"
      >
        <button
          ref={closeRef}
          type="button"
          onClick={onClose}
          className="inline-flex min-h-11 min-w-11 cursor-pointer items-center justify-center rounded-[8px] border-2 border-black bg-white text-black hover:bg-muted"
          aria-label={messages.detail.closePhoto}
        >
          <X className="size-5" aria-hidden="true" />
        </button>
        <h2 id={titleId} className="sr-only">
          {alt}
        </h2>
        <img
          src={src}
          alt={alt}
          className="max-h-[min(80dvh,720px)] w-full object-contain"
        />
      </div>
    </div>
  );
}
