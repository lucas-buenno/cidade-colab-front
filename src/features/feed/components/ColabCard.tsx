import { Link } from "react-router-dom";
import { AuthorMark } from "@/shared/components/AuthorMark";
import { CategoryBadge } from "@/shared/components/CategoryBadge";
import { SupportButton } from "@/shared/components/SupportButton";
import type { ColabResponse } from "@/shared/types/colab";
import { absoluteDate, relativeDate } from "@/shared/utils/dateRelative";
import { sanitizeText } from "@/shared/utils/sanitize";

type Props = {
  colab: ColabResponse;
};

export function ColabCard({ colab }: Props) {
  const authorName = sanitizeText(colab.username) || "Usuário";
  const createdRelative = relativeDate(colab.createdAt);
  const createdAbsolute = absoluteDate(colab.createdAt);
  const title = sanitizeText(colab.title);
  const description = sanitizeText(colab.description);

  return (
    <article className="relative flex w-full flex-col gap-4 border border-feed-hairline bg-white px-3 pt-3 pb-6 md:px-6 md:pt-6 md:pb-8 lg:px-8">
      <header className="flex items-center gap-[9px]">
        <div className="flex min-w-0 flex-1 items-center gap-[9px]">
          <AuthorMark name={authorName} size={32} />
          <p className="truncate text-[16px] leading-[1.031] font-normal tracking-[-0.8px] text-black">
            {authorName}
          </p>
        </div>
        <time
          dateTime={colab.createdAt}
          title={createdAbsolute}
          className="shrink-0 text-[12px] leading-[1.031] font-normal tracking-[-0.6px] text-feed-time"
        >
          {createdRelative || createdAbsolute}
        </time>
      </header>

      {colab.imageUrl ? (
        <div className="motion-media relative h-[179px] w-full overflow-hidden md:h-[260px] lg:h-[360px]">
          <img
            src={colab.imageUrl}
            alt=""
            loading="lazy"
            className="absolute inset-0 size-full object-cover"
          />
        </div>
      ) : null}

      {colab.categories.length > 0 ? (
        <div className="flex flex-wrap items-center gap-[17px]">
          {colab.categories.map((category) => (
            <CategoryBadge
              key={category.slug}
              name={category.name}
              slug={category.slug}
            />
          ))}
        </div>
      ) : null}

      <div className="flex flex-col gap-2 text-black">
        <h2 className="text-[32px] leading-[1.031] font-extrabold tracking-[-1.6px]">
          <Link
            to={`/colab/${colab.id}`}
            className="underline-offset-4 after:absolute after:inset-0 after:z-0 after:content-[''] hover:underline hover:decoration-2"
          >
            {title}
          </Link>
        </h2>
        {description ? (
          <p className="text-[16px] leading-[1.031] font-normal tracking-[-0.8px]">
            {description}
          </p>
        ) : null}
      </div>

      <div className="relative z-10">
        <SupportButton
          colabId={colab.id}
          supportCount={colab.supportCount}
          supportedByMe={colab.supportedByMe === true}
        />
      </div>
    </article>
  );
}
