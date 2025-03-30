"use client";

import { AdminLoginProvider } from "./providers/adminLoginProvider";
import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

import Navbar from "./_Components/NavBar/navbar";
import "./globals.css";

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  
  const hideNavbarRoutes = ["/"];

  return (
    <html lang="en">
      <body>
        <AdminLoginProvider>
          <div >
            {!hideNavbarRoutes.includes(pathname) && <Navbar />}
            {children}
          </div>
        </AdminLoginProvider>
      </body>
    </html>
  );
}

