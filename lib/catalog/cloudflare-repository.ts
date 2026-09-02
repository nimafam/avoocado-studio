import { env } from "cloudflare:workers";

export const PLACEMENTS = ["left", "right", "center", "large", "lower", "upper"] as const;
export type PlacementId = (typeof PLACEMENTS)[number];

export type PublicCollection = {
    id: number;
    slug: string;
    nameFa: string;
    nameEn: string;
    description: string;
    coverImageKey: string | null;
    designCount: number;
};

export type PublicDesign = {
    id: number;
    slug: string;
    name: string;
    description: string;
    basePrice: number;
    artworkKey: string | null;
    collectionSlug: string;
    placements: string | null;
};

export async function getPublicCollections() {
    const result = await env.DB.prepare(`
        SELECT c.id, c.slug, c.name_fa AS nameFa, c.name_en AS nameEn,
               c.description, c.cover_image_key AS coverImageKey,
               COUNT(DISTINCT d.id) AS designCount
        FROM design_categories c
        LEFT JOIN design_category_assignments a ON a.category_id = c.id
        LEFT JOIN designs d ON d.id = a.design_id AND d.active = 1
        WHERE c.active = 1
        GROUP BY c.id
        ORDER BY c.sort_order, c.id
    `).all<PublicCollection>();

    return result.results ?? [];
}

export async function getPublicCollection(slug: string) {
    const collection = await env.DB.prepare(`
        SELECT c.id, c.slug, c.name_fa AS nameFa, c.name_en AS nameEn,
               c.description, c.cover_image_key AS coverImageKey,
               COUNT(DISTINCT d.id) AS designCount
        FROM design_categories c
        LEFT JOIN design_category_assignments a ON a.category_id = c.id
        LEFT JOIN designs d ON d.id = a.design_id AND d.active = 1
        WHERE c.slug = ? AND c.active = 1
        GROUP BY c.id
    `).bind(slug).first<PublicCollection>();

    if (!collection) return null;

    const designs = await env.DB.prepare(`
        SELECT d.id, d.slug, d.name, d.description, d.base_price AS basePrice,
               d.artwork_key AS artworkKey, c.slug AS collectionSlug,
               GROUP_CONCAT(dp.placement_id) AS placements
        FROM designs d
        JOIN design_category_assignments a ON a.design_id = d.id
        JOIN design_categories c ON c.id = a.category_id AND c.active = 1
        LEFT JOIN design_placements dp ON dp.design_id = d.id
        WHERE c.id = ? AND d.active = 1
        GROUP BY d.id
        ORDER BY d.created_at DESC, d.id DESC
    `).bind(collection.id).all<PublicDesign>();

    return { collection, designs: designs.results ?? [] };
}

export async function getPublicCatalog() {
    const [categories, designs] = await Promise.all([
        env.DB.prepare("SELECT id, slug, name_fa AS nameFa, name_en AS nameEn FROM design_categories WHERE active = 1 ORDER BY sort_order, id").all(),
        env.DB.prepare(`
            SELECT d.id, d.slug, d.name, d.description, d.base_price AS basePrice,
                   d.artwork_key AS artworkKey, c.slug AS collectionSlug,
                   GROUP_CONCAT(dp.placement_id) AS placements
            FROM designs d
            JOIN design_category_assignments a ON a.design_id = d.id
            JOIN design_categories c ON c.id = a.category_id AND c.active = 1
            LEFT JOIN design_placements dp ON dp.design_id = d.id
            WHERE d.active = 1
            GROUP BY d.id, c.slug
            ORDER BY d.created_at DESC, d.id DESC
        `).all(),
    ]);
    return { categories: categories.results ?? [], designs: designs.results ?? [] };
}

export async function getAdminCatalog() {
    const [categories, designs] = await Promise.all([
        env.DB.prepare("SELECT id, slug, name_fa AS nameFa, name_en AS nameEn, sort_order AS sortOrder, active FROM design_categories ORDER BY sort_order, id").all(),
        env.DB.prepare(`
            SELECT d.id, d.slug, d.name, d.description, d.base_price AS basePrice, d.artwork_key AS artworkKey,
                   d.active, c.id AS collectionId, c.name_en AS collectionName,
                   GROUP_CONCAT(dp.placement_id) AS placements
            FROM designs d
            LEFT JOIN design_category_assignments a ON a.design_id = d.id
            LEFT JOIN design_categories c ON c.id = a.category_id
            LEFT JOIN design_placements dp ON dp.design_id = d.id
            GROUP BY d.id
            ORDER BY d.updated_at DESC, d.id DESC
        `).all(),
    ]);
    return { categories: categories.results ?? [], designs: designs.results ?? [], placements: PLACEMENTS };
}

export function validSlug(value: unknown) {
    return typeof value === "string" && /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(value) && value.length <= 80;
}
