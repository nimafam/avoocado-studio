import { env } from "cloudflare:workers";

export const dynamic = "force-dynamic";

export async function GET(_request: Request, { params }: { params: Promise<{ key: string[] }> }) {
    const { key } = await params;
    const object = await env.ARTWORKS.get(key.join("/"));
    if (!object) return new Response("Not found", { status: 404 });
    const headers = new Headers({ ETag: object.httpEtag, "Cache-Control": "public, max-age=31536000, immutable" });
    object.writeHttpMetadata(headers);
    return new Response(object.body, { headers });
}

