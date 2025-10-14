import { API_ROUTES } from "@/utils/api";
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

    export const addToCart = async (
  req: AuthenticatedRequest,
  res: Response
): Promise<void> => {
  try {
    const userId = req.user?.userId;
    const { productId, quantity, size, color } = req.body;

    if (!userId) {
      res.status(401).json({
        success: false,
        message: "Unauthenticated user",
      });
      return;
    }

    const cart = await prisma.cart.upsert({
      where: { userId },
      create: { userId },
      update: {},
    });

    // Check if item already exists
    const existingItem = await prisma.cartItem.findFirst({
      where: {
        cartId: cart.id,
        productId,
        size: size || null,
        color: color || null,
      },
    });

    let cartItem;
    if (existingItem) {
      // Update existing item
      cartItem = await prisma.cartItem.update({
        where: { id: existingItem.id },
        data: {
          quantity: { increment: quantity },
        },
      });
    } else {
      // Create new item
      cartItem = await prisma.cartItem.create({
        data: {
          cartId: cart.id,
          productId,
          quantity,
          size: size || null,
          color: color || null,
        },
      });
    }

    const product = await prisma.product.findUnique({
      where: { id: productId },
      select: {
        name: true,
        price: true,
        images: true,
      },
    });

    const responseItem = {
      id: cartItem.id,
      productId: cartItem.productId,
      name: product?.name,
      price: product?.price,
      image: product?.images[0],
      color: cartItem.color,
      size: cartItem.size,
      quantity: cartItem.quantity,
    };

    res.status(201).json({
      success: true,
      data: responseItem,
    });
  } catch (e) {
    console.error("Add to cart error:", e);
    res.status(500).json({
      success: false,
      message: "Some error occurred!",
    });
  }
};
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
