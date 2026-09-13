import { sanitizeText } from "@/shared/utils/sanitize";

type Props = {
  name: string;
  slug: string;
};

export function CategoryBadge({ name }: Props) {
  return (
    <span className="inline-flex items-center justify-center rounded-[4px] border-2 border-black bg-feed-tag px-4 py-2 text-[12px] leading-none font-semibold tracking-[-0.6px] text-black uppercase shadow-[2px_2px_0_0_black]">
      {sanitizeText(name)}
    </span>
  );
}
