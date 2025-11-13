import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";
import CommonLayout from "@/components/common/layout";
import AIStyleAssistant from "@/components/ai/AIStyleAssistant"; // ✅ ADD THIS LINE

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

// ✅ CHANGE THIS - Update metadata
export const metadata: Metadata = {
  title: "ShopVibe - Your Style, Your Vibe, Delivered Daily",
  description: "Fashion e-commerce platform for clothing and accessories. Shop your style today!",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <CommonLayout>{children}</CommonLayout>
        <Toaster />
        <AIStyleAssistant /> {/* ✅ ADD THIS LINE - Floating chat button appears on all pages */}
      </body>
    </html>
  );
}
