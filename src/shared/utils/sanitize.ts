/** Remove tags e caracteres de controle antes de reexibir input na UI. */
export function sanitizeText(value: string): string {
  return value
    .replace(/<[^>]*>/g, "")
    .replace(/[\u0000-\u001F\u007F]/g, "")
    .trim();
}

export function normalizeUsername(value: string): string {
  return sanitizeText(value);
}

export function normalizeEmail(value: string): string {
  return sanitizeText(value).toLowerCase();
}
