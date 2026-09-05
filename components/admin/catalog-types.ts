export type Category = {
  id: number;
  slug: string;
  nameFa: string;
  nameEn: string;
  sortOrder: number;
  active: number;
  description: string;
};
export type Design = {
  id: number;
  slug: string;
  name: string;
  description: string;
  basePrice: number;
  baseCost: number;
  editionLimit: number;
  editionIssued: number;
  artworkKey: string | null;
  active: number;
  collectionId: number | null;
  collectionName: string | null;
  placements: string | null;
};
export type NamedOption = { id: string; nameFa: string; nameEn: string };
export type Variant = {
  id: number;
  designId: number;
  designName: string;
  sku: string;
  price: number;
  costPrice: number;
  stockQuantity: number;
  materialId: string;
  sizeId: string;
  fitId: string;
  colorId: string;
  printMethodId: string;
  active: number;
};
export type Catalog = {
  categories: Category[];
  designs: Design[];
  variants: Variant[];
  materials: NamedOption[];
  sizes: { id: string; label: string }[];
  fits: NamedOption[];
  colors: (NamedOption & { hex: string })[];
  printMethods: NamedOption[];
  placements: string[];
};

export async function adminRequest<T = Catalog>(
  url = "/api/admin/catalog",
  init?: RequestInit,
): Promise<T> {
  const response = await fetch(url, {
    ...init,
    cache: "no-store",
    headers: { "Content-Type": "application/json", ...init?.headers },
  });
  const text = await response.text();
  let body: Record<string, unknown> = {};
  try {
    body = text ? (JSON.parse(text) as Record<string, unknown>) : {};
  } catch {
    /* Fallback below. */
  }
  if (!response.ok) {
    const error = new Error(
      typeof body.error === "string"
        ? body.error
        : `خطای سرور (${response.status})`,
    ) as Error & { status?: number };
    error.status = response.status;
    throw error;
  }
  return body as T;
}

export function slugify(value: string) {
  const map: Record<string, string> = {
    آ: "a",
    ا: "a",
    ب: "b",
    پ: "p",
    ت: "t",
    ث: "s",
    ج: "j",
    چ: "ch",
    ح: "h",
    خ: "kh",
    د: "d",
    ذ: "z",
    ر: "r",
    ز: "z",
    ژ: "zh",
    س: "s",
    ش: "sh",
    ص: "s",
    ض: "z",
    ط: "t",
    ظ: "z",
    ع: "a",
    غ: "gh",
    ف: "f",
    ق: "gh",
    ک: "k",
    ك: "k",
    گ: "g",
    ل: "l",
    م: "m",
    ن: "n",
    و: "v",
    ه: "h",
    ی: "y",
    ي: "y",
    ئ: "y",
  };
  const normalized = [...value.toLowerCase().trim()]
    .map((char) => map[char] ?? char)
    .join("");
  return normalized
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 80);
}

export function imageUrl(value: string) {
  return value.startsWith("https://")
    ? `/api/storage-image?url=${encodeURIComponent(value)}`
    : value;
}
