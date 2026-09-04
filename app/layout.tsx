import "@fontsource/ubuntu/300.css";
import "@fontsource/ubuntu/400.css";
import "@fontsource/ubuntu/500.css";
import "@fontsource/ubuntu/700.css";

import type { Metadata } from "next";
import { LanguageProvider } from "@/components/i18n/LanguageProvider";
import { CartProvider } from "@/components/cart/CartProvider";

import "./globals.css";

export const metadata: Metadata = {
  title: { default: "Avoocado", template: "%s — Avoocado" },
  description: "Original apparel, objects and creative products by Avoocado.",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="fa" dir="rtl" suppressHydrationWarning>
      <body>
        <LanguageProvider>
          <CartProvider>{children}</CartProvider>
        </LanguageProvider>
      </body>
    </html>
  );
}
