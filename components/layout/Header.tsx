"use client";

import Image from "next/image";
import Link from "next/link";
import {
  LanguageSwitch,
  useLanguage,
} from "@/components/i18n/LanguageProvider";
import { useCart } from "@/components/cart/CartProvider";

export function Header() {
  const { locale } = useLanguage();
  const { items, setOpen } = useCart();
  const copy =
    locale === "fa"
      ? {
          shirts: "تیشرت‌ها",
          collections: "کالکشن‌ها",
          custom: "ساخت تیشرت",
          about: "درباره ما",
        }
      : {
          shirts: "T-Shirts",
          collections: "Collections",
          custom: "Custom Lab",
          about: "About",
        };
  return (
    <header className="absolute inset-x-0 top-0 z-50">
      <div className="container flex h-[112px] items-center justify-between">
        <Link href="/" aria-label="Avoocado Home" className="flex items-center">
          <Image
            src="/brand/avoocado-logo.svg"
            alt="Avoocado"
            width={82}
            height={82}
            priority
            className="h-auto w-[68px] md:w-[82px]"
          />
        </Link>
        <nav
          className="absolute left-1/2 hidden -translate-x-1/2 items-center gap-8 text-sm font-medium md:flex"
          aria-label="Main navigation"
        >
          <Link
            className="transition-opacity hover:opacity-50"
            href="/t-shirts"
          >
            {copy.shirts}
          </Link>
          <Link
            className="transition-opacity hover:opacity-50"
            href="/collections"
          >
            {copy.collections}
          </Link>
          <Link
            className="transition-opacity hover:opacity-50"
            href="/customize"
          >
            {copy.custom}
          </Link>
          <Link className="transition-opacity hover:opacity-50" href="/about">
            {copy.about}
          </Link>
        </nav>
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => setOpen(true)}
            className="relative grid size-10 cursor-pointer place-items-center rounded-full transition hover:bg-black/5"
            aria-label={
              locale === "fa" ? "باز کردن بگ خرید" : "Open shopping bag"
            }
          >
            <svg
              viewBox="0 0 24 24"
              className="size-5"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.7"
              aria-hidden="true"
            >
              <path d="M5.5 8.5h13l1 12h-15l1-12Z" />
              <path d="M9 9V6.5a3 3 0 0 1 6 0V9" />
            </svg>
            {items.length ? (
              <span className="absolute -right-1 -top-1 grid min-w-5 place-items-center rounded-full bg-black px-1 text-[10px] leading-5 text-white">
                {items.reduce((sum, item) => sum + item.quantity, 0)}
              </span>
            ) : null}
          </button>
          <LanguageSwitch />
          <Link
            href="/customize"
            className="flex items-center gap-3 text-sm font-medium md:hidden"
            aria-label="Open Custom Lab"
          >
            {copy.custom} <span aria-hidden="true">↗</span>
          </Link>
        </div>
      </div>
    </header>
  );
}
