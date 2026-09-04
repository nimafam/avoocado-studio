"use client";

import Link from "next/link";
import { LanguageSwitch, useLanguage } from "@/components/i18n/LanguageProvider";

export function SiteFooter() {
    const { locale } = useLanguage();
    const fa = locale === "fa";
    return (
        <footer className="bg-black pb-8 pt-20 text-white">
            <div className="container">
                <div className="grid gap-14 border-b border-white/20 pb-16 md:grid-cols-[2fr_1fr_1fr]">
                    <p className="max-w-xl text-[clamp(2.4rem,5vw,5.5rem)] font-medium leading-[0.92] tracking-[-0.05em]">{fa ? "یک چیز متفاوت بپوش." : "Wear something different."}</p>
                    <div className="flex flex-col items-start gap-4 text-sm"><span className="text-xs uppercase tracking-[0.16em] text-white/40">{fa ? "کاوش" : "Explore"}</span><Link href="/t-shirts">{fa ? "تیشرت‌ها" : "T-Shirts"}</Link><Link href="/collections">{fa ? "کالکشن‌ها" : "Collections"}</Link><Link href="/about">{fa ? "درباره ما" : "About"}</Link></div>
                    <div className="flex flex-col items-start gap-4 text-sm"><span className="text-xs uppercase tracking-[0.16em] text-white/40">{fa ? "ارتباط" : "Contact"}</span><a href="https://instagram.com" target="_blank" rel="noreferrer">Instagram ↗</a><a href="mailto:hello@avoocado.studio">Email ↗</a><LanguageSwitch inverted /></div>
                </div>
                <div className="flex justify-between pt-7 text-xs text-white/45"><span>© 2026 Avoocado Studio</span><Link href="/">{fa ? "بازگشت به خانه ↑" : "Back home ↑"}</Link></div>
            </div>
        </footer>
    );
}
