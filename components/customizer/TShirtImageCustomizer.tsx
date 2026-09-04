"use client";

import Image from "next/image";
import { useEffect, useMemo, useState } from "react";
import { products } from "@/data/catalog/products";
import { designCategories, shirtColors, shirtMaterials, shirtSizes } from "@/data/catalog/shirt-options";
import { OrderCheckout } from "@/components/customizer/OrderCheckout";
import { useLanguage } from "@/components/i18n/LanguageProvider";

type Side = "front" | "back";
type Fit = "loose" | "boxy";
type Placement = "left" | "right" | "center" | "large" | "lower" | "upper";
type CustomizerCategory = { slug: string; nameEn: string; nameFa: string };
type CustomizerArtwork = { slug: string; name: string; collectionSlug: string; artworkUrl: string | null; placements: Placement[]; mark?: string; tone?: string };

const colors = shirtColors;
const artworkCollectionBySlug: Record<string, string> = { "meeple-society": "boardgame", "critical-roll": "boardgame", "damavand-lines": "iran-mountains-topography", "tehran-elevation": "iran-cities-topography", "everyday-icon": "pop-art", "studio-sun": "original-art" };
const fallbackCategories: CustomizerCategory[] = designCategories.map(([slug, nameEn, nameFa]) => ({ slug, nameEn, nameFa }));
const fallbackArtworks: CustomizerArtwork[] = products.map((product) => ({ ...product, collectionSlug: artworkCollectionBySlug[product.slug] ?? product.collectionSlug, artworkUrl: null, placements: ["left", "right", "center", "large", "lower", "upper"] }));

const placements = [
    ["left", "Left", "left-[37%] top-[34%] size-[9%]"],
    ["right", "Right", "right-[37%] top-[34%] size-[9%]"],
    ["center", "Center", "left-1/2 top-[39%] size-[17%] -translate-x-1/2"],
    ["large", "Large center", "left-1/2 top-[26%] size-[34%] -translate-x-1/2"],
    ["lower", "Lower center", "left-1/2 top-[55%] size-[14%] -translate-x-1/2"],
    ["upper", "Upper center", "left-1/2 top-[29%] size-[14%] -translate-x-1/2"],
] as const;

function Option({ active, children, onClick }: { active: boolean; children: React.ReactNode; onClick: () => void }) {
    return <button type="button" aria-pressed={active} onClick={onClick} className={`border px-4 py-3 text-sm transition ${active ? "border-black bg-black text-white" : "border-black/20 hover:border-black"}`}>{children}</button>;
}

