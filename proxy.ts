import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

export function proxy(request: NextRequest) {
  const forwardedProtocol = request.headers.get("x-forwarded-proto");
  const isHttps = forwardedProtocol
    ? forwardedProtocol.split(",")[0].trim() === "https"
    : request.nextUrl.protocol === "https:";

  if (!isHttps) {
    const secureUrl = request.nextUrl.clone();
    secureUrl.protocol = "https:";
    return NextResponse.redirect(secureUrl, 308);
  }

  const response = NextResponse.next();
  response.headers.set(
    "Strict-Transport-Security",
    "max-age=31536000; includeSubDomains",
  );
  return response;
}

export const config = {
  matcher: "/:path*",
};
