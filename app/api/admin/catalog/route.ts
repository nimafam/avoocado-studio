import { env } from "cloudflare:workers";
import { isAdminRequest, isSameOrigin } from "@/lib/admin/auth";
import {
  getAdminCatalog,
  PLACEMENTS,
  validSlug,
} from "@/lib/catalog/cloudflare-repository";
import { deleteHostedFile } from "@/lib/storage/hosted-files";

export const dynamic = "force-dynamic";

type Payload = {
  entity?: "collection" | "design" | "variant";
  id?: number;
  slug?: string;
  nameFa?: string;
  nameEn?: string;
  name?: string;
  description?: string;
  basePrice?: number;
  baseCost?: number;
  editionLimit?: number;
  editionIssued?: number;
  artworkKey?: string | null;
  collectionId?: number;
  placements?: string[];
  active?: boolean;
  designId?: number;
  sku?: string;
  price?: number;
  costPrice?: number;
  stockQuantity?: number;
  materialId?: string;
  sizeId?: string;
  fitId?: string;
  colorId?: string;
  printMethodId?: string;
};

function unauthorized() {
  return Response.json({ error: "Unauthorized" }, { status: 401 });
}
function badRequest(message: string) {
  return Response.json({ error: message }, { status: 400 });
}
function mutationError(
  error: unknown,
  entity: Payload["entity"],
  action: "create" | "update",
) {
  const message = error instanceof Error ? error.message : "";
  if (message.includes("UNIQUE"))
    return badRequest(
      entity === "variant"
        ? "این SKU یا ترکیب محصول قبلاً ثبت شده است."
        : "این Slug قبلاً استفاده شده است.",
    );
  console.error(
    JSON.stringify({
      event: `admin_catalog_${action}_failed`,
      entity,
      message: message || "unknown",
    }),
  );
  return badRequest(
    action === "create"
      ? "ایجاد این مورد انجام نشد."
      : "ذخیره تغییرات انجام نشد.",
  );
}
function validPlacements(values: unknown): values is string[] {
  return (
    Array.isArray(values) &&
    values.length > 0 &&
    values.every(
      (value) =>
        typeof value === "string" &&
        PLACEMENTS.includes(value as (typeof PLACEMENTS)[number]),
    )
  );
}

export async function GET(request: Request) {
  if (!(await isAdminRequest(request))) return unauthorized();
  return Response.json(await getAdminCatalog(), {
    headers: { "Cache-Control": "no-store" },
  });
}

