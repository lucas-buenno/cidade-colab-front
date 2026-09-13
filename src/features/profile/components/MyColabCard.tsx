import { Link } from "react-router-dom";
import type { ColabResponse } from "@/shared/types/colab";
import { messages } from "@/shared/i18n/pt-BR";
import { absoluteDate, relativeDate } from "@/shared/utils/dateRelative";
import { sanitizeText } from "@/shared/utils/sanitize";

type Props = {
  colab: ColabResponse;
};

export function MyColabCard({ colab }: Props) {
  const createdRelative = relativeDate(colab.createdAt);
  const createdAbsolute = absoluteDate(colab.createdAt);
  const title = sanitizeText(colab.title);
  const description = sanitizeText(colab.description);

  return (
    <article className="min-w-0">
      <Link
        to={`/colab/${colab.id}`}
        aria-label={`${messages.create.seeColab}: ${title}`}
        className="flex h-full flex-col gap-4 border border-feed-hairline bg-white px-3 pt-3 pb-6 text-left text-black outline-offset-2 focus-visible:outline-2 focus-visible:outline-black md:px-4 md:pt-4 md:pb-5"
      >
        <div className="relative h-[179px] w-full shrink-0 overflow-hidden md:h-[200px] lg:h-[220px]">
          {colab.imageUrl ? (
            <img
              src={colab.imageUrl}
              alt=""
              loading="lazy"
              className="absolute inset-0 size-full object-cover"
            />
          ) : (
            <div className="size-full bg-muted" aria-hidden="true" />
          )}
        </div>

        <div className="flex min-h-[73px] min-w-0 flex-col gap-2">
          <h2 className="line-clamp-2 text-[16px] leading-[1.031] font-extrabold tracking-[-0.8px]">
            {title}
          </h2>
          {description ? (
            <p className="line-clamp-3 text-[12px] leading-[1.031] font-normal tracking-[-0.6px] text-ellipsis">
              {description}
            </p>
          ) : null}
        </div>

        <time
          dateTime={colab.createdAt}
          title={createdAbsolute}
          className="mt-auto text-[12px] leading-[1.031] font-normal tracking-[-0.6px] text-feed-time"
        >
          {createdRelative || createdAbsolute}
        </time>
      </Link>
    </article>
  );
}
