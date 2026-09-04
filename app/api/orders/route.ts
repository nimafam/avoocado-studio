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
    variantSku?: string;
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
    const variantSku = cleanText(payload.variantSku, 100);
    const design = designSlug ? await env.DB.prepare("SELECT id, name, base_price AS basePrice, base_cost AS baseCost, active FROM designs WHERE slug = ?").bind(designSlug).first<{ id: number; name: string; basePrice: number; baseCost: number; active: number }>() : null;
    if (designSlug && (!design || !design.active)) return Response.json({ error: "این طرح دیگر فعال نیست." }, { status: 409 });

    const variant = variantSku && design ? await env.DB.prepare(`
        SELECT v.sku, v.price, v.cost_price AS costPrice, v.stock_quantity AS stockQuantity,
               v.material_id AS materialId, v.size_id AS sizeId,
               v.fit_id AS fitId, v.color_id AS colorId
        FROM product_variants v
        WHERE v.sku = ? AND v.design_id = ? AND v.active = 1
    `).bind(variantSku, design.id).first<{ sku: string; price: number; costPrice: number; stockQuantity: number; materialId: string; sizeId: string; fitId: string; colorId: string }>() : null;
    if (variantSku && !variant) return Response.json({ error: "این ترکیب محصول دیگر قابل سفارش نیست." }, { status: 409 });
    if (variant && variant.stockQuantity < quantity) return Response.json({ error: "موجودی این ترکیب برای تعداد انتخاب‌شده کافی نیست." }, { status: 409 });

    const unitPrice = variant?.price ?? design?.basePrice ?? 0;
    const unitCost = variant?.costPrice ?? design?.baseCost ?? 0;
    const materialId = variant?.materialId ?? cleanText(payload.materialId, 40);
    const sizeId = variant?.sizeId ?? cleanText(payload.sizeId, 10);
    const fitId = variant?.fitId ?? cleanText(payload.fitId, 20);
    const colorId = variant?.colorId ?? cleanText(payload.colorId, 30);

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
    const snapshot = { ...payload, firstName, lastName, phone, quantity, orderCode, unitPrice, materialId, sizeId, fitId, colorId, orderType: variant ? "ready-made" : "custom" };
    try {
        await env.DB.prepare(`INSERT INTO orders (order_code, customer_first_name, customer_last_name, customer_phone, design_id, design_name, collection_slug, material_id, size_id, fit_id, color_id, print_side, placement_id, quantity, unit_price, unit_cost, front_image_key, back_image_key, configuration_json, order_type, variant_sku, total_price) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`)
            .bind(orderCode, firstName, lastName, phone, design?.id ?? null, design?.name ?? cleanText(payload.designName, 100), cleanText(payload.collectionSlug, 80), materialId, sizeId, fitId, colorId, payload.printSide === "back" ? "back" : "front", placement, quantity, unitPrice, unitCost, frontUpload.url, backUpload.url, JSON.stringify(snapshot), variant ? "ready-made" : "custom", variant?.sku ?? null, unitPrice * quantity).run();
    } catch {
        await Promise.allSettled([deleteHostedFile(frontUpload.url), deleteHostedFile(backUpload.url)]);
        return Response.json({ error: "ثبت سفارش انجام نشد." }, { status: 500 });
    }
    return Response.json({ orderCode, telegramStatus: "not_configured" }, { status: 201 });
}

