import { notFound } from "next/navigation"
import Image from "next/image"
import Link from "next/link"
import { Calendar, Clock, User, ArrowLeft, Tag } from "lucide-react"

import { SiteHeader } from "@/components/site-header"
import { SiteFooter } from "@/components/site-footer"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { getBlogPost, getAllBlogPosts } from "@/lib/blog-data"

interface BlogPostPageProps {
  params: {
    slug: string
  }
}

export async function generateStaticParams() {
  const posts = getAllBlogPosts()
  return posts.map((post) => ({
    slug: post.slug,
  }))
}

export default function BlogPostPage({ params }: BlogPostPageProps) {
  const post = getBlogPost(params.slug)

  if (!post) {
    notFound()
  }

  const relatedPosts = getAllBlogPosts()
    .filter((p) => p.slug !== post.slug && p.category === post.category)
    .slice(0, 3)

  return (
    <div className="flex min-h-screen flex-col">
      <SiteHeader />

      <main className="flex-1">
        {/* Hero Section */}
        <section className="relative py-24 md:py-32 overflow-hidden">
          <div className="absolute inset-0">
            <Image src={post.image || "/placeholder.svg"} alt={post.title} fill className="object-cover" priority />
            <div className="absolute inset-0 bg-slate-900/60" />
          </div>

          <div className="container mx-auto px-4 md:px-6 relative">
            <div className="max-w-4xl mx-auto text-center text-white">
              <Button asChild variant="ghost" className="mb-6 text-white hover:bg-white/10">
                <Link href="/blog">
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Back to Blog
                </Link>
              </Button>

              <Badge className="mb-4 bg-gold-500 text-slate-900 hover:bg-gold-600">{post.category}</Badge>

              <h1 className="text-4xl md:text-6xl font-bold mb-6">{post.title}</h1>

              <p className="text-xl md:text-2xl text-slate-200 mb-8 max-w-3xl mx-auto">{post.excerpt}</p>

              <div className="flex flex-wrap items-center justify-center gap-6 text-slate-300">
                <div className="flex items-center gap-2">
                  <Calendar className="h-5 w-5" />
                  <span>{post.date}</span>
                </div>
                <div className="flex items-center gap-2">
                  <User className="h-5 w-5" />
                  <span>{post.author}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="h-5 w-5" />
                  <span>{post.readTime}</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Article Content */}
        <section className="py-16 md:py-24">
          <div className="container mx-auto px-4 md:px-6">
            <div className="max-w-4xl mx-auto">
              <div className="grid grid-cols-1 lg:grid-cols-4 gap-12">
                {/* Main Content */}
                <div className="lg:col-span-3">
                  <article className="prose prose-lg prose-slate dark:prose-invert max-w-none">
                    <div
                      dangerouslySetInnerHTML={{
                        __html: post.content
                          .replace(/\n/g, "<br />")
                          .replace(/#{1,6}\s/g, (match) => {
                            const level = match.trim().length
                            return `<h${level} class="text-${4 - level}xl font-bold mt-8 mb-4 text-slate-900 dark:text-white">`
                          })
                          .replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>"),
                      }}
                    />
                  </article>

                  {/* Tags */}
                  <div className="mt-12 pt-8 border-t border-slate-200 dark:border-slate-700">
                    <div className="flex items-center gap-2 mb-4">
                      <Tag className="h-5 w-5 text-slate-500" />
                      <span className="font-semibold text-slate-900 dark:text-white">Tags:</span>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {post.tags.map((tag) => (
                        <Badge
                          key={tag}
                          variant="outline"
                          className="border-gold-500/50 text-gold-500 hover:bg-gold-500/10"
                        >
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Sidebar */}
                <div className="lg:col-span-1">
                  <div className="sticky top-8 space-y-8">
                    {/* Author Info */}
                    <Card className="border-0 bg-white/5 dark:bg-slate-800/50 backdrop-blur-sm border border-white/10">
                      <CardContent className="p-6">
                        <h3 className="font-bold text-lg mb-4 text-slate-900 dark:text-white">About the Author</h3>
                        <div className="flex items-center gap-3 mb-4">
                          <div className="w-12 h-12 bg-gold-500 rounded-full flex items-center justify-center">
                            <span className="text-slate-900 font-bold">
                              {post.author
                                .split(" ")
                                .map((n) => n[0])
                                .join("")}
                            </span>
                          </div>
                          <div>
                            <p className="font-semibold text-slate-900 dark:text-white">{post.author}</p>
                            <p className="text-sm text-slate-600 dark:text-slate-400">Glass & Design Expert</p>
                          </div>
                        </div>
                        <p className="text-sm text-slate-600 dark:text-slate-400">
                          Passionate about innovative glass solutions and helping clients transform their spaces with
                          beautiful, functional designs.
                        </p>
                      </CardContent>
                    </Card>

                    {/* Newsletter Signup */}
                    <Card className="border-0 bg-white/5 dark:bg-slate-800/50 backdrop-blur-sm border border-white/10">
                      <CardContent className="p-6">
                        <h3 className="font-bold text-lg mb-4 text-slate-900 dark:text-white">Stay Updated</h3>
                        <p className="text-sm text-slate-600 dark:text-slate-400 mb-4">
                          Subscribe to our newsletter for the latest design trends and project insights.
                        </p>
                        <div className="space-y-3">
                          <input
                            type="email"
                            placeholder="Your email address"
                            className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-md text-slate-900 dark:text-white placeholder-slate-500"
                          />
                          <Button className="w-full bg-gold-500 hover:bg-gold-600 text-slate-900">Subscribe</Button>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Related Posts */}
        {relatedPosts.length > 0 && (
          <section className="py-16 md:py-24 bg-slate-50 dark:bg-slate-900/50">
            <div className="container mx-auto px-4 md:px-6">
              <div className="max-w-6xl mx-auto">
                <h2 className="text-3xl md:text-4xl font-bold text-center mb-12 text-slate-900 dark:text-white">
                  Related <span className="text-gold-500">Articles</span>
                </h2>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                  {relatedPosts.map((relatedPost) => (
                    <Card
                      key={relatedPost.slug}
                      className="overflow-hidden border-0 bg-white/5 dark:bg-slate-800/50 backdrop-blur-sm border border-white/10 hover:transform hover:scale-105 transition-all duration-300"
                    >
                      <div className="relative h-48">
                        <Image
                          src={relatedPost.image || "/placeholder.svg"}
                          alt={relatedPost.title}
                          fill
                          className="object-cover"
                        />
                        <Badge className="absolute top-4 right-4 bg-gold-500 text-slate-900">
                          {relatedPost.category}
                        </Badge>
                      </div>
                      <CardContent className="p-6">
                        <div className="flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400 mb-3">
                          <Calendar className="h-4 w-4" />
                          <span>{relatedPost.date}</span>
                        </div>
                        <h3 className="text-xl font-bold mb-2 text-slate-900 dark:text-white">{relatedPost.title}</h3>
                        <p className="text-slate-600 dark:text-slate-300 mb-4 line-clamp-3">{relatedPost.excerpt}</p>
                        <Button asChild variant="link" className="p-0 h-auto text-gold-500 hover:text-gold-600">
                          <Link href={`/blog/${relatedPost.slug}`}>Read More</Link>
                        </Button>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            </div>
          </section>
        )}

        {/* CTA Section */}
        <section className="py-16 md:py-24 bg-gradient-to-r from-slate-900 to-slate-800 text-white">
          <div className="container mx-auto px-4 md:px-6">
            <div className="max-w-4xl mx-auto text-center">
              <h2 className="text-3xl md:text-4xl font-bold mb-6">
                Ready to Start Your <span className="text-gold-500">Project?</span>
              </h2>
              <p className="text-xl text-slate-300 mb-8">
                Let our experts help you bring your vision to life with custom glass and aluminum solutions.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button asChild size="lg" className="bg-gold-500 hover:bg-gold-600 text-slate-900">
                  <Link href="/contact">Get Free Consultation</Link>
                </Button>
                <Button
                  asChild
                  size="lg"
                  variant="outline"
                  className="border-white text-white hover:bg-white hover:text-slate-900"
                >
                  <Link href="/projects">View Our Work</Link>
                </Button>
              </div>
            </div>
          </div>
        </section>
      </main>

      <SiteFooter />
    </div>
  )
}
