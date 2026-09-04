import type { Metadata } from "next";
import Link from "next/link";
import { Header } from "@/components/layout/Header";
import { SiteFooter } from "@/components/layout/SiteFooter";
import { getPublicCollections } from "@/lib/catalog/cloudflare-repository";
import { getServerLocale } from "@/lib/i18n/server";

const tones = ["#d7ff46", "#b9d1c3", "#ff775f", "#c7b8ff"];
export const metadata: Metadata = { title: "Collections", description: "Explore the original collections of Avoocado Studio." };
export const dynamic = "force-dynamic";

export default async function CollectionsPage() {
    const collections = await getPublicCollections();
    const fa = await getServerLocale() === "fa";

    return <main><Header /><section className="container pb-24 pt-44 md:pt-52"><span className="text-xs font-medium uppercase tracking-[0.2em] text-[var(--color-primary)]">{fa ? "آرشیو / ۱۴۰۵" : "Archive / 2026"}</span><h1 className="mt-6 text-[clamp(4.5rem,11vw,12rem)] font-bold leading-[0.78] tracking-[-0.07em]">{fa ? "کالکشن‌ها" : "Collections"}</h1><div className="mt-16 border-t border-black/15">
        {collections.map((collection, index) => <Link href={`/collections/${collection.slug}`} className="group grid gap-7 border-b border-black/15 py-10 md:grid-cols-[80px_1.2fr_1fr_80px] md:items-center" key={collection.id}><span className="text-xs text-black/40">{String(index + 1).padStart(2, "0")}</span><div><span className="text-xs uppercase tracking-[0.15em] text-black/40">{fa ? collection.nameEn : collection.nameFa} / {collection.designCount} {fa ? "طرح" : "designs"}</span><h2 className="mt-2 text-[clamp(2.5rem,5vw,5.5rem)] font-medium leading-none tracking-[-0.055em]">{fa ? collection.nameFa : collection.nameEn}</h2></div><div className="relative h-28 overflow-hidden bg-cover bg-center" style={{ backgroundColor: tones[index % tones.length], ...(collection.coverImageKey ? { backgroundImage: `url(${JSON.stringify(collection.coverImageKey)})` } : {}) }}><div className="absolute inset-0 bg-black/5 transition-colors group-hover:bg-transparent" />{!collection.coverImageKey && <span className="absolute bottom-4 right-4 text-[10px] uppercase tracking-[0.15em] text-black/50">{fa ? "تصویر به‌زودی" : "Cover coming soon"}</span>}</div><span className="text-right text-2xl transition-transform group-hover:translate-x-2">→</span></Link>)}
        {!collections.length && <div className="py-16 text-sm text-black/50">{fa ? "هنوز کالکشن فعالی منتشر نشده است." : "No active collections are available yet."}</div>}
    </div></section><SiteFooter /></main>;
}
