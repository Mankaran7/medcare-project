"use client";

import { usePathname } from "next/navigation";
import Navbar from "./_Components/NavBar/navbar";
import "./globals.css";

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  
  const hideNavbarRoutes = ["/"];

  return (
    <html lang="en">
      <body>
      
        {!hideNavbarRoutes.includes(pathname) && <Navbar />}
        {children}
      </body>
    </html>
  );
}