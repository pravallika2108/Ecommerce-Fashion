import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    domains: ["res.cloudinary.com"],
  },
  async headers() {
    return [
      {
        source: "/(.*)", // apply to all routes
        headers: [
          {
            key: "Access-Control-Allow-Credentials",
            value: "true",
          },
          {
            key: "Access-Control-Allow-Origin",
            value: "https://ecommerce-fashion-1.onrender.com", // 👈 must match your frontend domain (NOT backend)
          },
          {
            key: "Access-Control-Allow-Methods",
            value: "GET, POST, PUT, DELETE, OPTIONS",
          },
          {
            key: "Access-Control-Allow-Headers",
            value: "Content-Type, Authorization",
          },
        ],
      },
    ];
  },
};

export default nextConfig;
