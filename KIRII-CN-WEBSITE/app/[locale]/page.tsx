import type { Metadata } from "next"
import { createPageMetadata } from "@/lib/seo"
import { isValidLocale, type Locale } from "@/lib/locale"
import HomePageClient from "./home-page-client"

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
    title: "Professional Ceiling Systems & Building Materials",
    description:
      "Kirii Construction Materials (三水桐井) supplies aluminum ceiling systems, building accessories, and custom construction solutions across Hong Kong and China.",
    path: "/",
  })
}

export default function Page() {
  return <HomePageClient />
}
