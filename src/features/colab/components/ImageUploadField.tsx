import {
  CircleNotch,
  Image as ImageIcon,
  Trash,
  UploadSimple,
} from "@phosphor-icons/react";
import { useEffect, useRef, useState } from "react";
import { prepareColab } from "@/features/colab/api";
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
    <div className="flex flex-col gap-1.5">
      <label htmlFor={id} className="text-sm font-bold text-foreground">
        {messages.create.imageLabel}
        <span className="text-destructive"> *</span>
      </label>
      <p id={hintId} className="text-sm text-muted-foreground">
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
        className={`relative flex min-h-52 cursor-pointer flex-col overflow-hidden rounded-xl border-2 border-dashed bg-card outline-none transition-colors duration-200 ${
          error
            ? "border-destructive"
            : dragging
              ? "border-accent bg-accent/5"
              : "border-border hover:border-accent"
        }`}
      >
        {previewSrc ? (
          <>
            <img
              src={previewSrc}
              alt=""
              className="aspect-video h-full w-full object-cover"
            />
            {uploading ? (
              <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 bg-overlay text-on-primary">
                <CircleNotch className="size-8 animate-spin" aria-hidden="true" />
                <span className="text-sm font-bold">
                  {messages.create.imageUploading} {progress}%
                </span>
              </div>
            ) : null}
          </>
        ) : (
          <div className="flex flex-1 flex-col items-center justify-center gap-2 px-4 py-8 text-center">
            <span className="flex size-12 items-center justify-center rounded-full bg-muted text-foreground">
              <UploadSimple className="size-6" aria-hidden="true" />
            </span>
            <p className="text-sm font-bold text-foreground">
              {messages.create.imageDrop}
            </p>
            <ImageIcon className="size-5 text-muted-foreground" aria-hidden="true" />
          </div>
        )}
      </div>

      <div
        id={progressId}
        className="h-2 overflow-hidden rounded-full bg-muted"
        role="progressbar"
        aria-label={messages.create.imageProgress}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={uploading ? progress : value ? 100 : 0}
      >
        <div
          className="h-full rounded-full bg-accent transition-[width] duration-200"
          style={{
            width: `${uploading ? progress : value ? 100 : 0}%`,
            opacity: uploading || value ? 1 : 0,
          }}
        />
      </div>

      {value && !uploading ? (
        <p className="text-sm font-bold text-success" role="status">
          {messages.create.imageUploaded}
        </p>
      ) : (
        <p className="min-h-5 text-sm text-muted-foreground">
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
            className="inline-flex min-h-11 cursor-pointer items-center rounded-lg px-3 text-sm font-bold text-accent transition-opacity duration-200 hover:underline disabled:cursor-not-allowed disabled:opacity-60"
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
            className="inline-flex min-h-11 cursor-pointer items-center gap-1 rounded-lg px-3 text-sm font-bold text-destructive transition-opacity duration-200 hover:underline disabled:cursor-not-allowed disabled:opacity-60"
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
        className="min-h-5 text-sm text-destructive"
      >
        {error ?? ""}
      </p>
    </div>
  );
}
