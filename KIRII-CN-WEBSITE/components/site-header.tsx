"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { MobileNav } from "@/components/mobile-nav"
import { LanguageSwitcherClient } from "@/components/language-switcher-client"
import { type Language, getTranslation, loadLanguage } from "@/lib/i18n"

export function SiteHeader() {
  const [language, setLanguage] = useState<Language>("en")

  useEffect(() => {
    const savedLanguage = loadLanguage()
    setLanguage(savedLanguage)
  }, [])

  const t = getTranslation(language)

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center">
        <div className="mr-4 hidden md:flex">
          <Link href="/" className="mr-6 flex items-center space-x-2">
            <img src="/images/brand-kirii-logo.png" alt="Kirii Logo" className="h-8 w-auto" />
            <span className="hidden font-bold sm:inline-block text-xl">{t.companyNameFull}</span>
          </Link>
          <nav className="flex items-center space-x-6 text-sm font-medium">
            <Link href="/" className="transition-colors hover:text-foreground/80 text-foreground">
              {t.home}
            </Link>
            <Link href="/about" className="transition-colors hover:text-foreground/80 text-foreground/60">
              {t.about}
            </Link>
            <Link href="/products" className="transition-colors hover:text-foreground/80 text-foreground/60">
              {t.products}
            </Link>
            <Link href="/projects" className="transition-colors hover:text-foreground/80 text-foreground/60">
              {t.projects}
            </Link>
            <Link href="/contact" className="transition-colors hover:text-foreground/80 text-foreground/60">
              {t.contact}
            </Link>
          </nav>
        </div>
        <MobileNav />
        <div className="flex flex-1 items-center justify-between space-x-2 md:justify-end">
          <div className="w-full flex-1 md:w-auto md:flex-none">{/* Search can be added here if needed */}</div>
          <nav className="flex items-center space-x-2">
            <LanguageSwitcherClient onLanguageChange={setLanguage} />
            <Button asChild size="sm">
              <Link href="/contact">{t.getQuote}</Link>
            </Button>
          </nav>
        </div>
      </div>
    </header>
  )
}
