import { Link, useLocation } from "react-router-dom";
import { useSessionStore } from "@/features/auth/sessionStore";
import { Avatar } from "@/shared/components/Avatar";
import { ThemeToggle } from "@/shared/theme/ThemeToggle";
import { messages } from "@/shared/i18n/pt-BR";
import { sanitizeText } from "@/shared/utils/sanitize";
import { getSafeRedirectTo, withRedirectQuery } from "@/shared/utils/redirect";

export function AppHeader() {
  const location = useLocation();
  const user = useSessionStore((state) => state.user);
  const displayName = user?.username ? sanitizeText(user.username) : null;
  const onAuthPage =
    location.pathname === "/login" || location.pathname === "/cadastro";

  return (
    <header className="sticky top-0 z-40 border-b border-border bg-surface/95 backdrop-blur">
      <div className="mx-auto flex h-14 max-w-2xl items-center justify-between gap-3 px-4 sm:px-6">
        <Link
          to="/"
          className="truncate text-sm font-bold tracking-wide text-foreground uppercase"
        >
          {messages.appName}
        </Link>
        <div className="flex items-center gap-1">
          <ThemeToggle />
          {displayName ? (
            <Link
              to="/perfil"
              aria-label={messages.profile.open}
              className="inline-flex size-11 cursor-pointer items-center justify-center rounded-lg transition-colors duration-200 hover:bg-muted"
              data-testid="header-profile-link"
            >
              <Avatar name={displayName} size={32} />
            </Link>
          ) : onAuthPage ? null : (
            <Link
              to={withRedirectQuery(
                "/login",
                getSafeRedirectTo(location.pathname + location.search) ?? "/",
              )}
              className="inline-flex min-h-11 items-center px-2 text-sm font-bold text-accent underline-offset-2 hover:underline"
            >
              {messages.login.title}
            </Link>
          )}
        </div>
      </div>
    </header>
  );
}
