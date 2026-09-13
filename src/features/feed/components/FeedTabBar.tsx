import { Link, useLocation } from "react-router-dom";
import { useSessionStore } from "@/features/auth/sessionStore";
import { AuthorMark } from "@/shared/components/AuthorMark";
import { messages } from "@/shared/i18n/pt-BR";
import { HomeNavIcon, MyColabsNavIcon } from "@/shared/navigation/AppNavIcons";
import { sanitizeText } from "@/shared/utils/sanitize";

function tabClass(active: boolean) {
  return `inline-flex items-center justify-center p-2.5 text-black ${
    active ? "rounded-full bg-[#eee]" : ""
  }`;
}

export function FeedTabBar() {
  const user = useSessionStore((state) => state.user);
  const location = useLocation();
  const hiddenOn = [
    "/login",
    "/cadastro",
    "/esqueci-senha",
    "/redefinir-senha",
    "/bem-vindo",
    "/colab/novo",
  ];

  if (!user || hiddenOn.includes(location.pathname)) {
    return null;
  }

  const displayName = user.username ? sanitizeText(user.username) : "Usuário";
  const onHome = location.pathname === "/";
  const onMyColabs = location.pathname === "/minhas-colabs";
  const onProfile = location.pathname === "/perfil";

  return (
    <nav
      aria-label={messages.feed.tabs.label}
      className="fixed inset-x-0 bottom-0 z-30 border-t-2 border-black bg-white pt-[21px] pb-[max(21px,env(safe-area-inset-bottom))] md:hidden"
    >
      <div className="mx-auto flex max-w-[402px] items-center justify-between pr-[25px] pl-[26px]">
        <Link
          to="/"
          aria-current={onHome ? "page" : undefined}
          aria-label={messages.feed.tabs.home}
          className={tabClass(onHome)}
        >
          <HomeNavIcon active={onHome} />
        </Link>
        <Link
          to="/minhas-colabs"
          aria-current={onMyColabs ? "page" : undefined}
          aria-label={messages.feed.tabs.myColabs}
          className={tabClass(onMyColabs)}
        >
          <MyColabsNavIcon active={onMyColabs} />
        </Link>
        <Link
          to="/perfil"
          aria-current={onProfile ? "page" : undefined}
          aria-label={messages.feed.tabs.profile}
          className={tabClass(onProfile)}
        >
          <AuthorMark name={displayName} size={24} />
        </Link>
      </div>
    </nav>
  );
}
