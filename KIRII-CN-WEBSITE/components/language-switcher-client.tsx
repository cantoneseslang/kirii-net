"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { ChevronDown, Globe } from "lucide-react"
import { type Language, saveLanguage, loadLanguage } from "@/lib/i18n"

interface LanguageSwitcherClientProps {
  className?: string
  onLanguageChange?: (language: Language) => void
}

const languages = [
  { code: "en" as Language, name: "English", flag: "🇺🇸" },
  { code: "zh-HK" as Language, name: "繁體中文", flag: "🇭🇰" },
  { code: "zh-CN" as Language, name: "简体中文", flag: "🇨🇳" },
]

export function LanguageSwitcherClient({ className, onLanguageChange }: LanguageSwitcherClientProps) {
  const [language, setLanguage] = useState<Language>("en")
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
    const savedLanguage = loadLanguage()
    setLanguage(savedLanguage)
  }, [])

  const currentLanguage = languages.find((lang) => lang.code === language) || languages[0]

  const handleLanguageChange = (newLanguage: Language) => {
    setLanguage(newLanguage)
    saveLanguage(newLanguage)
    onLanguageChange?.(newLanguage)
    // Force page reload to apply changes
    window.location.reload()
  }

  if (!mounted) {
    return (
      <Button variant="ghost" size="sm" className={className}>
        <Globe className="h-4 w-4 mr-2" />
        <span className="hidden sm:inline">🇺🇸 English</span>
        <span className="sm:hidden">🇺🇸</span>
        <ChevronDown className="h-4 w-4 ml-1" />
      </Button>
    )
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="sm" className={className}>
          <Globe className="h-4 w-4 mr-2" />
          <span className="hidden sm:inline">
            {currentLanguage.flag} {currentLanguage.name}
          </span>
          <span className="sm:hidden">{currentLanguage.flag}</span>
          <ChevronDown className="h-4 w-4 ml-1" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        {languages.map((lang) => (
          <DropdownMenuItem
            key={lang.code}
            onClick={() => handleLanguageChange(lang.code)}
            className={language === lang.code ? "bg-accent" : ""}
          >
            <span className="mr-2">{lang.flag}</span>
            {lang.name}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  )
} 