import { Link } from "react-router-dom";
import { useFeed } from "@/features/feed/hooks/useFeed";
import { useSessionStore } from "@/features/auth/sessionStore";
import { MyColabCard } from "@/features/profile/components/MyColabCard";
import { MyColabCardSkeleton } from "@/features/profile/components/MyColabCardSkeleton";
import { messages } from "@/shared/i18n/pt-BR";
import { IllustrationGarden } from "@/shared/illustrations/CivicScenes";

export function MyColabsPage() {
  const user = useSessionStore((state) => state.user);
  const feed = useFeed();
  const mine =
    feed.data?.pages
      .flatMap((page) => page.items)
      .filter((colab) => colab.username === user?.username) ?? [];

  return (
    <div className="screen-feed min-h-dvh bg-white">
      <main id="conteudo" className="mx-auto max-w-[402px] pb-28 md:max-w-2xl md:pb-12 lg:max-w-3xl xl:max-w-4xl">
        <div className="p-4 md:hidden">
          <p className="text-[24px] leading-[1.031] font-medium tracking-[-1.2px] text-black">
            {messages.feed.brand}
          </p>
        </div>

        <section
          className="flex flex-col px-4 md:px-8 md:pt-8 lg:px-12"
          aria-label={messages.profile.myColabs}
        >
          <div className="flex flex-col gap-1 pb-4">
            <h1 className="text-[32px] leading-[1.031] font-extrabold tracking-[-1.6px] text-black">
              {messages.profile.myColabs}
            </h1>
            <p className="text-[16px] leading-[1.031] font-normal tracking-[-0.8px] text-[#656565]">
              {messages.profile.myColabsSubtitle}
            </p>
          </div>

          {feed.isLoading ? (
            <MyColabCardSkeleton />
          ) : mine.length === 0 ? (
            <div className="border border-feed-hairline bg-white p-6 text-center">
              <IllustrationGarden
                className="mx-auto h-36 w-full text-foreground"
                title={messages.profile.emptyColabs}
              />
              <p className="mt-2 font-bold text-black">{messages.profile.emptyColabs}</p>
              <Link
                to="/colab/novo"
                className="mt-3 inline-block text-base font-semibold text-black underline decoration-solid underline-offset-2"
              >
                {messages.feed.createCta}
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
              {mine.map((colab) => (
                <MyColabCard key={colab.id} colab={colab} />
              ))}
            </div>
          )}
        </section>
      </main>
    </div>
  );
}
