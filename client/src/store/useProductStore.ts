import { API_ROUTES } from "@/utils/api";
import { axiosInstance } from "@/lib/axios";
import { create } from "zustand";

export interface Product {
  id: string;
  name: string;
  brand: string;
  category: string;
  description: string;
  gender: string;
  sizes: string[];
  colors: string[];
  price: number;
  stock: number;
  rating?: number;
  soldCount: number;
  images: string[];
}

interface ProductState {
  products: Product[];
  isLoading: boolean;
  error: string | null;
  currentPage: number;
  totalPages: number;
  totalProducts: number;
  fetchAllProductsForAdmin: () => Promise<void>;
  createProduct: (productData: FormData) => Promise<Product>;
  updateProduct: (id: string, productData: FormData) => Promise<Product>;
  deleteProduct: (id: string) => Promise<boolean>;
  getProductById: (id: string) => Promise<Product | null>;
  fetchProductsForClient: (params: {
    page?: number;
    limit?: number;
    categories?: string[];
    sizes?: string[];
    colors?: string[];
    brands?: string[];
    minPrice?: number;
    maxPrice?: number;
    sortBy?: string;
    sortOrder?: "asc" | "desc";
  }) => Promise<void>;
  setCurrentPage: (page: number) => void;
}

export const useProductStore = create<ProductState>((set) => ({
  products: [],
  isLoading: true,
  error: null,
  currentPage: 1,
  totalPages: 1,
  totalProducts: 0,
  
  fetchAllProductsForAdmin: async () => {
    set({ isLoading: true, error: null });
    try {
      const response = await axiosInstance.get("/products/fetch-admin-products");
      set({ products: response.data, isLoading: false });
    } catch (e) {
      set({ error: "Failed to fetch product", isLoading: false });
    }
  },

  createProduct: async (productData: FormData) => {
    set({ isLoading: true, error: null });
    try {
      const response = await axiosInstance.post("/products/create-new-product", productData);
      set({ isLoading: false });
      return response.data;
    } catch (e) {
      set({ error: "Failed to create product", isLoading: false });
      throw e;
    }
  },

  updateProduct: async (id: string, productData: FormData) => {
    set({ isLoading: true, error: null });
    try {
      const response = await axiosInstance.put(`/products/${id}`, productData);
      set({ isLoading: false });
      return response.data;
    } catch (e) {
      set({ error: "Failed to update product", isLoading: false });
      throw e;
    }
  },

  deleteProduct: async (id: string) => {
    set({ isLoading: true, error: null });
    try {
      const response = await axiosInstance.delete(`/products/${id}`);
      set({ isLoading: false });
      return response.data.success;
    } catch (e) {
      set({ error: "Failed to delete product", isLoading: false });
      throw e;
    }
  },

  getProductById: async (id: string) => {
    set({ isLoading: true, error: null });
    try {
      const response = await axiosInstance.get(`/products/${id}`);
      set({ isLoading: false });
      return response.data;
    } catch (e) {
      set({ error: "Failed to fetch product", isLoading: false });
      return null;
    }
  },

  fetchProductsForClient: async (params) => {
    set({ isLoading: true, error: null });
    try {
      const queryParams = {
        ...params,
        categories: params.categories?.join(","),
        sizes: params.sizes?.join(","),
        colors: params.colors?.join(","),
        brands: params.brands?.join(","),
      };

      const response = await axiosInstance.get("/products/fetch-client-products", {
        params: queryParams,
      });

      set({
        products: response.data.products,
        currentPage: response.data.currentPage,
        totalPages: response.data.totalPages,
        totalProducts: response.data.totalProducts,
        isLoading: false,
      });
    } catch (e) {
      set({ error: "Failed to fetch products", isLoading: false });
    }
  },

  setCurrentPage: (page: number) => set({ currentPage: page }),
}));
