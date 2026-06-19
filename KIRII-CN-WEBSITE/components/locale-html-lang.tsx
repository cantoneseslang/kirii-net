"use client"

import { useEffect } from "react"
import { getHtmlLang, type Locale } from "@/lib/locale"

export function LocaleHtmlLang({ locale }: { locale: Locale }) {
  useEffect(() => {
    document.documentElement.lang = getHtmlLang(locale)
  }, [locale])

  return null
}
