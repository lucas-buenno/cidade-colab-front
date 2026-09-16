import { CircleNotch, Trash } from "@phosphor-icons/react";
import { useEffect, useRef, useState } from "react";
import { prepareColab } from "@/features/colab/api";
import uploadUrl from "@/assets/icons/upload.svg";
import type { AppError } from "@/shared/api/errors";
import { messages } from "@/shared/i18n/pt-BR";
import type { PrepareColabResponse } from "@/shared/types/colab";
import {
  COLAB_IMAGE_ACCEPT,
  cropCoverFile,
  validateColabImage,
} from "@/shared/utils/imageFile";

type Focus = { x: number; y: number };

const CENTER: Focus = { x: 50, y: 50 };

type Props = {
  id?: string;
  value: PrepareColabResponse | null;
  onChange: (value: PrepareColabResponse | null) => void;
  error?: string;
  onErrorChange: (error: string | undefined) => void;
  onBusyChange?: (busy: boolean) => void;
  disabled?: boolean;
};

export function ImageUploadField({
  id = "colab-image",
  value,
  onChange,
  error,
  onErrorChange,
  onBusyChange,
  disabled = false,
}: Props) {
  const inputRef = useRef<HTMLInputElement>(null);
  const frameRef = useRef<HTMLDivElement>(null);
  const abortRef = useRef<AbortController | null>(null);
  const localUrlRef = useRef<string | null>(null);
  const sourceFileRef = useRef<File | null>(null);
  const focusRef = useRef<Focus>(CENTER);
  const lastCropRef = useRef<Focus>(CENTER);
  const cropTimerRef = useRef<number | null>(null);
  const dragRef = useRef<{
    pointerId: number;
    lastX: number;
    lastY: number;
  } | null>(null);
  const [dragging, setDragging] = useState(false);
  const [panning, setPanning] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [localPreview, setLocalPreview] = useState<string | null>(null);
  const [focus, setFocus] = useState<Focus>(CENTER);

  useEffect(() => {
    return () => {
      abortRef.current?.abort();
      if (cropTimerRef.current) window.clearTimeout(cropTimerRef.current);
      if (localUrlRef.current) URL.revokeObjectURL(localUrlRef.current);
    };
  }, []);

  const previewSrc = localPreview || value?.url || null;
  const errorId = `${id}-error`;
  const hintId = `${id}-hint`;
  const progressId = `${id}-progress`;
  const adjustHintId = `${id}-adjust`;

  const setLocalUrl = (url: string | null) => {
    if (localUrlRef.current) URL.revokeObjectURL(localUrlRef.current);
    localUrlRef.current = url;
    setLocalPreview(url);
  };

  const resetFocus = () => {
    focusRef.current = CENTER;
    lastCropRef.current = CENTER;
    setFocus(CENTER);
  };

  const uploadFile = async (file: File) => {
    abortRef.current?.abort();
    const controller = new AbortController();
    abortRef.current = controller;

    onErrorChange(undefined);
    setUploading(true);
    onBusyChange?.(true);
    setProgress(0);

    try {
      const prepared = await prepareColab(file, setProgress, controller.signal);
      if (controller.signal.aborted) return false;
      onChange(prepared);
      setProgress(100);
      return true;
    } catch (caught) {
      if (controller.signal.aborted) return false;
      const appError = caught as AppError;
      onErrorChange(appError.message ?? messages.create.imageTypeInvalid);
      return false;
    } finally {
      if (!controller.signal.aborted) {
        setUploading(false);
        onBusyChange?.(false);
      }
    }
  };

  const handleFiles = async (file: File | undefined) => {
    if (!file || disabled) return;

    const validationError = validateColabImage(file);
    if (validationError) {
      onErrorChange(validationError);
      return;
    }

    sourceFileRef.current = file;
    resetFocus();
    onChange(null);
    setLocalUrl(URL.createObjectURL(file));
    await uploadFile(file);
  };

  const applyCrop = async () => {
    const source = sourceFileRef.current;
    const frame = frameRef.current;
    if (!source || !frame || disabled) return;

    const next = focusRef.current;
    if (next.x === lastCropRef.current.x && next.y === lastCropRef.current.y) {
      return;
    }

    const rect = frame.getBoundingClientRect();
    if (rect.width < 8 || rect.height < 8) return;

    try {
      if (next.x === CENTER.x && next.y === CENTER.y) {
        const uploaded = await uploadFile(source);
        if (uploaded) lastCropRef.current = next;
        return;
      }
      const cropped = await cropCoverFile(
        source,
        rect.width,
        rect.height,
        next.x,
        next.y,
      );
      const uploaded = await uploadFile(cropped);
      if (uploaded) lastCropRef.current = next;
    } catch {
      // Keep the original upload if this format cannot be cropped in the browser.
    }
  };

  const scheduleCrop = () => {
    if (cropTimerRef.current) window.clearTimeout(cropTimerRef.current);
    cropTimerRef.current = window.setTimeout(() => {
      void applyCrop();
    }, 280);
  };

  const moveFocus = (deltaX: number, deltaY: number) => {
    const frame = frameRef.current;
    if (!frame) return;
    const rect = frame.getBoundingClientRect();
    const next = {
      x: Math.min(100, Math.max(0, focusRef.current.x - (deltaX / rect.width) * 100)),
      y: Math.min(100, Math.max(0, focusRef.current.y - (deltaY / rect.height) * 100)),
    };
    focusRef.current = next;
    setFocus(next);
  };

  const openPicker = () => {
    if (disabled || uploading) return;
    inputRef.current?.click();
  };

  return (
    <div className="flex flex-col gap-1">
      <label htmlFor={id} className="text-base font-normal tracking-[-0.8px] text-field-ink">
        {messages.create.imageLabel}
      </label>
      <p id={hintId} className="sr-only">
        {messages.create.imageHint}
      </p>

      <input
        id={id}
        ref={inputRef}
        type="file"
        accept={COLAB_IMAGE_ACCEPT}
        className="sr-only"
        disabled={disabled || uploading}
        onChange={(event) => {
          const file = event.target.files?.[0];
          event.target.value = "";
          void handleFiles(file);
        }}
      />

      <div
        ref={frameRef}
        role={previewSrc ? "group" : "button"}
        tabIndex={disabled ? -1 : 0}
        aria-label={previewSrc ? messages.create.imageAdjustAria : undefined}
        aria-describedby={`${hintId} ${previewSrc ? adjustHintId : ""} ${error ? errorId : ""} ${progressId}`.trim()}
        aria-busy={uploading}
        onClick={() => {
          if (!previewSrc) openPicker();
        }}
        onKeyDown={(event) => {
          if (!previewSrc) {
            if (event.key === "Enter" || event.key === " ") {
              event.preventDefault();
              openPicker();
            }
            return;
          }
          if (uploading || disabled) return;
          const step = event.shiftKey ? 12 : 4;
          const width = frameRef.current?.clientWidth ?? 100;
          const height = frameRef.current?.clientHeight ?? 100;
          if (event.key === "ArrowLeft") {
            event.preventDefault();
            moveFocus(-(width * step) / 100, 0);
          } else if (event.key === "ArrowRight") {
            event.preventDefault();
            moveFocus((width * step) / 100, 0);
          } else if (event.key === "ArrowUp") {
            event.preventDefault();
            moveFocus(0, -(height * step) / 100);
          } else if (event.key === "ArrowDown") {
            event.preventDefault();
            moveFocus(0, (height * step) / 100);
          } else {
            return;
          }
          scheduleCrop();
        }}
        onPointerDown={(event) => {
          if (!previewSrc || uploading || disabled || event.button !== 0) return;
          event.preventDefault();
          frameRef.current?.setPointerCapture(event.pointerId);
          dragRef.current = {
            pointerId: event.pointerId,
            lastX: event.clientX,
            lastY: event.clientY,
          };
          setPanning(true);
        }}
        onPointerMove={(event) => {
          const drag = dragRef.current;
          if (!drag || drag.pointerId !== event.pointerId) return;
          moveFocus(event.clientX - drag.lastX, event.clientY - drag.lastY);
          drag.lastX = event.clientX;
          drag.lastY = event.clientY;
        }}
        onPointerUp={(event) => {
          const drag = dragRef.current;
          if (!drag || drag.pointerId !== event.pointerId) return;
          dragRef.current = null;
          setPanning(false);
          scheduleCrop();
        }}
        onPointerCancel={() => {
          dragRef.current = null;
          setPanning(false);
        }}
        onDragOver={(event) => {
          event.preventDefault();
          if (!disabled) setDragging(true);
        }}
        onDragLeave={() => setDragging(false)}
        onDrop={(event) => {
          event.preventDefault();
          setDragging(false);
          void handleFiles(event.dataTransfer.files[0]);
        }}
        className={`relative flex h-56 min-h-56 flex-col overflow-hidden rounded border-2 border-dashed bg-white outline-none md:h-72 lg:h-80 ${
          previewSrc
            ? `touch-none ${panning ? "cursor-grabbing" : "cursor-grab"}`
            : "cursor-pointer"
        } ${
          error
            ? "border-destructive"
            : dragging
              ? "border-field-ink bg-feed-tag"
              : "border-field-ink"
        }`}
      >
        {previewSrc ? (
          <>
            <img
              src={previewSrc}
              alt=""
              draggable={false}
              className="pointer-events-none h-full w-full select-none object-cover"
              style={{ objectPosition: `${focus.x}% ${focus.y}%` }}
            />
            {uploading ? (
              <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 bg-overlay text-on-primary">
                <CircleNotch className="size-8 animate-spin" aria-hidden="true" />
                <span className="text-base font-bold">
                  {messages.create.imageUploading} {progress}%
                </span>
              </div>
            ) : null}
          </>
        ) : (
          <div className="flex flex-1 flex-col items-center justify-center gap-6 px-4 py-8 text-center">
            <span className="inline-flex items-end justify-end rounded-[12px] border-[3px] border-feed-ink bg-feed-yellow p-4 shadow-[3px_4px_0_0_#0d0d0d]">
              <img
                src={uploadUrl}
                alt=""
                width={24}
                height={24}
                className="block size-6"
                aria-hidden="true"
              />
            </span>
            <p className="text-base tracking-[-0.8px] text-field-placeholder">
              {messages.create.imageDrop}
            </p>
          </div>
        )}
      </div>

      <div
        id={progressId}
        className="h-2 overflow-hidden rounded-lg border-[3px] border-foreground bg-muted"
        role="progressbar"
        aria-label={messages.create.imageProgress}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={uploading ? progress : value ? 100 : 0}
      >
        <div
          className="h-full bg-primary"
          style={{
            width: `${uploading ? progress : value ? 100 : 0}%`,
            opacity: uploading || value ? 1 : 0,
          }}
        />
      </div>

      {value && !uploading ? (
        <p className="text-base font-bold text-success" role="status">
          {messages.create.imageUploaded}
        </p>
      ) : (
        <p className="min-h-6 text-base text-muted-foreground">
          {localPreview && !value && !uploading
            ? messages.create.imagePreviewUnavailable
            : ""}
        </p>
      )}

      {previewSrc ? (
        <p id={adjustHintId} className="text-base tracking-[-0.8px] text-field-ink">
          {messages.create.imageAdjustHint}
        </p>
      ) : null}

      {previewSrc ? (
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={openPicker}
            disabled={uploading || disabled}
            className="inline-flex min-h-11 cursor-pointer items-center rounded-xl border-[3px] border-feed-ink bg-feed-yellow px-4 text-base font-bold text-black shadow-[3px_4px_0_0_#0d0d0d] hover:translate-x-px hover:translate-y-px hover:shadow-none disabled:cursor-not-allowed disabled:opacity-60 disabled:hover:translate-x-0 disabled:hover:translate-y-0 disabled:hover:shadow-[3px_4px_0_0_#0d0d0d]"
          >
            {messages.create.imageChange}
          </button>
          <button
            type="button"
            onClick={() => {
              abortRef.current?.abort();
              if (cropTimerRef.current) window.clearTimeout(cropTimerRef.current);
              setUploading(false);
              onBusyChange?.(false);
              setProgress(0);
              sourceFileRef.current = null;
              resetFocus();
              setLocalUrl(null);
              onChange(null);
              onErrorChange(undefined);
            }}
            disabled={disabled}
            className="inline-flex min-h-11 cursor-pointer items-center gap-1 rounded-xl border-[3px] border-feed-ink bg-feed-fab px-4 text-base font-bold text-black shadow-[3px_4px_0_0_#0d0d0d] hover:translate-x-px hover:translate-y-px hover:shadow-none disabled:cursor-not-allowed disabled:opacity-60 disabled:hover:translate-x-0 disabled:hover:translate-y-0 disabled:hover:shadow-[3px_4px_0_0_#0d0d0d]"
          >
            <Trash className="size-4" aria-hidden="true" />
            {messages.create.imageRemove}
          </button>
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
}
