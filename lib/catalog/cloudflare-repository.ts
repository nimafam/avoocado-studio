import { env } from "cloudflare:workers";

export const PLACEMENTS = ["left", "right", "center", "large", "lower", "upper"] as const;
export type PlacementId = (typeof PLACEMENTS)[number];

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

