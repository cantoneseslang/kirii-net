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
    title: "Projects",
    description:
      "View Kirii Construction Materials project portfolio including MTR stations, hospitals, cultural centres, and commercial buildings across Hong Kong and China.",
    path: "/projects",
    ogImage: "/images/Admiralty-MTR-Station-01.jpg",
  })
}

export default function ProjectsLayout({ children }: { children: React.ReactNode }) {
  return children
}
