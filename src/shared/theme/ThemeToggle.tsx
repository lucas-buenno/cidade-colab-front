import { Desktop, Moon, Sun } from "@phosphor-icons/react";
import { messages } from "@/shared/i18n/pt-BR";
import {
  nextThemePreference,
  useThemeStore,
  type ThemePreference,
} from "@/shared/theme/themeStore";

const icons: Record<ThemePreference, typeof Sun> = {
  light: Sun,
  dark: Moon,
  system: Desktop,
};

type Props = {
  className?: string;
};

export function ThemeToggle({ className = "" }: Props) {
  const preference = useThemeStore((state) => state.preference);
  const cyclePreference = useThemeStore((state) => state.cyclePreference);
  const next = nextThemePreference(preference);
  const Icon = icons[preference];

  return (
    <button
      type="button"
      onClick={cyclePreference}
      aria-label={messages.theme.toggleTo[next]}
      title={messages.theme.toggleTo[next]}
      data-testid="theme-toggle"
      data-theme-preference={preference}
      className={`inline-flex size-11 cursor-pointer items-center justify-center rounded-xl border-[3px] border-transparent text-foreground hover:border-foreground hover:bg-muted ${className}`}
    >
      <Icon className="size-5" weight="regular" aria-hidden="true" />
    </button>
  );
}
