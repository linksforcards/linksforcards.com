import { NextResponse, type NextRequest } from "next/server";
import { resolveLocaleRequest } from "./lib/routing";

export function middleware(request: NextRequest) {
  const decision = resolveLocaleRequest(request.nextUrl.pathname);
  if (decision.action === "redirect") {
    const url = new URL(decision.pathname, request.url);
    url.search = request.nextUrl.search;
    return NextResponse.redirect(url, 301);
  }
  if (decision.action === "rewrite") {
    const url = request.nextUrl.clone();
    url.pathname = decision.pathname;
    return NextResponse.rewrite(url);
  }
  const response = NextResponse.next();
  if (decision.noindex) {
    response.headers.set("X-Robots-Tag", "noindex, nofollow");
    response.headers.set("Cache-Control", "private, no-store");
  }
  return response;
}

export const config = {
  matcher: ["/((?!_next/static|_next/image).*)"],
};
