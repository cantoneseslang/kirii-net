import type { MetadataRoute } from "next"
import { getAllBlogPosts } from "@/lib/blog-data"
import { localizedPath, locales, staticPaths, type Locale } from "@/lib/locale"
import { SITE_URL } from "@/lib/seo"

export default function sitemap(): MetadataRoute.Sitemap {
  const blogPosts = getAllBlogPosts()
  const entries: MetadataRoute.Sitemap = []

  for (const locale of locales) {
    for (const path of staticPaths) {
      entries.push({
        url: `${SITE_URL}${localizedPath(path, locale)}`,
        lastModified: new Date(),
        changeFrequency: path === "/" || path === "/projects" || path === "/blog" ? "weekly" : "monthly",
        priority:
          path === "/"
            ? 1
            : path === "/products"
              ? 0.9
              : path === "/projects" || path === "/about"
                ? 0.8
                : path === "/contact"
                  ? 0.7
                  : 0.6,
      })
    }

    for (const post of blogPosts) {
      entries.push({
        url: `${SITE_URL}${localizedPath(`/blog/${post.slug}`, locale as Locale)}`,
        lastModified: new Date(post.date),
        changeFrequency: "monthly",
        priority: 0.5,
      })
    }
  }

  return entries
}
