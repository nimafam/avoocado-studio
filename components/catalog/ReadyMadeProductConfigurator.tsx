"use client";

import Image from "next/image";
import { useMemo, useState } from "react";
import { OrderCheckout } from "@/components/customizer/OrderCheckout";
import { useLanguage } from "@/components/i18n/LanguageProvider";
import type { PublicProduct, PublicVariant } from "@/lib/catalog/cloudflare-repository";

type Dimension = "fitId" | "materialId" | "sizeId" | "colorId";
type Placement = "left" | "right" | "center" | "large" | "lower" | "upper";
const validPlacements: Placement[] = ["left", "right", "center", "large", "lower", "upper"];
const placementClasses: Record<Placement, string> = { left: "left-[37%] top-[34%] size-[9%]", right: "right-[37%] top-[34%] size-[9%]", center: "left-1/2 top-[39%] size-[17%] -translate-x-1/2", large: "left-1/2 top-[26%] size-[34%] -translate-x-1/2", lower: "left-1/2 top-[55%] size-[14%] -translate-x-1/2", upper: "left-1/2 top-[29%] size-[14%] -translate-x-1/2" };

function uniqueOptions<T>(variants: PublicVariant[], key: Dimension, value: (variant: PublicVariant) => T) {
    return [...new Map(variants.map((variant) => [variant[key], value(variant)])).entries()];
}

function Choice({ active, disabled, children, onClick }: { active: boolean; disabled?: boolean; children: React.ReactNode; onClick: () => void }) {
    return <button type="button" disabled={disabled} aria-pressed={active} onClick={onClick} className={`border px-4 py-3 text-sm transition disabled:cursor-not-allowed disabled:opacity-30 ${active ? "border-black bg-black text-white" : "border-black/20 hover:border-black"}`}>{children}</button>;
}

