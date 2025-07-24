"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { Menu } from "lucide-react"
import { LanguageSwitcherClient } from "@/components/language-switcher-client"
import { type Language, getTranslation, loadLanguage } from "@/lib/i18n"

export function MobileNav() {
  const [open, setOpen] = useState(false)
  const [language, setLanguage] = useState<Language>("en")

  useEffect(() => {
    const savedLanguage = loadLanguage()
    setLanguage(savedLanguage)
  }, [])

  const t = getTranslation(language)

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button
          variant="ghost"
          className="mr-2 px-0 text-base hover:bg-transparent focus-visible:bg-transparent focus-visible:ring-0 focus-visible:ring-offset-0 md:hidden"
        >
          <Menu className="h-6 w-6" />
          <span className="sr-only">Toggle Menu</span>
        </Button>
      </SheetTrigger>
      <SheetContent side="left" className="pr-0">
        <Link href="/" className="flex items-center" onClick={() => setOpen(false)}>
                          <span className="font-bold">{t.companyNameFull}</span>
        </Link>
        <div className="my-4 h-[calc(100vh-8rem)] pb-10 pl-6">
          <div className="flex flex-col space-y-3">
            <Link
              href="/"
              className="text-foreground/70 transition-colors hover:text-foreground"
              onClick={() => setOpen(false)}
            >
              {t.home}
            </Link>
            <Link
              href="/about"
              className="text-foreground/70 transition-colors hover:text-foreground"
              onClick={() => setOpen(false)}
            >
              {t.about}
            </Link>
            <Link
              href="/products"
              className="text-foreground/70 transition-colors hover:text-foreground"
              onClick={() => setOpen(false)}
            >
              {t.products}
            </Link>
            <Link
              href="/projects"
              className="text-foreground/70 transition-colors hover:text-foreground"
              onClick={() => setOpen(false)}
            >
              {t.projects}
            </Link>
            <Link
              href="/contact"
              className="text-foreground/70 transition-colors hover:text-foreground"
              onClick={() => setOpen(false)}
            >
              {t.contact}
            </Link>
          </div>
          <div className="mt-6 pt-6 border-t">
            <LanguageSwitcherClient className="w-full justify-start" onLanguageChange={setLanguage} />
            <Button asChild className="w-full mt-4">
              <Link href="/contact" onClick={() => setOpen(false)}>
                {t.getQuote}
              </Link>
            </Button>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  )
}
