import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ReadyMadeProductConfigurator } from "@/components/catalog/ReadyMadeProductConfigurator";
import { Header } from "@/components/layout/Header";
import { SiteFooter } from "@/components/layout/SiteFooter";
import { getPublicProduct } from "@/lib/catalog/cloudflare-repository";

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
    const { slug } = await params;
    const result = await getPublicProduct(slug);
    return result ? { title: result.product.name, description: result.product.description || `${result.product.name} by Avoocado Studio.` } : {};
}

export default async function ProductPage({ params }: { params: Promise<{ slug: string }> }) {
    const { slug } = await params;
    const result = await getPublicProduct(slug);
    if (!result) notFound();
    const { product, variants } = result;
    return <main><Header /><section className="container pb-24 pt-40 md:pt-44"><Link href={`/collections/${product.collectionSlug}`} className="mb-8 inline-block text-xs font-medium uppercase tracking-[0.18em] text-black/45">{product.collectionName} ↗</Link><ReadyMadeProductConfigurator product={product} variants={variants} /></section><SiteFooter /></main>;
}
