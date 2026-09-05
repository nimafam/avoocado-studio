"use client";

import Image from "next/image";
import { useEffect, useMemo, useState } from "react";
import { OrderCheckout } from "@/components/customizer/OrderCheckout";
import { useLanguage } from "@/components/i18n/LanguageProvider";
import type {
  PublicProduct,
  PublicVariant,
} from "@/lib/catalog/cloudflare-repository";

type Dimension = "fitId" | "materialId" | "sizeId" | "colorId";
type Placement = "left" | "right" | "center" | "large" | "lower" | "upper";
const validPlacements: Placement[] = [
  "left",
  "right",
  "center",
  "large",
  "lower",
  "upper",
];
const placementClasses: Record<Placement, string> = {
  left: "left-[34%] top-[31%] h-[27%] w-[14%]",
  right: "right-[34%] top-[31%] h-[27%] w-[14%]",
  center: "left-1/2 top-[27%] h-[56%] w-[34%] -translate-x-1/2",
  large: "left-1/2 top-[23%] h-[64%] w-[42%] -translate-x-1/2",
  lower: "left-1/2 top-[50%] h-[35%] w-[28%] -translate-x-1/2",
  upper: "left-1/2 top-[27%] h-[35%] w-[28%] -translate-x-1/2",
};

function uniqueOptions<T>(
  variants: PublicVariant[],
  key: Dimension,
  value: (variant: PublicVariant) => T,
) {
  return [
    ...new Map(
      variants.map((variant) => [variant[key], value(variant)]),
    ).entries(),
  ];
}

function Choice({
  active,
  disabled,
  children,
  onClick,
}: {
  active: boolean;
  disabled?: boolean;
  children: React.ReactNode;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      disabled={disabled}
      aria-pressed={active}
      onClick={onClick}
      className={`border px-4 py-3 text-sm transition disabled:cursor-not-allowed disabled:opacity-30 ${active ? "border-black bg-black text-white" : "border-black/20 hover:border-black"}`}
    >
      {children}
    </button>
  );
}

