PRAGMA foreign_keys = ON;

CREATE TABLE IF NOT EXISTS orders (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    order_code TEXT NOT NULL UNIQUE,
    customer_first_name TEXT NOT NULL,
    customer_last_name TEXT NOT NULL,
    customer_phone TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'new' CHECK (status IN ('new', 'confirmed', 'printing', 'ready', 'completed', 'cancelled')),
    design_id INTEGER REFERENCES designs(id) ON DELETE SET NULL,
    design_name TEXT NOT NULL,
    collection_slug TEXT NOT NULL,
    material_id TEXT NOT NULL,
    size_id TEXT NOT NULL,
    fit_id TEXT NOT NULL,
    color_id TEXT NOT NULL,
    print_side TEXT NOT NULL CHECK (print_side IN ('front', 'back')),
    placement_id TEXT NOT NULL REFERENCES placement_options(id),
    quantity INTEGER NOT NULL DEFAULT 1 CHECK (quantity BETWEEN 1 AND 20),
    unit_price INTEGER NOT NULL DEFAULT 0 CHECK (unit_price >= 0),
    front_image_key TEXT NOT NULL,
    back_image_key TEXT NOT NULL,
    configuration_json TEXT NOT NULL,
    telegram_status TEXT NOT NULL DEFAULT 'not_configured' CHECK (telegram_status IN ('pending', 'sent', 'failed', 'not_configured')),
    telegram_error TEXT,
    created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_orders_created_at ON orders(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_orders_status_created ON orders(status, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_orders_phone ON orders(customer_phone);

PRAGMA optimize;
