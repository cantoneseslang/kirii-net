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
    title: "Blog",
    description:
      "Industry insights and technical articles on ceiling systems, building materials, and construction solutions from Kirii Construction Materials.",
    path: "/blog",
  })
}

export default function BlogLayout({ children }: { children: React.ReactNode }) {
  return children
}
