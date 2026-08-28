export type D1PreparedStatement = {
    bind(...values: unknown[]): D1PreparedStatement;
    all<T>(): Promise<{ results: T[] }>;
    first<T>(): Promise<T | null>;
    run(): Promise<unknown>;
};

export type CatalogDatabase = {
    prepare(query: string): D1PreparedStatement;
    batch(statements: D1PreparedStatement[]): Promise<unknown[]>;
};

export async function initializeCatalog(database: CatalogDatabase, statements: readonly string[]) {
    await database.batch(statements.map((statement) => database.prepare(statement)));
}

export async function listActiveCategories(database: CatalogDatabase) {
    const result = await database.prepare(
        "SELECT slug, name_fa AS nameFa, name_en AS nameEn FROM design_categories WHERE active = 1 ORDER BY sort_order, id",
    ).all<{ slug: string; nameFa: string; nameEn: string }>();
    return result.results;
}

export async function listAvailableVariants(database: CatalogDatabase, designSlug: string) {
    const result = await database.prepare(`
        SELECT v.sku, v.price, v.stock_quantity AS stockQuantity,
               v.material_id AS materialId, v.size_id AS sizeId,
               v.fit_id AS fitId, v.color_id AS colorId,
               v.print_method_id AS printMethodId
        FROM product_variants v
        JOIN designs d ON d.id = v.design_id
        WHERE d.slug = ? AND d.active = 1 AND v.active = 1
        ORDER BY v.price, v.sku
    `).bind(designSlug).all<{
        sku: string;
        price: number;
        stockQuantity: number;
        materialId: string;
        sizeId: string;
        fitId: string;
        colorId: string;
        printMethodId: string;
    }>();
    return result.results;
}

