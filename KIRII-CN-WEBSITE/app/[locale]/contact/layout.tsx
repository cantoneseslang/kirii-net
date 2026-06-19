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
    title: "Contact Us",
    description:
      "Contact Kirii Construction Materials in Foshan, China for ceiling systems quotes, technical consultation, and project support. Email info@kirii.cn.",
    path: "/contact",
  })
}

export default function ContactLayout({ children }: { children: React.ReactNode }) {
  return children
}
