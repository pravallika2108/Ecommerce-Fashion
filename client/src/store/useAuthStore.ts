// src/store/useAuthStore.ts
import { axiosInstance } from "@/lib/axios";
import axios from "axios";
import { create } from "zustand";
import { persist } from "zustand/middleware";

type User = {
  id: string;
  name: string | null;
  email: string;
  role: "USER" | "SUPER_ADMIN";
};

type AuthStore = {
  user: User | null;
  isLoading: boolean;
  error: string | null;
  register: (name: string, email: string, password: string) => Promise<string | null>;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => Promise<void>;
  refreshAccessToken: () => Promise<boolean>;
  setUser: (user: User | null) => void;
};

export const useAuthStore = create<AuthStore>()(
  persist(
    (set, get) => ({
      user: null,
      isLoading: false,
      error: null,

      setUser: (user) => set({ user }),

      register: async (name, email, password) => {
        set({ isLoading: true, error: null });
        try {
          // Calls /api/auth/register (Next.js proxy)
          const response = await axiosInstance.post("/register", {
            name,
            email,
            password,
          });
          set({ isLoading: false });
          return response.data.userId;
        } catch (err) {
          set({
            isLoading: false,
            error:
              axios.isAxiosError(err) && err.response
                ? (err.response.data.error as string)
                : "Registration failed",
          });
          return null;
        }
      },

      login: async (email, password) => {
        set({ isLoading: true, error: null });
        try {
          console.log("=== LOGIN ATTEMPT ===");
          console.log("Calling /api/auth/login (Next.js proxy)");
          
          // Calls /api/auth/login (Next.js proxy) → Backend
          const response = await axiosInstance.post("/login", {
            email,
            password,
          });

          console.log("Login response:", response.data);

          if (response.data.success && response.data.user) {
            // Cookies are automatically set by the proxy
            // We only need to store user data
            set({
              isLoading: false,
              user: response.data.user,
              error: null,
            });

            return true;
          } else {
            set({
              isLoading: false,
              error: "Login failed - no user data returned",
            });
            return false;
          }
        } catch (err) {
          console.error("Login error:", err);
          set({
            isLoading: false,
            user: null,
            error:
              axios.isAxiosError(err) && err.response
                ? (err.response.data.error as string)
                : "Login failed",
          });
          return false;
        }
      },

      logout: async () => {
        set({ isLoading: true });
        try {
          // Calls /api/auth/logout (Next.js proxy)
          await axiosInstance.post("/logout");
          
          set({ 
            user: null, 
            isLoading: false,
            error: null 
          });
        } catch (err) {
          console.error("Logout error:", err);
          set({
            isLoading: false,
            error:
              axios.isAxiosError(err) && err.response
                ? (err.response.data.error as string)
                : "Logout failed",
          });
        }
      },

      refreshAccessToken: async () => {
        try {
          console.log("Refreshing access token via proxy...");
          // Calls /api/auth/refresh-token (Next.js proxy)
          const response = await axiosInstance.post("/refresh-token");

          if (response.data.success) {
            console.log("Token refreshed successfully");
            return true;
          }
          
          return false;
        } catch (err) {
          console.error("Refresh token error:", err);
          
          // If refresh fails, clear user state
          set({ user: null });
          return false;
        }
      },
    }),
    {
      name: "auth-storage",
      // Only persist user data, cookies are httpOnly
      partialize: (state) => ({
        user: state.user,
      }),
    }
  )
);
