import type { Metadata } from "next";
import Link from "next/link";
import { ArtworkPlaceholder } from "@/components/catalog/ArtworkPlaceholder";
import { Header } from "@/components/layout/Header";
import { SiteFooter } from "@/components/layout/SiteFooter";
import { products } from "@/data/catalog/products";

export const metadata: Metadata = { title: "T-Shirts", description: "Original Avoocado T-shirts inspired by games, art and culture." };

export default function TShirtsPage() {
    return <main><Header />
        <section className="container pb-20 pt-44 md:pb-28 md:pt-52">
            <div className="flex flex-col gap-8 border-b border-black/15 pb-12 md:flex-row md:items-end md:justify-between">
                <div><span className="text-xs font-medium uppercase tracking-[0.2em] text-[var(--color-primary)]">Shop / All pieces</span><h1 className="mt-5 text-[clamp(4.5rem,11vw,12rem)] font-bold leading-[0.78] tracking-[-0.07em]">T-Shirts</h1></div>
                <p className="max-w-sm text-sm leading-6 text-black/55">Original studio graphics on comfortable everyday foundations. The artwork is temporary; the product system is ready.</p>
            </div>
            <div className="flex gap-7 overflow-x-auto border-b border-black/15 py-6 text-sm"><span className="font-medium">All / {products.length.toString().padStart(2, "0")}</span>{[...new Set(products.map((item) => item.collection))].map((name) => <span className="whitespace-nowrap text-black/45" key={name}>{name}</span>)}</div>
            <div className="grid gap-x-5 gap-y-14 pt-12 sm:grid-cols-2 lg:grid-cols-3">
                {products.map((product, index) => <Link href={`/t-shirts/${product.slug}`} className="group" key={product.slug}><ArtworkPlaceholder tone={product.tone} mark={product.mark} index={`0${index + 1}`} compact /><div className="mt-5 flex justify-between gap-4"><div><h2 className="text-xl font-medium tracking-[-0.03em]">{product.name}</h2><p className="mt-1 text-sm text-black/50">{product.collection}</p></div><span className="text-sm font-medium">${product.price}</span></div></Link>)}
            </div>
        </section><SiteFooter /></main>;
}
