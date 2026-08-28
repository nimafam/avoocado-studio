PRAGMA foreign_keys = ON;

CREATE TABLE IF NOT EXISTS shirt_materials (id TEXT PRIMARY KEY, name_fa TEXT NOT NULL, name_en TEXT NOT NULL, sort_order INTEGER NOT NULL DEFAULT 0, active INTEGER NOT NULL DEFAULT 1 CHECK (active IN (0, 1)));
CREATE TABLE IF NOT EXISTS shirt_sizes (id TEXT PRIMARY KEY, label TEXT NOT NULL UNIQUE, sort_order INTEGER NOT NULL DEFAULT 0, active INTEGER NOT NULL DEFAULT 1 CHECK (active IN (0, 1)));
CREATE TABLE IF NOT EXISTS shirt_fits (id TEXT PRIMARY KEY, name_fa TEXT NOT NULL, name_en TEXT NOT NULL, image_prefix TEXT NOT NULL, sort_order INTEGER NOT NULL DEFAULT 0, active INTEGER NOT NULL DEFAULT 1 CHECK (active IN (0, 1)));
CREATE TABLE IF NOT EXISTS shirt_colors (id TEXT PRIMARY KEY, name_fa TEXT NOT NULL, name_en TEXT NOT NULL, hex TEXT NOT NULL, css_filter TEXT NOT NULL DEFAULT 'none', sort_order INTEGER NOT NULL DEFAULT 0, active INTEGER NOT NULL DEFAULT 1 CHECK (active IN (0, 1)));
CREATE TABLE IF NOT EXISTS print_methods (id TEXT PRIMARY KEY, name_fa TEXT NOT NULL, name_en TEXT NOT NULL, active INTEGER NOT NULL DEFAULT 1 CHECK (active IN (0, 1)));
CREATE TABLE IF NOT EXISTS design_categories (id INTEGER PRIMARY KEY AUTOINCREMENT, slug TEXT NOT NULL UNIQUE, name_fa TEXT NOT NULL, name_en TEXT NOT NULL, sort_order INTEGER NOT NULL DEFAULT 0, active INTEGER NOT NULL DEFAULT 1 CHECK (active IN (0, 1)));
CREATE TABLE IF NOT EXISTS designs (id INTEGER PRIMARY KEY AUTOINCREMENT, slug TEXT NOT NULL UNIQUE, name TEXT NOT NULL, description TEXT NOT NULL DEFAULT '', base_price INTEGER NOT NULL DEFAULT 0 CHECK (base_price >= 0), artwork_key TEXT, active INTEGER NOT NULL DEFAULT 1 CHECK (active IN (0, 1)), created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP, updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP);
CREATE TABLE IF NOT EXISTS design_category_assignments (design_id INTEGER NOT NULL REFERENCES designs(id) ON DELETE CASCADE, category_id INTEGER NOT NULL REFERENCES design_categories(id) ON DELETE CASCADE, PRIMARY KEY (design_id, category_id));
CREATE TABLE IF NOT EXISTS product_variants (id INTEGER PRIMARY KEY AUTOINCREMENT, design_id INTEGER NOT NULL REFERENCES designs(id) ON DELETE CASCADE, material_id TEXT NOT NULL REFERENCES shirt_materials(id), size_id TEXT NOT NULL REFERENCES shirt_sizes(id), fit_id TEXT NOT NULL REFERENCES shirt_fits(id), color_id TEXT NOT NULL REFERENCES shirt_colors(id), print_method_id TEXT NOT NULL REFERENCES print_methods(id), sku TEXT NOT NULL UNIQUE, price INTEGER NOT NULL CHECK (price >= 0), stock_quantity INTEGER NOT NULL DEFAULT 0 CHECK (stock_quantity >= 0), active INTEGER NOT NULL DEFAULT 1 CHECK (active IN (0, 1)), UNIQUE (design_id, material_id, size_id, fit_id, color_id, print_method_id));

CREATE INDEX IF NOT EXISTS idx_designs_active ON designs(active);
CREATE INDEX IF NOT EXISTS idx_design_category_category ON design_category_assignments(category_id, design_id);
CREATE INDEX IF NOT EXISTS idx_variants_design_active ON product_variants(design_id, active);
CREATE INDEX IF NOT EXISTS idx_variants_options ON product_variants(fit_id, color_id, size_id, active);

