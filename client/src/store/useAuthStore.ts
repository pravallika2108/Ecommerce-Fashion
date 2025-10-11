import { API_ROUTES } from "@/utils/api";
import axios from "axios";
import { create } from "zustand";
import { persist } from "zustand/middleware";
import Cookies from "js-cookie"; // 👈 We'll use this for middleware visibility (optional)

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
  register: (
    name: string,
    email: string,
    password: string
  ) => Promise<string | null>;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => Promise<void>;
  refreshAccessToken: () => Promise<boolean>;
};

export const useAuthStore = create<AuthStore>()(
  persist(
    (set, get) => {
      const axiosInstance = axios.create({
        baseURL: API_ROUTES.AUTH,
      });

      // Add accessToken to Authorization header
      axiosInstance.interceptors.request.use((config) => {
        const token = get().accessToken;
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
      });

      return {
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
          } catch (error) {
            set({
              isLoading: false,
              error: axios.isAxiosError(error)
                ? error?.response?.data?.error || "Registration failed"
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

            const { user, accessToken, refreshToken } = response.data;

            // 👇 Optional: Set cookie so middleware can read it
            Cookies.set("client-token", accessToken, { path: "/", secure: true, sameSite: "None" });

            set({
              isLoading: false,
              user,
              accessToken,
              refreshToken,
            });

            return true;
          } catch (error) {
            set({
              isLoading: false,
              error: axios.isAxiosError(error)
                ? error?.response?.data?.error || "Login failed"
                : "Login failed",
            });
            return false;
          }
        },

        logout: async () => {
          try {
            await axiosInstance.post("/logout");

            // Remove client-token cookie
            Cookies.remove("client-token");

            set({
              user: null,
              accessToken: null,
              refreshToken: null,
              isLoading: false,
            });
          } catch (error) {
            set({
              isLoading: false,
              error: axios.isAxiosError(error)
                ? error?.response?.data?.error || "Logout failed"
                : "Logout failed",
            });
          }
        },

        refreshAccessToken: async () => {
          try {
            const { refreshToken } = get();
            if (!refreshToken) return false;

            const response = await axiosInstance.post("/refresh-token", {
              refreshToken,
            });

            const { accessToken } = response.data;

            // Update access token and reset cookie
            Cookies.set("client-token", accessToken, { path: "/", secure: true, sameSite: "None" });

            set({ accessToken });
            return true;
          } catch (error) {
            console.error("Refresh token error", error);
            return false;
          }
        },
      };
    },
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
