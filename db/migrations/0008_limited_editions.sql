PRAGMA foreign_keys = ON;

ALTER TABLE designs ADD COLUMN edition_limit INTEGER NOT NULL DEFAULT 0 CHECK (edition_limit >= 0);
ALTER TABLE designs ADD COLUMN edition_issued INTEGER NOT NULL DEFAULT 0 CHECK (edition_issued >= 0);
ALTER TABLE orders ADD COLUMN edition_start INTEGER;
ALTER TABLE orders ADD COLUMN edition_end INTEGER;
ALTER TABLE orders ADD COLUMN edition_limit_snapshot INTEGER;

CREATE INDEX IF NOT EXISTS idx_orders_design_edition ON orders(design_id, edition_end);

PRAGMA optimize;
