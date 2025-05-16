import "server-only"
import type { Locale } from "./i18n-config"

// Import dictionaries directly to avoid dynamic imports
import enDict from "./dictionaries/en.json"
import zhHKDict from "./dictionaries/zh-HK.json"
import jaDict from "./dictionaries/ja.json"

const dictionaries = {
  en: enDict,
  "zh-HK": zhHKDict,
  ja: jaDict,
}

export const getDictionary = async (locale: Locale | string) => {
  // Validate locale
  if (!Object.keys(dictionaries).includes(locale)) {
    return dictionaries["en"]
  }
  return dictionaries[locale as Locale]
}
