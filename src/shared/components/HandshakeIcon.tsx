import handshakeActiveUrl from "@/assets/icons/handshake-active.svg";
import handshakeDefaultUrl from "@/assets/icons/handshake-default.svg";

type Props = {
  active?: boolean;
};

export function HandshakeIcon({ active = false }: Props) {
  return (
    <img
      src={active ? handshakeActiveUrl : handshakeDefaultUrl}
      alt=""
      width={24}
      height={24}
      className="block size-6 shrink-0"
      aria-hidden="true"
    />
  );
}
