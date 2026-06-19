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
    title: "Products",
    description:
      "Explore Kirii ceiling systems including CH linear, CP clip-in, CR wide linear, HP hook-on, and building accessories. Professional aluminum ceiling solutions for commercial and residential projects.",
    path: "/products",
    ogImage: "/images/CH-type_Linear_Ceiling_Series_RGB_10.jpg",
  })
}

export default function ProductsLayout({ children }: { children: React.ReactNode }) {
  return children
}
