import { env } from "cloudflare:workers";

const COOKIE_NAME = "avoocado_admin";
const SESSION_SECONDS = 60 * 60 * 12;
const encoder = new TextEncoder();

function toBase64Url(bytes: Uint8Array) {
    let binary = "";
    for (const byte of bytes) binary += String.fromCharCode(byte);
    return btoa(binary).replaceAll("+", "-").replaceAll("/", "_").replaceAll("=", "");
}

async function hmac(value: string) {
    const key = await crypto.subtle.importKey("raw", encoder.encode(env.ADMIN_SESSION_SECRET), { name: "HMAC", hash: "SHA-256" }, false, ["sign"]);
    return toBase64Url(new Uint8Array(await crypto.subtle.sign("HMAC", key, encoder.encode(value))));
}

async function digest(value: string) {
    return new Uint8Array(await crypto.subtle.digest("SHA-256", encoder.encode(value)));
}

function safeEqual(left: Uint8Array, right: Uint8Array) {
    if (left.length !== right.length) return false;
    let difference = 0;
    for (let index = 0; index < left.length; index += 1) difference |= left[index] ^ right[index];
    return difference === 0;
}

export async function passwordIsValid(password: string) {
    if (!password || !env.ADMIN_PASSWORD) return false;
    return safeEqual(await digest(password), await digest(env.ADMIN_PASSWORD));
}

export async function createSessionCookie(request: Request) {
    const expires = Math.floor(Date.now() / 1000) + SESSION_SECONDS;
    const payload = `admin.${expires}`;
    const token = `${payload}.${await hmac(payload)}`;
    const secure = new URL(request.url).protocol === "https:" ? "; Secure" : "";
    return `${COOKIE_NAME}=${token}; Path=/; HttpOnly${secure}; SameSite=Strict; Max-Age=${SESSION_SECONDS}`;
}

export function clearSessionCookie() {
    return `${COOKIE_NAME}=; Path=/; HttpOnly; Secure; SameSite=Strict; Max-Age=0`;
}

export async function isAdminRequest(request: Request) {
    const cookie = request.headers.get("cookie") ?? "";
    const token = cookie.split(";").map((part) => part.trim()).find((part) => part.startsWith(`${COOKIE_NAME}=`))?.slice(COOKIE_NAME.length + 1);
    if (!token) return false;
    const [role, expiresRaw, signature] = token.split(".");
    const expires = Number(expiresRaw);
    if (role !== "admin" || !signature || !Number.isFinite(expires) || expires <= Date.now() / 1000) return false;
    const expected = await hmac(`${role}.${expiresRaw}`);
    return safeEqual(encoder.encode(signature), encoder.encode(expected));
}

export function isSameOrigin(request: Request) {
    const origin = request.headers.get("origin");
    if (!origin) return true;
    try { return new URL(origin).host === new URL(request.url).host; } catch { return false; }
}

