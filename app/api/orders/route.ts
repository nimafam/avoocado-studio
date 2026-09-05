import { env } from "cloudflare:workers";
import { isSameOrigin } from "@/lib/admin/auth";
import { PLACEMENTS } from "@/lib/catalog/cloudflare-repository";
import { deleteHostedFile, uploadHostedFile } from "@/lib/storage/hosted-files";
import { sendOrderToTelegram } from "@/lib/telegram/orders";

export const dynamic = "force-dynamic";

type OrderPayload = {
  designSlug?: string;
  designName?: string;
  collectionSlug?: string;
  materialId?: string;
  materialName?: string;
  sizeId?: string;
  fitId?: string;
  colorId?: string;
  colorName?: string;
  printSide?: "front" | "back";
  placementId?: string;
  quantity?: number;
  unitPrice?: number;
  variantSku?: string;
};

type DesignRow = {
  id: number;
  name: string;
  basePrice: number;
  baseCost: number;
  editionLimit: number;
  editionIssued: number;
  active: number;
};

type VariantRow = {
  sku: string;
  price: number;
  costPrice: number;
  stockQuantity: number;
  materialId: string;
  sizeId: string;
  fitId: string;
  colorId: string;
};

type ValidItem = {
  payload: OrderPayload;
  front: File;
  back: File;
  quantity: number;
  placement: string;
  design: DesignRow | null;
  variant: VariantRow | null;
};

function cleanText(value: unknown, max = 100) {
  return typeof value === "string" ? value.trim().slice(0, max) : "";
}

function validPreview(value: FormDataEntryValue | null): value is File {
  return (
    value instanceof File &&
    value.type === "image/webp" &&
    value.size <= 2_000_000
  );
}

