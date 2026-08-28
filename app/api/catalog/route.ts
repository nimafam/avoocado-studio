import { getPublicCatalog } from "@/lib/catalog/cloudflare-repository";

export const dynamic = "force-dynamic";

export async function GET() {
    return Response.json(await getPublicCatalog(), { headers: { "Cache-Control": "public, max-age=60, stale-while-revalidate=300" } });
}

