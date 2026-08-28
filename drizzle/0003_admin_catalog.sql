PRAGMA foreign_keys = ON;

CREATE TABLE IF NOT EXISTS placement_options (
    id TEXT PRIMARY KEY,
    name_en TEXT NOT NULL,
    name_fa TEXT NOT NULL,
    sort_order INTEGER NOT NULL DEFAULT 0,
    active INTEGER NOT NULL DEFAULT 1 CHECK (active IN (0, 1))
);

CREATE TABLE IF NOT EXISTS design_placements (
    design_id INTEGER NOT NULL REFERENCES designs(id) ON DELETE CASCADE,
    placement_id TEXT NOT NULL REFERENCES placement_options(id),
    PRIMARY KEY (design_id, placement_id)
);

CREATE INDEX IF NOT EXISTS idx_categories_active_sort
ON design_categories(active, sort_order);

CREATE INDEX IF NOT EXISTS idx_design_placements_design
ON design_placements(design_id, placement_id);

INSERT OR IGNORE INTO placement_options (id, name_en, name_fa, sort_order) VALUES
('left', 'Left', 'چپ', 1),
('right', 'Right', 'راست', 2),
('center', 'Center', 'وسط', 3),
('large', 'Large Center', 'وسط بزرگ', 4),
('lower', 'Lower Center', 'پایین وسط', 5),
('upper', 'Upper Center', 'بالا وسط', 6);

INSERT OR IGNORE INTO design_placements (design_id, placement_id)
SELECT d.id, p.id FROM designs d CROSS JOIN placement_options p;

PRAGMA optimize;

