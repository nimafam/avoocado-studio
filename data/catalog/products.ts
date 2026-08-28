export type Product = {
    slug: string;
    name: string;
    collection: string;
    collectionSlug: string;
    price: number;
    mark: string;
    tone: string;
    description: string;
};

export const products: Product[] = [
    { slug: "meeple-society", name: "Meeple Society", collection: "Boardgame", collectionSlug: "boardgame", price: 38, mark: "M", tone: "#d7ff46", description: "A playful studio graphic for people who always have one more turn in them." },
    { slug: "critical-roll", name: "Critical Roll", collection: "Boardgame", collectionSlug: "boardgame", price: 38, mark: "20", tone: "#f3c64e", description: "A bold tabletop emblem built around luck, risk and the perfect roll." },
    { slug: "damavand-lines", name: "Damavand Lines", collection: "Iran Topography", collectionSlug: "iran-topography", price: 42, mark: "D", tone: "#b9d1c3", description: "Mount Damavand reduced to rhythm, contour and a clean everyday silhouette." },
    { slug: "tehran-elevation", name: "Tehran Elevation", collection: "Iran Topography", collectionSlug: "iran-topography", price: 42, mark: "T", tone: "#a8c4d8", description: "A graphic study of the city where streets rise toward the mountains." },
    { slug: "everyday-icon", name: "Everyday Icon", collection: "Pop Art", collectionSlug: "pop-art", price: 38, mark: "E", tone: "#ff775f", description: "A familiar object turned louder, brighter and just strange enough." },
    { slug: "studio-sun", name: "Studio Sun", collection: "Original Art", collectionSlug: "original-art", price: 40, mark: "S", tone: "#c7b8ff", description: "An optimistic original drawn for slow mornings and long creative nights." },
];
