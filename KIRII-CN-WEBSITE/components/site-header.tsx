"use client"

import { Phone, VoicemailIcon as Fax, Mail } from "lucide-react"
import { LocalizedLink } from "@/components/localized-link"
import { MobileNav } from "@/components/mobile-nav"
import { LanguageSwitcherClient } from "@/components/language-switcher-client"
import { Button } from "@/components/ui/button"
import { useLanguage } from "@/components/language-provider"
import { getTranslation } from "@/lib/i18n"
import { navLabels } from "@/lib/page-seo"

export function SiteHeader() {
  const { language } = useLanguage()
  const t = getTranslation(language)
  const labels = navLabels[language]

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center">
        <div className="mr-4 hidden md:flex">
          <LocalizedLink href="/" className="mr-6 flex items-center space-x-2">
            <img src="/images/brand-kirii-logo.png" alt="Kirii Logo" className="h-8 w-auto" />
            <span className="hidden font-bold sm:inline-block text-xl">{t.companyNameFull}</span>
          </LocalizedLink>
          <nav className="flex items-center space-x-6 text-sm font-medium">
            <LocalizedLink href="/" className="transition-colors hover:text-foreground/80 text-foreground">
              {t.home}
            </LocalizedLink>
            <LocalizedLink href="/about" className="transition-colors hover:text-foreground/80 text-foreground/60">
              {t.about}
            </LocalizedLink>
            <LocalizedLink href="/products" className="transition-colors hover:text-foreground/80 text-foreground/60">
              {t.products}
            </LocalizedLink>
            <LocalizedLink href="/projects" className="transition-colors hover:text-foreground/80 text-foreground/60">
              {t.projects}
            </LocalizedLink>
            <LocalizedLink href="/blog" className="transition-colors hover:text-foreground/80 text-foreground/60">
              {labels.blog}
            </LocalizedLink>
            <LocalizedLink href="/contact" className="transition-colors hover:text-foreground/80 text-foreground/60">
              {t.contact}
            </LocalizedLink>
          </nav>
        </div>
        <MobileNav />
        <div className="flex flex-1 items-center justify-between space-x-2 md:justify-end">
          <div className="w-full flex-1 md:w-auto md:flex-none">{/* Search can be added here if needed */}</div>
          <nav className="flex items-center space-x-2">
            <LanguageSwitcherClient />
            <Button asChild size="sm">
              <LocalizedLink href="/contact">{t.getQuote}</LocalizedLink>
            </Button>
          </nav>
        </div>
      </div>
    </header>
  )
}
