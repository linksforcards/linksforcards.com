import { NextResponse, type NextRequest } from "next/server";
import { applyCdnCacheHeaders, cdnCacheControlFor } from "./lib/cdn-cache";
import { resolveLocaleRequest } from "./lib/routing";

function withCdnCache(response: NextResponse, pathname: string, search: string): NextResponse {
  const cacheControl = cdnCacheControlFor(pathname, search);
  if (cacheControl) applyCdnCacheHeaders(response.headers, cacheControl);
  return response;
}

export function middleware(request: NextRequest) {
  const { pathname, search } = request.nextUrl;
  const decision = resolveLocaleRequest(pathname);
  if (decision.action === "redirect") {
    const url = new URL(decision.pathname, request.url);
    url.search = search;
    return NextResponse.redirect(url, 301);
  }
  if (decision.action === "rewrite") {
    const url = request.nextUrl.clone();
    url.pathname = decision.pathname;
    return withCdnCache(NextResponse.rewrite(url), pathname, search);
  }
  const response = NextResponse.next();
  if (decision.noindex) {
    response.headers.set("X-Robots-Tag", "noindex, nofollow");
    response.headers.set("Cache-Control", "private, no-store");
    return response;
  }
  return withCdnCache(response, pathname, search);
}

export const config = {
  matcher: ["/((?!_next/static|_next/image).*)"],
};
