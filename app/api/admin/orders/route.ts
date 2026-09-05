import { env } from "cloudflare:workers";
import { isAdminRequest, isSameOrigin } from "@/lib/admin/auth";

export const dynamic = "force-dynamic";
const statuses = [
  "new",
  "confirmed",
  "printing",
  "ready",
  "completed",
  "cancelled",
] as const;
const paymentStatuses = ["unpaid", "paid", "refunded"] as const;

export async function GET(request: Request) {
  if (!(await isAdminRequest(request)))
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  const result = await env.DB.prepare(
    `SELECT id, order_code AS orderCode, COALESCE(checkout_code, order_code) AS checkoutCode, customer_first_name AS firstName, customer_last_name AS lastName, customer_phone AS phone, status, payment_status AS paymentStatus, design_name AS designName, collection_slug AS collectionSlug, (SELECT description FROM designs WHERE designs.id = orders.design_id) AS designDescription, (SELECT description FROM design_categories WHERE design_categories.slug = orders.collection_slug) AS collectionDescription, material_id AS materialId, size_id AS sizeId, fit_id AS fitId, color_id AS colorId, print_side AS printSide, placement_id AS placementId, quantity, unit_price AS unitPrice, unit_cost AS unitCost, discount_amount AS discountAmount, order_type AS orderType, variant_sku AS variantSku, total_price AS totalPrice, edition_start AS editionStart, edition_end AS editionEnd, edition_limit_snapshot AS editionLimit, front_image_key AS frontImageUrl, back_image_key AS backImageUrl, telegram_status AS telegramStatus, telegram_error AS telegramError, created_at AS createdAt FROM orders ORDER BY created_at DESC, id DESC LIMIT 250`,
  ).all();
  return Response.json(
    { orders: result.results ?? [], statuses, paymentStatuses },
    { headers: { "Cache-Control": "no-store" } },
  );
}

export async function PATCH(request: Request) {
  if (!isSameOrigin(request) || !(await isAdminRequest(request)))
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  const body = (await request.json().catch(() => ({}))) as {
    id?: number;
    status?: string;
    paymentStatus?: string;
  };
  if (!Number.isInteger(body.id))
    return Response.json({ error: "Invalid order." }, { status: 400 });
  if (
    body.status &&
    !statuses.includes(body.status as (typeof statuses)[number])
  )
    return Response.json({ error: "Invalid order status." }, { status: 400 });
  if (
    body.paymentStatus &&
    !paymentStatuses.includes(
      body.paymentStatus as (typeof paymentStatuses)[number],
    )
  )
    return Response.json({ error: "Invalid payment status." }, { status: 400 });
  if (!body.status && !body.paymentStatus)
    return Response.json({ error: "Nothing to update." }, { status: 400 });
  const selected = await env.DB.prepare(
    "SELECT COALESCE(checkout_code, order_code) AS checkoutCode FROM orders WHERE id = ?",
  )
    .bind(body.id)
    .first<{ checkoutCode: string }>();
  if (!selected)
    return Response.json({ error: "Order not found." }, { status: 404 });

  if (body.status) {
    const group = await env.DB.prepare(
      `SELECT id, status, order_type AS orderType, variant_sku AS variantSku, quantity
       FROM orders
       WHERE COALESCE(checkout_code, order_code) = ?`,
    )
      .bind(selected.checkoutCode)
      .all<{
        id: number;
        status: string;
        orderType: string;
        variantSku: string | null;
        quantity: number;
      }>();
    const rows = group.results ?? [];
    const wasCancelled = rows.every((row) => row.status === "cancelled");
    if (!wasCancelled && body.status === "cancelled") {
      await env.DB.batch([
        ...rows
          .filter(
            (row) =>
              row.status !== "cancelled" &&
              row.orderType === "ready-made" &&
              row.variantSku,
          )
          .map((row) =>
            env.DB.prepare(
              "UPDATE product_variants SET stock_quantity = stock_quantity + ? WHERE sku = ?",
            ).bind(row.quantity, row.variantSku),
          ),
        env.DB.prepare(
          "UPDATE orders SET status = 'cancelled', updated_at = CURRENT_TIMESTAMP WHERE COALESCE(checkout_code, order_code) = ?",
        ).bind(selected.checkoutCode),
      ]);
    } else if (wasCancelled && body.status !== "cancelled") {
      const reserved: Array<{ sku: string; quantity: number }> = [];
      for (const row of rows) {
        if (row.orderType !== "ready-made" || !row.variantSku) continue;
        const result = await env.DB.prepare(
          "UPDATE product_variants SET stock_quantity = stock_quantity - ? WHERE sku = ? AND stock_quantity >= ? RETURNING stock_quantity",
        )
          .bind(row.quantity, row.variantSku, row.quantity)
          .first();
        if (!result) {
          if (reserved.length)
            await env.DB.batch(
              reserved.map((entry) =>
                env.DB.prepare(
                  "UPDATE product_variants SET stock_quantity = stock_quantity + ? WHERE sku = ?",
                ).bind(entry.quantity, entry.sku),
              ),
            );
          return Response.json(
            { error: "موجودی برای فعال‌کردن دوباره کل سفارش کافی نیست." },
            { status: 409 },
          );
        }
        reserved.push({ sku: row.variantSku, quantity: row.quantity });
      }
      await env.DB.prepare(
        "UPDATE orders SET status = ?, updated_at = CURRENT_TIMESTAMP WHERE COALESCE(checkout_code, order_code) = ?",
      )
        .bind(body.status, selected.checkoutCode)
        .run();
    } else {
      await env.DB.prepare(
        "UPDATE orders SET status = ?, updated_at = CURRENT_TIMESTAMP WHERE COALESCE(checkout_code, order_code) = ?",
      )
        .bind(body.status, selected.checkoutCode)
        .run();
    }
  }
  if (body.paymentStatus)
    await env.DB.prepare(
      "UPDATE orders SET payment_status = ?, updated_at = CURRENT_TIMESTAMP WHERE COALESCE(checkout_code, order_code) = ?",
    )
      .bind(body.paymentStatus, selected.checkoutCode)
      .run();
  return GET(request);
}
