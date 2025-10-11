// src/server.ts or src/index.ts (your main Express file)
import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";

const app = express();

// CRITICAL: CORS must come BEFORE routes
const allowedOrigins = [
  "http://localhost:3000",
  "https://ecommerce-fashion-1.onrender.com", // Your frontend URL
  process.env.FRONTEND_URL,
].filter(Boolean);

app.use(
  cors({
    origin: function (origin, callback) {
      // Allow requests with no origin (like mobile apps or curl requests)
      if (!origin) return callback(null, true);
      
      if (allowedOrigins.indexOf(origin) !== -1) {
        callback(null, true);
      } else {
        console.log("Blocked by CORS:", origin);
        callback(new Error("Not allowed by CORS"));
      }
    },
    credentials: true, // THIS IS CRITICAL FOR COOKIES!
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization", "Cookie"],
    exposedHeaders: ["Set-Cookie"],
  })
);

// Parse cookies
app.use(cookieParser());

// Parse JSON bodies
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Your routes here
app.use("/api/auth", authRoutes);

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
