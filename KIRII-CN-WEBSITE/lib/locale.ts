import type { Language } from "@/lib/i18n"

export const locales = ["en", "zh-cn", "zh-hk"] as const
export type Locale = (typeof locales)[number]
export const defaultLocale: Locale = "en"

export function isValidLocale(value: string): value is Locale {
  return locales.includes(value as Locale)
}

export function localeToLanguage(locale: Locale): Language {
  const map: Record<Locale, Language> = {
    en: "en",
    "zh-cn": "zh-CN",
    "zh-hk": "zh-HK",
  }
  return map[locale]
}

export function languageToLocale(language: Language): Locale {
  const map: Record<Language, Locale> = {
    en: "en",
    "zh-CN": "zh-cn",
    "zh-HK": "zh-hk",
  }
  return map[language]
}

export function getHtmlLang(locale: Locale): string {
  const map: Record<Locale, string> = {
    en: "en",
    "zh-cn": "zh-CN",
    "zh-hk": "zh-HK",
  }
  return map[locale]
}

export function getOpenGraphLocale(locale: Locale): string {
  const map: Record<Locale, string> = {
    en: "en_US",
    "zh-cn": "zh_CN",
    "zh-hk": "zh_HK",
  }
  return map[locale]
}

export function getHrefLang(locale: Locale): string {
  const map: Record<Locale, string> = {
    en: "en",
    "zh-cn": "zh-CN",
    "zh-hk": "zh-HK",
  }
  return map[locale]
}

export function localizedPath(path: string, locale: Locale): string {
  const normalizedPath = path.startsWith("/") ? path : `/${path}`

  if (locale === defaultLocale) {
    return normalizedPath
  }

  return normalizedPath === "/" ? `/${locale}` : `/${locale}${normalizedPath}`
}

export function getLocaleFromPathname(pathname: string): {
  locale: Locale
  pathnameWithoutLocale: string
} {
  for (const locale of locales) {
    if (locale === defaultLocale) {
      continue
    }

    if (pathname === `/${locale}`) {
      return { locale, pathnameWithoutLocale: "/" }
    }

    if (pathname.startsWith(`/${locale}/`)) {
      return {
        locale,
        pathnameWithoutLocale: pathname.slice(`/${locale}`.length) || "/",
      }
    }
  }

  return { locale: defaultLocale, pathnameWithoutLocale: pathname || "/" }
}

export function resolveLocaleFromPathname(pathname: string): Locale {
  return getLocaleFromPathname(pathname).locale
}

export const staticPaths = [
  "/",
  "/about",
  "/products",
  "/projects",
  "/contact",
  "/blog",
  "/privacy",
  "/terms",
  "/cookies",
] as const
