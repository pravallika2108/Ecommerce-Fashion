// src/store/useAuthStore.ts
import { API_ROUTES } from "@/utils/api";
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
  accessToken: string | null;
  refreshToken: string | null;
  isLoading: boolean;
  error: string | null;
  register: (name: string, email: string, password: string) => Promise<string | null>;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => Promise<void>;
  refreshAccessToken: () => Promise<boolean>;
};

const axiosInstance = axios.create({
  baseURL: API_ROUTES.AUTH,
  withCredentials: true,
});

export const useAuthStore = create<AuthStore>()(
  persist(
    (set, get) => ({
      user: null,
      accessToken: null,
      refreshToken: null,
      isLoading: false,
      error: null,

      register: async (name, email, password) => {
        set({ isLoading: true, error: null });
        try {
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
          const response = await axiosInstance.post("/login", {
            email,
            password,
          });
          console.log("=== FRONTEND LOGIN DEBUG ===");
          console.log("Response data:", response.data);

          const { user, accessToken, refreshToken } = response.data;

          // Store tokens in both localStorage and zustand state
          if (accessToken) {
            localStorage.setItem("accessToken", accessToken);
          }
          if (refreshToken) {
            localStorage.setItem("refreshToken", refreshToken);
          }

          set({
            isLoading: false,
            user,
            accessToken: accessToken || null,
            refreshToken: refreshToken || null,
          });

          return true;
        } catch (err) {
          set({
            isLoading: false,
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
          await axiosInstance.post("/logout");
          localStorage.removeItem("accessToken");
          localStorage.removeItem("refreshToken");
          set({ user: null, accessToken: null, refreshToken: null, isLoading: false });
        } catch (err) {
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
          const response = await axiosInstance.post("/refresh-token");
          console.log("FRONTEND REFRESH DEBUG:", response.data);

          const { accessToken } = response.data;
          if (accessToken) {
            localStorage.setItem("accessToken", accessToken);
            set({ accessToken });
            return true;
          }
          return false;
        } catch (err) {
          console.error("Refresh token error frontend:", err);
          return false;
        }
      },
    }),
    {
      name: "auth-storage",
      partialize: (state) => ({
        user: state.user,
        accessToken: state.accessToken,
        refreshToken: state.refreshToken,
      }),
    }
  )
);
