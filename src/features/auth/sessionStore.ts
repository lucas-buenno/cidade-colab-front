import { create } from "zustand";
import type { SessionUser } from "@/shared/types/auth";
import {
  clearAccessToken,
  readAccessToken,
  writeAccessToken,
} from "@/shared/utils/tokenStorage";
import { decodeAccessToken, isTokenFresh } from "@/shared/utils/jwt";
import { clearCreateDraft } from "@/features/colab/draftStorage";

type SessionState = {
  accessToken: string | null;
  user: SessionUser | null;
  hydrate: () => void;
  setSession: (token: string) => void;
  clear: () => void;
  isAuthenticated: () => boolean;
};

function sessionFromToken(token: string | null): {
  accessToken: string | null;
  user: SessionUser | null;
} {
  if (!token || !isTokenFresh(token)) {
    return { accessToken: null, user: null };
  }
  return { accessToken: token, user: decodeAccessToken(token) };
}

export const useSessionStore = create<SessionState>((set, get) => ({
  accessToken: null,
  user: null,
  hydrate: () => {
    const stored = readAccessToken();
    const next = sessionFromToken(stored);
    if (stored && !next.accessToken) {
      clearAccessToken();
    }
    set(next);
  },
  setSession: (token: string) => {
    writeAccessToken(token);
    set(sessionFromToken(token));
  },
  clear: () => {
    clearAccessToken();
    clearCreateDraft();
    set({ accessToken: null, user: null });
  },
  isAuthenticated: () => {
    const token = get().accessToken;
    return Boolean(token && isTokenFresh(token));
  },
}));
