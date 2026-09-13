import { BrowserRouter, Navigate, Route, Routes, useLocation } from "react-router-dom";
import { GuestOnly, RequireAuth } from "@/app/guards";
import { ForgotPasswordPage } from "@/features/auth/pages/ForgotPasswordPage";
import { LoginPage } from "@/features/auth/pages/LoginPage";
import { RegisterPage } from "@/features/auth/pages/RegisterPage";
import { ResetPasswordPage } from "@/features/auth/pages/ResetPasswordPage";
import { ColabDetailPage } from "@/features/colab/pages/ColabDetailPage";
import { CreateColabPage } from "@/features/colab/pages/CreateColabPage";
import { FeedTabBar } from "@/features/feed/components/FeedTabBar";
import { FeedPage } from "@/features/feed/pages/FeedPage";
import {
  hasSeenOnboarding,
} from "@/features/onboarding/onboardingStorage";
import { OnboardingPage } from "@/features/onboarding/pages/OnboardingPage";
import { MyColabsPage } from "@/features/profile/pages/MyColabsPage";
import { ProfilePage } from "@/features/profile/pages/ProfilePage";
import { AppSidebar } from "@/shared/components/AppSidebar";
import { SkipLink } from "@/shared/components/SkipLink";
import { isAppChromeHidden } from "@/shared/navigation/appChrome";

const AUTH_GUEST_PATHS = [
  "/login",
  "/cadastro",
  "/esqueci-senha",
  "/redefinir-senha",
];

function FirstVisitRedirect() {
  const location = useLocation();
  if (location.pathname === "/bem-vindo") return null;
  if (AUTH_GUEST_PATHS.includes(location.pathname)) return null;
  if (hasSeenOnboarding()) return null;
  return <Navigate to="/bem-vindo" replace />;
}

function AppShell() {
  const location = useLocation();
  const chromeHidden = isAppChromeHidden(location.pathname);

  return (
    <>
      <SkipLink />
      <FirstVisitRedirect />
      <AppSidebar />
      <div
        className={
          chromeHidden
            ? undefined
            : "min-h-dvh bg-white md:pl-[var(--app-sidebar-width)]"
        }
      >
        <Routes>
          <Route path="/" element={<FeedPage />} />
          <Route path="/bem-vindo" element={<OnboardingPage />} />
          <Route element={<RequireAuth />}>
            <Route path="/colab/novo" element={<CreateColabPage />} />
            <Route path="/perfil" element={<ProfilePage />} />
            <Route path="/minhas-colabs" element={<MyColabsPage />} />
          </Route>
          <Route path="/colab/:colabId" element={<ColabDetailPage />} />
          <Route element={<GuestOnly />}>
            <Route path="/login" element={<LoginPage />} />
            <Route path="/cadastro" element={<RegisterPage />} />
            <Route path="/esqueci-senha" element={<ForgotPasswordPage />} />
            <Route path="/redefinir-senha" element={<ResetPasswordPage />} />
          </Route>
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </div>
      <FeedTabBar />
    </>
  );
}

export function App() {
  return (
    <BrowserRouter>
      <AppShell />
    </BrowserRouter>
  );
}
