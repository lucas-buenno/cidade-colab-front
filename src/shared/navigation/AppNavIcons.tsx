import navHomeFillUrl from "@/assets/icons/nav-home.svg";
import navHomeOutlineUrl from "@/assets/icons/nav-home-outline.svg";
import navListAltFillUrl from "@/assets/icons/nav-list-alt-fill.svg";
import navListAltOutlineUrl from "@/assets/icons/nav-list-alt.svg";

type IconProps = {
  active?: boolean;
};

export function HomeNavIcon({ active = false }: IconProps) {
  return (
    <img
      src={active ? navHomeFillUrl : navHomeOutlineUrl}
      alt=""
      width={24}
      height={24}
      className="block size-6"
      aria-hidden="true"
    />
  );
}

export function MyColabsNavIcon({ active = false }: IconProps) {
  return (
    <img
      src={active ? navListAltFillUrl : navListAltOutlineUrl}
      alt=""
      width={24}
      height={24}
      className="block size-6"
      aria-hidden="true"
    />
  );
}
