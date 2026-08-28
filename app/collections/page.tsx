import type { Metadata } from "next";
import Link from "next/link";
import { Header } from "@/components/layout/Header";
import { SiteFooter } from "@/components/layout/SiteFooter";
import { featuredCollections } from "@/data/catalog/collections";

const tones = ["#d7ff46", "#b9d1c3", "#ff775f", "#c7b8ff"];
export const metadata: Metadata = { title: "Collections", description: "Explore the original collections of Avoocado Studio." };

export default function CollectionsPage() {
    return <main><Header /><section className="container pb-24 pt-44 md:pt-52"><span className="text-xs font-medium uppercase tracking-[0.2em] text-[var(--color-primary)]">Archive / 2026</span><h1 className="mt-6 text-[clamp(4.5rem,11vw,12rem)] font-bold leading-[0.78] tracking-[-0.07em]">Collections</h1><div className="mt-16 border-t border-black/15">
        {featuredCollections.map((collection, index) => <Link href={`/collections/${collection.slug}`} className="group grid gap-7 border-b border-black/15 py-10 md:grid-cols-[80px_1.2fr_1fr_80px] md:items-center" key={collection.id}><span className="text-xs text-black/40">{collection.index}</span><div><span className="text-xs uppercase tracking-[0.15em] text-black/40">{collection.eyebrow}</span><h2 className="mt-2 text-[clamp(2.5rem,5vw,5.5rem)] font-medium leading-none tracking-[-0.055em]">{collection.name}</h2></div><div className="relative h-28 overflow-hidden" style={{ backgroundColor: tones[index] }}><div className="absolute -right-8 -top-16 size-44 rounded-full border border-black/20 transition-transform duration-500 group-hover:scale-125" /><span className="absolute bottom-4 right-4 text-[10px] uppercase tracking-[0.15em] text-black/50">Visual placeholder</span></div><span className="text-right text-2xl transition-transform group-hover:translate-x-2">→</span></Link>)}
    </div></section><SiteFooter /></main>;
}
