import { Response } from "express";
import { AuthenticatedRequest } from "../middleware/authMiddleware";
import cloudinary from "../config/cloudinary";
import { prisma } from "../server";
import fs from "fs";
import { Prisma } from "@prisma/client";

//create a product
export const createProduct = async (
  req: AuthenticatedRequest,
  res: Response
): Promise<void> => {
  try {
    console.log("Files received:", req.files);  // <-- check this
    console.log("Request body:", req.body);    
    const {
      name,
      brand,
      description,
      category,
      gender,
      sizes,
      colors,
      price,
      stock,
    } = req.body;

    const files = req.files as Express.Multer.File[];

    //upload all images to cloudinary
    const uploadPromises = files.map((file) =>
      cloudinary.uploader.upload(file.path, {
        folder: "ecommerce",
      })
    );

    const uploadresults = await Promise.all(uploadPromises);
    const imageUrls = uploadresults.map((result) => result.secure_url);

    const newlyCreatedProduct = await prisma.product.create({
      data: {
        name,
        brand,
        category,
        description,
        gender,
        sizes: sizes.split(","),
        colors: colors.split(","),
        price: parseFloat(price),
        stock: parseInt(stock),
        images: imageUrls,
        soldCount: 0,
        rating: 0,
      },
    });

    //clean the uploaded files
    files.forEach((file) => fs.unlinkSync(file.path));
    res.status(201).json(newlyCreatedProduct);
  } catch (e) {
    console.error(e);
    res.status(500).json({ success: false, message: "Some error occured!" });
  }
};

//fetch all products (admin side)
export const fetchAllProductsForAdmin = async (
  req: AuthenticatedRequest,
  res: Response
): Promise<void> => {
  try {
    const fetchAllProducts = await prisma.product.findMany();
    res.status(200).json(fetchAllProducts);
  } catch (e) {
    console.error(e);
    res.status(500).json({ success: false, message: "Some error occured!" });
  }
};

//get a single product
export const getProductByID = async (
  req: AuthenticatedRequest,
  res: Response
): Promise<void> => {
  try {
    const { id } = req.params;
    const product = await prisma.product.findUnique({
      where: { id },
    });

    if (!product) {
      res.status(404).json({
        success: false,
        message: "Product not found",
      });
    }

    res.status(200).json(product);
  } catch (e) {
    console.error(e);
    res.status(500).json({ success: false, message: "Some error occured!" });
  }
};
//update  a product (admin)
export const updateProduct = async (
  req: AuthenticatedRequest,
  res: Response
): Promise<void> => {
  try {
    const { id } = req.params;
    const {
      name,
      brand,
      description,
      category,
      gender,
      sizes,
      colors,
      price,
      stock,
      rating,
    } = req.body;

    console.log("Update request body:", req.body);
    console.log("Product ID:", id);

    const updateData: any = {};

    // String fields - accept if provided and not just whitespace
    if (name !== undefined && name !== null && String(name).trim() !== '') {
      updateData.name = String(name).trim();
    }
    if (brand !== undefined && brand !== null && String(brand).trim() !== '') {
      updateData.brand = String(brand).trim();
    }
    if (category !== undefined && category !== null && String(category).trim() !== '') {
      updateData.category = String(category).trim();
    }
    if (description !== undefined && description !== null && String(description).trim() !== '') {
      updateData.description = String(description).trim();
    }
    if (gender !== undefined && gender !== null && String(gender).trim() !== '') {
      updateData.gender = String(gender).trim();
    }

    // Array fields - handle both string (comma-separated) and array inputs
    if (sizes !== undefined && sizes !== null) {
      let sizesArray: string[] = [];
      
      if (typeof sizes === 'string' && sizes.trim() !== '') {
        sizesArray = sizes.split(",").map((s) => s.trim()).filter(Boolean);
      } else if (Array.isArray(sizes)) {
        sizesArray = sizes.map((s) => String(s).trim()).filter(Boolean);
      }
      
      if (sizesArray.length > 0) {
        updateData.sizes = sizesArray;
      }
    }

    if (colors !== undefined && colors !== null) {
      let colorsArray: string[] = [];
      
      if (typeof colors === 'string' && colors.trim() !== '') {
        colorsArray = colors.split(",").map((c) => c.trim()).filter(Boolean);
      } else if (Array.isArray(colors)) {
        colorsArray = colors.map((c) => String(c).trim()).filter(Boolean);
      }
      
      if (colorsArray.length > 0) {
        updateData.colors = colorsArray;
      }
    }

    // Number fields
    if (price !== undefined && price !== null && String(price).trim() !== '') {
      const parsedPrice = parseFloat(String(price));
      if (!isNaN(parsedPrice) && parsedPrice >= 0) {
        updateData.price = parsedPrice;
      }
    }

    if (stock !== undefined && stock !== null && String(stock).trim() !== '') {
      const parsedStock = parseInt(String(stock));
      if (!isNaN(parsedStock) && parsedStock >= 0) {
        updateData.stock = parsedStock;
      }
    }

    if (rating !== undefined && rating !== null && String(rating).trim() !== '') {
      const parsedRating = parseFloat(String(rating));
      if (!isNaN(parsedRating) && parsedRating >= 0 && parsedRating <= 5) {
        updateData.rating = parsedRating;
      }
    }

    console.log("Update data prepared:", updateData);
    console.log("Number of fields to update:", Object.keys(updateData).length);

    // Check if there's anything to update
    if (Object.keys(updateData).length === 0) {
      res.status(400).json({
        success: false,
        message: "No valid fields provided for update",
      });
      return;
    }

    // Update the product
    const product = await prisma.product.update({
      where: { id },
      data: updateData,
    });

    console.log("Product updated successfully:", product.id);

    res.status(200).json({
      success: true,
      product,
      message: "Product updated successfully",
    });
  } catch (e) {
    console.error("Update product error:", e);
    
    if (e instanceof Error) {
      console.error("Error message:", e.message);
      console.error("Error stack:", e.stack);
    }
    
    res.status(500).json({ 
      success: false, 
      message: "Failed to update product",
      error: process.env.NODE_ENV === 'development' ? (e as Error).message : undefined
    });
  }
};
//delete a product (admin)
export const deleteProduct = async (
  req: AuthenticatedRequest,
  res: Response
): Promise<void> => {
  try {
    const { id } = req.params;
    await prisma.product.delete({ where: { id } });

    res
      .status(200)
      .json({ success: true, message: "Product deleted successfully" });
  } catch (e) {
    console.error(e);
    res.status(500).json({ success: false, message: "Some error occured!" });
  }
};
//fetch products with filter (client)

