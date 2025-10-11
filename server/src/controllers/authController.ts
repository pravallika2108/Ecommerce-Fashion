// src/controllers/authController.ts (or wherever your login is)
import { prisma } from "../server";
import { Request, Response } from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

function generateToken(userId: string, email: string, role: string) {
  const accessToken = jwt.sign(
    { userId, email, role },
    process.env.JWT_SECRET!,
    { expiresIn: "15m" }
  );

  const refreshToken = jwt.sign(
    { userId, email, role },
    process.env.JWT_REFRESH_SECRET || process.env.JWT_SECRET!,
    { expiresIn: "7d" }
  );

  return { accessToken, refreshToken };
}

export const login = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: "Email and password are required" });
    }

    const user = await prisma.user.findUnique({ where: { email } });

    if (!user) {
      return res.status(401).json({ error: "Invalid credentials" });
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      return res.status(401).json({ error: "Invalid credentials" });
    }

    const { accessToken, refreshToken } = generateToken(
      user.id,
      user.email,
      user.role
    );

    // CRITICAL: Check NODE_ENV
    const isProduction = process.env.NODE_ENV === "production";
    
    console.log("=== BACKEND LOGIN DEBUG ===");
    console.log("NODE_ENV:", process.env.NODE_ENV);
    console.log("isProduction:", isProduction);
    console.log("Setting cookies with sameSite:", isProduction ? "none" : "lax");

    // Set cookies with correct settings
    res.cookie("accessToken", accessToken, {
      httpOnly: true,
      secure: isProduction, // true in production
      sameSite: isProduction ? "none" : "lax", // "none" requires secure: true
      maxAge: 15 * 60 * 1000, // 15 minutes
      path: "/",
    });

    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      secure: isProduction,
      sameSite: isProduction ? "none" : "lax",
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
      path: "/",
    });

    console.log("Cookies set, sending response");

    return res.status(200).json({
      success: true,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
      accessToken, // Also send in body for localStorage backup
      refreshToken, // Also send in body
    });
  } catch (error) {
    console.error("Login error:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
};
