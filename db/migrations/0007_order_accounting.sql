PRAGMA foreign_keys = ON;

ALTER TABLE designs ADD COLUMN base_cost INTEGER NOT NULL DEFAULT 0 CHECK (base_cost >= 0);
ALTER TABLE product_variants ADD COLUMN cost_price INTEGER NOT NULL DEFAULT 0 CHECK (cost_price >= 0);
ALTER TABLE orders ADD COLUMN unit_cost INTEGER NOT NULL DEFAULT 0 CHECK (unit_cost >= 0);
ALTER TABLE orders ADD COLUMN discount_amount INTEGER NOT NULL DEFAULT 0 CHECK (discount_amount >= 0);
ALTER TABLE orders ADD COLUMN payment_status TEXT NOT NULL DEFAULT 'unpaid' CHECK (payment_status IN ('unpaid', 'paid', 'refunded'));

CREATE INDEX IF NOT EXISTS idx_orders_payment_status ON orders(payment_status, created_at DESC);

PRAGMA optimize;
