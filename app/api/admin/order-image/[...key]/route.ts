import { env } from "cloudflare:workers";
import { isAdminRequest } from "@/lib/admin/auth";

export const dynamic = "force-dynamic";

export async function GET(request: Request, { params }: { params: Promise<{ key: string[] }> }) {
    if (!await isAdminRequest(request)) return new Response("Unauthorized", { status: 401 });
    const { key } = await params;
    const objectKey = key.join("/");
    if (!objectKey.startsWith("orders/")) return new Response("Not found", { status: 404 });
    const object = await env.ARTWORKS.get(objectKey);
    if (!object) return new Response("Not found", { status: 404 });
    const headers = new Headers({ ETag: object.httpEtag, "Cache-Control": "private, no-store" }); object.writeHttpMetadata(headers);
    return new Response(object.body, { headers });
}

