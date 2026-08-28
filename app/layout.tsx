import "@fontsource/ubuntu/300.css";
import "@fontsource/ubuntu/400.css";
import "@fontsource/ubuntu/500.css";
import "@fontsource/ubuntu/700.css";

import type { Metadata } from "next";

import "./globals.css";

export const metadata: Metadata = {
  title: { default: "Avoocado", template: "%s — Avoocado" },
  description: "Original apparel, objects and creative products by Avoocado.",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="en"><body>{children}</body></html>;
}
