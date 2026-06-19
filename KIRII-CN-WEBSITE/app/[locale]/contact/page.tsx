import type { Metadata } from "next"
import ContactPageClient from "./contact-page-client"
import { buildPageMetadata } from "@/lib/page-seo"
import { resolvePageLanguage } from "@/lib/server-page"

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>
}): Promise<Metadata> {
  const { locale: localeParam } = await params
  return buildPageMetadata(localeParam, "contact", "/contact")
}

export default async function ContactPage({ params }: { params: Promise<{ locale: string }> }) {
  const language = await resolvePageLanguage(params)
  return <ContactPageClient language={language} />
}
