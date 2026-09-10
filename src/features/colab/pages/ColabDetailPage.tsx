import { ArrowLeft, MapPin } from "@phosphor-icons/react";
import { Link, useParams } from "react-router-dom";
import { useColab } from "@/features/colab/hooks/useColab";
import { ColabCardSkeleton } from "@/features/feed/components/ColabCardSkeleton";
import { Avatar } from "@/shared/components/Avatar";
import { LocationPicker } from "@/shared/components/LocationPicker";
import { RequestErrorBanner } from "@/shared/components/RequestErrorBanner";
import { SupportButton } from "@/shared/components/SupportButton";
import { messages } from "@/shared/i18n/pt-BR";
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

  return (
    <div className="min-h-dvh bg-background">
      <main
        id="conteudo"
        className="mx-auto w-full max-w-2xl px-4 py-6 sm:px-6"
      >
        <Link
          to="/"
          className="inline-flex min-h-11 items-center gap-2 text-sm font-bold text-accent underline-offset-2 hover:underline"
        >
          <ArrowLeft className="size-4" aria-hidden="true" />
          {messages.detail.backToFeed}
        </Link>

        {query.isLoading ? (
          <div className="mt-6">
            <ColabCardSkeleton />
          </div>
        ) : null}

        {query.isError ? (
          <div className="mt-6">
            {query.error.kind === "not_found" ? (
              <div className="rounded-xl border border-border bg-card p-6">
                <h1 className="text-2xl font-bold text-foreground">
                  {messages.detail.notFoundTitle}
                </h1>
                <p className="mt-2 text-muted-foreground">
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
          <article className="mt-6 rounded-xl border border-border bg-card p-4 shadow-card sm:p-6">
            <header className="flex items-center gap-3">
              <Avatar name={sanitizeText(query.data.username) || "Usuário"} />
              <div className="min-w-0 flex-1">
                <p className="truncate font-bold text-foreground">
                  {sanitizeText(query.data.username) || "Usuário"}
                </p>
                <time
                  dateTime={query.data.createdAt}
                  title={absoluteDate(query.data.createdAt)}
                  className="text-sm text-muted-foreground"
                >
                  {relativeDate(query.data.createdAt) ||
                    absoluteDate(query.data.createdAt)}
                </time>
              </div>
            </header>

            {query.data.imageUrl ? (
              <div className="mt-4 aspect-video w-full overflow-hidden rounded-lg bg-muted">
                <img
                  src={query.data.imageUrl}
                  alt={`Foto da ocorrência: ${sanitizeText(query.data.title)}`}
                  className="h-full w-full object-cover"
                />
              </div>
            ) : null}

            <h1 className="mt-4 text-2xl font-bold text-foreground">
              {sanitizeText(query.data.title)}
            </h1>
            <p className="mt-3 whitespace-pre-wrap text-base text-foreground">
              {sanitizeText(query.data.description)}
            </p>

            {query.data.categories.length > 0 ? (
              <div className="mt-4 flex flex-wrap gap-2">
                {query.data.categories.map((category) => (
                  <span
                    key={category.slug}
                    className="inline-flex whitespace-nowrap rounded-full border border-border bg-muted px-2.5 py-1 text-xs font-medium text-foreground"
                  >
                    {sanitizeText(category.name)}
                  </span>
                ))}
              </div>
            ) : null}

            <div className="mt-6">
              <h2 className="mb-3 flex items-center gap-2 text-sm font-bold text-foreground">
                <MapPin className="size-4" aria-hidden="true" />
                {messages.detail.location}
              </h2>
              <LocationPicker
                readOnly
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
              {!locationCoordinates(query.data.location) &&
              formatLocationAddress(query.data.location) ? (
                <p className="mt-2 text-sm text-muted-foreground">
                  {formatLocationAddress(query.data.location)}
                </p>
              ) : null}
            </div>

            <div className="mt-6 flex items-center border-t border-border pt-4">
              <SupportButton
                colabId={query.data.id}
                supportCount={query.data.supportCount}
              />
            </div>
          </article>
        ) : null}
      </main>
    </div>
  );
}
