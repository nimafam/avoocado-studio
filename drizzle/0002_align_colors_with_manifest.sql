PRAGMA foreign_keys = OFF;

UPDATE shirt_colors SET id = 'off-white', name_en = 'Off White', hex = '#F1EBDD', css_filter = 'none' WHERE id = 'bone-white';
UPDATE shirt_colors SET id = 'light-gray', name_en = 'Light Gray', hex = '#C8C9CB', css_filter = 'none' WHERE id = 'light-grey';
UPDATE shirt_colors SET hex = '#FFFFFF', css_filter = 'none' WHERE id = 'white';
UPDATE shirt_colors SET hex = '#151515', css_filter = 'none' WHERE id = 'black';
UPDATE shirt_colors SET hex = '#4B6B4F', css_filter = 'none' WHERE id = 'zara-green';
UPDATE shirt_colors SET hex = '#006A66', css_filter = 'none' WHERE id = 'teal-green';
UPDATE shirt_colors SET hex = '#86C9E8', css_filter = 'none' WHERE id = 'sky-blue';
UPDATE shirt_colors SET hex = '#6D7345', css_filter = 'none' WHERE id = 'olive-green';
UPDATE shirt_colors SET hex = '#17233F', css_filter = 'none' WHERE id = 'navy';
UPDATE shirt_colors SET hex = '#DCC8A2', css_filter = 'none' WHERE id = 'cream';

PRAGMA foreign_keys = ON;
PRAGMA optimize;
