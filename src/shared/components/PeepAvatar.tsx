type Props = {
  name: string;
  size?: number;
};

const SKINS = ["#f5d0c5", "#e8b896", "#c68642", "#8d5524", "#5c3a21"] as const;
const HAIRS = ["#121212", "#6b3a2a", "#d4a017", "#f4e0c8", "#2c1b18"] as const;
const SHIRTS = ["#d6ff3e", "#b8a8ff", "#ff6b5b", "#f5c542"] as const;

function hashName(input: string): number {
  let hash = 0;
  for (let i = 0; i < input.length; i++) {
    hash = input.charCodeAt(i) + ((hash << 5) - hash);
  }
  return Math.abs(hash);
}

export function PeepAvatar({ name, size = 40 }: Props) {
  const hash = hashName(name.trim() || "?");
  const skin = SKINS[hash % SKINS.length];
  const hair = HAIRS[Math.floor(hash / 5) % HAIRS.length];
  const shirt = SHIRTS[Math.floor(hash / 11) % SHIRTS.length];
  const glasses = hash % 4 === 0;
  const bun = hash % 3 === 1;

  return (
    <div
      role="img"
      aria-label={`Avatar de ${name}`}
      className="shrink-0 overflow-hidden rounded-xl border-[3px] border-foreground bg-surface"
      style={{ width: size, height: size }}
    >
      <svg viewBox="0 0 64 64" className="size-full" aria-hidden="true">
        <rect width="64" height="64" fill={shirt} />
        <circle cx="32" cy="28" r="14" fill={skin} />
        <path
          d={
            bun
              ? "M18 26c2-14 26-16 28 0 0 0-4-8-14-8S18 26 18 26Z"
              : "M18 24c4-14 24-14 28 0v2c-6-10-22-10-28 0Z"
          }
          fill={hair}
        />
        {bun ? <circle cx="32" cy="10" r="5" fill={hair} /> : null}
        <circle cx="27" cy="28" r="1.6" fill="#121212" />
        <circle cx="37" cy="28" r="1.6" fill="#121212" />
        {glasses ? (
          <path
            d="M22 28h8a4 4 0 0 1 4 0h8"
            fill="none"
            stroke="#121212"
            strokeWidth="1.8"
          />
        ) : null}
        <path
          d="M28 34c2.4 2.2 5.6 2.2 8 0"
          fill="none"
          stroke="#121212"
          strokeWidth="1.6"
          strokeLinecap="round"
        />
        <path d="M16 64c4-16 28-16 32 0" fill={skin} />
      </svg>
    </div>
  );
}
