import { env } from "cloudflare:workers";
import { isSameOrigin } from "@/lib/admin/auth";
import { PLACEMENTS } from "@/lib/catalog/cloudflare-repository";
import { deleteHostedFile, uploadHostedFile } from "@/lib/storage/hosted-files";

export const dynamic = "force-dynamic";

type OrderPayload = {
    firstName?: string; lastName?: string; phone?: string; designSlug?: string; designName?: string;
    collectionSlug?: string; materialId?: string; materialName?: string; sizeId?: string; fitId?: string;
    colorId?: string; colorName?: string; printSide?: "front" | "back"; placementId?: string;
    quantity?: number; unitPrice?: number; website?: string;
};

function cleanText(value: unknown, max = 100) { return typeof value === "string" ? value.trim().slice(0, max) : ""; }

export async function POST(request: Request) {
    if (!isSameOrigin(request)) return Response.json({ error: "Invalid origin" }, { status: 403 });
    const form = await request.formData().catch(() => null);
    if (!form) return Response.json({ error: "Invalid order." }, { status: 400 });
    let payload: OrderPayload;
    try { payload = JSON.parse(String(form.get("order") ?? "{}")); } catch { return Response.json({ error: "Invalid order data." }, { status: 400 }); }
    if (payload.website) return Response.json({ error: "Invalid order." }, { status: 400 });
    const firstName = cleanText(payload.firstName, 60); const lastName = cleanText(payload.lastName, 80);
    const phone = cleanText(payload.phone, 20).replace(/[\s()-]/g, "");
    const front = form.get("front"); const back = form.get("back");
    const quantity = Math.min(20, Math.max(1, Number(payload.quantity) || 1));
    if (!firstName || !lastName || !/^\+?[0-9]{8,15}$/.test(phone) || !(front instanceof File) || !(back instanceof File)) return Response.json({ error: "نام، نام خانوادگی، شماره تماس و دو تصویر سفارش الزامی است." }, { status: 400 });
    if (front.type !== "image/webp" || back.type !== "image/webp" || front.size > 2_000_000 || back.size > 2_000_000) return Response.json({ error: "تصاویر سفارش معتبر نیستند." }, { status: 400 });
    const placement = cleanText(payload.placementId, 20);
    if (!PLACEMENTS.includes(placement as (typeof PLACEMENTS)[number])) return Response.json({ error: "Placement معتبر نیست." }, { status: 400 });
    const designSlug = cleanText(payload.designSlug, 80);
    const design = designSlug ? await env.DB.prepare("SELECT id, name, active FROM designs WHERE slug = ?").bind(designSlug).first<{ id: number; name: string; active: number }>() : null;
    if (designSlug && (!design || !design.active)) return Response.json({ error: "این طرح دیگر فعال نیست." }, { status: 409 });

    const orderCode = `AV-${Date.now().toString(36).toUpperCase()}-${crypto.randomUUID().slice(0, 4).toUpperCase()}`;
    let frontUpload: Awaited<ReturnType<typeof uploadHostedFile>> | null = null;
    let backUpload: Awaited<ReturnType<typeof uploadHostedFile>> | null = null;
    try {
        frontUpload = await uploadHostedFile(front, "orders", `${orderCode}-front`);
        backUpload = await uploadHostedFile(back, "orders", `${orderCode}-back`);
    } catch (error) {
        console.error(JSON.stringify({ event: "order_image_upload_failed", message: error instanceof Error ? error.message : "Unknown storage error" }));
        if (frontUpload) await deleteHostedFile(frontUpload.url).catch(() => undefined);
        return Response.json({ error: "ذخیره تصاویر سفارش انجام نشد." }, { status: 502 });
    }
    if (!frontUpload || !backUpload) return Response.json({ error: "ذخیره تصاویر سفارش انجام نشد." }, { status: 502 });
    const snapshot = { ...payload, firstName, lastName, phone, quantity, orderCode };
    try {
        await env.DB.prepare(`INSERT INTO orders (order_code, customer_first_name, customer_last_name, customer_phone, design_id, design_name, collection_slug, material_id, size_id, fit_id, color_id, print_side, placement_id, quantity, unit_price, front_image_key, back_image_key, configuration_json) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`)
            .bind(orderCode, firstName, lastName, phone, design?.id ?? null, design?.name ?? cleanText(payload.designName, 100), cleanText(payload.collectionSlug, 80), cleanText(payload.materialId, 40), cleanText(payload.sizeId, 10), cleanText(payload.fitId, 20), cleanText(payload.colorId, 30), payload.printSide === "back" ? "back" : "front", placement, quantity, Math.max(0, Number(payload.unitPrice) || 0), frontUpload.url, backUpload.url, JSON.stringify(snapshot)).run();
    } catch {
        await Promise.allSettled([deleteHostedFile(frontUpload.url), deleteHostedFile(backUpload.url)]);
        return Response.json({ error: "ثبت سفارش انجام نشد." }, { status: 500 });
    }
    return Response.json({ orderCode, telegramStatus: "not_configured" }, { status: 201 });
}

