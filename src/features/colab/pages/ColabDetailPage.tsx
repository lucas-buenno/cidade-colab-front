import { useState } from "react";
import { Link, useParams } from "react-router-dom";
import arrowLeftAltUrl from "@/assets/icons/arrow-left-alt.svg";
import distanceUrl from "@/assets/icons/distance.svg";
import plusMathUrl from "@/assets/icons/plus-math.png";
import { useColab } from "@/features/colab/hooks/useColab";
import { useSessionStore } from "@/features/auth/sessionStore";
import { ColabCardSkeleton } from "@/features/feed/components/ColabCardSkeleton";
import { AuthorMark } from "@/shared/components/AuthorMark";
import { CategoryBadge } from "@/shared/components/CategoryBadge";
import { ImageLightbox } from "@/shared/components/ImageLightbox";
import { LocationPicker } from "@/shared/components/LocationPicker";
import { RequestErrorBanner } from "@/shared/components/RequestErrorBanner";
import { SupportButton } from "@/shared/components/SupportButton";
import { messages } from "@/shared/i18n/pt-BR";
import { IllustrationPothole } from "@/shared/illustrations/CivicScenes";
import { absoluteDate, relativeDate } from "@/shared/utils/dateRelative";
import {
  EMPTY_LOCATION,
  formatLocationAddress,
  locationCoordinates,
} from "@/shared/utils/location";
import { sanitizeText } from "@/shared/utils/sanitize";

