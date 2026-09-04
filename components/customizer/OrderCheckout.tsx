"use client";

import { useState } from "react";
import { useLanguage } from "@/components/i18n/LanguageProvider";
import { useCart } from "@/components/cart/CartProvider";

type Props = {
  designSlug: string;
  designName: string;
  collectionSlug: string;
  artworkUrl: string | null;
  artworkMark?: string;
  artworkTone?: string;
  fitId: "loose" | "boxy";
  colorId: string;
  colorName: string;
  materialId: string;
  materialName: string;
  sizeId: string;
  printSide: "front" | "back";
  placementId: "left" | "right" | "center" | "large" | "lower" | "upper";
  unitPrice: number;
  variantSku?: string;
  maxQuantity?: number;
};

function loadImage(source: string) {
  const safeSource = source.startsWith(
    "https://storage.avoocadostudio.com/uploads/",
  )
    ? `/api/storage-image?url=${encodeURIComponent(source)}`
    : source;
  return new Promise<HTMLImageElement>((resolve, reject) => {
    const image = new Image();
    image.onload = () => resolve(image);
    image.onerror = reject;
    image.src = safeSource;
  });
}

function placementBox(id: Props["placementId"]) {
  const boxes = {
    left: [370, 425, 90],
    right: [540, 425, 90],
    center: [415, 488, 170],
    large: [330, 325, 340],
    lower: [430, 688, 140],
    upper: [430, 363, 140],
  } as const;
  return boxes[id];
}

async function renderPreview(side: "front" | "back", props: Props) {
  const canvas = document.createElement("canvas");
  canvas.width = 1000;
  canvas.height = 1250;
  const context = canvas.getContext("2d");
  if (!context) throw new Error("Canvas is not available");
  const shirt = await loadImage(
    `/models/tshirts/colors/${props.fitId}-fit-${props.colorId}-${side}.webp`,
  );
  const scale = Math.min(
    canvas.width / shirt.naturalWidth,
    canvas.height / shirt.naturalHeight,
  );
  const width = shirt.naturalWidth * scale;
  const height = shirt.naturalHeight * scale;
  context.drawImage(
    shirt,
    (canvas.width - width) / 2,
    (canvas.height - height) / 2,
    width,
    height,
  );
  if (side === props.printSide) {
    const [x, y, size] = placementBox(props.placementId);
    if (props.artworkUrl) {
      const artwork = await loadImage(props.artworkUrl);
      const artScale = size / artwork.naturalWidth;
      const artWidth = size;
      const artHeight = artwork.naturalHeight * artScale;
      context.drawImage(artwork, x, y, artWidth, artHeight);
    } else {
      context.fillStyle = props.artworkTone ?? "#d7ff46";
      context.beginPath();
      context.arc(x + size / 2, y + size / 2, size / 2, 0, Math.PI * 2);
      context.fill();
      context.fillStyle = "#000";
      context.textAlign = "center";
      context.textBaseline = "middle";
      context.font = `700 ${Math.max(20, size * 0.38)}px sans-serif`;
      context.fillText(
        props.artworkMark ?? props.designName.slice(0, 1),
        x + size / 2,
        y + size / 2,
      );
    }
  }
  return new Promise<Blob>((resolve, reject) =>
    canvas.toBlob(
      (blob) =>
        blob
          ? resolve(blob)
          : reject(new Error("Could not create order image")),
      "image/webp",
      0.9,
    ),
  );
}

export function OrderCheckout(props: Props) {
  const { locale } = useLanguage();
  const fa = locale === "fa";
  const { add } = useCart();
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");
  const [quantity, setQuantity] = useState(1);
  async function addToBag() {
    setBusy(true);
    setMessage("");
    try {
      const [front, back] = await Promise.all([
        renderPreview("front", props),
        renderPreview("back", props),
      ]);
      const payload = {
        designSlug: props.designSlug,
        designName: props.designName,
        collectionSlug: props.collectionSlug,
        materialId: props.materialId,
        materialName: props.materialName,
        sizeId: props.sizeId,
        fitId: props.fitId,
        colorId: props.colorId,
        colorName: props.colorName,
        printSide: props.printSide,
        placementId: props.placementId,
        quantity,
        unitPrice: props.unitPrice,
        variantSku: props.variantSku,
      };
      add({
        designName: props.designName,
        quantity,
        unitPrice: props.unitPrice,
        payload,
        front,
        back,
      });
    } catch (error) {
      setMessage(
        error instanceof Error
          ? error.message
          : fa
            ? "ساخت پیش‌نمایش انجام نشد."
            : "Preview could not be created.",
      );
    } finally {
      setBusy(false);
    }
  }
  const maxQuantity = Math.max(1, Math.min(20, props.maxQuantity ?? 20));
  return (
    <div>
      <div className="mb-4 flex items-center justify-between border-y border-black/15 py-4 text-sm">
        <label htmlFor="order-quantity">{fa ? "تعداد" : "Quantity"}</label>
        <div className="flex items-center gap-3">
          <input
            id="order-quantity"
            name="quantity"
            type="number"
            min="1"
            max={maxQuantity}
            value={quantity}
            onChange={(event) =>
              setQuantity(
                Math.min(
                  maxQuantity,
                  Math.max(1, Number(event.target.value) || 1),
                ),
              )
            }
            className="w-20 border border-black/15 p-2 text-center"
          />
          <strong>
            {(props.unitPrice * quantity).toLocaleString(
              fa ? "fa-IR" : "en-US",
            )}{" "}
            {fa ? "تومان" : "Toman"}
          </strong>
        </div>
      </div>
      <button
        type="button"
        disabled={busy}
        onClick={() => void addToBag()}
        className="w-full bg-[var(--color-primary)] py-5 text-sm font-medium transition hover:bg-black hover:text-white disabled:opacity-50"
      >
        {busy
          ? fa
            ? "در حال آماده‌سازی…"
            : "Preparing…"
          : fa
            ? "افزودن به بگ خرید"
            : "Add to bag"}
      </button>
      {message ? <p className="mt-3 text-sm text-red-700">{message}</p> : null}
    </div>
  );
}
