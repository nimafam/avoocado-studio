PRAGMA foreign_keys = ON;

ALTER TABLE orders ADD COLUMN checkout_code TEXT;

UPDATE orders
SET checkout_code = order_code
WHERE checkout_code IS NULL;

CREATE INDEX IF NOT EXISTS idx_orders_checkout_code
ON orders(checkout_code, id);

PRAGMA optimize;
