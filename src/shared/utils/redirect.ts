const SAFE_REDIRECT = /^\/(?!\/)/;

export function getSafeRedirectTo(value: string | null): string | null {
  if (!value) return null;
  let decoded = value;
  try {
    decoded = decodeURIComponent(value);
  } catch {
    return null;
  }
  if (!SAFE_REDIRECT.test(decoded)) return null;
  if (decoded.startsWith("/login") || decoded.startsWith("/cadastro")) return null;
  if (decoded === "/colab/novo" || decoded.startsWith("/colab/novo?")) return null;
  return decoded;
}

export function withRedirectQuery(path: string, redirectTo: string | null): string {
  if (!redirectTo || redirectTo === "/") return path;
  return `${path}?redirectTo=${encodeURIComponent(redirectTo)}`;
}
