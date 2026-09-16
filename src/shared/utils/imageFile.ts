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

const CROP_MAX_EDGE = 1920;
const CROP_JPEG_QUALITY = 0.9;

export async function cropCoverFile(
  file: File,
  containerWidth: number,
  containerHeight: number,
  objectPositionX: number,
  objectPositionY: number,
): Promise<File> {
  const bitmap = await createImageBitmap(file);
  const scale = Math.max(
    containerWidth / bitmap.width,
    containerHeight / bitmap.height,
  );
  const overflowX = Math.max(0, bitmap.width * scale - containerWidth);
  const overflowY = Math.max(0, bitmap.height * scale - containerHeight);
  const sx = overflowX === 0 ? 0 : overflowX * (objectPositionX / 100) / scale;
  const sy = overflowY === 0 ? 0 : overflowY * (objectPositionY / 100) / scale;
  const sw = containerWidth / scale;
  const sh = containerHeight / scale;

  let outW = Math.max(1, Math.round(sw));
  let outH = Math.max(1, Math.round(sh));
  const longEdge = Math.max(outW, outH);
  if (longEdge > CROP_MAX_EDGE) {
    const shrink = CROP_MAX_EDGE / longEdge;
    outW = Math.max(1, Math.round(outW * shrink));
    outH = Math.max(1, Math.round(outH * shrink));
  }

  const canvas = document.createElement("canvas");
  canvas.width = outW;
  canvas.height = outH;
  const ctx = canvas.getContext("2d");
  if (!ctx) {
    bitmap.close();
    throw new Error("canvas");
  }
  ctx.drawImage(bitmap, sx, sy, sw, sh, 0, 0, outW, outH);
  bitmap.close();

  const blob = await new Promise<Blob>((resolve, reject) => {
    canvas.toBlob(
      (next) => (next ? resolve(next) : reject(new Error("blob"))),
      "image/jpeg",
      CROP_JPEG_QUALITY,
    );
  });

  const baseName = file.name.replace(/\.[^.]+$/, "") || "colab-foto";
  return new File([blob], `${baseName}.jpg`, { type: "image/jpeg" });
}
