import { API_ROUTES } from "@/utils/api";
import axios from "axios";
import debounce from "lodash/debounce";
import { create } from "zustand";

export interface CartItem {
  id: string;
  productId: string;
  name: string;
  price: number;
  image: string;
  color: string | null;  // Changed to nullable
  size: string | null;   // Changed to nullable
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

export const useCartStore = create<CartStore>((set, get) => {
  const debounceUpdateCartItemQuantity = debounce(
    async (id: string, quantity: number) => {
      try {
        await axios.put(
          `${API_ROUTES.CART}/update/${id}`,
          { quantity },
          {
            withCredentials: true,
          }
        );
      } catch (e) {
        set({ error: "Failed to update cart quantity" });
      }
    },
    500  // Added delay
  );

  return {
    items: [],
    isLoading: false,
    error: null,

    fetchCart: async () => {
      set({ isLoading: true, error: null });
      try {
        const response = await axios.get(`${API_ROUTES.CART}/fetch-cart`, {
          withCredentials: true,
        });
        set({ items: response.data.data, isLoading: false });
      } catch (e) {
        set({ error: "Failed to fetch cart", isLoading: false });
      }
    },

    addToCart: async (item) => {
      set({ isLoading: true, error: null });
      try {
        // Normalize payload - ensure null instead of undefined
        const payload = {
          productId: item.productId,
          name: item.name,
          price: item.price,
          image: item.image,
          quantity: item.quantity,
          color: item.color ?? null,
          size: item.size ?? null,
        };

        const response = await axios.post(
          `${API_ROUTES.CART}/add-to-cart`,
          payload,
          {
            withCredentials: true,
          }
        );
        
        set((state) => ({
          items: [...state.items, response.data.data],
          isLoading: false,
        }));
      } catch (e) {
        console.error("Add to cart error:", e);
        set({ error: "Failed to add to cart", isLoading: false });
      }
    },

    removeFromCart: async (id) => {
      set({ isLoading: true, error: null });
      try {
        await axios.delete(`${API_ROUTES.CART}/remove/${id}`, {
          withCredentials: true,
        });
        set((state) => ({
          items: state.items.filter((item) => item.id !== id),
          isLoading: false,
        }));
      } catch (e) {
        console.error("Remove from cart error:", e);
        set({ error: "Failed to delete from cart", isLoading: false });
      }
    },

    updateCartItemQuantity: async (id, quantity) => {
      // Optimistic update
      set((state) => ({
        items: state.items.map((cartItem) =>
          cartItem.id === id ? { ...cartItem, quantity } : cartItem
        ),
      }));
      
      // Debounced API call
      debounceUpdateCartItemQuantity(id, quantity);
    },

    clearCart: async () => {
      set({ isLoading: true, error: null });
      try {
        await axios.post(
          `${API_ROUTES.CART}/clear-cart`,
          {},
          {
            withCredentials: true,
          }
        );
        set({ items: [], isLoading: false });
      } catch (e) {
        console.error("Clear cart error:", e);
        set({ error: "Failed to clear cart", isLoading: false });
      }
    },
  };
});
