type Props = {
  name: string;
  size?: number;
};

export function AuthorMark({ name, size = 32 }: Props) {
  const initial = (name.trim().charAt(0) || "?").toLocaleUpperCase("pt-BR");
  const compact = size <= 24;
  const large = size >= 80;

  return (
    <span
      aria-hidden="true"
      className={`inline-flex shrink-0 items-center justify-center rounded-[4px] bg-feed-yellow leading-[1.031] font-normal text-black ${
        compact
          ? "border border-feed-ink text-[12px] tracking-[-0.8px] shadow-[2px_1px_0_0_#0d0d0d]"
          : large
            ? "border-2 border-feed-ink text-[40px] tracking-[-2px]"
            : "border-2 border-feed-ink text-[16px] tracking-[-0.8px]"
      }`}
      style={{ width: size, height: size }}
    >
      {initial}
    </span>
  );
}
