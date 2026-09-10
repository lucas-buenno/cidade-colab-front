import { authorColor } from "@/shared/utils/authorColor";

type Props = {
  name: string;
  size?: number;
};

export function Avatar({ name, size = 40 }: Props) {
  const initial = name.trim().charAt(0).toUpperCase() || "?";

  return (
    <div
      role="img"
      aria-label={`Avatar de ${name}`}
      className="flex shrink-0 items-center justify-center rounded-full font-bold text-on-primary"
      style={{
        width: size,
        height: size,
        backgroundColor: authorColor(name),
        fontSize: size * 0.45,
      }}
    >
      {initial}
    </div>
  );
}
