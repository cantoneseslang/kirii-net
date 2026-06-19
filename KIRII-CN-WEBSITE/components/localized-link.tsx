"use client"

import Link from "next/link"
import { useParams } from "next/navigation"
import { defaultLocale, isValidLocale, localizedPath, type Locale } from "@/lib/locale"

export function useLocale(): Locale {
  const params = useParams()
  const localeParam = params?.locale

  if (typeof localeParam === "string" && isValidLocale(localeParam)) {
    return localeParam
  }

  return defaultLocale
}

type LocalizedLinkProps = React.ComponentProps<typeof Link>

export function LocalizedLink({ href, ...props }: LocalizedLinkProps) {
  const locale = useLocale()

  if (typeof href !== "string") {
    return <Link href={href} {...props} />
  }

  if (href.startsWith("http") || href.startsWith("mailto:") || href.startsWith("tel:")) {
    return <Link href={href} {...props} />
  }

  return <Link href={localizedPath(href, locale)} {...props} />
}

export function localizeHref(href: string, locale: Locale): string {
  if (href.startsWith("http") || href.startsWith("mailto:") || href.startsWith("tel:")) {
    return href
  }

  return localizedPath(href, locale)
}
