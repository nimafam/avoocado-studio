export const dynamic = "force-dynamic";

export async function GET(request: Request) {
    const source = new URL(request.url).searchParams.get("url");
    if (!source) return Response.json({ error: "Image URL is required." }, { status: 400 });

    let imageUrl: URL;
    try { imageUrl = new URL(source); } catch { return Response.json({ error: "Invalid image URL." }, { status: 400 }); }
    if (imageUrl.protocol !== "https:" || imageUrl.hostname !== "storage.avoocadostudio.com" || !imageUrl.pathname.startsWith("/uploads/")) return Response.json({ error: "Image host is not allowed." }, { status: 403 });

    const upstream = await fetch(imageUrl, { headers: { Accept: "image/avif,image/webp,image/png,image/jpeg" } });
    if (!upstream.ok || !upstream.body) return Response.json({ error: "Image is unavailable." }, { status: upstream.status === 404 ? 404 : 502 });
    const contentType = upstream.headers.get("content-type") ?? "";
    if (!contentType.startsWith("image/")) return Response.json({ error: "Invalid image response." }, { status: 502 });

    return new Response(upstream.body, { headers: { "Content-Type": contentType, "Cache-Control": "public, max-age=86400, stale-while-revalidate=604800", "X-Content-Type-Options": "nosniff" } });
}
