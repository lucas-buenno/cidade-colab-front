import type { SessionUser } from "@/shared/types/auth";

type JwtPayload = {
  exp?: number;
  preferred_username?: string;
  username?: string;
  email?: string;
  sub?: string;
  realm_access?: { roles?: string[] };
  resource_access?: Record<string, { roles?: string[] }>;
  authorities?: string[];
  roles?: string[];
};

function base64UrlDecode(segment: string): string {
  const padded = segment.replace(/-/g, "+").replace(/_/g, "/");
  const pad = padded.length % 4 === 0 ? "" : "=".repeat(4 - (padded.length % 4));
  return atob(padded + pad);
}

/** Decodifica o payload do JWT sem validar assinatura (isso é do backend). */
export function decodeAccessToken(token: string): SessionUser | null {
  const parts = token.split(".");
  if (parts.length < 2) return null;

  try {
    const json = base64UrlDecode(parts[1]);
    const payload = JSON.parse(json) as JwtPayload;
    const realmRoles = payload.realm_access?.roles ?? [];
    const extraRoles = payload.roles ?? [];
    const resourceRoles = Object.values(payload.resource_access ?? {}).flatMap(
      (client) => client.roles ?? [],
    );
    const authorities = payload.authorities ?? [];

    return {
      username: payload.preferred_username ?? payload.username,
      email: payload.email,
      roles: [...realmRoles, ...extraRoles, ...resourceRoles],
      authorities,
      exp: payload.exp,
    };
  } catch {
    return null;
  }
}

export function isTokenFresh(token: string): boolean {
  const decoded = decodeAccessToken(token);
  if (!decoded) return false;
  if (!decoded.exp) return true;
  const nowSeconds = Math.floor(Date.now() / 1000);
  return decoded.exp > nowSeconds + 15;
}