export const getProductsForClient = async (
  req: AuthenticatedRequest,
  res: Response
): Promise<void> => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const categories = ((req.query.categories as string) || "")
      .split(",")
      .filter(Boolean);
    const brands = ((req.query.brands as string) || "")
      .split(",")
      .filter(Boolean);
    const sizes = ((req.query.sizes as string) || "")
      .split(",")
      .filter(Boolean);
    const colors = ((req.query.colors as string) || "")
      .split(",")
      .filter(Boolean);

    const minPrice = parseFloat(req.query.minPrice as string) || 0;
    const maxPrice =
      parseFloat(req.query.maxPrice as string) || Number.MAX_SAFE_INTEGER;
    const sortBy = (req.query.sortBy as string) || "createdAt";
    const sortOrder = (req.query.sortOrder as "asc" | "desc") || "desc";

    const skip = (page - 1) * limit;

    const where: Prisma.productWhereInput = {
      AND: [
        categories.length > 0
          ? {
              category: {
                in: categories,
                mode: "insensitive",
              },
            }
          : {},
        brands.length > 0
          ? {
              brand: {
                in: brands,
                mode: "insensitive",
              },
            }
          : {},
        sizes.length > 0
          ? {
              sizes: {
                hasSome: sizes,
              },
            }
          : {},
        colors.length > 0
          ? {
              colors: {
                hasSome: colors,
              },
            }
          : {},
        {
          price: { gte: minPrice, lte: maxPrice },
        },
      ],
    };

    const [products, total] = await Promise.all([
      prisma.product.findMany({
        where,
        skip,
        take: limit,
        orderBy: {
          [sortBy]: sortOrder,
        },
      }),
      prisma.product.count({ where }),
    ]);

    console.log(
      Math.ceil(total / limit),
      total,
      limit,
      "Math.ceil(total / limit)"
    );

    res.status(200).json({
      success: true,
      products,
      currentPage: page,
      totalPages: Math.ceil(total / limit),
      totalProducts: total,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Some error occured!" });
  }
};
