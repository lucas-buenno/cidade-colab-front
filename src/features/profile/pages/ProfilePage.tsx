import { ArrowLeft } from "@phosphor-icons/react";
import { Link, useNavigate } from "react-router-dom";
import { useSessionStore } from "@/features/auth/sessionStore";
import { Avatar } from "@/shared/components/Avatar";
import { Button } from "@/shared/components/Button";
import { messages } from "@/shared/i18n/pt-BR";
import { sanitizeText } from "@/shared/utils/sanitize";

export function ProfilePage() {
  const navigate = useNavigate();
  const user = useSessionStore((state) => state.user);
  const clear = useSessionStore((state) => state.clear);
  const displayName = user?.username ? sanitizeText(user.username) : "Usuário";

  return (
    <div className="min-h-dvh bg-background">
      <main id="conteudo" className="mx-auto w-full max-w-lg px-4 py-8 sm:px-6">
        <Link
          to="/"
          className="inline-flex min-h-11 items-center gap-2 text-sm font-bold text-accent underline-offset-2 hover:underline"
        >
          <ArrowLeft className="size-4" aria-hidden="true" />
          {messages.profile.backToFeed}
        </Link>

        <section className="mt-6 rounded-xl border border-border bg-surface p-6 shadow-card">
          <div className="flex items-center gap-4">
            <Avatar name={displayName} size={64} />
            <div className="min-w-0">
              <h1 className="text-2xl font-bold text-foreground">{displayName}</h1>
              <p
                className="mt-1 text-sm text-muted-foreground"
                data-testid="session-username"
              >
                {messages.profile.subtitle}
              </p>
            </div>
          </div>

          <Button
            type="button"
            variant="secondary"
            className="mt-8"
            onClick={() => {
              clear();
              navigate("/", { replace: true });
            }}
          >
            {messages.profile.logout}
          </Button>
        </section>
      </main>
    </div>
  );
}
