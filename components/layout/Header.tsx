"use client";

import Image from "next/image";
import Link from "next/link";
import { LanguageSwitch, useLanguage } from "@/components/i18n/LanguageProvider";

export function Header() {
    const { locale } = useLanguage();
    const copy = locale === "fa"
      ? { shirts: "تیشرت‌ها", collections: "کالکشن‌ها", custom: "ساخت تیشرت", about: "درباره ما", menu: "منو" }
      : { shirts: "T-Shirts", collections: "Collections", custom: "Custom Lab", about: "About", menu: "Menu" };
    return (
        <header className="absolute inset-x-0 top-0 z-50">
            <div className="container flex h-[112px] items-center justify-between">
                <Link href="/" aria-label="Avoocado Home" className="flex items-center">
                    <Image src="/brand/avoocado-logo.svg" alt="Avoocado" width={82} height={82} priority className="h-auto w-[68px] md:w-[82px]" />
                </Link>
                <nav className="absolute left-1/2 hidden -translate-x-1/2 items-center gap-8 text-sm font-medium md:flex" aria-label="Main navigation">
                    <Link className="transition-opacity hover:opacity-50" href="/t-shirts">{copy.shirts}</Link>
                    <Link className="transition-opacity hover:opacity-50" href="/collections">{copy.collections}</Link>
                    <Link className="transition-opacity hover:opacity-50" href="/customize">{copy.custom}</Link>
                    <Link className="transition-opacity hover:opacity-50" href="/about">{copy.about}</Link>
                </nav>
                <div className="flex items-center gap-3">
                  <LanguageSwitch />
                  <Link href="/customize" className="flex items-center gap-3 text-sm font-medium md:hidden" aria-label="Open Custom Lab">
                      {copy.custom} <span aria-hidden="true">↗</span>
                  </Link>
                  <button type="button" className="hidden items-center gap-3 text-sm font-medium md:flex" aria-label="Open menu">
                      {copy.menu} <span className="flex flex-col gap-[5px]"><span className="block h-px w-[18px] bg-current" /><span className="block h-px w-[18px] bg-current" /></span>
                  </button>
                </div>
            </div>
        </header>
    );
}