export async function POST(request: Request) {
  if (!isSameOrigin(request) || !(await isAdminRequest(request)))
    return unauthorized();
  const body = (await request.json().catch(() => ({}))) as Payload;
  try {
    if (body.entity === "collection") {
      if (!validSlug(body.slug) || !body.nameFa?.trim() || !body.nameEn?.trim())
        return badRequest("Collection slug and names are required.");
      await env.DB.prepare(
        "INSERT INTO design_categories (slug, name_fa, name_en, description, sort_order, active) VALUES (?, ?, ?, ?, COALESCE((SELECT MAX(sort_order) + 1 FROM design_categories), 1), ?)",
      )
        .bind(
          body.slug,
          body.nameFa.trim(),
          body.nameEn.trim(),
          body.description?.trim() ?? "",
          body.active === false ? 0 : 1,
        )
        .run();
    } else if (body.entity === "design") {
      if (
        !validSlug(body.slug) ||
        !body.name?.trim() ||
        !Number.isInteger(body.collectionId) ||
        !validPlacements(body.placements)
      )
        return badRequest(
          "Design name, slug, collection and at least one placement are required.",
        );
      const editionLimit = Math.max(
        0,
        Math.floor(Number(body.editionLimit) || 0),
      );
      const editionIssued = Math.max(
        0,
        Math.floor(Number(body.editionIssued) || 0),
      );
      if (editionLimit > 0 && editionIssued > editionLimit)
        return badRequest("تعداد چاپ‌شده نمی‌تواند بیشتر از تیراژ کل باشد.");
      await env.DB.prepare(
        "INSERT INTO designs (slug, name, description, base_price, base_cost, edition_limit, edition_issued, artwork_key, active) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)",
      )
        .bind(
          body.slug,
          body.name.trim(),
          body.description?.trim() ?? "",
          Math.max(0, Number(body.basePrice) || 0),
          Math.max(0, Number(body.baseCost) || 0),
          editionLimit,
          editionIssued,
          body.artworkKey ?? null,
          body.active === false ? 0 : 1,
        )
        .run();
      const design = await env.DB.prepare(
        "SELECT id FROM designs WHERE slug = ?",
      )
        .bind(body.slug)
        .first<{ id: number }>();
      if (!design) throw new Error("Design was not created");
      await env.DB.batch([
        env.DB.prepare(
          "INSERT INTO design_category_assignments (design_id, category_id) VALUES (?, ?)",
        ).bind(design.id, body.collectionId),
        ...body.placements.map((placement) =>
          env.DB.prepare(
            "INSERT INTO design_placements (design_id, placement_id) VALUES (?, ?)",
          ).bind(design.id, placement),
        ),
      ]);
    } else if (body.entity === "variant") {
      if (
        !Number.isInteger(body.designId) ||
        !body.sku?.trim() ||
        !body.materialId ||
        !body.sizeId ||
        !body.fitId ||
        !body.colorId ||
        !body.printMethodId
      )
        return badRequest("All variant fields are required.");
      await env.DB.prepare(
        "INSERT INTO product_variants (design_id, material_id, size_id, fit_id, color_id, print_method_id, sku, price, cost_price, stock_quantity, active) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)",
      )
        .bind(
          body.designId,
          body.materialId,
          body.sizeId,
          body.fitId,
          body.colorId,
          body.printMethodId,
          body.sku.trim(),
          Math.max(0, Number(body.price) || 0),
          Math.max(0, Number(body.costPrice) || 0),
          Math.max(0, Math.floor(Number(body.stockQuantity) || 0)),
          body.active === false ? 0 : 1,
        )
        .run();
    } else return badRequest("Unknown entity.");
    return Response.json(await getAdminCatalog(), { status: 201 });
  } catch (error) {
    return mutationError(error, body.entity, "create");
  }
}

