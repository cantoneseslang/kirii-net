import { notFound } from "next/navigation"
import { LanguageProvider } from "@/components/language-provider"
import { LocaleHtmlLang } from "@/components/locale-html-lang"
import { isValidLocale, localeToLanguage, type Locale } from "@/lib/locale"

export function generateStaticParams() {
  return [{ locale: "en" }, { locale: "zh-cn" }, { locale: "zh-hk" }]
}

export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode
  params: Promise<{ locale: string }>
}) {
  const { locale: localeParam } = await params

  if (!isValidLocale(localeParam)) {
    notFound()
  }

  const locale = localeParam as Locale
  const language = localeToLanguage(locale)

  return (
    <LanguageProvider initialLanguage={language} locale={locale}>
      <LocaleHtmlLang locale={locale} />
      {children}
    </LanguageProvider>
  )
}
