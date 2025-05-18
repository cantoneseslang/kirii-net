export const i18n = {
  defaultLocale: "zh-HK",
  locales: ["en", "zh-HK", "ja"],
} as const

export type Locale = (typeof i18n)["locales"][number]