export async function PATCH(request: Request) {
  if (!isSameOrigin(request) || !(await isAdminRequest(request)))
    return unauthorized();
  const body = (await request.json().catch(() => ({}))) as Payload;
  if (!Number.isInteger(body.id)) return badRequest("A valid id is required.");
  try {
    if (body.entity === "collection") {
      if (!validSlug(body.slug) || !body.nameFa?.trim() || !body.nameEn?.trim())
        return badRequest("Collection slug and names are required.");
      await env.DB.prepare(
        "UPDATE design_categories SET slug = ?, name_fa = ?, name_en = ?, description = ?, active = ? WHERE id = ?",
      )
        .bind(
          body.slug,
          body.nameFa.trim(),
          body.nameEn.trim(),
          body.description?.trim() ?? "",
          body.active === false ? 0 : 1,
          body.id,
        )
        .run();
    } else if (body.entity === "design") {
      if (
        !validSlug(body.slug) ||
        !body.name?.trim() ||
        !Number.isInteger(body.collectionId) ||
        !validPlacements(body.placements)
      )
        return badRequest(
          "Design name, slug, collection and at least one placement are required.",
        );
      const editionLimit = Math.max(
        0,
        Math.floor(Number(body.editionLimit) || 0),
      );
      const editionIssued = Math.max(
        0,
        Math.floor(Number(body.editionIssued) || 0),
      );
      if (editionLimit > 0 && editionIssued > editionLimit)
        return badRequest("تعداد چاپ‌شده نمی‌تواند بیشتر از تیراژ کل باشد.");
      const assigned = await env.DB.prepare(
        "SELECT COALESCE(MAX(edition_end), 0) AS maximum FROM orders WHERE design_id = ?",
      )
        .bind(body.id)
        .first<{ maximum: number }>();
      if (editionIssued < (assigned?.maximum ?? 0))
        return badRequest(
          `شمارنده نمی‌تواند از آخرین شماره اختصاص‌یافته (${assigned?.maximum}) کمتر باشد.`,
        );
      await env.DB.prepare(
        "UPDATE designs SET slug = ?, name = ?, description = ?, base_price = ?, base_cost = ?, edition_limit = ?, edition_issued = ?, artwork_key = ?, active = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?",
      )
        .bind(
          body.slug,
          body.name.trim(),
          body.description?.trim() ?? "",
          Math.max(0, Number(body.basePrice) || 0),
          Math.max(0, Number(body.baseCost) || 0),
          editionLimit,
          editionIssued,
          body.artworkKey ?? null,
          body.active === false ? 0 : 1,
          body.id,
        )
        .run();
      await env.DB.batch([
        env.DB.prepare(
          "DELETE FROM design_category_assignments WHERE design_id = ?",
        ).bind(body.id),
        env.DB.prepare(
          "DELETE FROM design_placements WHERE design_id = ?",
        ).bind(body.id),
        env.DB.prepare(
          "INSERT INTO design_category_assignments (design_id, category_id) VALUES (?, ?)",
        ).bind(body.id, body.collectionId),
        ...body.placements.map((placement) =>
          env.DB.prepare(
            "INSERT INTO design_placements (design_id, placement_id) VALUES (?, ?)",
          ).bind(body.id, placement),
        ),
      ]);
    } else if (body.entity === "variant") {
      if (
        !Number.isInteger(body.designId) ||
        !body.sku?.trim() ||
        !body.materialId ||
        !body.sizeId ||
        !body.fitId ||
        !body.colorId ||
        !body.printMethodId
      )
        return badRequest("All variant fields are required.");
      await env.DB.prepare(
        "UPDATE product_variants SET design_id = ?, material_id = ?, size_id = ?, fit_id = ?, color_id = ?, print_method_id = ?, sku = ?, price = ?, cost_price = ?, stock_quantity = ?, active = ? WHERE id = ?",
      )
        .bind(
          body.designId,
          body.materialId,
          body.sizeId,
          body.fitId,
          body.colorId,
          body.printMethodId,
          body.sku.trim(),
          Math.max(0, Number(body.price) || 0),
          Math.max(0, Number(body.costPrice) || 0),
          Math.max(0, Math.floor(Number(body.stockQuantity) || 0)),
          body.active === false ? 0 : 1,
          body.id,
        )
        .run();
    } else return badRequest("Unknown entity.");
    return Response.json(await getAdminCatalog());
  } catch (error) {
    return mutationError(error, body.entity, "update");
  }
}

export async function DELETE(request: Request) {
  if (!isSameOrigin(request) || !(await isAdminRequest(request)))
    return unauthorized();
  const { searchParams } = new URL(request.url);
  const entity = searchParams.get("entity");
  const id = Number(searchParams.get("id"));
  if (!Number.isInteger(id)) return badRequest("A valid id is required.");
  try {
    if (entity === "collection") {
      const assigned = await env.DB.prepare(
        "SELECT COUNT(*) AS count FROM design_category_assignments WHERE category_id = ?",
      )
        .bind(id)
        .first<{ count: number }>();
      if ((assigned?.count ?? 0) > 0)
        return badRequest("ابتدا طرح‌های این کالکشن را حذف یا منتقل کنید.");
      await env.DB.prepare("DELETE FROM design_categories WHERE id = ?")
        .bind(id)
        .run();
    } else if (entity === "design") {
      const design = await env.DB.prepare(
        "SELECT artwork_key AS artworkKey FROM designs WHERE id = ?",
      )
        .bind(id)
        .first<{ artworkKey: string | null }>();
      await env.DB.prepare("DELETE FROM designs WHERE id = ?").bind(id).run();
      if (design?.artworkKey?.startsWith("https://"))
        await deleteHostedFile(design.artworkKey);
    } else if (entity === "variant") {
      await env.DB.prepare("DELETE FROM product_variants WHERE id = ?")
        .bind(id)
        .run();
    } else return badRequest("Unknown entity.");
    return Response.json(await getAdminCatalog());
  } catch (error) {
    console.error(
      JSON.stringify({
        event: "admin_catalog_delete_failed",
        entity,
        id,
        message: error instanceof Error ? error.message : "unknown",
      }),
    );
    return badRequest(
      "این مورد به اطلاعات دیگری متصل است و فعلاً قابل حذف نیست.",
    );
  }
}
