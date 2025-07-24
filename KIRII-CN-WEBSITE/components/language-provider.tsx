"use client"

import React, { createContext, useContext, useState, useEffect } from "react"
import { type Language, loadLanguage, saveLanguage } from "@/lib/i18n"

interface LanguageContextType {
  language: Language
  setLanguage: (language: Language) => void
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined)

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [language, setLanguageState] = useState<Language>("en")
  const [isHydrated, setIsHydrated] = useState(false)

  useEffect(() => {
    setIsHydrated(true)
    const savedLanguage = loadLanguage()
    setLanguageState(savedLanguage)
  }, [])

  const setLanguage = (newLanguage: Language) => {
    setLanguageState(newLanguage)
    saveLanguage(newLanguage)
  }

  // Prevent hydration mismatch by showing loading state
  if (!isHydrated) {
    return <div>{children}</div>
  }

  return (
    <LanguageContext.Provider value={{ language, setLanguage }}>
      {children}
    </LanguageContext.Provider>
  )
}

export function useLanguage() {
  const context = useContext(LanguageContext)
  if (context === undefined) {
    throw new Error("useLanguage must be used within a LanguageProvider")
  }
  return context
} 