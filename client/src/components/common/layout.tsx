"use client";

import { usePathname } from "next/navigation";
import Header from "../user/header";
import Footer from "./footer"; // ✅ ADD THIS IMPORT

const pathsNotToShowHeaders = ["/auth", "/super-admin"];

function CommonLayout({ children }: { children: React.ReactNode }) {
  const pathName = usePathname();

  const showHeader = !pathsNotToShowHeaders.some((currentPath) =>
    pathName.startsWith(currentPath)
  );

  return (
    <div className="min-h-screen bg-white flex flex-col">
      {showHeader && <Header />}
      <main className="flex-1">{children}</main>
      {/* ✅ ADD FOOTER HERE */}
      {showHeader && <Footer />}
    </div>
  );
}

export default CommonLayout;