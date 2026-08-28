"use client";

import { FormEvent, useState } from "react";

type Props = {
    designSlug: string; designName: string; collectionSlug: string; artworkUrl: string | null; artworkMark?: string; artworkTone?: string;
    fitId: "loose" | "boxy"; colorId: string; colorName: string; materialId: string; materialName: string; sizeId: string;
    printSide: "front" | "back"; placementId: "left" | "right" | "center" | "large" | "lower" | "upper"; unitPrice: number;
};

function loadImage(source: string) {
    return new Promise<HTMLImageElement>((resolve, reject) => { const image = new Image(); image.onload = () => resolve(image); image.onerror = reject; image.src = source; });
}

function placementBox(id: Props["placementId"]) {
    const boxes = { left: [370, 425, 90], right: [540, 425, 90], center: [415, 488, 170], large: [330, 325, 340], lower: [430, 688, 140], upper: [430, 363, 140] } as const;
    return boxes[id];
}

async function renderPreview(side: "front" | "back", props: Props) {
    const canvas = document.createElement("canvas"); canvas.width = 1000; canvas.height = 1250;
    const context = canvas.getContext("2d"); if (!context) throw new Error("Canvas is not available");
    const shirt = await loadImage(`/models/tshirts/colors/${props.fitId}-fit-${props.colorId}-${side}.webp`);
    const scale = Math.min(canvas.width / shirt.naturalWidth, canvas.height / shirt.naturalHeight);
    const width = shirt.naturalWidth * scale; const height = shirt.naturalHeight * scale;
    context.drawImage(shirt, (canvas.width - width) / 2, (canvas.height - height) / 2, width, height);
    if (side === props.printSide) {
        const [x, y, size] = placementBox(props.placementId);
        if (props.artworkUrl) { const artwork = await loadImage(props.artworkUrl); const artScale = Math.min(size / artwork.naturalWidth, size / artwork.naturalHeight); const artWidth = artwork.naturalWidth * artScale; const artHeight = artwork.naturalHeight * artScale; context.drawImage(artwork, x + (size - artWidth) / 2, y + (size - artHeight) / 2, artWidth, artHeight); }
        else { context.fillStyle = props.artworkTone ?? "#d7ff46"; context.beginPath(); context.arc(x + size / 2, y + size / 2, size / 2, 0, Math.PI * 2); context.fill(); context.fillStyle = "#000"; context.textAlign = "center"; context.textBaseline = "middle"; context.font = `700 ${Math.max(20, size * .38)}px sans-serif`; context.fillText(props.artworkMark ?? props.designName.slice(0, 1), x + size / 2, y + size / 2); }
    }
    return new Promise<Blob>((resolve, reject) => canvas.toBlob((blob) => blob ? resolve(blob) : reject(new Error("Could not create order image")), "image/webp", .9));
}

export function OrderCheckout(props: Props) {
    const [open, setOpen] = useState(false); const [busy, setBusy] = useState(false); const [message, setMessage] = useState(""); const [orderCode, setOrderCode] = useState("");
    async function submit(event: FormEvent<HTMLFormElement>) {
        event.preventDefault(); setBusy(true); setMessage("");
        try {
            const fields = new FormData(event.currentTarget); const [front, back] = await Promise.all([renderPreview("front", props), renderPreview("back", props)]);
            const payload = { firstName: fields.get("firstName"), lastName: fields.get("lastName"), phone: fields.get("phone"), website: fields.get("website"), designSlug: props.designSlug, designName: props.designName, collectionSlug: props.collectionSlug, materialId: props.materialId, materialName: props.materialName, sizeId: props.sizeId, fitId: props.fitId, colorId: props.colorId, colorName: props.colorName, printSide: props.printSide, placementId: props.placementId, quantity: Number(fields.get("quantity")) || 1, unitPrice: props.unitPrice };
            const form = new FormData(); form.set("order", JSON.stringify(payload)); form.set("front", front, "front.webp"); form.set("back", back, "back.webp");
            const response = await fetch("/api/orders", { method: "POST", body: form }); const data = await response.json(); if (!response.ok) throw new Error(data.error || "ثبت سفارش انجام نشد.");
            setOrderCode(data.orderCode); event.currentTarget.reset();
        } catch (error) { setMessage(error instanceof Error ? error.message : "ثبت سفارش انجام نشد."); }
        finally { setBusy(false); }
    }
    if (orderCode) return <div className="border border-green-700/30 bg-green-50 p-5 text-sm leading-6 text-green-900"><strong>سفارش ثبت شد.</strong><br/>کد پیگیری: <span className="font-mono">{orderCode}</span></div>;
    return <div><button type="button" onClick={() => setOpen((value) => !value)} className="w-full bg-[var(--color-primary)] py-5 text-sm font-medium transition hover:bg-black hover:text-white">{open ? "بستن فرم سفارش" : "ثبت سفارش"}</button>{open ? <form onSubmit={submit} dir="rtl" className="mt-4 space-y-3 border border-black/15 p-4"><div className="grid grid-cols-2 gap-3"><input name="firstName" required maxLength={60} placeholder="نام" className="border border-black/20 p-3 text-sm"/><input name="lastName" required maxLength={80} placeholder="نام خانوادگی" className="border border-black/20 p-3 text-sm"/></div><input name="phone" required inputMode="tel" pattern="[+0-9 ()-]{8,20}" placeholder="شماره تماس" className="w-full border border-black/20 p-3 text-sm"/><label className="flex items-center justify-between border border-black/20 p-3 text-sm"><span>تعداد</span><input name="quantity" type="number" min="1" max="20" defaultValue="1" className="w-20 border border-black/15 p-2 text-center"/></label><input name="website" tabIndex={-1} autoComplete="off" className="hidden" aria-hidden="true"/><p className="text-xs leading-5 text-black/45">با ثبت سفارش، مشخصات تماس و تصاویر نهایی برای پیگیری سفارش ذخیره می‌شوند.</p><button disabled={busy} className="w-full bg-black py-4 text-sm text-white disabled:opacity-50">{busy ? "در حال ساخت تصاویر…" : "تأیید و ثبت سفارش"}</button>{message ? <p className="text-sm text-red-700">{message}</p> : null}</form> : null}</div>;
}


