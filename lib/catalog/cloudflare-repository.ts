import { env } from "cloudflare:workers";

export const PLACEMENTS = [
  "left",
  "right",
  "center",
  "large",
  "lower",
  "upper",
] as const;
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

export type PublicProduct = PublicDesign & {
  collectionName: string;
  collectionNameFa: string;
  price: number;
  variantCount: number;
  editionLimit: number;
  editionIssued: number;
};

export type PublicVariant = {
  sku: string;
  price: number;
  stockQuantity: number;
  materialId: string;
  materialNameFa: string;
  materialNameEn: string;
  sizeId: string;
  sizeLabel: string;
  fitId: string;
  fitNameFa: string;
  fitNameEn: string;
  colorId: string;
  colorNameFa: string;
  colorNameEn: string;
  colorHex: string;
};

export async function getPublicProducts() {
  const result = await env.DB.prepare(
    `
        SELECT d.id, d.slug, d.name, d.description, d.base_price AS basePrice,
               d.edition_limit AS editionLimit, d.edition_issued AS editionIssued,
               d.artwork_key AS artworkKey, c.slug AS collectionSlug,
               c.name_en AS collectionName, c.name_fa AS collectionNameFa,
               GROUP_CONCAT(DISTINCT dp.placement_id) AS placements,
               COALESCE(MIN(CASE WHEN v.active = 1 THEN v.price END), d.base_price) AS price,
               COUNT(DISTINCT CASE WHEN v.active = 1 THEN v.id END) AS variantCount
        FROM designs d
        JOIN design_category_assignments a ON a.design_id = d.id
        JOIN design_categories c ON c.id = a.category_id AND c.active = 1
        LEFT JOIN design_placements dp ON dp.design_id = d.id
        LEFT JOIN product_variants v ON v.design_id = d.id
        WHERE d.active = 1
        GROUP BY d.id, c.id
        ORDER BY d.created_at DESC, d.id DESC
    `,
  ).all<PublicProduct>();

  return result.results ?? [];
}

export async function getPublicProduct(slug: string) {
  const product = await env.DB.prepare(
    `
        SELECT d.id, d.slug, d.name, d.description, d.base_price AS basePrice,
               d.edition_limit AS editionLimit, d.edition_issued AS editionIssued,
               d.artwork_key AS artworkKey, c.slug AS collectionSlug,
               c.name_en AS collectionName, c.name_fa AS collectionNameFa,
               GROUP_CONCAT(DISTINCT dp.placement_id) AS placements,
               COALESCE(MIN(CASE WHEN v.active = 1 THEN v.price END), d.base_price) AS price,
               COUNT(DISTINCT CASE WHEN v.active = 1 THEN v.id END) AS variantCount
        FROM designs d
        JOIN design_category_assignments a ON a.design_id = d.id
        JOIN design_categories c ON c.id = a.category_id AND c.active = 1
        LEFT JOIN design_placements dp ON dp.design_id = d.id
        LEFT JOIN product_variants v ON v.design_id = d.id
        WHERE d.slug = ? AND d.active = 1
        GROUP BY d.id, c.id
        LIMIT 1
    `,
  )
    .bind(slug)
    .first<PublicProduct>();

  if (!product) return null;

  const variants = await env.DB.prepare(
    `
        SELECT v.sku, v.price, v.stock_quantity AS stockQuantity,
               m.id AS materialId, m.name_fa AS materialNameFa, m.name_en AS materialNameEn,
               s.id AS sizeId, s.label AS sizeLabel,
               f.id AS fitId, f.name_fa AS fitNameFa, f.name_en AS fitNameEn,
               c.id AS colorId, c.name_fa AS colorNameFa, c.name_en AS colorNameEn, c.hex AS colorHex
        FROM product_variants v
        JOIN shirt_materials m ON m.id = v.material_id AND m.active = 1
        JOIN shirt_sizes s ON s.id = v.size_id AND s.active = 1
        JOIN shirt_fits f ON f.id = v.fit_id AND f.active = 1
        JOIN shirt_colors c ON c.id = v.color_id AND c.active = 1
        WHERE v.design_id = ? AND v.active = 1
        ORDER BY f.sort_order, c.sort_order, s.sort_order, m.sort_order
    `,
  )
    .bind(product.id)
    .all<PublicVariant>();

  return { product, variants: variants.results ?? [] };
}

export async function getPublicCollections() {
  const result = await env.DB.prepare(
    `
        SELECT c.id, c.slug, c.name_fa AS nameFa, c.name_en AS nameEn,
               c.description, c.cover_image_key AS coverImageKey,
               COUNT(DISTINCT d.id) AS designCount
        FROM design_categories c
        LEFT JOIN design_category_assignments a ON a.category_id = c.id
        LEFT JOIN designs d ON d.id = a.design_id AND d.active = 1
        WHERE c.active = 1
        GROUP BY c.id
        ORDER BY c.sort_order, c.id
    `,
  ).all<PublicCollection>();

  return result.results ?? [];
}

