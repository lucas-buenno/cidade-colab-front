import { useState } from "react";
import { useNavigate } from "react-router-dom";
import loginShapesUrl from "@/assets/auth/login-shapes.svg";
import arrowRightAltUrl from "@/assets/icons/arrow-right-alt.svg";
import { Button } from "@/shared/components/Button";
import { messages } from "@/shared/i18n/pt-BR";
import {
  IllustrationNeighbors,
  IllustrationStreetlight,
  IllustrationWelcome,
} from "@/shared/illustrations/CivicScenes";
import { markOnboardingSeen } from "@/features/onboarding/onboardingStorage";

const slides = [
  {
    title: messages.onboarding.slides[0].title,
    body: messages.onboarding.slides[0].body,
    Art: IllustrationWelcome,
    tone: "bg-feed-yellow",
  },
  {
    title: messages.onboarding.slides[1].title,
    body: messages.onboarding.slides[1].body,
    Art: IllustrationStreetlight,
    tone: "bg-feed-tag",
  },
  {
    title: messages.onboarding.slides[2].title,
    body: messages.onboarding.slides[2].body,
    Art: IllustrationNeighbors,
    tone: "bg-feed-fab",
  },
] as const;

function stepCopy(current: number, total: number) {
  return messages.onboarding.step
    .replace("{current}", String(current))
    .replace("{total}", String(total));
}

export function OnboardingPage() {
  const navigate = useNavigate();
  const [index, setIndex] = useState(0);
  const slide = slides[index];
  const last = index === slides.length - 1;
  const Art = slide.Art;

  const finish = () => {
    markOnboardingSeen();
    navigate("/", { replace: true });
  };

  return (
    <div className="screen-welcome relative min-h-dvh overflow-hidden bg-white">
      <img
        src={loginShapesUrl}
        alt=""
        width={1232}
        height={1307}
        className="pointer-events-none absolute top-[-480px] left-[-520px] h-[1307px] w-[1232px] max-w-none select-none"
        aria-hidden="true"
      />

      <main
        id="conteudo"
        className="relative mx-auto flex min-h-dvh w-full max-w-[402px] flex-col md:max-w-2xl lg:max-w-4xl xl:max-w-5xl"
      >
        <div className="flex items-center justify-between gap-3 p-4 md:px-8 lg:px-12">
          <p className="flex h-[41px] items-center justify-center border border-feed-hairline bg-white px-3 text-[18px] leading-[1.031] font-medium tracking-[-0.9px] text-black">
            {messages.feed.brand}
          </p>
          <button
            type="button"
            onClick={finish}
            data-testid="onboarding-skip"
            className="inline-flex min-h-11 cursor-pointer items-center text-base font-semibold tracking-[-0.8px] text-black underline decoration-solid underline-offset-2"
          >
            {messages.onboarding.skip}
          </button>
        </div>

        <div className="flex flex-1 flex-col justify-center px-4 md:px-8 lg:flex-row lg:items-center lg:gap-12 lg:px-12 xl:gap-16">
          <div
            className={`flex h-[220px] items-center justify-center overflow-hidden rounded-[12px] border-[3px] border-feed-ink shadow-[3px_4px_0_0_#0d0d0d] md:h-[320px] lg:h-[360px] lg:w-1/2 ${slide.tone}`}
          >
            <Art className="h-full w-full text-feed-ink" title={slide.title} />
          </div>
          <div className="lg:flex lg:w-1/2 lg:flex-col">
            <p
              className="mt-6 font-mono text-xs font-bold tracking-wider text-black uppercase"
              aria-live="polite"
            >
              {stepCopy(index + 1, slides.length)}
            </p>
            <h1 className="mt-2 max-w-[334px] text-[40px] leading-[1.031] font-extrabold tracking-[-2px] text-black lg:max-w-none lg:text-5xl">
              {slide.title}
            </h1>
            <p className="mt-3 text-base tracking-[-0.8px] text-field-ink lg:text-lg">
              {slide.body}
            </p>
          </div>
        </div>

        <div className="flex flex-col gap-4 px-4 pt-6 pb-[max(1.5rem,env(safe-area-inset-bottom))] md:px-8 lg:px-12">
          <div className="flex gap-1" role="group" aria-label={messages.onboarding.steps}>
            {slides.map((_, i) => (
              <button
                key={i}
                type="button"
                aria-label={stepCopy(i + 1, slides.length)}
                aria-current={i === index ? "step" : undefined}
                onClick={() => setIndex(i)}
                className="inline-flex min-h-11 min-w-11 cursor-pointer items-center justify-center"
              >
                <span
                  className={`block h-3 w-8 border-[3px] border-feed-ink ${
                    i === index ? "bg-feed-fab" : "bg-white"
                  }`}
                  aria-hidden="true"
                />
              </button>
            ))}
          </div>

          <Button
            type="button"
            data-testid="onboarding-next"
            onClick={() => {
              if (last) {
                finish();
                return;
              }
              setIndex((current) => current + 1);
            }}
            icon={
              <img
                src={arrowRightAltUrl}
                alt=""
                width={32}
                height={32}
                className="block size-8 shrink-0"
                aria-hidden="true"
              />
            }
          >
            {last ? messages.onboarding.start : messages.onboarding.next}
          </Button>

          {index > 0 ? (
            <button
              type="button"
              onClick={() => setIndex((current) => current - 1)}
              data-testid="onboarding-back"
              className="inline-flex min-h-11 cursor-pointer items-center justify-center text-base font-semibold tracking-[-0.8px] text-black underline decoration-solid underline-offset-2"
            >
              {messages.onboarding.back}
            </button>
          ) : (
            <span className="min-h-11" aria-hidden="true" />
          )}
        </div>
      </main>
    </div>
  );
}