export function TShirtImageCustomizer() {
    const { locale } = useLanguage(); const fa = locale === "fa";
    const [viewSide, setViewSide] = useState<Side>("front");
    const [printSide, setPrintSide] = useState<Side>("front");
    const [fit, setFit] = useState<Fit>("loose");
    const [material, setMaterial] = useState(0);
    const [size, setSize] = useState(0);
    const [color, setColor] = useState(0);
    const [collection, setCollection] = useState("boardgame");
    const [artworkSlug, setArtworkSlug] = useState("meeple-society");
    const [placement, setPlacement] = useState<Placement>("center");
    const [categories, setCategories] = useState(fallbackCategories);
    const [artworks, setArtworks] = useState(fallbackArtworks);

    useEffect(() => {
        let cancelled = false;
        fetch("/api/catalog").then((response) => response.ok ? response.json() : Promise.reject()).then((data) => {
            if (cancelled || !Array.isArray(data.categories) || !Array.isArray(data.designs)) return;
            const nextCategories: CustomizerCategory[] = data.categories.map((item: { slug: string; nameEn: string; nameFa: string }) => ({ slug: item.slug, nameEn: item.nameEn, nameFa: item.nameFa }));
            const nextArtworks: CustomizerArtwork[] = data.designs.map((item: { slug: string; name: string; collectionSlug: string; artworkKey: string | null; placements: string | null }) => ({ slug: item.slug, name: item.name, collectionSlug: item.collectionSlug, artworkUrl: item.artworkKey?.startsWith("https://") ? item.artworkKey : null, placements: (item.placements?.split(",").filter((value: string) => placements.some(([id]) => id === value)) ?? ["center"]) as Placement[] }));
            setCategories(nextCategories); setArtworks(nextArtworks);
            const first = nextArtworks[0];
            if (first) { setCollection(first.collectionSlug); setArtworkSlug(first.slug); setPlacement(first.placements[0] ?? "center"); }
        }).catch(() => undefined);
        return () => { cancelled = true; };
    }, []);

    const collectionArtworks = useMemo(() => artworks.filter((item) => item.collectionSlug === collection), [artworks, collection]);
    const selectedArtwork = artworks.find((item) => item.slug === artworkSlug && item.collectionSlug === collection) ?? collectionArtworks[0] ?? null;
    const allowedPlacements = placements.filter(([id]) => selectedArtwork?.placements.includes(id) ?? false);
    const activePlacement = placements.find(([id]) => id === placement) ?? placements[2];
    const source = `/models/tshirts/colors/${fit}-fit-${colors[color][3]}-${viewSide}.webp`;

    function selectCollection(slug: string) {
        setCollection(slug); const first = artworks.find((item) => item.collectionSlug === slug); setArtworkSlug(first?.slug ?? ""); setPlacement(first?.placements[0] ?? "center");
    }
    function selectArtwork(item: CustomizerArtwork) { setArtworkSlug(item.slug); if (!item.placements.includes(placement)) setPlacement(item.placements[0] ?? "center"); }

    return <div className="grid min-h-[calc(100svh-112px)] lg:grid-cols-[1.35fr_0.65fr]">
        <section className="relative flex min-h-[620px] items-center justify-center bg-[#efeee9] px-6 pb-28 pt-12 md:min-h-[760px]">
            <div className="absolute left-6 top-6 text-xs font-medium uppercase tracking-[0.15em] text-black/45">{fa ? "پیش‌نمایش محصول" : "Product preview"} · {fit} · {viewSide}</div>
            <div className="relative aspect-[4/5] w-full max-w-[560px] overflow-hidden">
                <Image key={source} src={source} alt={`${viewSide} view of ${fit} fit T-shirt`} fill priority sizes="(max-width: 1024px) 80vw, 560px" className="object-contain transition-opacity duration-300" />
                {selectedArtwork && viewSide === printSide ? <div className={`pointer-events-none absolute z-10 ${activePlacement[2]}`}>{selectedArtwork.artworkUrl ? <Image src={selectedArtwork.artworkUrl} alt="" fill unoptimized className="object-contain" /> : <div className="flex size-full items-center justify-center rounded-full font-bold leading-none text-black shadow-md" style={{ backgroundColor: selectedArtwork.tone ?? "#d7ff46" }}><span className={placement === "left" || placement === "right" ? "text-[clamp(.7rem,1.5vw,1.2rem)]" : placement === "large" ? "text-[clamp(2rem,6vw,5rem)]" : "text-[clamp(1.5rem,4vw,3.5rem)]"}>{selectedArtwork.mark ?? selectedArtwork.name.slice(0, 1)}</span></div>}</div> : null}
            </div>
            <div className="absolute bottom-8 left-1/2 flex -translate-x-1/2 overflow-hidden rounded-full border border-black/15 bg-white p-1 shadow-sm" aria-label="T-shirt view"><button type="button" onClick={() => setViewSide("front")} className={`min-w-28 rounded-full px-6 py-3 text-sm transition ${viewSide === "front" ? "bg-black text-white" : "hover:bg-black/5"}`}>{fa ? "نمای جلو" : "View front"}</button><button type="button" onClick={() => setViewSide("back")} className={`min-w-28 rounded-full px-6 py-3 text-sm transition ${viewSide === "back" ? "bg-black text-white" : "hover:bg-black/5"}`}>{fa ? "نمای پشت" : "View back"}</button></div>
        </section>
        <aside className="border-l border-black/15 bg-[var(--color-background)] px-6 py-10 md:px-10 lg:max-h-[calc(100svh-112px)] lg:overflow-y-auto">
            <div className="mb-9"><span className="text-xs font-medium uppercase tracking-[0.18em] text-[var(--color-primary)]">Avoocado Custom Lab</span><h1 className="mt-4 text-4xl font-bold tracking-[-0.05em] md:text-5xl">{fa ? "تیشرتت را بساز." : "Build your tee."}</h1><p className="mt-4 text-sm leading-6 text-black/50">{fa ? "کالکشن و طرح را انتخاب کن، سپس مشخصات تیشرت و چاپ را تنظیم کن." : "Select a collection, choose its artwork, then configure your T-shirt and print."}</p></div>
            <div className="space-y-8">
                <fieldset><legend className="mb-3 text-xs font-medium uppercase tracking-[0.15em] text-black/45">01 / {fa ? "کالکشن" : "Collection"}</legend><select value={collection} onChange={(event) => selectCollection(event.target.value)} className="w-full border border-black/20 bg-transparent px-4 py-3 text-sm outline-none transition focus:border-black">{categories.map((item) => <option value={item.slug} key={item.slug}>{fa ? item.nameFa : item.nameEn}</option>)}</select></fieldset>
                <fieldset><legend className="mb-3 text-xs font-medium uppercase tracking-[0.15em] text-black/45">02 / {fa ? "طرح" : "Artwork"}</legend>{collectionArtworks.length ? <div className="grid grid-cols-2 gap-2">{collectionArtworks.map((item) => <button type="button" aria-pressed={selectedArtwork?.slug === item.slug} onClick={() => selectArtwork(item)} className={`flex min-h-20 items-center gap-3 border p-3 text-left text-sm transition ${selectedArtwork?.slug === item.slug ? "border-black bg-black text-white" : "border-black/20 hover:border-black"}`} key={item.slug}>{item.artworkUrl ? <span className="relative size-10 shrink-0 overflow-hidden bg-white"><Image src={item.artworkUrl} alt="" fill unoptimized className="object-contain"/></span> : <span className="flex size-10 shrink-0 items-center justify-center rounded-full font-bold text-black" style={{ backgroundColor: item.tone }}>{item.mark}</span>}<span>{item.name}</span></button>)}</div> : <p className="border border-dashed border-black/20 p-4 text-sm leading-6 text-black/45">{fa ? "در این کالکشن طرح فعالی وجود ندارد." : "No active artwork is available in this collection."}</p>}</fieldset>
                <fieldset><legend className="mb-3 text-xs font-medium uppercase tracking-[0.15em] text-black/45">03 / {fa ? "استایل تیشرت" : "T-shirt style"}</legend><div className="grid grid-cols-2 gap-2"><Option active={fit === "loose"} onClick={() => setFit("loose")}>{fa ? "لش" : "Loose fit"}</Option><Option active={fit === "boxy"} onClick={() => setFit("boxy")}>{fa ? "باکس" : "Boxy fit"}</Option></div></fieldset>
                <fieldset><legend className="mb-3 text-xs font-medium uppercase tracking-[0.15em] text-black/45">04 / {fa ? "جنس" : "Fabric"}</legend><div className="grid grid-cols-2 gap-2">{shirtMaterials.map((item, index) => <Option active={material === index} onClick={() => setMaterial(index)} key={item.id}>{fa ? item.labelFa : item.labelEn}</Option>)}</div></fieldset>
                <fieldset><legend className="mb-3 text-xs font-medium uppercase tracking-[0.15em] text-black/45">05 / {fa ? "سایز" : "Size"}</legend><div className="grid grid-cols-4 gap-2">{shirtSizes.map((item, index) => <Option active={size === index} onClick={() => setSize(index)} key={item}>{item}</Option>)}</div></fieldset>
                <fieldset><legend className="mb-3 text-xs font-medium uppercase tracking-[0.15em] text-black/45">06 / {fa ? "رنگ" : "Color"} — {colors[color][0]}</legend><div className="flex flex-wrap gap-3">{colors.map((item, index) => <button type="button" onClick={() => setColor(index)} aria-label={`${fa ? "انتخاب" : "Choose"} ${item[0]}`} aria-pressed={color === index} className={`size-10 rounded-full border-2 transition-transform hover:scale-110 ${color === index ? "scale-110 border-black ring-2 ring-black/20 ring-offset-2" : "border-black/15"}`} style={{ backgroundColor: item[1] }} key={item[3]} />)}</div></fieldset>
                <fieldset><legend className="mb-3 text-xs font-medium uppercase tracking-[0.15em] text-black/45">07 / {fa ? "سمت چاپ" : "Print side"}</legend><div className="grid grid-cols-2 gap-2"><Option active={printSide === "front"} onClick={() => setPrintSide("front")}>{fa ? "چاپ جلو" : "Print on front"}</Option><Option active={printSide === "back"} onClick={() => setPrintSide("back")}>{fa ? "چاپ پشت" : "Print on back"}</Option></div></fieldset>
                <fieldset><legend className="mb-3 text-xs font-medium uppercase tracking-[0.15em] text-black/45">08 / {fa ? "جانمایی" : "Placement"}</legend>{allowedPlacements.length ? <div className="grid grid-cols-2 gap-2">{allowedPlacements.map((item) => <Option active={placement === item[0]} onClick={() => setPlacement(item[0])} key={item[0]}>{fa ? ({left:"چپ",right:"راست",center:"وسط",large:"وسط بزرگ",lower:"پایین وسط",upper:"بالا وسط"} as Record<string,string>)[item[0]] : item[1]}</Option>)}</div> : <p className="text-sm text-black/45">{fa ? "برای دیدن جانمایی‌ها یک طرح انتخاب کنید." : "Choose an artwork to see its available placements."}</p>}</fieldset>
            </div>
            <div className="mt-9 border-t border-black/15 pt-6"><div className="mb-5 flex justify-between text-sm"><span>{selectedArtwork?.name ?? (fa ? "یک طرح انتخاب کنید" : "Choose an artwork")}</span></div>{selectedArtwork ? <OrderCheckout designSlug={selectedArtwork.slug} designName={selectedArtwork.name} collectionSlug={collection} artworkUrl={selectedArtwork.artworkUrl} artworkMark={selectedArtwork.mark} artworkTone={selectedArtwork.tone} fitId={fit} colorId={colors[color][3]} colorName={colors[color][0]} materialId={shirtMaterials[material].id} materialName={shirtMaterials[material].labelFa} sizeId={shirtSizes[size]} printSide={printSide} placementId={placement} unitPrice={46} /> : <button type="button" disabled className="w-full bg-[var(--color-primary)] py-5 text-sm font-medium opacity-40">{fa ? "ابتدا یک طرح انتخاب کنید" : "Choose an artwork first"}</button>}</div>
        </aside>
    </div>;
}