export async function getPublicCollection(slug: string) {
  const collection = await env.DB.prepare(
    `
        SELECT c.id, c.slug, c.name_fa AS nameFa, c.name_en AS nameEn,
               c.description, c.cover_image_key AS coverImageKey,
               COUNT(DISTINCT d.id) AS designCount
        FROM design_categories c
        LEFT JOIN design_category_assignments a ON a.category_id = c.id
        LEFT JOIN designs d ON d.id = a.design_id AND d.active = 1
        WHERE c.slug = ? AND c.active = 1
        GROUP BY c.id
    `,
  )
    .bind(slug)
    .first<PublicCollection>();

  if (!collection) return null;

  const designs = await env.DB.prepare(
    `
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
    `,
  )
    .bind(collection.id)
    .all<PublicDesign>();

  return { collection, designs: designs.results ?? [] };
}

export async function getPublicCatalog() {
  const [categories, designs] = await Promise.all([
    env.DB.prepare(
      "SELECT id, slug, name_fa AS nameFa, name_en AS nameEn FROM design_categories WHERE active = 1 ORDER BY sort_order, id",
    ).all(),
    env.DB.prepare(
      `
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
        `,
    ).all(),
  ]);
  return {
    categories: categories.results ?? [],
    designs: designs.results ?? [],
  };
}

export async function getAdminCatalog() {
  const [
    categories,
    designs,
    variants,
    materials,
    sizes,
    fits,
    colors,
    printMethods,
  ] = await Promise.all([
    env.DB.prepare(
      "SELECT id, slug, name_fa AS nameFa, name_en AS nameEn, description, sort_order AS sortOrder, active FROM design_categories ORDER BY sort_order, id",
    ).all(),
    env.DB.prepare(
      `
            SELECT d.id, d.slug, d.name, d.description, d.base_price AS basePrice, d.base_cost AS baseCost,
                   d.edition_limit AS editionLimit, d.edition_issued AS editionIssued, d.artwork_key AS artworkKey,
                   d.active, c.id AS collectionId, c.name_en AS collectionName,
                   GROUP_CONCAT(dp.placement_id) AS placements
            FROM designs d
            LEFT JOIN design_category_assignments a ON a.design_id = d.id
            LEFT JOIN design_categories c ON c.id = a.category_id
            LEFT JOIN design_placements dp ON dp.design_id = d.id
            GROUP BY d.id
            ORDER BY d.updated_at DESC, d.id DESC
        `,
    ).all(),
    env.DB.prepare(
      `
            SELECT v.id, v.design_id AS designId, d.name AS designName, v.sku, v.price, v.cost_price AS costPrice,
                   v.stock_quantity AS stockQuantity, v.material_id AS materialId,
                   v.size_id AS sizeId, v.fit_id AS fitId, v.color_id AS colorId,
                   v.print_method_id AS printMethodId, v.active
            FROM product_variants v
            JOIN designs d ON d.id = v.design_id
            ORDER BY d.name, v.sku
        `,
    ).all(),
    env.DB.prepare(
      "SELECT id, name_fa AS nameFa, name_en AS nameEn FROM shirt_materials WHERE active = 1 ORDER BY sort_order",
    ).all(),
    env.DB.prepare(
      "SELECT id, label FROM shirt_sizes WHERE active = 1 ORDER BY sort_order",
    ).all(),
    env.DB.prepare(
      "SELECT id, name_fa AS nameFa, name_en AS nameEn FROM shirt_fits WHERE active = 1 ORDER BY sort_order",
    ).all(),
    env.DB.prepare(
      "SELECT id, name_fa AS nameFa, name_en AS nameEn, hex FROM shirt_colors WHERE active = 1 ORDER BY sort_order",
    ).all(),
    env.DB.prepare(
      "SELECT id, name_fa AS nameFa, name_en AS nameEn FROM print_methods WHERE active = 1 ORDER BY id",
    ).all(),
  ]);
  return {
    categories: categories.results ?? [],
    designs: designs.results ?? [],
    variants: variants.results ?? [],
    materials: materials.results ?? [],
    sizes: sizes.results ?? [],
    fits: fits.results ?? [],
    colors: colors.results ?? [],
    printMethods: printMethods.results ?? [],
    placements: PLACEMENTS,
  };
}

export function validSlug(value: unknown) {
  return (
    typeof value === "string" &&
    /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(value) &&
    value.length <= 80
  );
}
