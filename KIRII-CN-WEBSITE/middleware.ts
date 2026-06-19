import { NextResponse, type NextRequest } from "next/server"
import { defaultLocale, isValidLocale, resolveLocaleFromPathname } from "@/lib/locale"

const LOCALE_COOKIE = "NEXT_LOCALE"

function shouldBypass(pathname: string): boolean {
  return (
    pathname.startsWith("/_next") ||
    pathname.startsWith("/api") ||
    pathname === "/robots.txt" ||
    pathname === "/sitemap.xml" ||
    pathname === "/favicon.ico" ||
    pathname.startsWith("/google") ||
    /\.[a-zA-Z0-9]+$/.test(pathname)
  )
}

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  if (shouldBypass(pathname)) {
    return NextResponse.next()
  }

  const pathnameLocale = resolveLocaleFromPathname(pathname)
  const firstSegment = pathname.split("/")[1]

  if (firstSegment && isValidLocale(firstSegment)) {
    const response = NextResponse.next()
    response.cookies.set(LOCALE_COOKIE, firstSegment, { path: "/" })
    return response
  }

  const rewriteUrl = request.nextUrl.clone()
  rewriteUrl.pathname = `/${defaultLocale}${pathname === "/" ? "" : pathname}`

  const response = NextResponse.rewrite(rewriteUrl)
  response.cookies.set(LOCALE_COOKIE, defaultLocale, { path: "/" })
  return response
}

export const config = {
  matcher: ["/((?!_next/static|_next/image).*)"],
}