export function ReadyMadeProductConfigurator({ product, variants }: { product: PublicProduct; variants: PublicVariant[] }) {
    const { locale } = useLanguage(); const fa = locale === "fa";
    const firstAvailable = variants.find((variant) => variant.stockQuantity > 0) ?? variants[0];
    const [selected, setSelected] = useState(firstAvailable);
    const [side, setSide] = useState<"front" | "back">("front");
    const placements = product.placements?.split(",").filter((value): value is Placement => validPlacements.includes(value as Placement)) ?? [];
    const placement = placements.includes("center") ? "center" : placements[0] ?? "center";
    const fits = useMemo(() => uniqueOptions(variants, "fitId", (item) => fa ? item.fitNameFa : item.fitNameEn), [variants, fa]);
    const materials = useMemo(() => uniqueOptions(variants, "materialId", (item) => fa ? item.materialNameFa : item.materialNameEn), [variants, fa]);
    const sizes = useMemo(() => uniqueOptions(variants, "sizeId", (item) => item.sizeLabel), [variants]);
    const colors = useMemo(() => uniqueOptions(variants, "colorId", (item) => ({ name: fa ? item.colorNameFa : item.colorNameEn, hex: item.colorHex })), [variants, fa]);

    function choose(field: Dimension, value: string) {
        const exact = variants.find((variant) => variant[field] === value && variant.stockQuantity > 0 && (["fitId", "materialId", "sizeId", "colorId"] as Dimension[]).every((key) => key === field || variant[key] === selected[key]));
        setSelected(exact ?? variants.find((variant) => variant[field] === value && variant.stockQuantity > 0) ?? variants.find((variant) => variant[field] === value) ?? selected);
    }

    if (!selected) return <p className="border border-dashed border-black/20 p-5 text-sm text-black/45">{fa ? "هنوز تنوع قابل سفارشی برای این تیشرت ثبت نشده است." : "No purchasable variant has been added for this T-shirt yet."}</p>;
    const fit = selected.fitId === "boxy" ? "boxy" : "loose";
    const shirtSource = `/models/tshirts/colors/${fit}-fit-${selected.colorId}-${side}.webp`;
    const artworkSource = product.artworkKey?.startsWith("https://storage.avoocadostudio.com/uploads/") ? `/api/storage-image?url=${encodeURIComponent(product.artworkKey)}` : product.artworkKey;

    return <div className="grid gap-12 md:grid-cols-[1.15fr_0.85fr] md:gap-20"><section className="relative flex min-h-[600px] items-center justify-center bg-[#efeee9] p-6"><div className="relative aspect-[4/5] w-full max-w-[560px]"><Image src={shirtSource} alt={`${side} view of ${product.name}`} fill priority className="object-contain" />{side === "front" && artworkSource ? <div className={`pointer-events-none absolute z-10 ${placementClasses[placement]}`}><Image src={artworkSource} alt="" fill unoptimized className="object-contain" /></div> : null}</div><div className="absolute bottom-6 left-1/2 flex -translate-x-1/2 rounded-full border border-black/15 bg-white p-1"><button type="button" onClick={() => setSide("front")} className={`rounded-full px-5 py-2 text-sm ${side === "front" ? "bg-black text-white" : ""}`}>Front</button><button type="button" onClick={() => setSide("back")} className={`rounded-full px-5 py-2 text-sm ${side === "back" ? "bg-black text-white" : ""}`}>Back</button></div></section><div className="md:sticky md:top-12 md:self-start"><h1 className="text-[clamp(3.5rem,7vw,7rem)] font-bold leading-[0.88] tracking-[-0.06em]">{product.name}</h1>{product.description && <p className="mt-7 max-w-md text-base leading-7 text-black/60">{product.description}</p>}<div className="mt-8 space-y-6"><fieldset><legend className="mb-3 text-xs uppercase tracking-[.15em] text-black/45">Fit</legend><div className="grid grid-cols-2 gap-2">{fits.map(([id, label]) => <Choice key={id} active={selected.fitId === id} onClick={() => choose("fitId", id)}>{label}</Choice>)}</div></fieldset><fieldset><legend className="mb-3 text-xs uppercase tracking-[.15em] text-black/45">Fabric</legend><div className="grid grid-cols-2 gap-2">{materials.map(([id, label]) => <Choice key={id} active={selected.materialId === id} onClick={() => choose("materialId", id)}>{label}</Choice>)}</div></fieldset><fieldset><legend className="mb-3 text-xs uppercase tracking-[.15em] text-black/45">Size</legend><div className="flex flex-wrap gap-2">{sizes.map(([id, label]) => <Choice key={id} active={selected.sizeId === id} onClick={() => choose("sizeId", id)}>{label}</Choice>)}</div></fieldset><fieldset><legend className="mb-3 text-xs uppercase tracking-[.15em] text-black/45">Color — {selected.colorNameEn}</legend><div className="flex flex-wrap gap-3">{colors.map(([id, color]) => <button type="button" key={id} title={color.name} aria-label={color.name} aria-pressed={selected.colorId === id} onClick={() => choose("colorId", id)} className={`size-10 rounded-full border-2 ${selected.colorId === id ? "scale-110 border-black ring-2 ring-black/20 ring-offset-2" : "border-black/15"}`} style={{ backgroundColor: color.hex }} />)}</div></fieldset></div><div className="mt-8"><div className="mb-4 flex justify-between text-sm"><span>{selected.stockQuantity > 0 ? `${selected.stockQuantity} available` : "Out of stock"}</span><strong>{selected.price.toLocaleString("fa-IR")} تومان</strong></div>{selected.stockQuantity > 0 ? <OrderCheckout designSlug={product.slug} designName={product.name} collectionSlug={product.collectionSlug} artworkUrl={product.artworkKey} fitId={fit} colorId={selected.colorId} colorName={selected.colorNameFa} materialId={selected.materialId} materialName={selected.materialNameFa} sizeId={selected.sizeId} printSide="front" placementId={placement} unitPrice={selected.price} variantSku={selected.sku} maxQuantity={selected.stockQuantity} /> : <button disabled className="w-full bg-black py-5 text-sm text-white opacity-35">Out of stock</button>}</div></div></div>;
}
