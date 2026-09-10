import { useEffect, type ReactNode } from "react";
import { syncSystemThemeListener, useThemeStore } from "@/shared/theme/themeStore";

type Props = { children: ReactNode };

export function ThemeProvider({ children }: Props) {
  const hydrate = useThemeStore((state) => state.hydrate);

  useEffect(() => {
    hydrate();
    return syncSystemThemeListener();
  }, [hydrate]);

  return children;
}
