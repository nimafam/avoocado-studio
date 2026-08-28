import { env } from "cloudflare:workers";
import { isAdminRequest, isSameOrigin } from "@/lib/admin/auth";

export const dynamic = "force-dynamic";
const allowedTypes = new Set(["image/png", "image/jpeg", "image/webp"]);

export async function POST(request: Request) {
    if (!isSameOrigin(request) || !await isAdminRequest(request)) return Response.json({ error: "Unauthorized" }, { status: 401 });
    const form = await request.formData();
    const file = form.get("file");
    if (!(file instanceof File) || !allowedTypes.has(file.type) || file.size > 8 * 1024 * 1024) {
        return Response.json({ error: "Only PNG, JPEG or WebP files up to 8 MB are allowed." }, { status: 400 });
    }
    const extension = file.type === "image/png" ? "png" : file.type === "image/webp" ? "webp" : "jpg";
    const key = `artworks/${crypto.randomUUID()}.${extension}`;
    await env.ARTWORKS.put(key, await file.arrayBuffer(), { httpMetadata: { contentType: file.type, cacheControl: "public, max-age=31536000, immutable" }, customMetadata: { originalName: file.name } });
    return Response.json({ key, url: `/api/artwork/${key}` }, { status: 201 });
}
