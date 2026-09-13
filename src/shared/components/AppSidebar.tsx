import { Link, useLocation } from "react-router-dom";
import { useSessionStore } from "@/features/auth/sessionStore";
import { AuthorMark } from "@/shared/components/AuthorMark";
import { messages } from "@/shared/i18n/pt-BR";
import {
  HomeNavIcon,
  MyColabsNavIcon,
} from "@/shared/navigation/AppNavIcons";
import { isAppChromeHidden } from "@/shared/navigation/appChrome";
import { sanitizeText } from "@/shared/utils/sanitize";
import { getSafeRedirectTo, withRedirectQuery } from "@/shared/utils/redirect";

function itemClass(active: boolean) {
  return `inline-flex min-h-11 w-full items-center gap-3 px-2.5 py-2.5 text-left text-black ${
    active ? "rounded-full bg-[#eee]" : "rounded-full hover:bg-[#f5f5f5]"
  }`;
}

export function AppSidebar() {
  const location = useLocation();
  const user = useSessionStore((state) => state.user);

  if (isAppChromeHidden(location.pathname)) {
    return null;
  }

  const displayName = user?.username ? sanitizeText(user.username) : "Usuário";
  const onHome = location.pathname === "/";
  const onMyColabs = location.pathname === "/minhas-colabs";
  const onProfile = location.pathname === "/perfil";

  return (
    <aside className="fixed inset-y-0 left-0 z-40 hidden w-[var(--app-sidebar-width)] flex-col border-r border-feed-hairline bg-white px-4 py-6 md:flex">
      <Link
        to="/"
        className="px-2.5 text-[24px] leading-[1.031] font-medium tracking-[-1.2px] text-black"
      >
        {messages.feed.brand}
      </Link>

      {user ? (
        <nav className="mt-8 flex flex-1 flex-col" aria-label={messages.feed.tabs.label}>
          <ul className="flex flex-col gap-1">
            <li>
              <Link
                to="/"
                aria-current={onHome ? "page" : undefined}
                className={itemClass(onHome)}
              >
                <HomeNavIcon active={onHome} />
                <span className="text-base font-medium tracking-[-0.8px]">
                  {messages.feed.tabs.home}
                </span>
              </Link>
            </li>
            <li>
              <Link
                to="/minhas-colabs"
                aria-current={onMyColabs ? "page" : undefined}
                className={itemClass(onMyColabs)}
              >
                <MyColabsNavIcon active={onMyColabs} />
                <span className="text-base font-medium tracking-[-0.8px]">
                  {messages.feed.tabs.myColabs}
                </span>
              </Link>
            </li>
            <li>
              <Link
                to="/perfil"
                aria-current={onProfile ? "page" : undefined}
                aria-label={messages.feed.tabs.profile}
                className={itemClass(onProfile)}
                data-testid="header-profile-link"
              >
                <AuthorMark name={displayName} size={24} />
                <span className="text-base font-medium tracking-[-0.8px]">
                  {messages.feed.tabs.profile}
                </span>
              </Link>
            </li>
          </ul>
        </nav>
      ) : (
        <div className="mt-8">
          <Link
            to={withRedirectQuery(
              "/login",
              getSafeRedirectTo(location.pathname + location.search) ?? "/",
            )}
            className="inline-flex min-h-11 items-center px-2.5 text-base font-semibold tracking-[-0.8px] text-black underline decoration-solid underline-offset-2"
          >
            {messages.login.title}
          </Link>
        </div>
      )}
    </aside>
  );
}
