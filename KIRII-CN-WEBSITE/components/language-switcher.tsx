"use client"
import { Button } from "@/components/ui/button"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { ChevronDown, Globe } from "lucide-react"
import { type Language } from "@/lib/i18n"
import { useLanguage } from "@/components/language-provider"

interface LanguageSwitcherProps {
  className?: string
}

const languages = [
  { code: "en" as Language, name: "English", flag: "🇺🇸" },
  { code: "zh-HK" as Language, name: "繁體中文", flag: "🇭🇰" },
  { code: "zh-CN" as Language, name: "简体中文", flag: "🇨🇳" },
]

export function LanguageSwitcher({ className }: LanguageSwitcherProps) {
  const { language, setLanguage } = useLanguage()
  const currentLanguage = languages.find((lang) => lang.code === language) || languages[0]

  const handleLanguageChange = (newLanguage: Language) => {
    try {
      setLanguage(newLanguage)
    } catch (error) {
      console.error("Failed to change language:", error)
    }
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
