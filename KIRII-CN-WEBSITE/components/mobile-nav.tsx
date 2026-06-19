"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { Menu } from "lucide-react"
import { LanguageSwitcherClient } from "@/components/language-switcher-client"
import { LocalizedLink } from "@/components/localized-link"
import { useLanguage } from "@/components/language-provider"
import { getTranslation } from "@/lib/i18n"
import { navLabels } from "@/lib/page-seo"

export function MobileNav() {
  const [open, setOpen] = useState(false)
  const { language } = useLanguage()
  const t = getTranslation(language)
  const labels = navLabels[language]

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
        <LocalizedLink href="/" className="flex items-center" onClick={() => setOpen(false)}>
          <span className="font-bold">{t.companyNameFull}</span>
        </LocalizedLink>
        <div className="my-4 h-[calc(100vh-8rem)] pb-10 pl-6">
          <div className="flex flex-col space-y-3">
            <LocalizedLink
              href="/"
              className="text-foreground/70 transition-colors hover:text-foreground"
              onClick={() => setOpen(false)}
            >
              {t.home}
            </LocalizedLink>
            <LocalizedLink
              href="/about"
              className="text-foreground/70 transition-colors hover:text-foreground"
              onClick={() => setOpen(false)}
            >
              {t.about}
            </LocalizedLink>
            <LocalizedLink
              href="/products"
              className="text-foreground/70 transition-colors hover:text-foreground"
              onClick={() => setOpen(false)}
            >
              {t.products}
            </LocalizedLink>
            <LocalizedLink
              href="/projects"
              className="text-foreground/70 transition-colors hover:text-foreground"
              onClick={() => setOpen(false)}
            >
              {t.projects}
            </LocalizedLink>
            <LocalizedLink
              href="/blog"
              className="text-foreground/70 transition-colors hover:text-foreground"
              onClick={() => setOpen(false)}
            >
              {labels.blog}
            </LocalizedLink>
            <LocalizedLink
              href="/contact"
              className="text-foreground/70 transition-colors hover:text-foreground"
              onClick={() => setOpen(false)}
            >
              {t.contact}
            </LocalizedLink>
          </div>
          <div className="mt-6 pt-6 border-t">
            <LanguageSwitcherClient className="w-full justify-start" />
            <Button asChild className="w-full mt-4">
              <LocalizedLink href="/contact" onClick={() => setOpen(false)}>
                {t.getQuote}
              </LocalizedLink>
            </Button>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  )
}
