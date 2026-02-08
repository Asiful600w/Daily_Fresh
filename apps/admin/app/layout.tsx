import type { Metadata } from "next";
import { Plus_Jakarta_Sans } from "next/font/google";
import "./globals.css";
import { CartProvider } from "@/context/CartContext";
import { AdminAuthProvider } from "@/context/AdminAuthContext";
import { WishlistProvider } from "@/context/WishlistContext";

import { FlyToCartProvider } from "@/context/FlyToCartContext";
import { ThemeProvider } from "@/context/ThemeProvider";

const plusJakartaSans = Plus_Jakarta_Sans({
  subsets: ["latin"],
  variable: "--font-plus-jakarta",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Daily Fresh | Premium Grocery Shopping",
  description: "Fresh produce delivered from farm to your doorstep.",
};



// ... (imports)

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link href="https://fonts.googleapis.com/icon?family=Material+Icons+Round" rel="stylesheet" />
      </head>
      <body
        suppressHydrationWarning={true}
        className={`${plusJakartaSans.variable} font-sans antialiased bg-gray-50 dark:bg-[#0F172A] text-slate-900 dark:text-slate-100 transition-colors duration-300`}
      >
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <AdminAuthProvider>
            <WishlistProvider>
              <CartProvider>
                <FlyToCartProvider>
                  {children}
                </FlyToCartProvider>
              </CartProvider>
            </WishlistProvider>
          </AdminAuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
