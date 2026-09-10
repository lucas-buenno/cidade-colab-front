import { MapPin } from "@phosphor-icons/react";
import type { ReactNode } from "react";
import { messages } from "@/shared/i18n/pt-BR";

type Props = {
  title: string;
  subtitle: string;
  children: ReactNode;
};

export function AuthLayout({ title, subtitle, children }: Props) {
  return (
    <div className="min-h-dvh bg-background">
      <main
        id="conteudo"
        className="mx-auto flex min-h-dvh w-full max-w-md flex-col justify-center px-4 py-8 sm:max-w-lg sm:px-6 lg:max-w-xl"
      >
        <header className="mb-8 flex flex-col items-start gap-3">
          <div className="flex size-12 items-center justify-center rounded-xl bg-primary text-on-primary">
            <MapPin className="size-7" weight="fill" aria-hidden="true" />
          </div>
          <p className="text-sm font-bold tracking-wide text-accent uppercase">
            {messages.appName}
          </p>
          <h1 className="text-3xl font-bold text-foreground">{title}</h1>
          <p className="text-base text-muted-foreground">{subtitle}</p>
        </header>
        {children}
      </main>
    </div>
  );
}
