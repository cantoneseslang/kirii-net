import type { Metadata } from "next"
import { notFound } from "next/navigation"
import Image from "next/image"
import Link from "next/link"
import { Calendar, Clock, ArrowRight } from "lucide-react"

import { SiteHeader } from "@/components/site-header"
import { SiteFooter } from "@/components/site-footer"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { getAllBlogPosts } from "@/lib/blog-data"
import { isValidLocale, localizedPath, type Locale } from "@/lib/locale"
import { buildPageMetadata, getPageSeo } from "@/lib/page-seo"
import { resolvePageLanguage } from "@/lib/server-page"

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>
}): Promise<Metadata> {
  const { locale: localeParam } = await params
  return buildPageMetadata(localeParam, "blog", "/blog")
}

export default async function BlogPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale: localeParam } = await params

  if (!isValidLocale(localeParam)) {
    notFound()
  }

  const locale = localeParam as Locale
  const language = await resolvePageLanguage(params)
  const { title, description } = getPageSeo(locale, "blog")
  const posts = getAllBlogPosts()

  const readMoreLabel =
    language === "en" ? "Read More" : language === "zh-HK" ? "閱讀更多" : "阅读更多"
  const insightsLabel = language === "en" ? "Insights" : language === "zh-HK" ? "資訊" : "资讯"

  return (
    <div className="flex min-h-screen flex-col">
      <SiteHeader />

      <main className="flex-1">
        <section className="relative py-24 md:py-32 overflow-hidden bg-slate-900 text-white">
          <div className="absolute inset-0">
            <Image
              src="/images/about-kirii-01.jpg"
              alt={title}
              fill
              className="object-cover opacity-30"
              priority
              sizes="100vw"
            />
          </div>
          <div className="container mx-auto px-4 md:px-6 relative">
            <div className="max-w-3xl mx-auto text-center">
              <Badge className="mb-4 bg-gold-500 text-slate-900 hover:bg-gold-600">{insightsLabel}</Badge>
              <h1 className="text-4xl md:text-6xl font-bold mb-6">{title}</h1>
              <p className="text-xl text-slate-200">{description}</p>
            </div>
          </div>
        </section>

        <section className="py-16 md:py-24">
          <div className="container mx-auto px-4 md:px-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
              {posts.map((post) => (
                <Card
                  key={post.slug}
                  className="overflow-hidden border-0 bg-white shadow-lg hover:shadow-xl transition-shadow duration-300"
                >
                  <div className="relative h-48">
                    <Image
                      src={post.image || "/placeholder.svg"}
                      alt={post.title}
                      fill
                      className="object-cover"
                      sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                    />
                    <Badge className="absolute top-4 right-4 bg-gold-500 text-slate-900">{post.category}</Badge>
                  </div>
                  <CardContent className="p-6">
                    <div className="flex items-center gap-4 text-sm text-slate-500 mb-3">
                      <div className="flex items-center gap-1">
                        <Calendar className="h-4 w-4" />
                        <span>{post.date}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Clock className="h-4 w-4" />
                        <span>{post.readTime}</span>
                      </div>
                    </div>
                    <h2 className="text-xl font-bold mb-2 text-slate-900">{post.title}</h2>
                    <p className="text-slate-600 mb-4 line-clamp-3">{post.excerpt}</p>
                    <Button asChild variant="link" className="p-0 h-auto text-gold-600 hover:text-gold-700">
                      <Link href={localizedPath(`/blog/${post.slug}`, locale)}>
                        {readMoreLabel}
                        <ArrowRight className="ml-1 h-4 w-4" />
                      </Link>
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>
      </main>

      <SiteFooter />
    </div>
  )
}
