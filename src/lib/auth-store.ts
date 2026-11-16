import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import type { AdminUser } from "./types";

type AuthState = {
  token: string | null;
  user: AdminUser | null;
  setSession: (token: string, user: AdminUser) => void;
  logout: () => void;
};

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      token: null,
      user: null,
      setSession: (token, user) => set({ token, user }),
      logout: () => set({ token: null, user: null }),
    }),
    {
      name: "andaaz-admin-auth",
      storage: createJSONStorage(() => window.localStorage),
      partialize: ({ token, user }) => ({ token, user }),
    },
  ),
);
