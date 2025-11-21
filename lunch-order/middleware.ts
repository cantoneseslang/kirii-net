import { NextRequest, NextResponse } from "next/server";

// Allow only traffic that comes from the portfolio site in production
const ALLOWED_REFERRER_ORIGIN = "https://kirii-portfolio-1.vercel.app";
// 厳格モード: クッキーは使用しない

export function middleware(request: NextRequest) {
  // Allow everything in non-production to avoid blocking local/dev
  if (process.env.NODE_ENV !== "production") {
    return NextResponse.next();
  }

  const { pathname } = request.nextUrl;

  // Always allow static assets
  const isStaticAsset =
    pathname.startsWith("/_next") ||
    pathname.startsWith("/images") ||
    pathname === "/favicon.ico" ||
    pathname === "/robots.txt" ||
    pathname === "/sitemap.xml";

  if (isStaticAsset) {
    return NextResponse.next();
  }

  // Allow debug, access-check, and monthly-summary endpoints without gating
  if (pathname === "/access-check" || pathname.startsWith("/api/debug-headers") || pathname === "/monthly-summary") {
    return NextResponse.next();
  }

  // 厳格モード: 事前許可（クッキー）を一切用いない

  // Handle access-denied route explicitly to avoid redirect loops
  if (pathname === "/access-denied") {
    const url = request.nextUrl.clone();
    const fromParam = url.searchParams.get("from");
    const isAllowedParam = false; // query-based bypass is disabled

    // Allow when coming from allowed referer even without param/cookie
    const referer = request.headers.get("referer") || request.headers.get("referrer");
    const isAllowedReferer = !!referer && (referer.startsWith(ALLOWED_REFERRER_ORIGIN) || referer.includes("kirii-portfolio-1.vercel.app"));

    if (isAllowedParam || isAllowedReferer) {
      // Grant and send to top
      const response = NextResponse.redirect(() => {
        url.pathname = "/";
        url.searchParams.delete("from");
        return url;
      })();
      return response;
    }

    // Otherwise show the page as-is
    return NextResponse.next();
  }

  // Query-based bypass removed for security

  // If user hits /access-denied but already authorized, send them to top
  if (pathname === "/access-denied") {
    const top = request.nextUrl.clone();
    top.pathname = "/";
    top.search = "";
    return NextResponse.redirect(top);
  }

  // Check Referer header for allowed origin
  const referer = request.headers.get("referer") || request.headers.get("referrer");
  const isAllowedReferer = !!referer && (referer.startsWith(ALLOWED_REFERRER_ORIGIN) || referer.includes("kirii-portfolio-1.vercel.app"));

  // Allow direct access (no referer) for lunch order system
  const isDirectAccess = !referer;
  
  if (isAllowedReferer || isDirectAccess) {
    return NextResponse.next();
  }

  // Otherwise, block and redirect to access denied page
  const denyUrl = request.nextUrl.clone();
  denyUrl.pathname = "/access-denied";
  denyUrl.search = "";
  return NextResponse.redirect(denyUrl);
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|robots.txt|sitemap.xml|images).*)",
  ],
};


