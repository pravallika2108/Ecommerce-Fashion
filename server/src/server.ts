import { PrismaClient } from "@prisma/client";
import dotenv from "dotenv";
import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import authRoutes from "./routes/authRoutes";
import productRoutes from "./routes/productRoutes";
import couponRoutes from "./routes/couponRoutes";
import settingsRoutes from "./routes/settingRoutes";
import cartRoutes from "./routes/cartRoutes";
import addressRoutes from "./routes/addressRoutes";
import orderRoutes from "./routes/orderRoutes";

dotenv.config();
const PORT = process.env.PORT || 3001;
const app = express();

// ✅ CORS Configuration - CRITICAL for proxy to work
app.use(
  cors({
    origin: [
      process.env.FRONTEND_URL|| "https://ecommerce-fashion-1.onrender.com", // Frontend
      "http://localhost:3000", // Local development
    ],
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
    optionsSuccessStatus: 200,
  })
);

// ✅ Body parser middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ✅ Cookie parser
app.use(cookieParser());

// Your routes here
export const prisma = new PrismaClient();

app.use("/api/auth", authRoutes);
app.use("/api/products", productRoutes);
app.use("/api/coupon", couponRoutes);
app.use("/api/settings", settingsRoutes);
app.use("/api/cart", cartRoutes);
app.use("/api/address", addressRoutes);
app.use("/api/order", orderRoutes);

app.get("/", (req, res) => {
  res.send("Hello from E-Commerce backend");
});
// Temporary cleanup route - REMOVE after running once
app.get('/api/cleanup-database', async (req, res) => {
  try {
    console.log('Starting cleanup...');
    
    // Delete invalid cart items
    const deletedItems = await prisma.cartItem.deleteMany({
      where: {
        OR: [
          { size: '' },
          { color: '' },
        ],
      },
    });
    
    // Fix products
    const products = await prisma.product.findMany();
    let fixedCount = 0;
    
    for (const product of products) {
      const validSizes = product.sizes.filter(s => s && s.trim() !== '');
      const validColors = product.colors.filter(c => c && c.trim() !== '');
      
      if (validSizes.length === 0 || validColors.length === 0) {
        await prisma.product.update({
          where: { id: product.id },
          data: {
            sizes: validSizes.length > 0 ? validSizes : ['ONE SIZE'],
            colors: validColors.length > 0 ? validColors : ['DEFAULT'],
          },
        });
        fixedCount++;
      }
    }
    
    res.json({
      success: true,
      message: 'Cleanup complete',
      deletedCartItems: deletedItems.count,
      fixedProducts: fixedCount
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});
app.listen(PORT, () => {
  console.log(`Server is now running on port ${PORT}`);
});

process.on("SIGINT", async () => {
  await prisma.$disconnect();
  process.exit();
});
