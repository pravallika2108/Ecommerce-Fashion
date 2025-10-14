
import { axiosInstance } from "@/lib/axios";
import debounce from "lodash/debounce";
import { create } from "zustand";

export interface CartItem {
  id: string;
  productId: string;
  name: string;
  price: number;
  image: string;
  color: string;
  size: string;
  quantity: number;
}

interface CartStore {
  items: CartItem[];
  isLoading: boolean;
  error: string | null;
  fetchCart: () => Promise<void>;
  addToCart: (item: Omit<CartItem, "id">) => Promise<void>;
  removeFromCart: (id: string) => Promise<void>;
  updateCartItemQuantity: (id: string, quantity: number) => Promise<void>;
  clearCart: () => Promise<void>;
}

export const useCartStore = create<CartStore>((set) => {
  const debounceUpdateCartItemQuantity = debounce(
    async (id: string, quantity: number) => {
      try {
        await axiosInstance.put(`/cart/update/${id}`, { quantity });
      } catch (e) {
        set({ error: "Failed to update cart quantity" });
      }
    }
  );

  return {
    items: [],
    isLoading: false,
    error: null,

    fetchCart: async () => {
      set({ isLoading: true, error: null });
      try {
        const response = await axiosInstance.get("/cart/fetch-cart");
        set({ items: response.data.data, isLoading: false });
      } catch (e) {
        set({ error: "Failed to fetch cart", isLoading: false });
      }
    },

    addToCart: async (item) => {
      set({ isLoading: true, error: null });
      try {
        const response = await axiosInstance.post("/cart/add-to-cart", item);
        set((state) => ({
          items: [...state.items, response.data.data],
          isLoading: false,
        }));
      } catch (e) {
        set({ error: "Failed to add to cart", isLoading: false });
      }
    },

    removeFromCart: async (id) => {
      set({ isLoading: true, error: null });
      try {
        await axiosInstance.delete(`/cart/remove/${id}`);
        set((state) => ({
          items: state.items.filter((item) => item.id !== id),
          isLoading: false,
        }));
      } catch (e) {
        set({ error: "Failed to delete from cart", isLoading: false });
      }
    },

    updateCartItemQuantity: async (id, quantity) => {
      set((state) => ({
        items: state.items.map((cartItem) =>
          cartItem.id === id ? { ...cartItem, quantity } : cartItem
        ),
      }));
      debounceUpdateCartItemQuantity(id, quantity);
    },

    clearCart: async () => {
      set({ isLoading: true, error: null });
      try {
        await axiosInstance.post("/cart/clear-cart", {});
        set({ items: [], isLoading: false });
      } catch (e) {
        set({ error: "Failed to clear cart", isLoading: false });
      }
    },
  };
});
