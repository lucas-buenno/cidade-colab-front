import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import { GuestOnly, RequireAuth } from "@/app/guards";
import { LoginPage } from "@/features/auth/pages/LoginPage";
import { RegisterPage } from "@/features/auth/pages/RegisterPage";
import { ColabDetailPage } from "@/features/colab/pages/ColabDetailPage";
import { CreateColabPage } from "@/features/colab/pages/CreateColabPage";
import { FeedPage } from "@/features/feed/pages/FeedPage";
import { ProfilePage } from "@/features/profile/pages/ProfilePage";
import { AppHeader } from "@/shared/components/AppHeader";
import { SkipLink } from "@/shared/components/SkipLink";

export function App() {
  return (
    <BrowserRouter>
      <SkipLink />
      <AppHeader />
      <Routes>
        <Route path="/" element={<FeedPage />} />
        <Route element={<RequireAuth />}>
          <Route path="/colab/novo" element={<CreateColabPage />} />
          <Route path="/perfil" element={<ProfilePage />} />
        </Route>
        <Route path="/colab/:colabId" element={<ColabDetailPage />} />
        <Route element={<GuestOnly />}>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/cadastro" element={<RegisterPage />} />
        </Route>
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
