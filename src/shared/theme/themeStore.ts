import { create } from "zustand";

export const THEME_STORAGE_KEY = "cidadecolab:theme";

export type ThemePreference = "light" | "dark" | "system";
export type ResolvedTheme = "light" | "dark";

type ThemeState = {
  preference: ThemePreference;
  resolved: ResolvedTheme;
  hydrate: () => void;
  setPreference: (preference: ThemePreference) => void;
  cyclePreference: () => void;
};

function isThemePreference(value: string | null): value is ThemePreference {
  return value === "light" || value === "dark" || value === "system";
}

function getSystemTheme(): ResolvedTheme {
  if (typeof window === "undefined") return "light";
  return window.matchMedia("(prefers-color-scheme: dark)").matches
    ? "dark"
    : "light";
}

export function readThemePreference(): ThemePreference {
  try {
    const stored = window.localStorage.getItem(THEME_STORAGE_KEY);
    if (isThemePreference(stored)) return stored;
  } catch {
    /* private mode / blocked storage */
  }
  return "system";
}

export function writeThemePreference(preference: ThemePreference): void {
  try {
    window.localStorage.setItem(THEME_STORAGE_KEY, preference);
  } catch {
    /* ignore quota / private mode */
  }
}

export function resolveTheme(preference: ThemePreference): ResolvedTheme {
  return preference === "system" ? getSystemTheme() : preference;
}

export function applyResolvedTheme(resolved: ResolvedTheme): void {
  const root = document.documentElement;
  root.classList.toggle("dark", resolved === "dark");
  root.style.colorScheme = resolved;
  const themeColor = resolved === "dark" ? "#121212" : "#0F172A";
  document
    .querySelector('meta[name="theme-color"]')
    ?.setAttribute("content", themeColor);
}

export function nextThemePreference(
  preference: ThemePreference,
): ThemePreference {
  if (preference === "light") return "dark";
  if (preference === "dark") return "system";
  return "light";
}

export const useThemeStore = create<ThemeState>((set, get) => ({
  preference: "system",
  resolved: "light",
  hydrate: () => {
    const preference = readThemePreference();
    const resolved = resolveTheme(preference);
    applyResolvedTheme(resolved);
    set({ preference, resolved });
  },
  setPreference: (preference) => {
    writeThemePreference(preference);
    const resolved = resolveTheme(preference);
    applyResolvedTheme(resolved);
    set({ preference, resolved });
  },
  cyclePreference: () => {
    get().setPreference(nextThemePreference(get().preference));
  },
}));

export function syncSystemThemeListener(): () => void {
  const media = window.matchMedia("(prefers-color-scheme: dark)");
  const onChange = () => {
    const { preference } = useThemeStore.getState();
    if (preference !== "system") return;
    const resolved = resolveTheme("system");
    applyResolvedTheme(resolved);
    useThemeStore.setState({ resolved });
  };
  media.addEventListener("change", onChange);
  return () => media.removeEventListener("change", onChange);
}
