import { Link } from "react-router-dom";
import { Plus } from "@phosphor-icons/react";
import { FeedList } from "@/features/feed/components/FeedList";
import { useSessionStore } from "@/features/auth/sessionStore";
import { messages } from "@/shared/i18n/pt-BR";

export function FeedPage() {
  const user = useSessionStore((state) => state.user);
  const isSignedIn = Boolean(user);

  return (
    <div className="min-h-dvh bg-background">
      <main id="conteudo" className="mx-auto max-w-lg px-4 py-10 pb-28">
        <h1 className="text-3xl font-bold text-foreground">
          {messages.feed.title}
        </h1>
        <p className="mt-3 text-muted-foreground">
          {isSignedIn
            ? messages.feed.signedInHint
            : messages.feed.guestHint}
        </p>

        <section className="mt-8" aria-label={messages.feed.title}>
          <FeedList />
        </section>
      </main>

      {isSignedIn ? (
        <Link
          to="/colab/novo"
          aria-label={messages.feed.createCta}
          className="fixed right-4 z-30 inline-flex size-14 cursor-pointer items-center justify-center rounded-full bg-accent text-on-accent shadow-lg transition-opacity duration-200 hover:opacity-90 bottom-[max(1.25rem,env(safe-area-inset-bottom))]"
        >
          <Plus className="size-7" weight="bold" aria-hidden="true" />
        </Link>
      ) : null}
    </div>
  );
}
