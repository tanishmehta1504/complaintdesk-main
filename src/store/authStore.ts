// src/store/authStore.ts
// Zustand global auth state — persists to localStorage automatically

import { create } from "zustand";
import { persist } from "zustand/middleware";
import { AuthState, AuthUser } from "@/types";

const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      token: null,
      isLoading: false,

      // Called after successful login/signup
      login: (user: AuthUser, token: string) => {
        // Also save to localStorage for Axios interceptor
        localStorage.setItem("cd_token", token);
        localStorage.setItem("cd_user", JSON.stringify(user));
        set({ user, token });
      },

      // Called on logout
      logout: () => {
        localStorage.removeItem("cd_token");
        localStorage.removeItem("cd_user");
        set({ user: null, token: null });
      },

      setLoading: (val: boolean) => set({ isLoading: val }),
    }),
    {
      name: "complaintdesk-auth", // localStorage key
      partialize: (state) => ({ user: state.user, token: state.token }),
    }
  )
);

export default useAuthStore;
