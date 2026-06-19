import { notFound } from "next/navigation"
import { isValidLocale, localeToLanguage, type Locale } from "@/lib/locale"
import type { Language } from "@/lib/i18n"

export async function resolvePageLanguage(
  params: Promise<{ locale: string }>,
): Promise<Language> {
  const { locale: localeParam } = await params

  if (!isValidLocale(localeParam)) {
    notFound()
  }

  return localeToLanguage(localeParam as Locale)
}
