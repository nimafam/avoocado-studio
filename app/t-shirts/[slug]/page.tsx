import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
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
    const sizes = [...new Map(variants.map((item) => [item.sizeId, item.sizeLabel])).entries()];
    const fits = [...new Map(variants.map((item) => [item.fitId, item.fitNameEn])).entries()];
    const colors = [...new Map(variants.map((item) => [item.colorId, { name: item.colorNameEn, hex: item.colorHex }])).entries()];
    const materials = [...new Map(variants.map((item) => [item.materialId, item.materialNameEn])).entries()];

    return <main><Header /><section className="container grid gap-12 pb-24 pt-40 md:grid-cols-[1.15fr_0.85fr] md:gap-20 md:pt-44"><div className="flex aspect-[4/5] items-center justify-center overflow-hidden bg-[#efeee9]">{product.artworkKey ? <img src={product.artworkKey} alt={product.name} className="h-full w-full object-contain p-[12%]" /> : <span className="text-xs uppercase tracking-[0.16em] text-black/35">Artwork coming soon</span>}</div>
        <div className="md:sticky md:top-12 md:self-start"><Link href={`/collections/${product.collectionSlug}`} className="text-xs font-medium uppercase tracking-[0.18em] text-black/45">{product.collectionName} ↗</Link><h1 className="mt-6 text-[clamp(3.5rem,7vw,7rem)] font-bold leading-[0.88] tracking-[-0.06em]">{product.name}</h1>{product.description && <p className="mt-7 max-w-md text-base leading-7 text-black/60">{product.description}</p>}<div className="mt-10 border-y border-black/15 py-6"><div className="flex justify-between"><span>DTF print</span><span className="font-medium">{product.price.toLocaleString("fa-IR")} تومان</span></div></div>
        {variants.length ? <div className="mt-8 space-y-6"><div><span className="text-xs font-medium uppercase tracking-[0.15em] text-black/45">Available fits</span><p className="mt-2 text-sm">{fits.map(([, label]) => label).join(" · ")}</p></div><div><span className="text-xs font-medium uppercase tracking-[0.15em] text-black/45">Available materials</span><p className="mt-2 text-sm">{materials.map(([, label]) => label).join(" · ")}</p></div><div><span className="text-xs font-medium uppercase tracking-[0.15em] text-black/45">Available sizes</span><div className="mt-3 flex flex-wrap gap-2">{sizes.map(([id, label]) => <span className="border border-black/20 px-4 py-3 text-sm" key={id}>{label}</span>)}</div></div><div><span className="text-xs font-medium uppercase tracking-[0.15em] text-black/45">Available colors</span><div className="mt-3 flex flex-wrap gap-3">{colors.map(([id, color]) => <span title={color.name} aria-label={color.name} className="size-10 rounded-full border border-black/20" style={{ backgroundColor: color.hex }} key={id} />)}</div></div><p className="border border-dashed border-black/20 p-4 text-sm leading-6 text-black/45">Interactive selection and ordering will be enabled in the next step.</p></div> : <p className="mt-8 border border-dashed border-black/20 p-5 text-sm leading-6 text-black/45">This design is published, but its purchasable variants have not been added yet.</p>}
        </div>
    </section><SiteFooter /></main>;
}
