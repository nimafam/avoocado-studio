import { env } from "cloudflare:workers";

type UploadScope = "artworks" | "orders";
type UploadResult = { url: string; path: string };

function storageConfig() {
    const endpoint = new URL(env.UPLOAD_API_URL);
    if (endpoint.protocol !== "https:") throw new Error("UPLOAD_API_URL must use HTTPS.");
    return { endpoint, secret: env.UPLOAD_API_SECRET };
}

async function parseSmallJson(response: Response, limit = 32_768) {
    const reader = response.body?.getReader();
    if (!reader) return {};
    const chunks: Uint8Array[] = [];
    let length = 0;
    while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        length += value.byteLength;
        if (length > limit) { await reader.cancel(); throw new Error("Storage response is too large."); }
        chunks.push(value);
    }
    const bytes = new Uint8Array(length);
    let offset = 0;
    for (const chunk of chunks) { bytes.set(chunk, offset); offset += chunk.byteLength; }
    return JSON.parse(new TextDecoder().decode(bytes)) as Record<string, unknown>;
}

export async function uploadHostedFile(file: File, scope: UploadScope, label?: string): Promise<UploadResult> {
    const { endpoint, secret } = storageConfig();
    if (!secret) throw new Error("UPLOAD_API_SECRET is not configured.");
    const body = new FormData();
    body.set("file", file);
    body.set("scope", scope);
    if (label) body.set("label", label);
    const response = await fetch(endpoint, { method: "POST", headers: { "X-Avoocado-Key": secret }, body });
    const result = await parseSmallJson(response);
    if (!response.ok || typeof result.url !== "string" || typeof result.path !== "string") throw new Error(typeof result.error === "string" ? result.error : "File upload failed.");
    const publicUrl = new URL(result.url);
    if (publicUrl.protocol !== "https:" || publicUrl.hostname !== endpoint.hostname) throw new Error("Storage returned an invalid URL.");
    return { url: publicUrl.toString(), path: result.path };
}

export async function deleteHostedFile(url: string) {
    const { endpoint, secret } = storageConfig();
    const fileUrl = new URL(url);
    if (!secret || fileUrl.protocol !== "https:" || fileUrl.hostname !== endpoint.hostname) return;
    const response = await fetch(endpoint, { method: "DELETE", headers: { "X-Avoocado-Key": secret, "Content-Type": "application/json" }, body: JSON.stringify({ url: fileUrl.toString() }) });
    if (!response.ok && response.status !== 404) throw new Error("File deletion failed.");
}
