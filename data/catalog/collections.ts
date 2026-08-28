export type Collection = {
    id: string;
    slug: string;
    name: string;
    eyebrow: string;
    description: string;
    index: string;
};

export const featuredCollections: Collection[] = [
    {
        id: "boardgame",
        slug: "boardgame",
        name: "Boardgame",
        eyebrow: "Play / Wear",
        description:
            "Original designs inspired by the worlds, mechanics and stories of tabletop games.",
        index: "01",
    },
    {
        id: "iran-topography",
        slug: "iran-topography",
        name: "Iran Topography",
        eyebrow: "Land / Form",
        description:
            "Iranian mountains, cities and landscapes translated into minimal topographic graphics.",
        index: "02",
    },
    {
        id: "pop-art",
        slug: "pop-art",
        name: "Pop Art",
        eyebrow: "Color / Culture",
        description:
            "Bold interpretations of familiar objects, symbols and everyday culture.",
        index: "03",
    },
    {
        id: "original-art",
        slug: "original-art",
        name: "Original Art",
        eyebrow: "Studio / Originals",
        description:
            "Illustrations and artworks created as original Avoocado pieces.",
        index: "04",
    },
];