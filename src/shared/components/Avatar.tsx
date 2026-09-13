import { PeepAvatar } from "@/shared/components/PeepAvatar";

type Props = {
  name: string;
  size?: number;
};

export function Avatar({ name, size = 40 }: Props) {
  return <PeepAvatar name={name} size={size} />;
}
