export const shirtMaterials = [
    { id: "cotton-28", labelFa: "نخ ۲۸", labelEn: "Cotton 28", sortOrder: 1 },
    { id: "machinist", labelFa: "ماچینست", labelEn: "Machinist", sortOrder: 2 },
] as const;

export const shirtSizes = ["L", "XL", "2XL", "3XL", "4XL", "5XL", "6XL"] as const;

export const shirtFits = [
    { id: "boxy", labelFa: "باکس", labelEn: "Boxy fit", imagePrefix: "boxy-fit" },
    { id: "loose", labelFa: "لش (افتاده)", labelEn: "Loose fit", imagePrefix: "loose-fit" },
] as const;

// name, swatch, legacy filter, image/manifest key, Persian name
export const shirtColors = [
    ["White", "#FFFFFF", "none", "white", "سفید"],
    ["Black", "#151515", "none", "black", "مشکی"],
    ["Off White", "#F1EBDD", "none", "off-white", "سفید استخوانی"],
    ["Zara Green", "#4B6B4F", "none", "zara-green", "سبز زارا"],
    ["Teal Green", "#006A66", "none", "teal-green", "سبز کله‌غازی"],
    ["Sky Blue", "#86C9E8", "none", "sky-blue", "آبی آسمانی"],
    ["Light Gray", "#C8C9CB", "none", "light-gray", "طوسی روشن"],
    ["Olive Green", "#6D7345", "none", "olive-green", "سبز زیتونی"],
    ["Navy", "#17233F", "none", "navy", "سورمه‌ای"],
    ["Cream", "#DCC8A2", "none", "cream", "کرم"],
] as const;

export const printMethods = [
    { id: "dtf", labelFa: "چاپ DTF", labelEn: "DTF print" },
] as const;

export const designCategories = [
    ["boardgame", "Boardgame", "بازی‌های رومیزی"],
    ["iran-mountains-topography", "Iran Mountains (Topography)", "کوه‌های ایران (توپولوژی)"],
    ["iran-nature-topography", "Iran Nature (Topography)", "طبیعت ایران (توپولوژی)"],
    ["iran-cities-topography", "Iran Cities (Topography)", "شهرهای ایران (توپولوژی)"],
    ["fruit", "Fruit", "میوه"],
    ["pop-art", "Pop Art", "پاپ آرت"],
    ["iranian-food", "Iranian Food", "غذاهای ایرانی"],
    ["iranian-drinks", "Iranian Drinks", "نوشیدنی‌های ایرانی"],
    ["persianized-logos", "Persianized Famous Logos", "لوگوهای معروف ایرانی‌شده"],
    ["movies-series", "Movies & Series", "فیلم و سریال"],
    ["food-horror", "Food Horror", "ژانر وحشت غذا"],
    ["original-art", "Original Art", "نقاشی‌های اصل"],
    ["poetry-music", "Poetry & Music", "شعر و موسیقی"],
    ["anime", "Anime", "انیمه"],
    ["video-games", "Video Games", "بازی‌های ویدیویی"],
] as const;

export type ShirtMaterialId = (typeof shirtMaterials)[number]["id"];
export type ShirtSize = (typeof shirtSizes)[number];
export type ShirtFitId = (typeof shirtFits)[number]["id"];
export type ShirtColorId = (typeof shirtColors)[number][3];
export type PrintMethodId = (typeof printMethods)[number]["id"];

