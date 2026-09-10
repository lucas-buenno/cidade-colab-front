import { ArrowLeft } from "@phosphor-icons/react";
import { Link } from "react-router-dom";
import { CreateColabForm } from "@/features/colab/components/CreateColabForm";
import { messages } from "@/shared/i18n/pt-BR";

export function CreateColabPage() {
  return (
    <div className="min-h-dvh bg-background">
      <main
        id="conteudo"
        className="mx-auto w-full max-w-2xl px-4 pb-4 pt-6 sm:px-6"
      >
        <Link
          to="/"
          className="inline-flex min-h-11 items-center gap-2 text-sm font-bold text-accent underline-offset-2 hover:underline"
        >
          <ArrowLeft className="size-4" aria-hidden="true" />
          {messages.create.backToFeed}
        </Link>
        <h1 className="mt-4 text-3xl font-bold text-foreground text-balance">
          {messages.create.title}
        </h1>
        <p className="mt-2 text-muted-foreground">{messages.create.subtitle}</p>
        <div className="mt-6">
          <CreateColabForm />
        </div>
      </main>
    </div>
  );
}
