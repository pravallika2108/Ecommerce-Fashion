// store/useSettingsStore.ts
import { axiosInstance } from "@/lib/axios";
import { create } from "zustand";

interface FeatureBanner {
  id: string;
  imageUrl: string;
}

interface FeaturedProduct {
  id: string;
  name: string;
  price: string;
  images: string[];
}

interface SettingsState {
  banners: FeatureBanner[];
  featuredProducts: FeaturedProduct[];
  isLoading: boolean;
  error: string | null;
  fetchBanners: () => Promise<void>;
  fetchFeaturedProducts: () => Promise<void>;
  addBanners: (files: File[]) => Promise<boolean>;
  updateFeaturedProducts: (productIds: string[]) => Promise<boolean>;
}

export const useSettingsStore = create<SettingsState>((set) => ({
  banners: [],
  featuredProducts: [],
  isLoading: false,
  error: null,
  
  fetchBanners: async () => {
    set({ isLoading: true, error: null });
    try {
      const response = await axiosInstance.get("/settings/get-banners");
      set({ banners: response.data.banners, isLoading: false });
    } catch (e) {
      console.error(e);
      set({ error: "Failed to fetch banners", isLoading: false });
    }
  },
  
  fetchFeaturedProducts: async () => {
    set({ isLoading: true, error: null });
    try {
      const response = await axiosInstance.get("/settings/fetch-feature-products");
      set({
        featuredProducts: response.data.featuredProducts,
        isLoading: false,
      });
    } catch (e) {
      console.error(e);
      set({ error: "Failed to fetch featured products", isLoading: false });
    }
  },
  
  addBanners: async (files: File[]) => {
    set({ isLoading: true, error: null });
    try {
      const formData = new FormData();
      files.forEach((file) => formData.append("images", file));
      const response = await axiosInstance.post("/settings/banners", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
      set({ isLoading: false });
      return response.data.success;
    } catch (e) {
      console.error(e);
      set({ error: "Failed to add banners", isLoading: false });
      return false;
    }
  },
  
  updateFeaturedProducts: async (productIds: string[]) => {
    set({ isLoading: true, error: null });
    try {
      const response = await axiosInstance.post("/settings/update-feature-products", { 
        productIds 
      });
      set({ isLoading: false });
      return response.data.success;
    } catch (e) {
      console.error(e);
      set({ error: "Failed to update featured products", isLoading: false });
      return false;
    }
  },
}));
deleteBanner: async (bannerId: string) => {
    set({ isLoading: true, error: null });
    try {
      const response = await axiosInstance.delete(`/settings/banners/${bannerId}`);
      
      // Update local state by removing the deleted banner
      set((state) => ({
        banners: state.banners.filter((banner) => banner.id !== bannerId),
        isLoading: false,
      }));
      
      return response.data.success;
    } catch (e) {
      console.error(e);
      set({ error: "Failed to delete banner", isLoading: false });
      return false;
    }
  },
}));
