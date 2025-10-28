import { prisma } from "../server";
import { Request, Response } from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { v4 as uuidv4 } from "uuid";

function generateToken(userId: string, email: string, role: string) {
  const accessToken = jwt.sign(
    {
      userId,
      email,
      role,
    },
    process.env.JWT_SECRET!,
    { expiresIn: "60m" }
  );
  const refreshToken = uuidv4();
  return { accessToken, refreshToken };
}

 function setTokens(
  res: Response,
  accessToken: string,
  refreshToken: string
) {
  // Cookie options for cross-origin
  const isProduction = process.env.NODE_ENV === "production";
  
  const cookieOptions = {
    httpOnly: true,
    secure: isProduction,
    sameSite: (isProduction ? "none" : "lax") as "none" | "lax" | "strict",
    path: "/",
  };

  res.cookie("accessToken", accessToken, {
    ...cookieOptions,
    maxAge: 60 * 60 * 1000, // 1 hour
  });
  
  res.cookie("refreshToken", refreshToken, {
    ...cookieOptions,
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
  });
}

export const register = async (req: Request, res: Response): Promise<void> => {
  try {
    const { name, email, password } = req.body;
    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      res.status(400).json({
        success: false,
        error: "User with this email exists!",
      });
      return;
    }

    const hashedPassword = await bcrypt.hash(password, 12);
    const user = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        role: "USER",
      },
    });

    res.status(201).json({
      message: "User registered successfully",
      success: true,
      userId: user.id,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Registration failed" });
  }
};

export const login = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, password } = req.body;
    
    console.log("=== LOGIN ATTEMPT ===");
    console.log("Email:", email);
    console.log("Origin:", req.headers.origin);
    console.log("NODE_ENV:", process.env.NODE_ENV);
    
    const extractCurrentUser = await prisma.user.findUnique({
      where: { email },
    });

    if (
      !extractCurrentUser ||
      !(await bcrypt.compare(password, extractCurrentUser.password))
    ) {
      res.status(401).json({
        success: false,
        error: "Invalid credentials",
      });
      return;
    }

    // Create access and refresh tokens
    const { accessToken, refreshToken } = generateToken(
      extractCurrentUser.id,
      extractCurrentUser.email,
      extractCurrentUser.role
    );

    console.log("Tokens generated successfully");

    // Save refresh token to database
    await prisma.user.update({
      where: { id: extractCurrentUser.id },
      data: { refreshToken },
    });

    console.log("Refresh token saved to database");

    // Set cookies - THIS MUST HAPPEN BEFORE res.json()
    setTokens(res, accessToken, refreshToken);
    
    console.log("Cookies set in response");
    console.log("✅ Login successful for:", email);
    
    // Send response - tokens are in httpOnly cookies only
    res.status(200).json({
      success: true,
      message: "Login successful",
      user: {
        id: extractCurrentUser.id,
        name: extractCurrentUser.name,
        email: extractCurrentUser.email,
        role: extractCurrentUser.role,
      },
      // DO NOT include tokens in JSON - they're in cookies
    });
  } catch (error) {
    console.error("❌ Login error:", error);
    res.status(500).json({ 
      success: false,
      error: "Login failed" 
    });
  }
};

export const refreshAccessToken = async (
  req: Request,
  res: Response
): Promise<void> => {
  const refreshToken = req.cookies.refreshToken;
  
  if (!refreshToken) {
    res.status(401).json({
      success: false,
      error: "Invalid refresh token",
    });
    return;
  }

  try {
    const user = await prisma.user.findFirst({
      where: {
        refreshToken: refreshToken,
      },
    });

    if (!user) {
      res.status(401).json({
        success: false,
        error: "User not found or refresh token invalid",
      });
      return;
    }

    // Generate new tokens
    const { accessToken, refreshToken: newRefreshToken } = generateToken(
      user.id,
      user.email,
      user.role
    );

    // Update refresh token in database
    await prisma.user.update({
      where: { id: user.id },
      data: { refreshToken: newRefreshToken },
    });

    // Set new cookies
     setTokens(res, accessToken, newRefreshToken);
    
    res.status(200).json({
      success: true,
      message: "Token refreshed successfully",
      accessToken, // Include in response for frontend
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ 
      success: false,
      error: "Refresh token error" 
    });
  }
};

export const logout = async (req: Request, res: Response): Promise<void> => {
  try {
    const refreshToken = req.cookies.refreshToken;

    // Clear refresh token from database
    if (refreshToken) {
      await prisma.user.updateMany({
        where: { refreshToken },
        data: { refreshToken: null },
      });
    }

    // Clear cookies
    res.clearCookie("accessToken");
    res.clearCookie("refreshToken");
    
    res.json({
      success: true,
      message: "User logged out successfully",
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      error: "Logout failed",
    });
  }
};
