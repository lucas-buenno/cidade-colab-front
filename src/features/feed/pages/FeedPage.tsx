import { useState } from "react";
import { Link } from "react-router-dom";
import { FeedList } from "@/features/feed/components/FeedList";
import { useSessionStore } from "@/features/auth/sessionStore";
import {
  ColabSearchBar,
  type ColabSearchValue,
} from "@/features/search/components/ColabSearchBar";
import { messages } from "@/shared/i18n/pt-BR";
import plusMathUrl from "@/assets/icons/plus-math.png";
import { getSafeRedirectTo, withRedirectQuery } from "@/shared/utils/redirect";

const EMPTY_SEARCH: ColabSearchValue = {
  q: "",
  nearMe: false,
  lat: null,
  lng: null,
  categories: [],
};

export function FeedPage() {
  const user = useSessionStore((state) => state.user);
  const isSignedIn = Boolean(user);
  const [search, setSearch] = useState<ColabSearchValue>(EMPTY_SEARCH);

  return (
    <div className="screen-feed min-h-dvh bg-white">
      <main
        id="conteudo"
        className={`mx-auto max-w-[402px] md:max-w-2xl lg:max-w-3xl xl:max-w-4xl ${
          isSignedIn ? "pb-28 md:pb-12" : "pb-8"
        }`}
      >
        <div className="flex items-center justify-between gap-3 p-4 md:hidden">
          <p className="text-[24px] leading-[1.031] font-medium tracking-[-1.2px] text-black">
            {messages.feed.brand}
          </p>
          {isSignedIn ? null : (
            <Link
              to={withRedirectQuery("/login", getSafeRedirectTo("/") ?? "/")}
              className="text-base font-semibold tracking-[-0.8px] text-black underline decoration-solid underline-offset-2"
            >
              {messages.login.title}
            </Link>
          )}
        </div>

        <section className="flex flex-col gap-4 px-4 md:px-8 md:pt-8 lg:px-12" aria-label={messages.feed.title}>
          <ColabSearchBar value={search} onChange={setSearch} />
          <FeedList search={search} />
        </section>
      </main>

      {isSignedIn ? (
        <Link
          to="/colab/novo"
          aria-label={messages.feed.createCta}
          className="motion-press fixed right-4 z-40 inline-flex items-end justify-end rounded-[12px] border-[3px] border-feed-ink bg-feed-fab p-4 shadow-[3px_4px_0_0_#0d0d0d] hover:translate-x-px hover:translate-y-px hover:shadow-none bottom-[calc(5.5rem+env(safe-area-inset-bottom))] md:bottom-8"
        >
          <img
            src={plusMathUrl}
            alt=""
            width={24}
            height={24}
            className="block size-6 object-contain"
            aria-hidden="true"
          />
        </Link>
      ) : null}
    </div>
  );
}
