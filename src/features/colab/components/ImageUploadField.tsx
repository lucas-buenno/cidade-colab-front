import {
  CircleNotch,
  Trash,
} from "@phosphor-icons/react";
import { useEffect, useRef, useState } from "react";
import { prepareColab } from "@/features/colab/api";
import uploadUrl from "@/assets/icons/upload.svg";
import type { AppError } from "@/shared/api/errors";
import { messages } from "@/shared/i18n/pt-BR";
import type { PrepareColabResponse } from "@/shared/types/colab";
import {
  COLAB_IMAGE_ACCEPT,
  validateColabImage,
} from "@/shared/utils/imageFile";

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
  const abortRef = useRef<AbortController | null>(null);
  const localUrlRef = useRef<string | null>(null);
  const [dragging, setDragging] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [localPreview, setLocalPreview] = useState<string | null>(null);

  useEffect(() => {
    return () => {
      abortRef.current?.abort();
      if (localUrlRef.current) URL.revokeObjectURL(localUrlRef.current);
    };
  }, []);

  const previewSrc = value?.url || localPreview;
  const errorId = `${id}-error`;
  const hintId = `${id}-hint`;
  const progressId = `${id}-progress`;

  const setLocalUrl = (url: string | null) => {
    if (localUrlRef.current) URL.revokeObjectURL(localUrlRef.current);
    localUrlRef.current = url;
    setLocalPreview(url);
  };

  const handleFiles = async (file: File | undefined) => {
    if (!file || disabled) return;

    const validationError = validateColabImage(file);
    if (validationError) {
      onErrorChange(validationError);
      return;
    }

    abortRef.current?.abort();
    const controller = new AbortController();
    abortRef.current = controller;

    onErrorChange(undefined);
    onChange(null);
    setLocalUrl(URL.createObjectURL(file));
    setUploading(true);
    onBusyChange?.(true);
    setProgress(0);

    try {
      const prepared = await prepareColab(file, setProgress, controller.signal);
      if (controller.signal.aborted) return;
      onChange(prepared);
      setProgress(100);
    } catch (caught) {
      if (controller.signal.aborted) return;
      const appError = caught as AppError;
      onErrorChange(appError.message ?? messages.create.imageTypeInvalid);
    } finally {
      if (!controller.signal.aborted) {
        setUploading(false);
        onBusyChange?.(false);
      }
    }
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
        role="button"
        tabIndex={disabled ? -1 : 0}
        aria-describedby={`${hintId} ${error ? errorId : ""} ${progressId}`.trim()}
        aria-busy={uploading}
        onClick={openPicker}
        onKeyDown={(event) => {
          if (event.key === "Enter" || event.key === " ") {
            event.preventDefault();
            openPicker();
          }
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
        className={`relative flex h-56 min-h-56 cursor-pointer flex-col overflow-hidden rounded border-2 border-dashed bg-white outline-none md:h-72 lg:h-80 ${
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
              className="h-full w-full object-cover"
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
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={openPicker}
            disabled={uploading || disabled}
            className="inline-flex min-h-11 cursor-pointer items-center rounded-xl border-[3px] border-foreground px-3 text-base font-bold text-foreground hover:bg-secondary disabled:cursor-not-allowed disabled:opacity-60"
          >
            {messages.create.imageChange}
          </button>
          <button
            type="button"
            onClick={() => {
              abortRef.current?.abort();
              setUploading(false);
              onBusyChange?.(false);
              setProgress(0);
              setLocalUrl(null);
              onChange(null);
              onErrorChange(undefined);
            }}
            disabled={disabled}
            className="inline-flex min-h-11 cursor-pointer items-center gap-1 rounded-xl border-[3px] border-foreground px-3 text-base font-bold text-foreground hover:bg-accent hover:text-on-accent disabled:cursor-not-allowed disabled:opacity-60"
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
