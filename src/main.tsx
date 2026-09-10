import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { App } from "@/app/App";
import { AppProviders } from "@/app/providers";
import { useSessionStore } from "@/features/auth/sessionStore";
import { useThemeStore } from "@/shared/theme/themeStore";
import "@/index.css";

useThemeStore.getState().hydrate();
useSessionStore.getState().hydrate();

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <AppProviders>
      <App />
    </AppProviders>
  </StrictMode>,
);
