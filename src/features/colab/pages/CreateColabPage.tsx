import { useState } from "react";
import { Link } from "react-router-dom";
import loginShapesUrl from "@/assets/auth/login-shapes.svg";
import arrowLeftAltUrl from "@/assets/icons/arrow-left-alt.svg";
import { CreateColabForm } from "@/features/colab/components/CreateColabForm";
import { useSessionStore } from "@/features/auth/sessionStore";
import { messages } from "@/shared/i18n/pt-BR";
import { sanitizeText } from "@/shared/utils/sanitize";

export function CreateColabPage() {
  const username = useSessionStore((state) => state.user?.username);
  const displayName = username ? sanitizeText(username) : null;
  const subtitle = displayName
    ? messages.create.subtitleNamed.replace("{username}", displayName)
    : messages.create.subtitle;
  const [published, setPublished] = useState(false);

  return (
    <div className="screen-create relative min-h-dvh overflow-hidden bg-white">
      <img
        src={loginShapesUrl}
        alt=""
        width={1232}
        height={1307}
        className="pointer-events-none absolute top-[-560px] left-[-671px] h-[1307px] w-[1232px] max-w-none -rotate-[21.44deg] select-none"
        aria-hidden="true"
      />
      <main
        id="conteudo"
        className="relative mx-auto w-full max-w-[402px] pb-[9.5rem] md:max-w-3xl md:pb-12 lg:max-w-4xl xl:max-w-5xl"
      >
        <div className="p-4 md:px-8 lg:px-12">
          <Link
            to="/"
            aria-label={messages.create.backToFeed}
            className="inline-flex size-11 items-center justify-center text-black"
          >
            <img
              src={arrowLeftAltUrl}
              alt=""
              width={24}
              height={24}
              className="block size-6"
              aria-hidden="true"
            />
          </Link>
        </div>
        {published ? null : (
          <div className="flex flex-col gap-[7px] px-4 md:px-8 lg:px-12">
            <h1 className="text-[32px] leading-[1.031] font-extrabold tracking-[-1.6px] text-black lg:text-[40px]">
              {messages.create.title}
            </h1>
            <p className="text-base leading-[1.031] tracking-[-0.8px] text-black">
              {subtitle}
            </p>
          </div>
        )}
        <div className="px-4 md:px-8 lg:px-12">
          <CreateColabForm onPublished={() => setPublished(true)} />
        </div>
      </main>
    </div>
  );
}
