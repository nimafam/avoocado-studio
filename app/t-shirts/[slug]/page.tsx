import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArtworkPlaceholder } from "@/components/catalog/ArtworkPlaceholder";
import { Header } from "@/components/layout/Header";
import { SiteFooter } from "@/components/layout/SiteFooter";
import { products } from "@/data/catalog/products";

export const dynamicParams = false;
export function generateStaticParams() { return products.map(({ slug }) => ({ slug })); }
export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> { const { slug } = await params; const product = products.find((item) => item.slug === slug); return product ? { title: product.name, description: product.description } : {}; }

export default async function ProductPage({ params }: { params: Promise<{ slug: string }> }) {
    const { slug } = await params; const product = products.find((item) => item.slug === slug); if (!product) notFound();
    return <main><Header /><section className="container grid gap-12 pb-24 pt-40 md:grid-cols-[1.15fr_0.85fr] md:gap-20 md:pt-44"><ArtworkPlaceholder tone={product.tone} mark={product.mark} />
        <div className="md:sticky md:top-12 md:self-start"><Link href={`/collections/${product.collectionSlug}`} className="text-xs font-medium uppercase tracking-[0.18em] text-black/45">{product.collection} ↗</Link><h1 className="mt-6 text-[clamp(3.5rem,7vw,7rem)] font-bold leading-[0.88] tracking-[-0.06em]">{product.name}</h1><p className="mt-7 max-w-md text-base leading-7 text-black/60">{product.description}</p><div className="mt-10 border-y border-black/15 py-6"><div className="flex justify-between"><span>Studio edition</span><span className="font-medium">${product.price}</span></div></div><div className="mt-8"><span className="text-xs font-medium uppercase tracking-[0.15em] text-black/45">Select size</span><div className="mt-4 grid grid-cols-4 gap-2">{["S", "M", "L", "XL"].map((size) => <button className="border border-black/20 py-4 transition hover:bg-black hover:text-white" key={size}>{size}</button>)}</div></div><button className="mt-5 w-full bg-[var(--color-primary)] py-5 text-sm font-medium transition hover:bg-black hover:text-white">Add to bag — ${product.price}</button><div className="mt-8 grid grid-cols-2 gap-5 text-xs leading-5 text-black/50"><p>Printed in small batches with durable inks.</p><p>Size exchange available on unworn pieces.</p></div></div>
    </section><SiteFooter /></main>;
}
