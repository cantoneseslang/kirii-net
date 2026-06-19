import type { Metadata } from "next"
import { createPageMetadata } from "@/lib/seo"
import { isValidLocale, type Locale } from "@/lib/locale"

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>
}): Promise<Metadata> {
  const { locale: localeParam } = await params
  if (!isValidLocale(localeParam)) {
    return {}
  }

  const locale = localeParam as Locale

  return createPageMetadata({
    locale,
    title: "About Us",
    description:
      "Learn about Kirii Construction Materials (三水桐井), a leading supplier of aluminum ceiling systems and building materials serving Hong Kong and China since 2008.",
    path: "/about",
    ogImage: "/images/about-kirii-02.jpg",
  })
}

export default function AboutLayout({ children }: { children: React.ReactNode }) {
  return children
}
