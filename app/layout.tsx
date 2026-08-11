import "./globals.css";
import type { Metadata } from "next";

import { CartProvider } from "@/components/CartContext";
import Navbar from "@/components/Navbar";

export const metadata: Metadata = {
  title: "Benkaso Collection",
  description:
    "Luxury bespoke menswear handcrafted for modern gentlemen.",
  keywords: [
    "Benkaso Collection",
    "Luxury Fashion",
    "Agbada",
    "Senator Wear",
    "Suits",
    "Kaftan",
    "African Fashion",
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="bg-[#0B0B0B] text-white antialiased">
        <CartProvider>
          <Navbar />
          {children}
        </CartProvider>
      </body>
    </html>
  );
}