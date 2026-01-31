import type { Metadata } from "next";
import { Plus_Jakarta_Sans } from "next/font/google";
import "./globals.css";
import { CartProvider } from "@/context/CartContext";
import { AuthProvider } from "@/context/AuthContext";
import { WishlistProvider } from "@/context/WishlistContext";

import { FlyToCartProvider } from "@/context/FlyToCartContext";
import NextTopLoader from 'nextjs-toploader';
import { MobileNav } from "@/components/layout/MobileNav";
import { getCategories } from "@/lib/api";

const plusJakartaSans = Plus_Jakarta_Sans({
  subsets: ["latin"],
  variable: "--font-plus-jakarta",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Daily Fresh | Premium Grocery Shopping",
  description: "Fresh produce delivered from farm to your doorstep.",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const categories = await getCategories();

  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link href="https://fonts.googleapis.com/icon?family=Material+Icons+Round" rel="stylesheet" />
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=0" />
      </head>
      <body
        suppressHydrationWarning={true}
        className={`${plusJakartaSans.variable} font-sans antialiased bg-gray-50 dark:bg-[#0F172A] text-slate-900 dark:text-slate-100 transition-colors duration-300`}
      >
        <AuthProvider>
          <WishlistProvider>
            <CartProvider>
              <FlyToCartProvider>
                <NextTopLoader color="#22C55E" showSpinner={false} />
                {children}
                <MobileNav categories={categories} />
              </FlyToCartProvider>
            </CartProvider>
          </WishlistProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
