export type ShirtFit = "loose" | "boxy";
export type ShirtSide = "front" | "back";

export function getTshirtAsset(fit: ShirtFit, color: string, side: ShirtSide) {
  const prefix = fit === "loose" ? "oversized-loose-fit" : "boxy-fit";
  return `/models/tshirts/Oversized/${prefix}-${color}-${side}.webp`;
}
