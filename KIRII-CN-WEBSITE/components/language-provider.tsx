"use client"

import React, { createContext, useContext, useEffect, useMemo, useState } from "react"
import { usePathname, useRouter } from "next/navigation"
import {
  getLocaleFromPathname,
  languageToLocale,
  localeToLanguage,
  localizedPath,
  type Locale,
} from "@/lib/locale"
import { type Language, saveLanguage } from "@/lib/i18n"

interface LanguageContextType {
  language: Language
  locale: Locale
  setLanguage: (language: Language) => void
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined)

export function LanguageProvider({
  children,
  initialLanguage,
  locale,
}: {
  children: React.ReactNode
  initialLanguage: Language
  locale: Locale
}) {
  const router = useRouter()
  const pathname = usePathname()
  const [language, setLanguageState] = useState<Language>(initialLanguage)

  useEffect(() => {
    setLanguageState(initialLanguage)
    saveLanguage(initialLanguage)
  }, [initialLanguage])

  const setLanguage = (newLanguage: Language) => {
    const nextLocale = languageToLocale(newLanguage)
    const { pathnameWithoutLocale } = getLocaleFromPathname(pathname)
    const nextPath = localizedPath(pathnameWithoutLocale, nextLocale)

    setLanguageState(newLanguage)
    saveLanguage(newLanguage)
    router.push(nextPath)
  }

  const value = useMemo(
    () => ({
      language,
      locale,
      setLanguage,
    }),
    [language, locale],
  )

  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>
}

export function useLanguage() {
  const context = useContext(LanguageContext)
  if (context === undefined) {
    throw new Error("useLanguage must be used within a LanguageProvider")
  }
  return context
}
