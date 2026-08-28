export const catalogSchemaStatements = [
    `CREATE TABLE IF NOT EXISTS shirt_materials (id TEXT PRIMARY KEY, name_fa TEXT NOT NULL, name_en TEXT NOT NULL, sort_order INTEGER NOT NULL DEFAULT 0, active INTEGER NOT NULL DEFAULT 1 CHECK (active IN (0, 1)))`,
    `CREATE TABLE IF NOT EXISTS shirt_sizes (id TEXT PRIMARY KEY, label TEXT NOT NULL UNIQUE, sort_order INTEGER NOT NULL DEFAULT 0, active INTEGER NOT NULL DEFAULT 1 CHECK (active IN (0, 1)))`,
    `CREATE TABLE IF NOT EXISTS shirt_fits (id TEXT PRIMARY KEY, name_fa TEXT NOT NULL, name_en TEXT NOT NULL, image_prefix TEXT NOT NULL, sort_order INTEGER NOT NULL DEFAULT 0, active INTEGER NOT NULL DEFAULT 1 CHECK (active IN (0, 1)))`,
    `CREATE TABLE IF NOT EXISTS shirt_colors (id TEXT PRIMARY KEY, name_fa TEXT NOT NULL, name_en TEXT NOT NULL, hex TEXT NOT NULL, css_filter TEXT NOT NULL DEFAULT 'none', sort_order INTEGER NOT NULL DEFAULT 0, active INTEGER NOT NULL DEFAULT 1 CHECK (active IN (0, 1)))`,
    `CREATE TABLE IF NOT EXISTS print_methods (id TEXT PRIMARY KEY, name_fa TEXT NOT NULL, name_en TEXT NOT NULL, active INTEGER NOT NULL DEFAULT 1 CHECK (active IN (0, 1)))`,
    `CREATE TABLE IF NOT EXISTS design_categories (id INTEGER PRIMARY KEY AUTOINCREMENT, slug TEXT NOT NULL UNIQUE, name_fa TEXT NOT NULL, name_en TEXT NOT NULL, sort_order INTEGER NOT NULL DEFAULT 0, active INTEGER NOT NULL DEFAULT 1 CHECK (active IN (0, 1)))`,
    `CREATE TABLE IF NOT EXISTS designs (id INTEGER PRIMARY KEY AUTOINCREMENT, slug TEXT NOT NULL UNIQUE, name TEXT NOT NULL, description TEXT NOT NULL DEFAULT '', base_price INTEGER NOT NULL DEFAULT 0 CHECK (base_price >= 0), artwork_key TEXT, active INTEGER NOT NULL DEFAULT 1 CHECK (active IN (0, 1)), created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP, updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP)`,
    `CREATE TABLE IF NOT EXISTS design_category_assignments (design_id INTEGER NOT NULL REFERENCES designs(id) ON DELETE CASCADE, category_id INTEGER NOT NULL REFERENCES design_categories(id) ON DELETE CASCADE, PRIMARY KEY (design_id, category_id))`,
    `CREATE TABLE IF NOT EXISTS product_variants (id INTEGER PRIMARY KEY AUTOINCREMENT, design_id INTEGER NOT NULL REFERENCES designs(id) ON DELETE CASCADE, material_id TEXT NOT NULL REFERENCES shirt_materials(id), size_id TEXT NOT NULL REFERENCES shirt_sizes(id), fit_id TEXT NOT NULL REFERENCES shirt_fits(id), color_id TEXT NOT NULL REFERENCES shirt_colors(id), print_method_id TEXT NOT NULL REFERENCES print_methods(id), sku TEXT NOT NULL UNIQUE, price INTEGER NOT NULL CHECK (price >= 0), stock_quantity INTEGER NOT NULL DEFAULT 0 CHECK (stock_quantity >= 0), active INTEGER NOT NULL DEFAULT 1 CHECK (active IN (0, 1)), UNIQUE (design_id, material_id, size_id, fit_id, color_id, print_method_id))`,
    `CREATE INDEX IF NOT EXISTS idx_designs_active ON designs(active)`,
    `CREATE INDEX IF NOT EXISTS idx_design_category_category ON design_category_assignments(category_id, design_id)`,
    `CREATE INDEX IF NOT EXISTS idx_variants_design_active ON product_variants(design_id, active)`,
    `CREATE INDEX IF NOT EXISTS idx_variants_options ON product_variants(fit_id, color_id, size_id, active)`,
] as const;

