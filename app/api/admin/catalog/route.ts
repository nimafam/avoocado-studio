import { env } from "cloudflare:workers";
import { isAdminRequest, isSameOrigin } from "@/lib/admin/auth";
import { getAdminCatalog, PLACEMENTS, validSlug } from "@/lib/catalog/cloudflare-repository";
import { deleteHostedFile } from "@/lib/storage/hosted-files";

export const dynamic = "force-dynamic";

type Payload = {
    entity?: "collection" | "design";
    id?: number;
    slug?: string;
    nameFa?: string;
    nameEn?: string;
    name?: string;
    description?: string;
    basePrice?: number;
    artworkKey?: string | null;
    collectionId?: number;
    placements?: string[];
    active?: boolean;
};

function unauthorized() { return Response.json({ error: "Unauthorized" }, { status: 401 }); }
function badRequest(message: string) { return Response.json({ error: message }, { status: 400 }); }
function validPlacements(values: unknown): values is string[] {
    return Array.isArray(values) && values.length > 0 && values.every((value) => typeof value === "string" && PLACEMENTS.includes(value as (typeof PLACEMENTS)[number]));
}

export async function GET(request: Request) {
    if (!await isAdminRequest(request)) return unauthorized();
    return Response.json(await getAdminCatalog(), { headers: { "Cache-Control": "no-store" } });
}

export async function POST(request: Request) {
    if (!isSameOrigin(request) || !await isAdminRequest(request)) return unauthorized();
    const body = await request.json().catch(() => ({})) as Payload;
    try {
        if (body.entity === "collection") {
            if (!validSlug(body.slug) || !body.nameFa?.trim() || !body.nameEn?.trim()) return badRequest("Collection slug and names are required.");
            await env.DB.prepare("INSERT INTO design_categories (slug, name_fa, name_en, sort_order, active) VALUES (?, ?, ?, COALESCE((SELECT MAX(sort_order) + 1 FROM design_categories), 1), ?)")
                .bind(body.slug, body.nameFa.trim(), body.nameEn.trim(), body.active === false ? 0 : 1).run();
        } else if (body.entity === "design") {
            if (!validSlug(body.slug) || !body.name?.trim() || !Number.isInteger(body.collectionId) || !validPlacements(body.placements)) return badRequest("Design name, slug, collection and at least one placement are required.");
            await env.DB.prepare("INSERT INTO designs (slug, name, description, base_price, artwork_key, active) VALUES (?, ?, ?, ?, ?, ?)")
                .bind(body.slug, body.name.trim(), body.description?.trim() ?? "", Math.max(0, Number(body.basePrice) || 0), body.artworkKey ?? null, body.active === false ? 0 : 1).run();
            const design = await env.DB.prepare("SELECT id FROM designs WHERE slug = ?").bind(body.slug).first<{ id: number }>();
            if (!design) throw new Error("Design was not created");
            await env.DB.batch([
                env.DB.prepare("INSERT INTO design_category_assignments (design_id, category_id) VALUES (?, ?)").bind(design.id, body.collectionId),
                ...body.placements.map((placement) => env.DB.prepare("INSERT INTO design_placements (design_id, placement_id) VALUES (?, ?)").bind(design.id, placement)),
            ]);
        } else return badRequest("Unknown entity.");
        return Response.json(await getAdminCatalog(), { status: 201 });
    } catch (error) {
        return badRequest(error instanceof Error && error.message.includes("UNIQUE") ? "Slug is already in use." : "Could not create this item.");
    }
}

export async function PATCH(request: Request) {
    if (!isSameOrigin(request) || !await isAdminRequest(request)) return unauthorized();
    const body = await request.json().catch(() => ({})) as Payload;
    if (!Number.isInteger(body.id)) return badRequest("A valid id is required.");
    try {
        if (body.entity === "collection") {
            if (!validSlug(body.slug) || !body.nameFa?.trim() || !body.nameEn?.trim()) return badRequest("Collection slug and names are required.");
            await env.DB.prepare("UPDATE design_categories SET slug = ?, name_fa = ?, name_en = ?, active = ? WHERE id = ?")
                .bind(body.slug, body.nameFa.trim(), body.nameEn.trim(), body.active === false ? 0 : 1, body.id).run();
        } else if (body.entity === "design") {
            if (!validSlug(body.slug) || !body.name?.trim() || !Number.isInteger(body.collectionId) || !validPlacements(body.placements)) return badRequest("Design name, slug, collection and at least one placement are required.");
            await env.DB.prepare("UPDATE designs SET slug = ?, name = ?, description = ?, base_price = ?, artwork_key = ?, active = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?")
                .bind(body.slug, body.name.trim(), body.description?.trim() ?? "", Math.max(0, Number(body.basePrice) || 0), body.artworkKey ?? null, body.active === false ? 0 : 1, body.id).run();
            await env.DB.batch([
                env.DB.prepare("DELETE FROM design_category_assignments WHERE design_id = ?").bind(body.id),
                env.DB.prepare("DELETE FROM design_placements WHERE design_id = ?").bind(body.id),
                env.DB.prepare("INSERT INTO design_category_assignments (design_id, category_id) VALUES (?, ?)").bind(body.id, body.collectionId),
                ...body.placements.map((placement) => env.DB.prepare("INSERT INTO design_placements (design_id, placement_id) VALUES (?, ?)").bind(body.id, placement)),
            ]);
        } else return badRequest("Unknown entity.");
        return Response.json(await getAdminCatalog());
    } catch (error) {
        return badRequest(error instanceof Error && error.message.includes("UNIQUE") ? "Slug is already in use." : "Could not update this item.");
    }
}

export async function DELETE(request: Request) {
    if (!isSameOrigin(request) || !await isAdminRequest(request)) return unauthorized();
    const { searchParams } = new URL(request.url);
    const entity = searchParams.get("entity");
    const id = Number(searchParams.get("id"));
    if (!Number.isInteger(id)) return badRequest("A valid id is required.");
    try {
        if (entity === "collection") {
            const assigned = await env.DB.prepare("SELECT COUNT(*) AS count FROM design_category_assignments WHERE category_id = ?").bind(id).first<{ count: number }>();
            if ((assigned?.count ?? 0) > 0) return badRequest("Move or delete this collection's designs first.");
            await env.DB.prepare("DELETE FROM design_categories WHERE id = ?").bind(id).run();
        } else if (entity === "design") {
            const design = await env.DB.prepare("SELECT artwork_key AS artworkKey FROM designs WHERE id = ?").bind(id).first<{ artworkKey: string | null }>();
            await env.DB.prepare("DELETE FROM designs WHERE id = ?").bind(id).run();
            if (design?.artworkKey?.startsWith("https://")) await deleteHostedFile(design.artworkKey);
        } else return badRequest("Unknown entity.");
        return Response.json(await getAdminCatalog());
    } catch {
        return badRequest("Could not delete this item.");
    }
}