export function ReadyMadeProductConfigurator({
  product,
  variants,
}: {
  product: PublicProduct;
  variants: PublicVariant[];
}) {
  const { locale } = useLanguage();
  const fa = locale === "fa";
  const firstAvailable =
    variants.find((variant) => variant.stockQuantity > 0) ?? variants[0];
  const [selected, setSelected] = useState(firstAvailable);
  const [side, setSide] = useState<"front" | "back">("front");
  const [artworkOpen, setArtworkOpen] = useState(false);

  useEffect(() => {
    if (!artworkOpen) return;

    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") setArtworkOpen(false);
    };
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", closeOnEscape);

    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", closeOnEscape);
    };
  }, [artworkOpen]);
  const placements =
    product.placements
      ?.split(",")
      .filter((value): value is Placement =>
        validPlacements.includes(value as Placement),
      ) ?? [];
  const placement = placements.includes("center")
    ? "center"
    : (placements[0] ?? "center");
  const fits = useMemo(
    () =>
      uniqueOptions(variants, "fitId", (item) =>
        fa ? item.fitNameFa : item.fitNameEn,
      ),
    [variants, fa],
  );
  const materials = useMemo(
    () =>
      uniqueOptions(variants, "materialId", (item) =>
        fa ? item.materialNameFa : item.materialNameEn,
      ),
    [variants, fa],
  );
  const sizes = useMemo(
    () => uniqueOptions(variants, "sizeId", (item) => item.sizeLabel),
    [variants],
  );
  const colors = useMemo(
    () =>
      uniqueOptions(variants, "colorId", (item) => ({
        name: fa ? item.colorNameFa : item.colorNameEn,
        hex: item.colorHex,
      })),
    [variants, fa],
  );

  function choose(field: Dimension, value: string) {
    const exact = variants.find(
      (variant) =>
        variant[field] === value &&
        variant.stockQuantity > 0 &&
        (["fitId", "materialId", "sizeId", "colorId"] as Dimension[]).every(
          (key) => key === field || variant[key] === selected[key],
        ),
    );
    setSelected(
      exact ??
        variants.find(
          (variant) => variant[field] === value && variant.stockQuantity > 0,
        ) ??
        variants.find((variant) => variant[field] === value) ??
        selected,
    );
  }

  if (!selected)
    return (
      <p className="border border-dashed border-black/20 p-5 text-sm text-black/45">
        {fa
          ? "هنوز تنوع قابل سفارشی برای این تیشرت ثبت نشده است."
          : "No purchasable variant has been added for this T-shirt yet."}
      </p>
    );
  const fit = selected.fitId === "boxy" ? "boxy" : "loose";
  const shirtSource = `/models/tshirts/colors/${fit}-fit-${selected.colorId}-${side}.webp`;
  const artworkSource = product.artworkKey?.startsWith(
    "https://storage.avoocadostudio.com/uploads/",
  )
    ? `/api/storage-image?url=${encodeURIComponent(product.artworkKey)}`
    : product.artworkKey;

  return (
    <div className="grid gap-12 md:grid-cols-[1.15fr_0.85fr] md:gap-20">
      <section className="relative flex min-h-[600px] items-center justify-center overflow-hidden bg-[#efeee9] p-6">
        <div className="relative aspect-[4/5] w-full max-w-[620px]">
          <Image
            src={shirtSource}
            alt={`${side} view of ${product.name}`}
            fill
            priority
            className="object-contain p-[6%]"
          />
          {side === "front" && artworkSource ? (
            <div
              className={`pointer-events-none absolute z-10 ${placementClasses[placement]}`}
            >
              <img
                src={artworkSource}
                alt=""
                className="block h-auto max-h-full w-full object-contain object-top"
              />
            </div>
          ) : null}
        </div>
        <div className="absolute bottom-6 left-1/2 flex -translate-x-1/2 rounded-full border border-black/15 bg-white p-1">
          <button
            type="button"
            onClick={() => setSide("front")}
            className={`rounded-full px-5 py-2 text-sm ${side === "front" ? "bg-black text-white" : ""}`}
          >
            {fa ? "جلو" : "Front"}
          </button>
          <button
            type="button"
            onClick={() => setSide("back")}
            className={`rounded-full px-5 py-2 text-sm ${side === "back" ? "bg-black text-white" : ""}`}
          >
            {fa ? "پشت" : "Back"}
          </button>
        </div>
      </section>
      <div className="md:sticky md:top-12 md:self-start">
        <h1 className="text-[clamp(3.5rem,7vw,7rem)] font-bold leading-[0.88] tracking-[-0.06em]">
          {product.name}
        </h1>
        {product.description && (
          <p className="mt-7 max-w-md text-base leading-7 text-black/60">
            {product.description}
          </p>
        )}
        {product.editionLimit > 0 ? (
          <div className="mt-6 rounded-2xl border border-black/10 bg-lime-300 p-5">
            <div className="flex items-end justify-between gap-4">
              <div>
                <small className="block text-[10px] font-bold uppercase tracking-[.18em] text-black/55">
                  {fa ? "نسخه محدود و شماره‌دار" : "Numbered limited edition"}
                </small>
                <strong className="mt-2 block text-xl">
                  {fa ? "نسخه بعدی" : "Next edition"}
                </strong>
              </div>
              <strong className="text-2xl font-black" dir="ltr">
                {String(product.editionIssued + 1).padStart(3, "0")} /{" "}
                {product.editionLimit}
              </strong>
            </div>
            <p className="mt-3 border-t border-black/15 pt-3 text-xs text-black/60">
              {fa
                ? `${Math.max(product.editionLimit - product.editionIssued, 0).toLocaleString("fa-IR")} نسخه باقی مانده؛ شماره قطعی هنگام ثبت سفارش اختصاص می‌یابد و شناسنامه از پنل سفارش‌ها صادر می‌شود.`
                : `${Math.max(product.editionLimit - product.editionIssued, 0).toLocaleString("en-US")} editions remain. The final number is assigned when the order is placed and its certificate is issued from Orders.`}
            </p>
          </div>
        ) : null}
        {artworkSource ? (
          <button
            type="button"
            onClick={() => setArtworkOpen(true)}
            className="mt-7 flex w-full cursor-pointer items-center gap-4 rounded-2xl border border-black/10 bg-[#f6f5f1] p-3 text-start transition hover:border-black/30"
          >
            <span
              className="relative grid h-32 w-28 shrink-0 select-none place-items-center overflow-hidden rounded-xl bg-white p-2"
              onContextMenu={(event) => event.preventDefault()}
            >
              <img
                src={artworkSource}
                alt={product.name}
                draggable={false}
                className="block h-full w-full object-contain"
              />
              <Image
                src="/brand/avoocado-logo.svg"
                alt=""
                width={96}
                height={36}
                draggable={false}
                className="pointer-events-none absolute left-1/2 top-1/2 w-[72%] -translate-x-1/2 -translate-y-1/2 opacity-30"
              />
            </span>
            <span>
              <small className="block text-xs uppercase tracking-[.14em] text-black/40">
                {fa ? "طرح اصلی" : "Original artwork"}
              </small>
              <strong className="mt-2 block text-sm">
                {fa ? "مشاهده طرح" : "View artwork"} +
              </strong>
            </span>
          </button>
        ) : null}
        <div className="mt-8 space-y-6">
          <fieldset>
            <legend className="mb-3 text-xs uppercase tracking-[.15em] text-black/45">
              {fa ? "استایل" : "Fit"}
            </legend>
            <div className="grid grid-cols-2 gap-2">
              {fits.map(([id, label]) => (
                <Choice
                  key={id}
                  active={selected.fitId === id}
                  onClick={() => choose("fitId", id)}
                >
                  {label}
                </Choice>
              ))}
            </div>
          </fieldset>
          <fieldset>
            <legend className="mb-3 text-xs uppercase tracking-[.15em] text-black/45">
              {fa ? "جنس" : "Fabric"}
            </legend>
            <div className="grid grid-cols-2 gap-2">
              {materials.map(([id, label]) => (
                <Choice
                  key={id}
                  active={selected.materialId === id}
                  onClick={() => choose("materialId", id)}
                >
                  {label}
                </Choice>
              ))}
            </div>
          </fieldset>
          <fieldset>
            <legend className="mb-3 text-xs uppercase tracking-[.15em] text-black/45">
              {fa ? "سایز" : "Size"}
            </legend>
            <div className="flex flex-wrap gap-2">
              {sizes.map(([id, label]) => (
                <Choice
                  key={id}
                  active={selected.sizeId === id}
                  onClick={() => choose("sizeId", id)}
                >
                  {label}
                </Choice>
              ))}
            </div>
          </fieldset>
          <fieldset>
            <legend className="mb-3 text-xs uppercase tracking-[.15em] text-black/45">
              {fa ? "رنگ" : "Color"} —{" "}
              {fa ? selected.colorNameFa : selected.colorNameEn}
            </legend>
            <div className="flex flex-wrap gap-3">
              {colors.map(([id, color]) => (
                <button
                  type="button"
                  key={id}
                  title={color.name}
                  aria-label={color.name}
                  aria-pressed={selected.colorId === id}
                  onClick={() => choose("colorId", id)}
                  className={`size-10 rounded-full border-2 ${selected.colorId === id ? "scale-110 border-black ring-2 ring-black/20 ring-offset-2" : "border-black/15"}`}
                  style={{ backgroundColor: color.hex }}
                />
              ))}
            </div>
          </fieldset>
        </div>
        <div className="mt-8">
          <div className="mb-4 flex justify-between text-sm">
            <span>
              {selected.stockQuantity > 0
                ? `${selected.stockQuantity} ${fa ? "عدد موجود" : "available"}`
                : fa
                  ? "ناموجود"
                  : "Out of stock"}
            </span>
            <strong>
              {selected.price.toLocaleString(fa ? "fa-IR" : "en-US")}{" "}
              {fa ? "تومان" : "Toman"}
            </strong>
          </div>
          {selected.stockQuantity > 0 ? (
            <OrderCheckout
              designSlug={product.slug}
              designName={product.name}
              collectionSlug={product.collectionSlug}
              artworkUrl={product.artworkKey}
              fitId={fit}
              colorId={selected.colorId}
              colorName={selected.colorNameFa}
              materialId={selected.materialId}
              materialName={selected.materialNameFa}
              sizeId={selected.sizeId}
              printSide="front"
              placementId={placement}
              unitPrice={selected.price}
              variantSku={selected.sku}
              maxQuantity={selected.stockQuantity}
            />
          ) : (
            <button
              disabled
              className="w-full bg-black py-5 text-sm text-white opacity-35"
            >
              {fa ? "ناموجود" : "Out of stock"}
            </button>
          )}
        </div>
      </div>
      {artworkOpen && artworkSource ? (
        <div
          className="fixed inset-0 z-[120] flex items-center justify-center bg-black/85 p-4 backdrop-blur-sm sm:p-8"
          role="dialog"
          aria-modal="true"
          aria-label={fa ? "پیش‌نمایش طرح" : "Artwork preview"}
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) setArtworkOpen(false);
          }}
        >
          <div className="relative flex max-h-[92vh] w-full max-w-5xl flex-col overflow-hidden rounded-2xl bg-[#171714] shadow-2xl">
            <div className="flex items-center justify-between border-b border-white/15 px-4 py-3 text-white sm:px-6">
              <div>
                <small className="block text-[10px] uppercase tracking-[.18em] text-white/50">
                  AVOOCADO STUDIO
                </small>
                <strong className="mt-1 block text-sm">{product.name}</strong>
              </div>
              <button
                type="button"
                onClick={() => setArtworkOpen(false)}
                className="grid size-10 cursor-pointer place-items-center rounded-full border border-white/20 text-xl leading-none transition hover:bg-white hover:text-black"
                aria-label={fa ? "بستن" : "Close"}
              >
                ×
              </button>
            </div>
            <div
              className="relative flex min-h-0 flex-1 select-none items-center justify-center overflow-hidden p-4 sm:p-8"
              onContextMenu={(event) => event.preventDefault()}
            >
              <img
                src={artworkSource}
                alt={product.name}
                draggable={false}
                className="block max-h-[72vh] max-w-full object-contain"
              />
              <div className="pointer-events-none absolute inset-0 grid place-items-center overflow-hidden">
                <Image
                  src="/brand/avoocado-logo.svg"
                  alt=""
                  width={320}
                  height={120}
                  draggable={false}
                  className="w-[38%] min-w-40 max-w-80 opacity-30 brightness-0 invert"
                />
              </div>
              <div className="pointer-events-none absolute inset-x-0 bottom-4 text-center text-[10px] uppercase tracking-[.28em] text-white/45">
                AVOOCADO STUDIO · PREVIEW
              </div>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
