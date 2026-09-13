import { useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { useSessionStore } from "@/features/auth/sessionStore";
import { invalidateColabQueries } from "@/features/feed/hooks/useSupportColab";
import { AuthorMark } from "@/shared/components/AuthorMark";
import { Button } from "@/shared/components/Button";
import { messages } from "@/shared/i18n/pt-BR";
import { sanitizeText } from "@/shared/utils/sanitize";

export function ProfilePage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const user = useSessionStore((state) => state.user);
  const clear = useSessionStore((state) => state.clear);
  const displayName = user?.username ? sanitizeText(user.username) : "Usuário";
  const displayEmail = user?.email ? sanitizeText(user.email) : null;

  return (
    <div className="screen-feed min-h-dvh bg-white">
      <main id="conteudo" className="mx-auto max-w-[402px] pb-28 md:max-w-2xl md:pb-12 lg:max-w-3xl xl:max-w-4xl">
        <div className="p-4 md:hidden">
          <p className="text-[24px] leading-[1.031] font-medium tracking-[-1.2px] text-black">
            {messages.feed.brand}
          </p>
        </div>

        <section
          className="flex flex-col gap-6 p-4 md:px-8 md:pt-8 lg:px-12"
          aria-label={messages.feed.tabs.profile}
        >
          <div className="flex flex-col gap-1">
            <h1 className="text-[32px] leading-[1.031] font-extrabold tracking-[-1.6px] text-black">
              {messages.feed.tabs.profile}
            </h1>
            <p className="text-[16px] leading-[1.031] tracking-[-0.8px] text-[#656565]">
              {messages.profile.subtitle}
            </p>
          </div>

          <div className="flex w-full flex-col gap-4 border border-feed-hairline px-3 pt-3 pb-6">
            <div className="flex w-full flex-col items-center justify-center gap-[9px]">
              <AuthorMark name={displayName} size={84} />
              <p
                className="text-[24px] leading-[1.031] tracking-[-1.2px] text-black"
                data-testid="session-username"
              >
                {displayName}
              </p>
              {displayEmail ? (
                <p className="text-[16px] leading-[1.031] tracking-[-0.8px] text-field-placeholder">
                  {displayEmail}
                </p>
              ) : null}
            </div>

            <Button
              type="button"
              className="min-h-0 !rounded-lg py-3 text-[16px] leading-normal"
              onClick={() => {
                navigate("/", { replace: true });
                clear();
                invalidateColabQueries(queryClient);
              }}
            >
              {messages.profile.logout}
            </Button>
          </div>
        </section>
      </main>
    </div>
  );
}