export async function POST(request: Request) {
  if (!isSameOrigin(request))
    return Response.json({ error: "Invalid origin" }, { status: 403 });

  const form = await request.formData().catch(() => null);
  if (!form) return Response.json({ error: "Invalid order." }, { status: 400 });

  let customer: {
    firstName?: string;
    lastName?: string;
    phone?: string;
    website?: string;
  };
  let itemPayloads: OrderPayload[];
  try {
    customer = JSON.parse(String(form.get("order") ?? "{}"));
    const rawItems = form.get("items");
    itemPayloads = rawItems
      ? JSON.parse(String(rawItems))
      : [customer as OrderPayload];
  } catch {
    return Response.json({ error: "Invalid order data." }, { status: 400 });
  }

  if (
    !Array.isArray(itemPayloads) ||
    !itemPayloads.length ||
    itemPayloads.length > 10
  )
    return Response.json(
      { error: "سبد خرید باید بین ۱ تا ۱۰ آیتم داشته باشد." },
      { status: 400 },
    );

  if (customer.website)
    return Response.json({ error: "Invalid order." }, { status: 400 });
  const firstName = cleanText(customer.firstName, 60);
  const lastName = cleanText(customer.lastName, 80);
  const phone = cleanText(customer.phone, 20).replace(/[\s()-]/g, "");
  if (!firstName || !lastName || !/^\+?[0-9]{8,15}$/.test(phone))
    return Response.json(
      { error: "نام، نام خانوادگی و شماره تماس معتبر الزامی است." },
      { status: 400 },
    );

  const items: ValidItem[] = [];
  for (let index = 0; index < itemPayloads.length; index += 1) {
    const payload = itemPayloads[index] ?? {};
    const front = form.get(
      itemPayloads.length === 1 && !form.has("items")
        ? "front"
        : `front-${index}`,
    );
    const back = form.get(
      itemPayloads.length === 1 && !form.has("items")
        ? "back"
        : `back-${index}`,
    );
    if (!validPreview(front) || !validPreview(back))
      return Response.json(
        { error: `تصاویر آیتم ${index + 1} معتبر نیستند.` },
        { status: 400 },
      );

    const quantity = Math.min(20, Math.max(1, Number(payload.quantity) || 1));
    const placement = cleanText(payload.placementId, 20);
    if (!PLACEMENTS.includes(placement as (typeof PLACEMENTS)[number]))
      return Response.json(
        { error: `جانمایی آیتم ${index + 1} معتبر نیست.` },
        { status: 400 },
      );

    const designSlug = cleanText(payload.designSlug, 80);
    const variantSku = cleanText(payload.variantSku, 100);
    const design = designSlug
      ? await env.DB.prepare(
          "SELECT id, name, base_price AS basePrice, base_cost AS baseCost, edition_limit AS editionLimit, edition_issued AS editionIssued, active FROM designs WHERE slug = ?",
        )
          .bind(designSlug)
          .first<DesignRow>()
      : null;
    if (designSlug && (!design || !design.active))
      return Response.json(
        { error: `طرح آیتم ${index + 1} دیگر فعال نیست.` },
        { status: 409 },
      );

    const variant =
      variantSku && design
        ? await env.DB.prepare(
            `SELECT sku, price, cost_price AS costPrice, stock_quantity AS stockQuantity,
                    material_id AS materialId, size_id AS sizeId,
                    fit_id AS fitId, color_id AS colorId
             FROM product_variants
             WHERE sku = ? AND design_id = ? AND active = 1`,
          )
            .bind(variantSku, design.id)
            .first<VariantRow>()
        : null;
    if (variantSku && !variant)
      return Response.json(
        { error: `ترکیب محصول آیتم ${index + 1} دیگر قابل سفارش نیست.` },
        { status: 409 },
      );
    if (variant && variant.stockQuantity < quantity)
      return Response.json(
        { error: `موجودی آیتم ${index + 1} کافی نیست.` },
        { status: 409 },
      );
    if (
      design &&
      design.editionLimit > 0 &&
      design.editionIssued + quantity > design.editionLimit
    )
      return Response.json(
        { error: `تیراژ محدود آیتم ${index + 1} کافی نیست.` },
        { status: 409 },
      );

    items.push({ payload, front, back, quantity, placement, design, variant });
  }

  const checkoutCode = `AV-${Date.now().toString(36).toUpperCase()}-${crypto.randomUUID().slice(0, 4).toUpperCase()}`;
  const uploads: Array<{ front: string; back: string }> = [];
  const uploadedUrls: string[] = [];
  try {
    for (let index = 0; index < items.length; index += 1) {
      const front = await uploadHostedFile(
        items[index].front,
        "orders",
        `${checkoutCode}-${index + 1}-front`,
      );
      uploadedUrls.push(front.url);
      const back = await uploadHostedFile(
        items[index].back,
        "orders",
        `${checkoutCode}-${index + 1}-back`,
      );
      uploadedUrls.push(back.url);
      uploads.push({ front: front.url, back: back.url });
    }
  } catch (error) {
    await Promise.allSettled(uploadedUrls.map((url) => deleteHostedFile(url)));
    console.error(
      JSON.stringify({
        event: "group_order_image_upload_failed",
        message:
          error instanceof Error ? error.message : "Unknown storage error",
      }),
    );
    return Response.json(
      { error: "ذخیره تصاویر سفارش انجام نشد." },
      { status: 502 },
    );
  }

  const reservedStock: Array<{ sku: string; quantity: number }> = [];
  const allocatedEditions: Array<{
    designId: number;
    quantity: number;
    editionEnd: number;
  }> = [];
  const prepared: Array<{
    internalCode: string;
    item: ValidItem;
    unitPrice: number;
    unitCost: number;
    materialId: string;
    sizeId: string;
    fitId: string;
    colorId: string;
    editionStart: number | null;
    editionEnd: number | null;
    editionLimit: number;
  }> = [];

  const rollbackReservations = async () => {
    const statements = reservedStock.map((entry) =>
      env.DB.prepare(
        "UPDATE product_variants SET stock_quantity = stock_quantity + ? WHERE sku = ?",
      ).bind(entry.quantity, entry.sku),
    );
    for (const entry of [...allocatedEditions].reverse())
      statements.push(
        env.DB.prepare(
          "UPDATE designs SET edition_issued = edition_issued - ? WHERE id = ? AND edition_issued = ?",
        ).bind(entry.quantity, entry.designId, entry.editionEnd),
      );
    if (statements.length)
      await env.DB.batch(statements).catch(() => undefined);
  };

  try {
    for (let index = 0; index < items.length; index += 1) {
      const item = items[index];
      if (item.variant) {
        const reserved = await env.DB.prepare(
          "UPDATE product_variants SET stock_quantity = stock_quantity - ? WHERE sku = ? AND active = 1 AND stock_quantity >= ? RETURNING stock_quantity",
        )
          .bind(item.quantity, item.variant.sku, item.quantity)
          .first();
        if (!reserved) throw new Error("stock_changed");
        reservedStock.push({ sku: item.variant.sku, quantity: item.quantity });
      }

      let editionStart: number | null = null;
      let editionEnd: number | null = null;
      const editionLimit = item.design?.editionLimit ?? 0;
      if (item.design && editionLimit > 0) {
        const allocation = await env.DB.prepare(
          "UPDATE designs SET edition_issued = edition_issued + ? WHERE id = ? AND edition_issued + ? <= edition_limit RETURNING edition_issued AS editionEnd",
        )
          .bind(item.quantity, item.design.id, item.quantity)
          .first<{ editionEnd: number }>();
        if (!allocation) throw new Error("edition_changed");
        editionEnd = allocation.editionEnd;
        editionStart = editionEnd - item.quantity + 1;
        allocatedEditions.push({
          designId: item.design.id,
          quantity: item.quantity,
          editionEnd,
        });
      }

      prepared.push({
        internalCode: `${checkoutCode}-${String(index + 1).padStart(2, "0")}`,
        item,
        unitPrice: item.variant?.price ?? item.design?.basePrice ?? 0,
        unitCost: item.variant?.costPrice ?? item.design?.baseCost ?? 0,
        materialId:
          item.variant?.materialId ?? cleanText(item.payload.materialId, 40),
        sizeId: item.variant?.sizeId ?? cleanText(item.payload.sizeId, 10),
        fitId: item.variant?.fitId ?? cleanText(item.payload.fitId, 20),
        colorId: item.variant?.colorId ?? cleanText(item.payload.colorId, 30),
        editionStart,
        editionEnd,
        editionLimit,
      });
    }
  } catch (error) {
    await rollbackReservations();
    await Promise.allSettled(uploadedUrls.map((url) => deleteHostedFile(url)));
    return Response.json(
      {
        error:
          error instanceof Error && error.message === "edition_changed"
            ? "تیراژ یکی از طرح‌ها همین حالا تغییر کرده است؛ لطفاً دوباره بررسی کنید."
            : "موجودی یکی از محصولات همین حالا تغییر کرده است؛ لطفاً دوباره بررسی کنید.",
      },
      { status: 409 },
    );
  }

  try {
    await env.DB.batch(
      prepared.map((entry, index) => {
        const { item } = entry;
        const snapshot = {
          ...item.payload,
          firstName,
          lastName,
          phone,
          quantity: item.quantity,
          orderCode: checkoutCode,
          itemCode: entry.internalCode,
          unitPrice: entry.unitPrice,
          materialId: entry.materialId,
          sizeId: entry.sizeId,
          fitId: entry.fitId,
          colorId: entry.colorId,
          orderType: item.variant ? "ready-made" : "custom",
          editionStart: entry.editionStart,
          editionEnd: entry.editionEnd,
          editionLimit: entry.editionLimit,
        };
        return env.DB.prepare(
          `INSERT INTO orders (
             order_code, checkout_code, customer_first_name, customer_last_name,
             customer_phone, design_id, design_name, collection_slug, material_id,
             size_id, fit_id, color_id, print_side, placement_id, quantity,
             unit_price, unit_cost, front_image_key, back_image_key,
             configuration_json, order_type, variant_sku, total_price,
             edition_start, edition_end, edition_limit_snapshot
           ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        ).bind(
          entry.internalCode,
          checkoutCode,
          firstName,
          lastName,
          phone,
          item.design?.id ?? null,
          item.design?.name ?? cleanText(item.payload.designName, 100),
          cleanText(item.payload.collectionSlug, 80),
          entry.materialId,
          entry.sizeId,
          entry.fitId,
          entry.colorId,
          item.payload.printSide === "back" ? "back" : "front",
          item.placement,
          item.quantity,
          entry.unitPrice,
          entry.unitCost,
          uploads[index].front,
          uploads[index].back,
          JSON.stringify(snapshot),
          item.variant ? "ready-made" : "custom",
          item.variant?.sku ?? null,
          entry.unitPrice * item.quantity,
          entry.editionStart,
          entry.editionEnd,
          entry.editionLimit || null,
        );
      }),
    );
  } catch {
    await rollbackReservations();
    await Promise.allSettled(uploadedUrls.map((url) => deleteHostedFile(url)));
    return Response.json({ error: "ثبت سفارش انجام نشد." }, { status: 500 });
  }

  const telegram = await sendOrderToTelegram({
    orderCode: checkoutCode,
    customer: `${firstName} ${lastName}`,
    phone,
    totalPrice: prepared.reduce(
      (sum, entry) => sum + entry.unitPrice * entry.item.quantity,
      0,
    ),
    items: prepared.map((entry, index) => ({
      designName:
        entry.item.design?.name ??
        cleanText(entry.item.payload.designName, 100),
      quantity: entry.item.quantity,
      variantSku: entry.item.variant?.sku,
      frontUrl: uploads[index].front,
      backUrl: uploads[index].back,
      editionStart: entry.editionStart,
      editionEnd: entry.editionEnd,
      editionLimit: entry.editionLimit,
    })),
  });
  await env.DB.prepare(
    "UPDATE orders SET telegram_status = ?, telegram_error = ? WHERE checkout_code = ?",
  )
    .bind(telegram.status, telegram.error, checkoutCode)
    .run();

  return Response.json(
    {
      orderCode: checkoutCode,
      itemCount: prepared.length,
      telegramStatus: telegram.status,
    },
    { status: 201 },
  );
}
