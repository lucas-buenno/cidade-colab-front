import { Link } from "react-router-dom";
import { Avatar } from "@/shared/components/Avatar";
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
    <article className="rounded-xl border border-border bg-card p-4 shadow-card">
      <header className="flex items-center gap-3">
        <Avatar name={authorName} />
        <div className="min-w-0 flex-1">
          <p className="truncate font-bold text-foreground">{authorName}</p>
          <time
            dateTime={colab.createdAt}
            title={createdAbsolute}
            className="text-sm text-muted-foreground"
          >
            {createdRelative || createdAbsolute}
          </time>
        </div>
      </header>

      {colab.imageUrl ? (
        <Link
          to={`/colab/${colab.id}`}
          className="mt-3 block aspect-video w-full overflow-hidden rounded-lg bg-muted"
        >
          <img
            src={colab.imageUrl}
            alt={`Foto da ocorrência: ${title}`}
            loading="lazy"
            className="h-full w-full object-cover"
          />
        </Link>
      ) : null}

      <h2 className="mt-3 text-lg font-bold leading-tight text-foreground">
        <Link
          to={`/colab/${colab.id}`}
          className="underline-offset-2 hover:underline"
        >
          {title}
        </Link>
      </h2>

      {description ? (
        <p className="mt-2 line-clamp-2 text-sm text-muted-foreground">
          {description}
        </p>
      ) : null}

      {colab.categories.length > 0 ? (
        <div className="mt-3 flex flex-wrap gap-2">
          {colab.categories.map((category) => (
            <span
              key={category.slug}
              className="inline-flex rounded-full border border-border bg-muted px-2.5 py-1 text-xs font-medium text-foreground"
            >
              {sanitizeText(category.name)}
            </span>
          ))}
        </div>
      ) : null}

      <div className="mt-4 flex items-center border-t border-border pt-3">
        <SupportButton
          colabId={colab.id}
          supportCount={colab.supportCount}
        />
      </div>
    </article>
  );
}
