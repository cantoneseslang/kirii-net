"use client"

import { useRouter } from "next/navigation"
import { usePathname } from "next/navigation"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

export default function LanguageSwitcher({ currentLang }: { currentLang: string }) {
  const router = useRouter()
  const pathname = usePathname()

  const handleLanguageChange = (newLocale: string) => {
    // Get the path without the locale
    const pathWithoutLocale = pathname.replace(`/${currentLang}`, "")

    // Navigate to the same page with the new locale
    router.push(`/${newLocale}${pathWithoutLocale}`)
  }

  return (
    <div className="w-32">
      <Select value={currentLang} onValueChange={handleLanguageChange}>
        <SelectTrigger>
          <SelectValue placeholder="Language" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="en">English</SelectItem>
          <SelectItem value="zh-HK">廣東話</SelectItem>
        </SelectContent>
      </Select>
    </div>
  )
}
