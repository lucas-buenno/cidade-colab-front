import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useSessionStore } from "@/features/auth/sessionStore";
import { getSafeRedirectTo } from "@/shared/utils/redirect";
import { isTokenFresh } from "@/shared/utils/jwt";

export function GuestOnly() {
  const accessToken = useSessionStore((state) => state.accessToken);
  const location = useLocation();
  const hasValidSession = Boolean(accessToken && isTokenFresh(accessToken));

  if (hasValidSession) {
    const redirectTo = getSafeRedirectTo(
      new URLSearchParams(location.search).get("redirectTo"),
    );
    return <Navigate to={redirectTo || "/"} replace />;
  }

  return <Outlet />;
}

export function RequireAuth() {
  const accessToken = useSessionStore((state) => state.accessToken);
  const location = useLocation();
  const hasValidSession = Boolean(accessToken && isTokenFresh(accessToken));

  if (!hasValidSession) {
    const redirectTo = encodeURIComponent(location.pathname + location.search);
    return <Navigate to={`/login?redirectTo=${redirectTo}`} replace />;
  }

  return <Outlet />;
}
