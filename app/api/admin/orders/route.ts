import { env } from "cloudflare:workers";
import { isAdminRequest, isSameOrigin } from "@/lib/admin/auth";

export const dynamic = "force-dynamic";
const statuses = ["new", "confirmed", "printing", "ready", "completed", "cancelled"] as const;

export async function GET(request: Request) {
    if (!await isAdminRequest(request)) return Response.json({ error: "Unauthorized" }, { status: 401 });
    const result = await env.DB.prepare(`SELECT id, order_code AS orderCode, customer_first_name AS firstName, customer_last_name AS lastName, customer_phone AS phone, status, design_name AS designName, material_id AS materialId, size_id AS sizeId, fit_id AS fitId, color_id AS colorId, print_side AS printSide, placement_id AS placementId, quantity, unit_price AS unitPrice, front_image_key AS frontImageUrl, back_image_key AS backImageUrl, telegram_status AS telegramStatus, telegram_error AS telegramError, created_at AS createdAt FROM orders ORDER BY created_at DESC, id DESC LIMIT 250`).all();
    return Response.json({ orders: result.results ?? [], statuses }, { headers: { "Cache-Control": "no-store" } });
}

export async function PATCH(request: Request) {
    if (!isSameOrigin(request) || !await isAdminRequest(request)) return Response.json({ error: "Unauthorized" }, { status: 401 });
    const body = await request.json().catch(() => ({})) as { id?: number; status?: string };
    if (!Number.isInteger(body.id) || !statuses.includes(body.status as (typeof statuses)[number])) return Response.json({ error: "Invalid order status." }, { status: 400 });
    await env.DB.prepare("UPDATE orders SET status = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?").bind(body.status, body.id).run();
    return GET(request);
}
