import type { Metadata } from "next"
import AboutPageClient from "./about-page-client"
import { buildPageMetadata } from "@/lib/page-seo"
import { resolvePageLanguage } from "@/lib/server-page"

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>
}): Promise<Metadata> {
  const { locale: localeParam } = await params
  return buildPageMetadata(localeParam, "about", "/about", "/images/about-kirii-02.jpg")
}

export default async function AboutPage({ params }: { params: Promise<{ locale: string }> }) {
  const language = await resolvePageLanguage(params)
  return <AboutPageClient language={language} />
}