export function ColabDetailPage() {
  const { colabId } = useParams<{ colabId: string }>();
  const query = useColab(colabId);
  const isSignedIn = Boolean(useSessionStore((state) => state.user));
  const [photoOpen, setPhotoOpen] = useState(false);

  const authorName = sanitizeText(query.data?.username ?? "") || "Usuário";
  const title = query.data ? sanitizeText(query.data.title) : "";
  const description = query.data ? sanitizeText(query.data.description) : "";
  const photoAlt = title
    ? `Foto da colaboração: ${title}`
    : messages.detail.expandPhoto;
  const address = query.data
    ? query.data.location?.name || formatLocationAddress(query.data.location)
    : "";

  return (
    <div className="screen-feed min-h-dvh bg-white">
      <main
        id="conteudo"
        className={`mx-auto w-full max-w-[402px] md:max-w-2xl md:pb-12 lg:max-w-3xl xl:max-w-4xl ${
          isSignedIn ? "pb-28 md:pb-12" : "pb-8"
        }`}
      >
        <div className="flex items-start gap-2.5 p-4 md:px-8 md:pt-8 lg:px-12">
          <Link
            to="/"
            aria-label={messages.detail.backToFeed}
            className="inline-flex size-11 shrink-0 items-center justify-center text-black"
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

        {query.isLoading ? (
          <div className="px-4 md:px-8 lg:px-12">
            <ColabCardSkeleton />
          </div>
        ) : null}

        {query.isError ? (
          <div className="px-4 md:px-8 lg:px-12">
            {query.error.kind === "not_found" ? (
              <div className="border border-feed-hairline bg-white px-3 pt-3 pb-6">
                <IllustrationPothole
                  className="mx-auto h-36 w-full text-black"
                  title={messages.detail.notFoundTitle}
                />
                <h1 className="mt-4 text-[32px] leading-[1.031] font-extrabold tracking-[-1.6px] text-black">
                  {messages.detail.notFoundTitle}
                </h1>
                <p className="mt-2 text-base tracking-[-0.8px] text-black">
                  {messages.detail.notFoundBody}
                </p>
              </div>
            ) : (
              <RequestErrorBanner
                error={query.error}
                onRetry={() => void query.refetch()}
                testId="colab-detail-error"
              />
            )}
          </div>
        ) : null}

        {query.data ? (
          <div className="px-4 md:px-8 lg:px-12">
            <article className="flex w-full flex-col gap-4 border border-feed-hairline bg-white px-3 pt-3 pb-6 md:px-6 lg:px-8">
              <header className="flex items-center gap-[9px]">
                <div className="flex min-w-0 flex-1 items-center gap-[9px]">
                  <AuthorMark name={authorName} size={32} />
                  <p className="truncate text-[16px] leading-[1.031] font-normal tracking-[-0.8px] text-black">
                    {authorName}
                  </p>
                </div>
                <time
                  dateTime={query.data.createdAt}
                  title={absoluteDate(query.data.createdAt)}
                  className="shrink-0 text-[12px] leading-[1.031] font-normal tracking-[-0.6px] text-feed-time"
                >
                  {relativeDate(query.data.createdAt) ||
                    absoluteDate(query.data.createdAt)}
                </time>
              </header>

              {query.data.imageUrl ? (
                <button
                  type="button"
                  onClick={() => setPhotoOpen(true)}
                  aria-label={messages.detail.expandPhoto}
                  className="motion-media relative h-[179px] w-full cursor-zoom-in overflow-hidden"
                >
                  <img
                    src={query.data.imageUrl}
                    alt={photoAlt}
                    className="absolute inset-0 size-full object-cover"
                  />
                </button>
              ) : null}

              <div className="flex flex-col gap-2 text-black">
                <h1 className="text-[32px] leading-[1.031] font-extrabold tracking-[-1.6px]">
                  {title}
                </h1>
                {description ? (
                  <p className="text-[16px] leading-[1.031] font-normal tracking-[-0.8px] whitespace-pre-wrap">
                    {description}
                  </p>
                ) : null}
              </div>

              {query.data.categories.length > 0 ? (
                <div className="flex flex-wrap items-center gap-[17px]">
                  {query.data.categories.map((category) => (
                    <CategoryBadge
                      key={category.slug}
                      name={category.name}
                      slug={category.slug}
                    />
                  ))}
                </div>
              ) : null}

              <div className="flex w-full flex-col gap-2">
                <div className="flex items-center gap-[5px]">
                  <img
                    src={distanceUrl}
                    alt=""
                    width={24}
                    height={24}
                    className="block size-6 shrink-0"
                    aria-hidden="true"
                  />
                  <h2 className="text-[16px] leading-[1.031] font-normal tracking-[-0.8px] text-black">
                    {messages.detail.location}
                  </h2>
                </div>
                {address ? (
                  <p className="text-[16px] leading-[1.031] font-normal text-black">
                    {address}
                  </p>
                ) : null}
                <LocationPicker
                  readOnly
                  mapOnly
                  value={{
                    ...EMPTY_LOCATION,
                    name: query.data.location?.name ?? "",
                    reference: query.data.location?.reference ?? "",
                    street:
                      typeof query.data.location?.address === "object"
                        ? (query.data.location.address.street ?? "")
                        : "",
                    number:
                      typeof query.data.location?.address === "object"
                        ? (query.data.location.address.number ?? "")
                        : "",
                    neighborhood:
                      typeof query.data.location?.address === "object"
                        ? (query.data.location.address.neighborhood ?? "")
                        : "",
                    postalCode:
                      typeof query.data.location?.address === "object"
                        ? (query.data.location.address.postalCode ?? "")
                        : "",
                    coordinates: locationCoordinates(query.data.location),
                  }}
                />
              </div>

              <div className="bg-white">
                <SupportButton
                  colabId={query.data.id}
                  supportCount={query.data.supportCount}
                  supportedByMe={query.data.supportedByMe === true}
                  prominent
                />
              </div>
            </article>
          </div>
        ) : null}
      </main>

      {isSignedIn ? null : (
        <Link
          to="/login"
          aria-label={messages.feed.loginToCreate}
          className="motion-press fixed right-4 bottom-10 z-40 inline-flex items-end justify-end rounded-[12px] border-[3px] border-feed-ink bg-feed-fab p-4 shadow-[3px_4px_0_0_#0d0d0d] hover:translate-x-px hover:translate-y-px hover:shadow-none md:bottom-8"
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
      )}

      {query.data?.imageUrl ? (
        <ImageLightbox
          open={photoOpen}
          src={query.data.imageUrl}
          alt={photoAlt}
          onClose={() => setPhotoOpen(false)}
        />
      ) : null}
    </div>
  );
}
