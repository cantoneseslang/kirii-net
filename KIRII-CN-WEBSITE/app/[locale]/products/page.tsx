import type { Metadata } from "next"
import ProductsPageClient from "./products-page-client"
import { buildPageMetadata } from "@/lib/page-seo"
import { resolvePageLanguage } from "@/lib/server-page"

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>
}): Promise<Metadata> {
  const { locale: localeParam } = await params
  return buildPageMetadata(
    localeParam,
    "products",
    "/products",
    "/images/CH-type_Linear_Ceiling_Series_RGB_10.jpg",
  )
}

export default async function ProductsPage({ params }: { params: Promise<{ locale: string }> }) {
  const language = await resolvePageLanguage(params)
  return <ProductsPageClient language={language} />
}
