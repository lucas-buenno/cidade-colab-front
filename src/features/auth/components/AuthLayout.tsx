import type { ReactNode } from "react";
import { messages } from "@/shared/i18n/pt-BR";
import { IllustrationAuth } from "@/shared/illustrations/CivicScenes";

type Props = {
  title: string;
  subtitle: string;
  children: ReactNode;
};

export function AuthLayout({ title, subtitle, children }: Props) {
  return (
    <div className="screen-auth min-h-dvh">
      <main
        id="conteudo"
        className="mx-auto flex min-h-dvh w-full max-w-md flex-col justify-center px-4 py-8 sm:max-w-lg sm:px-6 lg:max-w-6xl lg:flex-row lg:items-center lg:justify-between lg:gap-16 lg:px-12 xl:gap-24"
      >
        <header className="mb-6 flex flex-col items-start gap-3 lg:mb-0 lg:max-w-xl lg:flex-1">
          <IllustrationAuth
            className="h-36 w-full text-foreground lg:h-56"
            title={messages.login.heroArt}
          />
          <p className="font-mono text-xs font-bold tracking-widest text-foreground uppercase">
            {messages.appName}
          </p>
          <h1 className="max-w-[12ch] text-5xl leading-[0.9] font-black tracking-tight text-foreground lg:max-w-none lg:text-6xl xl:text-7xl">
            {title}
          </h1>
          <p className="max-w-prose text-lg text-foreground/90">{subtitle}</p>
        </header>
        <div className="rounded-2xl border-[3px] border-foreground bg-card p-5 shadow-card lg:w-full lg:max-w-xl lg:flex-1 lg:p-8">
          {children}
        </div>
      </main>
    </div>
  );
}
