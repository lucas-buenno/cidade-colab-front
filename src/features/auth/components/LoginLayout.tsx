import type { ReactNode } from "react";
import loginFrameUrl from "@/assets/auth/login-frame.svg";
import loginShapesUrl from "@/assets/auth/login-shapes.svg";
import { messages } from "@/shared/i18n/pt-BR";

type Props = {
  children: ReactNode;
  variant?: "login" | "register";
};

export function LoginLayout({ children, variant = "login" }: Props) {
  const isRegister = variant === "register";

  return (
    <div className="screen-login relative min-h-dvh overflow-hidden bg-white">
      {isRegister ? (
        <div className="pointer-events-none absolute top-[-197px] left-[-869px] flex h-[1462px] w-[1521px] items-center justify-center">
          <img
            src={loginShapesUrl}
            alt=""
            width={1232}
            height={1307}
            className="h-[1307px] w-[1232px] max-w-none -rotate-[101.18deg] select-none"
            aria-hidden="true"
          />
        </div>
      ) : (
        <img
          src={loginShapesUrl}
          alt=""
          width={1232}
          height={1307}
          className="pointer-events-none absolute top-[-534px] left-[-475px] h-[1307px] w-[1232px] max-w-none select-none"
          aria-hidden="true"
        />
      )}
      {isRegister ? null : (
        <div className="pointer-events-none absolute bottom-0 left-1/2 flex h-[82px] w-[436px] -translate-x-1/2 items-center justify-center overflow-hidden">
          <img
            src={loginFrameUrl}
            alt=""
            width={82}
            height={436}
            className="h-[436px] w-[82px] max-w-none -rotate-90 select-none"
            aria-hidden="true"
          />
        </div>
      )}

      <main
        id="conteudo"
        className="relative mx-auto flex min-h-dvh w-full max-w-[402px] flex-col md:max-w-2xl lg:max-w-5xl xl:max-w-6xl"
      >
        <div
          className={`flex flex-1 flex-col px-4 pt-4 md:px-8 lg:px-12 ${
            isRegister ? "justify-start pb-10" : "justify-center pb-24"
          }`}
        >
          <div className="mx-auto w-full max-w-[402px] md:max-w-xl lg:max-w-2xl">
            <div className="py-4">
              {isRegister ? (
                <p className="text-[24px] leading-[1.031] font-medium tracking-[-1.2px] text-black">
                  {messages.feed.brand}
                </p>
              ) : (
                <p className="flex h-[41px] items-center justify-center border border-feed-hairline bg-white px-3 text-[18px] leading-[1.031] font-medium tracking-[-0.9px] text-black">
                  {messages.feed.brand}
                </p>
              )}
            </div>
            {children}
          </div>
        </div>
      </main>
    </div>
  );
}