INSERT OR IGNORE INTO shirt_materials VALUES ('cotton-28', 'نخ ۲۸', 'Cotton 28', 1, 1), ('machinist', 'ماچینست', 'Machinist', 2, 1);
INSERT OR IGNORE INTO shirt_sizes VALUES ('L', 'Large', 1, 1), ('XL', 'X-Large', 2, 1), ('2XL', '2X-Large', 3, 1), ('3XL', '3X-Large', 4, 1), ('4XL', '4X-Large', 5, 1), ('5XL', '5X-Large', 6, 1), ('6XL', '6X-Large', 7, 1);
INSERT OR IGNORE INTO shirt_fits VALUES ('boxy', 'باکس', 'Boxy fit', 'boxy-fit', 1, 1), ('loose', 'لش (افتاده)', 'Loose fit', 'loose-fit', 2, 1);
INSERT OR IGNORE INTO print_methods VALUES ('dtf', 'چاپ DTF', 'DTF print', 1);
INSERT OR IGNORE INTO shirt_colors VALUES
('white', 'سفید', 'White', '#f7f7f3', 'brightness(1.08) saturate(.25)', 1, 1),
('black', 'مشکی', 'Black', '#171717', 'brightness(.25) contrast(1.35)', 2, 1),
('bone-white', 'سفید استخوانی', 'Bone White', '#e8dfcf', 'sepia(.34) saturate(.5) brightness(1.06)', 3, 1),
('zara-green', 'سبز زارا', 'Zara Green', '#a7b59a', 'sepia(.25) saturate(.75) hue-rotate(55deg) brightness(.96)', 4, 1),
('teal-green', 'سبز کله‌غازی', 'Teal Green', '#175f5b', 'sepia(.35) saturate(1.65) hue-rotate(110deg) brightness(.58)', 5, 1),
('sky-blue', 'آبی آسمانی', 'Sky Blue', '#afcfe8', 'sepia(.15) saturate(.9) hue-rotate(155deg) brightness(1.03)', 6, 1),
('light-grey', 'طوسی روشن', 'Light Grey', '#c9cbcb', 'brightness(.9) saturate(.3)', 7, 1),
('olive-green', 'سبز زیتونی', 'Olive Green', '#747c4a', 'sepia(.35) saturate(1.1) hue-rotate(35deg) brightness(.76)', 8, 1),
('navy', 'سرمه‌ای', 'Navy', '#1f2e45', 'sepia(.2) saturate(1.6) hue-rotate(165deg) brightness(.45)', 9, 1),
('cream', 'کرم', 'Cream', '#d8c4a4', 'sepia(.4) saturate(.65) brightness(.98)', 10, 1);

INSERT OR IGNORE INTO design_categories (slug, name_en, name_fa, sort_order) VALUES
('boardgame', 'Boardgame', 'بازی‌های رومیزی', 1), ('iran-mountains-topography', 'Iran Mountains (Topography)', 'کوه‌های ایران (توپولوژی)', 2),
('iran-nature-topography', 'Iran Nature (Topography)', 'طبیعت ایران (توپولوژی)', 3), ('iran-cities-topography', 'Iran Cities (Topography)', 'شهرهای ایران (توپولوژی)', 4),
('fruit', 'Fruit', 'میوه', 5), ('pop-art', 'Pop Art', 'پاپ آرت', 6), ('iranian-food', 'Iranian Food', 'غذاهای ایرانی', 7),
('iranian-drinks', 'Iranian Drinks', 'نوشیدنی‌های ایرانی', 8), ('persianized-logos', 'Persianized Famous Logos', 'لوگوهای معروف ایرانی‌شده', 9),
('movies-series', 'Movies & Series', 'فیلم و سریال', 10), ('food-horror', 'Food Horror', 'ژانر وحشت غذا', 11),
('original-art', 'Original Art', 'نقاشی‌های اصل', 12), ('poetry-music', 'Poetry & Music', 'شعر و موسیقی', 13),
('anime', 'Anime', 'انیمه', 14), ('video-games', 'Video Games', 'بازی‌های ویدیویی', 15);

PRAGMA optimize;

