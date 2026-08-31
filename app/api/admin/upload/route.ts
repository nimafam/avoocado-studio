import { isAdminRequest, isSameOrigin } from "@/lib/admin/auth";
import { uploadHostedFile } from "@/lib/storage/hosted-files";

export const dynamic = "force-dynamic";
const allowedTypes = new Set(["image/png", "image/jpeg", "image/webp"]);

export async function POST(request: Request) {
    if (!isSameOrigin(request) || !await isAdminRequest(request)) return Response.json({ error: "Unauthorized" }, { status: 401 });
    const form = await request.formData();
    const file = form.get("file");
    if (!(file instanceof File) || !allowedTypes.has(file.type) || file.size > 8 * 1024 * 1024) {
        return Response.json({ error: "Only PNG, JPEG or WebP files up to 8 MB are allowed." }, { status: 400 });
    }
    try {
        const uploaded = await uploadHostedFile(file, "artworks", file.name.replace(/\.[^.]+$/, ""));
        return Response.json({ key: uploaded.url, url: uploaded.url }, { status: 201 });
    } catch (error) {
        console.error(JSON.stringify({ event: "artwork_upload_failed", message: error instanceof Error ? error.message : "Unknown storage error" }));
        return Response.json({ error: "ذخیره تصویر روی هاست انجام نشد." }, { status: 502 });
    }
}
