import { messages } from "@/shared/i18n/pt-BR";

export const COLAB_IMAGE_MAX_BYTES = 10 * 1024 * 1024;

const ACCEPTED_MIME = new Set([
  "image/jpeg",
  "image/jpg",
  "image/png",
  "image/webp",
  "image/heic",
  "image/heif",
  "image/gif",
  "image/bmp",
]);

const ACCEPTED_EXTENSIONS = [
  ".jpg",
  ".jpeg",
  ".png",
  ".webp",
  ".heic",
  ".heif",
  ".gif",
  ".bmp",
];

export const COLAB_IMAGE_ACCEPT = [
  ...ACCEPTED_MIME,
  ...ACCEPTED_EXTENSIONS,
].join(",");

export function validateColabImage(file: File | null | undefined): string | null {
  if (!file) return messages.create.imageRequired;
  if (file.size <= 0) return messages.create.imageEmpty;

  if (file.size > COLAB_IMAGE_MAX_BYTES) {
    return messages.create.imageTooLarge;
  }

  const name = file.name.toLowerCase();
  const extOk = ACCEPTED_EXTENSIONS.some((ext) => name.endsWith(ext));
  const mime = file.type.toLowerCase();
  const mimeOk = mime.length === 0 || ACCEPTED_MIME.has(mime);

  if (!extOk && !mimeOk) return messages.create.imageTypeInvalid;
  if (mime && !ACCEPTED_MIME.has(mime) && !extOk) {
    return messages.create.imageTypeInvalid;
  }

  return null;
}
