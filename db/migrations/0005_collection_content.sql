PRAGMA foreign_keys = ON;

ALTER TABLE design_categories ADD COLUMN description TEXT NOT NULL DEFAULT '';
ALTER TABLE design_categories ADD COLUMN cover_image_key TEXT;

PRAGMA optimize;
