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

    console.log("\n=== ADD TO CART DEBUG START ===");
    console.log("1. User ID:", userId);
    console.log("2. Request Body:", JSON.stringify(req.body, null, 2));
    console.log("3. ProductId:", productId, "Quantity:", quantity);
    console.log("4. Size received:", size, "Type:", typeof size);
    console.log("5. Color received:", color, "Type:", typeof color);

    if (!userId) {
      console.log("❌ ERROR: No userId found");
      res.status(401).json({
        success: false,
        message: "Unauthenticated user",
      });
      return;
    }

    // Fetch product
    console.log("6. Fetching product with ID:", productId);
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

    console.log("7. Product found:", product ? "✅ YES" : "❌ NO");
    if (product) {
      console.log("8. Product details:");
      console.log("   - Name:", product.name);
      console.log("   - Sizes:", product.sizes, "Length:", product.sizes?.length);
      console.log("   - Colors:", product.colors, "Length:", product.colors?.length);
    }

    if (!product) {
      console.log("❌ ERROR: Product not found in database");
      res.status(404).json({
        success: false,
        message: "Product not found",
      });
      return;
    }

    // If size/color not provided, use first available (default)
    const originalSize = size;
    const originalColor = color;

    if (!size && product.sizes && product.sizes.length > 0) {
      size = product.sizes[0];
      console.log("9. Size was empty, using default:", size);
    } else {
      console.log("9. Using provided size:", size);
    }

    if (!color && product.colors && product.colors.length > 0) {
      color = product.colors[0];
      console.log("10. Color was empty, using default:", color);
    } else {
      console.log("10. Using provided color:", color);
    }

    console.log("11. Final values - Size:", size, "Color:", color);

    // Validate that we have size and color
    if (!size || !color) {
      console.log("❌ ERROR: Missing size or color after defaults");
      console.log("   - Size:", size);
      console.log("   - Color:", color);
      res.status(400).json({
        success: false,
        message: "Product must have at least one size and color",
      });
      return;
    }

    // Upsert the cart
    console.log("12. Upserting cart for user:", userId);
    const cart = await prisma.cart.upsert({
      where: { userId },
      create: { userId },
      update: {},
    });
    console.log("13. Cart ID:", cart.id);

    // Check if cart item already exists
    console.log("14. Looking for existing cart item with:");
    console.log("   - cartId:", cart.id);
    console.log("   - productId:", productId);
    console.log("   - size:", size);
    console.log("   - color:", color);

    const existingItem = await prisma.cartItem.findUnique({
      where: {
        cartId_productId_size_color: {
          cartId: cart.id,
          productId,
          size: size,
          color: color,
        },
      },
    });

    console.log("15. Existing cart item:", existingItem ? "✅ FOUND (will update)" : "❌ NOT FOUND (will create)");
    if (existingItem) {
      console.log("    Current quantity:", existingItem.quantity);
      console.log("    Will increment by:", quantity);
    }

    // Upsert cart item
    console.log("16. Upserting cart item...");
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

    console.log("17. ✅ Cart item upserted successfully!");
    console.log("    - ID:", cartItem.id);
    console.log("    - Quantity:", cartItem.quantity);
    console.log("    - Size:", cartItem.size);
    console.log("    - Color:", cartItem.color);

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

    console.log("18. Sending success response");
    console.log("=== ADD TO CART DEBUG END ===\n");

    res.status(201).json({
      success: true,
      data: responseItem,
    });
  } catch (e) {
    console.log("\n❌❌❌ FATAL ERROR IN ADD TO CART ❌❌❌");
    console.error("Error type:", e instanceof Error ? e.constructor.name : typeof e);
    console.error("Error message:", e instanceof Error ? e.message : e);
    if (e instanceof Error && e.stack) {
      console.error("Stack trace:", e.stack);
    }
    console.log("=== ADD TO CART DEBUG END (ERROR) ===\n");
    
    res.status(500).json({
      success: false,
      message: "Some error occurred!",
      error: e instanceof Error ? e.message : "Unknown error",
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
