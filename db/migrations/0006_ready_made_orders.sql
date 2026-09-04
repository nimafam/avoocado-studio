PRAGMA foreign_keys = ON;

ALTER TABLE orders ADD COLUMN order_type TEXT NOT NULL DEFAULT 'custom' CHECK (order_type IN ('custom', 'ready-made'));
ALTER TABLE orders ADD COLUMN variant_sku TEXT;
ALTER TABLE orders ADD COLUMN total_price INTEGER NOT NULL DEFAULT 0 CHECK (total_price >= 0);

CREATE INDEX IF NOT EXISTS idx_orders_variant_sku ON orders(variant_sku);

UPDATE orders SET total_price = unit_price * quantity WHERE total_price = 0;

PRAGMA optimize;
