import type { SessionUser } from "@/shared/types/auth";

const CREATE_PERMISSIONS = ["PERM_colabs:create", "colabs:create"];
const CREATE_ROLES = ["ROLE_COLLABORATOR", "COLLABORATOR"];

function pool(user: SessionUser | null): string[] {
  if (!user) return [];
  return [...user.authorities, ...user.roles];
}

export function hasColabCreatePermission(user: SessionUser | null): boolean {
  const tokens = pool(user);
  const hasPerm = tokens.some((token) => CREATE_PERMISSIONS.includes(token));
  const hasRole = tokens.some((token) => CREATE_ROLES.includes(token));
  return hasPerm || hasRole;
}
