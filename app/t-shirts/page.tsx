import type { Metadata } from "next";
import Link from "next/link";
import { Header } from "@/components/layout/Header";
import { SiteFooter } from "@/components/layout/SiteFooter";
import { getPublicProducts } from "@/lib/catalog/cloudflare-repository";
import { getServerLocale } from "@/lib/i18n/server";

export const metadata: Metadata = { title: "T-Shirts", description: "Original Avoocado T-shirts inspired by games, art and culture." };
export const dynamic = "force-dynamic";

export default async function TShirtsPage() {
    const products = await getPublicProducts();
    const fa = await getServerLocale() === "fa";
    const collections = [...new Map(products.map((item) => [item.collectionSlug, item.collectionName])).entries()];

    return <main><Header />
        <section className="container pb-20 pt-44 md:pb-28 md:pt-52">
            <div className="flex flex-col gap-8 border-b border-black/15 pb-12 md:flex-row md:items-end md:justify-between">
                <div><span className="text-xs font-medium uppercase tracking-[0.2em] text-[var(--color-primary)]">{fa ? "فروشگاه / همه طرح‌ها" : "Shop / All pieces"}</span><h1 className="mt-5 text-[clamp(4.5rem,11vw,12rem)] font-bold leading-[0.78] tracking-[-0.07em]">{fa ? "تیشرت‌ها" : "T-Shirts"}</h1></div>
                <p className="max-w-sm text-sm leading-6 text-black/55">{fa ? "طرح‌های اورجینال آووکادو روی جنس، استایل، رنگ و سایزی که خودت انتخاب می‌کنی." : "Original Avoocado artworks, printed on the fabric, fit, color and size you choose."}</p>
            </div>
            <nav className="flex gap-7 overflow-x-auto border-b border-black/15 py-6 text-sm" aria-label="Product collections"><span className="font-medium">{fa ? "همه" : "All"} / {String(products.length).padStart(2, "0")}</span>{collections.map(([slug, name]) => <Link href={`/collections/${slug}`} className="whitespace-nowrap text-black/45 transition hover:text-black" key={slug}>{name}</Link>)}</nav>
            {products.length ? <div className="grid gap-x-5 gap-y-14 pt-12 sm:grid-cols-2 lg:grid-cols-3">
                {products.map((product, index) => <Link href={`/t-shirts/${product.slug}`} className="group" key={`${product.id}-${product.collectionSlug}`}><div className="relative aspect-[4/5] overflow-hidden bg-[#efeee9]">{product.artworkKey ? <img src={product.artworkKey} alt={product.name} className="h-full w-full object-contain p-[14%] transition-transform duration-500 group-hover:scale-[1.03]" /> : <div className="flex h-full items-center justify-center text-xs uppercase tracking-[0.16em] text-black/35">{fa ? "تصویر به‌زودی" : "Artwork coming soon"}</div>}<span className="absolute left-4 top-4 text-xs text-black/40">{String(index + 1).padStart(2, "0")}</span></div><div className="mt-5 flex justify-between gap-4"><div><h2 className="text-xl font-medium tracking-[-0.03em]">{product.name}</h2><p className="mt-1 text-sm text-black/50">{fa ? product.collectionNameFa : product.collectionName}</p></div><div className="text-right"><span className="whitespace-nowrap text-sm font-medium">{product.price.toLocaleString(fa ? "fa-IR" : "en-US")} {fa ? "تومان" : "Toman"}</span><p className="mt-1 text-xs text-black/40">{product.variantCount ? `${product.variantCount} ${fa ? "تنوع" : "variants"}` : fa ? "گزینه‌ها به‌زودی" : "Options coming soon"}</p></div></div></Link>)}
            </div> : <div className="py-24 text-center"><p className="text-2xl font-medium">{fa ? "تیشرت‌ها به‌زودی اضافه می‌شوند." : "T-shirts are coming soon."}</p><p className="mt-3 text-sm text-black/45">{fa ? "طرح‌های منتشرشده خودکار اینجا نمایش داده می‌شوند." : "Published designs will automatically appear here."}</p></div>}
        </section><SiteFooter /></main>;
}
