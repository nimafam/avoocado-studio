import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArtworkPlaceholder } from "@/components/catalog/ArtworkPlaceholder";
import { Header } from "@/components/layout/Header";
import { SiteFooter } from "@/components/layout/SiteFooter";
import { featuredCollections } from "@/data/catalog/collections";
import { products } from "@/data/catalog/products";

const tones: Record<string, string> = { boardgame: "#d7ff46", "iran-topography": "#b9d1c3", "pop-art": "#ff775f", "original-art": "#c7b8ff" };
export const dynamicParams = false;
export function generateStaticParams() { return featuredCollections.map(({ slug }) => ({ slug })); }
export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> { const { slug } = await params; const collection = featuredCollections.find((item) => item.slug === slug); return collection ? { title: collection.name, description: collection.description } : {}; }

export default async function CollectionPage({ params }: { params: Promise<{ slug: string }> }) {
    const { slug } = await params; const collection = featuredCollections.find((item) => item.slug === slug); if (!collection) notFound(); const items = products.filter((item) => item.collectionSlug === slug); const fallback = products.slice(0, 3);
    return <main><Header /><section className="container pb-20 pt-44 md:pt-52"><div className="grid gap-12 md:grid-cols-[1.1fr_0.9fr] md:items-end"><div><span className="text-xs font-medium uppercase tracking-[0.2em] text-[var(--color-primary)]">Collection / {collection.index}</span><h1 className="mt-6 text-[clamp(4rem,9vw,10rem)] font-bold leading-[0.8] tracking-[-0.07em]">{collection.name}</h1></div><p className="max-w-md text-base leading-7 text-black/55">{collection.description}</p></div><div className="relative mt-16 aspect-[16/7] overflow-hidden" style={{ backgroundColor: tones[slug] }}><div className="absolute left-1/2 top-1/2 size-[42%] -translate-x-1/2 -translate-y-1/2 rounded-full bg-black" /><span className="absolute bottom-6 right-6 text-xs uppercase tracking-[0.18em]">Campaign placeholder</span></div></section><section className="container pb-28"><div className="mb-10 flex justify-between border-b border-black/15 pb-5"><span className="text-sm">Pieces in this collection</span><span className="text-sm text-black/45">{items.length || fallback.length} items</span></div><div className="grid gap-x-5 gap-y-14 sm:grid-cols-2 lg:grid-cols-3">{(items.length ? items : fallback).map((product) => <Link href={`/t-shirts/${product.slug}`} className="group" key={product.slug}><ArtworkPlaceholder tone={product.tone} mark={product.mark} compact /><div className="mt-5 flex justify-between"><div><h2 className="text-xl font-medium">{product.name}</h2><p className="mt-1 text-sm text-black/50">{product.collection}</p></div><span className="text-sm font-medium">${product.price}</span></div></Link>)}</div></section><SiteFooter /></main>;
}
