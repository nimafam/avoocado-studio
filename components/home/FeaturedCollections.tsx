"use client";

import Link from "next/link";
import { useLanguage } from "@/components/i18n/LanguageProvider";

import type { PublicCollection } from "@/lib/catalog/cloudflare-repository";

const placeholderTones = [
    "bg-[#d7ff46]",
    "bg-[#a9c9b8]",
    "bg-[#ff775f]",
    "bg-[#c7b8ff]",
];

export function FeaturedCollections({ collections }: { collections: PublicCollection[] }) {
    const { locale } = useLanguage(); const fa = locale === "fa";
    const featuredCollections = collections.slice(0, 4);
    return (
        <section className="flex h-[100svh] items-center">
            <div className="container">
                <div className="mb-12 flex items-end justify-between md:mb-16">
                    <div>
                        <span className="mb-4 block text-xs font-medium uppercase tracking-[0.2em] text-[var(--color-primary)]">
                            {fa ? "کاوش" : "Explore"}
                        </span>
                        <h2 className="text-[clamp(3rem,7vw,7rem)] font-bold leading-[0.9] tracking-[-0.055em]">
                            {fa ? "کالکشن‌ها" : "Collections"}
                        </h2>
                    </div>
                    <span className="hidden text-sm md:block">{fa ? "۰۴ / منتخب" : "04 / Featured"}</span>
                </div>

                <div className="border-t border-black/15">
                    {featuredCollections.map((collection, index) => (
                        <Link
                            key={collection.id}
                            href={`/collections/${collection.slug}`}
                            className="group grid grid-cols-[48px_1fr_auto] items-center gap-5 border-b border-black/15 py-6 transition-[padding] duration-500 ease-[var(--ease-standard)] hover:px-4 md:grid-cols-[80px_1fr_280px_auto] md:py-7"
                        >
                            <span className="text-xs font-medium text-black/45">
                                {String(index + 1).padStart(2, "0")}
                            </span>

                            <div>
                                <span className="mb-1 hidden text-xs uppercase tracking-[0.12em] text-black/45 md:block">
                                    {fa ? `${collection.designCount.toLocaleString("fa-IR")} طرح` : `${collection.designCount} designs`}
                                </span>
                                <h3 className="text-2xl font-medium tracking-[-0.035em] md:text-4xl">
                                    {fa ? collection.nameFa : collection.nameEn}
                                </h3>
                            </div>

                            <div
                                aria-hidden="true"
                                className={`relative hidden h-16 overflow-hidden rounded-sm ${placeholderTones[index]} md:block`}
                            >
                                {collection.coverImageKey ? <div className="absolute inset-0 bg-cover bg-center" style={{ backgroundImage: `url(${JSON.stringify(collection.coverImageKey)})` }} /> : <div className="absolute -right-5 -top-10 size-28 rounded-full border border-black/20 transition-transform duration-500 ease-[var(--ease-standard)] group-hover:scale-125" />}
                                <div className="absolute bottom-3 left-3 h-px w-12 bg-black/35 transition-[width] duration-500 group-hover:w-24" />
                                <span className="absolute bottom-2.5 right-3 text-[10px] font-medium uppercase tracking-[0.16em] text-black/55">
                                    {fa ? "تصویر به‌زودی" : "Artwork soon"}
                                </span>
                            </div>

                            <span className="text-xl transition-transform duration-500 ease-[var(--ease-standard)] group-hover:translate-x-2">
                                →
                            </span>
                        </Link>
                    ))}
                </div>

                <div className="mt-8 flex justify-end">
                    <Link href="/collections" className="inline-flex items-center gap-3 text-sm font-medium">
                        {fa ? "مشاهده همه کالکشن‌ها" : "View all collections"}
                        <span>↗</span>
                    </Link>
                </div>
            </div>
        </section>
    );
}
