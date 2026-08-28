import { clearSessionCookie, createSessionCookie, isAdminRequest, isSameOrigin, passwordIsValid } from "@/lib/admin/auth";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
    return Response.json({ authenticated: await isAdminRequest(request) });
}

export async function POST(request: Request) {
    if (!isSameOrigin(request)) return Response.json({ error: "Invalid origin" }, { status: 403 });
    const body = await request.json().catch(() => ({})) as { password?: string };
    if (!await passwordIsValid(body.password ?? "")) return Response.json({ error: "رمز ورود صحیح نیست." }, { status: 401 });
    return Response.json({ authenticated: true }, { headers: { "Set-Cookie": await createSessionCookie(request), "Cache-Control": "no-store" } });
}

export async function DELETE(request: Request) {
    if (!isSameOrigin(request)) return Response.json({ error: "Invalid origin" }, { status: 403 });
    return Response.json({ authenticated: false }, { headers: { "Set-Cookie": clearSessionCookie(), "Cache-Control": "no-store" } });
}

