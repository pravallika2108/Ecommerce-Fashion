import { Response } from "express";
import { AuthenticatedRequest } from "../middleware/authMiddleware";
import { prisma } from "../server";

export const addToCart = async (
  req: AuthenticatedRequest,
  res: Response
): Promise<void> => {
  try {
    const userId = req.user?.userId;
    let { productId, quantity, size, color } = req.body;

    if (!userId) {
      res.status(401).json({
        success: false,
        message: "Unauthenticated user",
      });
      return;
    }

    // CHANGE 1: Fetch product to get default size/color if not provided
    const product = await prisma.product.findUnique({
      where: { id: productId },
      select: {
        name: true,
        price: true,
        images: true,
        sizes: true,
        colors: true,
      },
    });

    if (!product) {
      res.status(404).json({
        success: false,
        message: "Product not found",
      });
      return;
    }

    // CHANGE 2: If size/color not provided, use first available (default)
    if (!size && product.sizes.length > 0) {
      size = product.sizes[0];
    }
    if (!color && product.colors.length > 0) {
      color = product.colors[0];
    }

    // Validate that we have size and color
    if (!size || !color) {
      res.status(400).json({
        success: false,
        message: "Product must have at least one size and color",
      });
      return;
    }

    // Upsert the cart for the user (create if not exist)
    const cart = await prisma.cart.upsert({
      where: { userId },
      create: { userId },
      update: {},
    });

    // CHANGE 3: Now using actual size/color values (not null)
    const cartItem = await prisma.cartItem.upsert({
      where: {
        cartId_productId_size_color: {
          cartId: cart.id,
          productId,
          size: size,
          color: color,
        },
      },
      update: {
        quantity: { increment: quantity },
      },
      create: {
        cartId: cart.id,
        productId,
        quantity,
        size: size,
        color: color,
      },
    });

    // CHANGE 4: Use product data we already fetched
    const responseItem = {
      id: cartItem.id,
      productId: cartItem.productId,
      name: product.name,
      price: product.price,
      image: product.images[0] || null,
      color: cartItem.color,
      size: cartItem.size,
      quantity: cartItem.quantity,
    };

    res.status(201).json({
      success: true,
      data: responseItem,
    });
  } catch (e) {
    console.error("Add to cart error:", e instanceof Error ? e.message : e);
    if (e instanceof Error && e.stack) {
      console.error(e.stack);
    }
    res.status(500).json({
      success: false,
      message: "Some error occurred!",
    });
  }
};

export const getCart = async (
  req: AuthenticatedRequest,
  res: Response
): Promise<void> => {
  try {
    const userId = req.user?.userId;

    if (!userId) {
      res.status(401).json({
        success: false,
        message: "Unauthenticated user",
      });
      return;
    }

    const cart = await prisma.cart.findUnique({
      where: { userId },
      include: {
        items: true,
      },
    });

    if (!cart || cart.items.length === 0) {
      res.json({
        success: true,
        data: [],
        message: "No items found in cart",
      });
      return;
    }

    const cartItemsWithProducts = await Promise.all(
      cart.items.map(async (item) => {
        const product = await prisma.product.findUnique({
          where: { id: item.productId },
          select: {
            name: true,
            price: true,
            images: true,
          },
        });

        return {
          id: item.id,
          productId: item.productId,
          name: product?.name,
          price: product?.price,
          image: product?.images[0] || null,
          color: item.color,
          size: item.size,
          quantity: item.quantity,
        };
      })
    );

    res.json({
      success: true,
      data: cartItemsWithProducts,
    });
  } catch (e) {
    console.error("Get cart error:", e);
    res.status(500).json({
      success: false,
      message: "Failed to fetch cart!",
    });
  }
};

export const removeFromCart = async (
  req: AuthenticatedRequest,
  res: Response
): Promise<void> => {
  try {
    const userId = req.user?.userId;
    const { id } = req.params;

    if (!userId) {
      res.status(401).json({
        success: false,
        message: "Unauthenticated user",
      });
      return;
    }

    const cartItem = await prisma.cartItem.findUnique({
      where: { id },
      include: { cart: true },
    });

    if (!cartItem || cartItem.cart.userId !== userId) {
      res.status(404).json({
        success: false,
        message: "Cart item not found or unauthorized",
      });
      return;
    }

    await prisma.cartItem.delete({
      where: { id },
    });

    res.status(200).json({
      success: true,
      message: "Item removed from cart",
    });
  } catch (e) {
    console.error("Remove from cart error:", e);
    res.status(500).json({
      success: false,
      message: "Failed to remove from cart!",
    });
  }
};

export const updateCartItemQuantity = async (
  req: AuthenticatedRequest,
  res: Response
): Promise<void> => {
  try {
    const userId = req.user?.userId;
    const { id } = req.params;
    const { quantity } = req.body;

    if (!userId) {
      res.status(401).json({
        success: false,
        message: "Unauthenticated user",
      });
      return;
    }

    const cartItem = await prisma.cartItem.findUnique({
      where: { id },
      include: { cart: true },
    });

    if (!cartItem || cartItem.cart.userId !== userId) {
      res.status(404).json({
        success: false,
        message: "Cart item not found or unauthorized",
      });
      return;
    }

    const updatedItem = await prisma.cartItem.update({
      where: { id },
      data: { quantity },
    });

    const product = await prisma.product.findUnique({
      where: { id: updatedItem.productId },
      select: {
        name: true,
        price: true,
        images: true,
      },
    });

    const responseItem = {
      id: updatedItem.id,
      productId: updatedItem.productId,
      name: product?.name,
      price: product?.price,
      image: product?.images[0] || null,
      color: updatedItem.color,
      size: updatedItem.size,
      quantity: updatedItem.quantity,
    };

    res.json({
      success: true,
      data: responseItem,
    });
  } catch (e) {
    console.error("Update cart item error:", e);
    res.status(500).json({
      success: false,
      message: "Failed to update cart item quantity",
    });
  }
};

export const clearEntireCart = async (
  req: AuthenticatedRequest,
  res: Response
): Promise<void> => {
  try {
    const userId = req.user?.userId;

    if (!userId) {
      res.status(401).json({
        success: false,
        message: "Unauthenticated user",
      });
      return;
    }

    await prisma.cartItem.deleteMany({
      where: {
        cart: { userId },
      },
    });

    res.status(200).json({
      success: true,
      message: "Cart cleared successfully!",
    });
  } catch (e) {
    console.error("Clear cart error:", e);
    res.status(500).json({
      success: false,
      message: "Failed to clear cart!",
    });
  }
};
