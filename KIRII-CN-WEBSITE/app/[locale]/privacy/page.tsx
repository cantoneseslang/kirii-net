import type { Metadata } from "next"
import { LegalPageContent } from "@/components/legal-page-content"
import { buildPageMetadata } from "@/lib/page-seo"
import { resolvePageLanguage } from "@/lib/server-page"

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>
}): Promise<Metadata> {
  const { locale: localeParam } = await params
  return buildPageMetadata(localeParam, "privacy", "/privacy")
}

export default async function PrivacyPage({ params }: { params: Promise<{ locale: string }> }) {
  const language = await resolvePageLanguage(params)
  return <LegalPageContent page="privacy" language={language} />
}
