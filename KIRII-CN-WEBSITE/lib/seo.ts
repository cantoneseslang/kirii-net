import type { Metadata } from "next"
import {
  getHrefLang,
  getOpenGraphLocale,
  localizedPath,
  locales,
  type Locale,
} from "@/lib/locale"

export const SITE_URL = "https://kirii.cn"
export const SITE_NAME = "Kirii Construction Materials"
export const DEFAULT_OG_IMAGE = "/images/about-kirii-01.jpg"

type PageMetadataOptions = {
  title: string
  description: string
  path?: string
  locale?: Locale
  ogImage?: string
  type?: "website" | "article"
  noIndex?: boolean
}

export function createPageMetadata({
  title,
  description,
  path = "/",
  locale = "en",
  ogImage = DEFAULT_OG_IMAGE,
  type = "website",
  noIndex = false,
}: PageMetadataOptions): Metadata {
  const canonicalPath = localizedPath(path, locale)
  const imageUrl = ogImage.startsWith("http") ? ogImage : `${SITE_URL}${ogImage}`

  const languages: Record<string, string> = {
    "x-default": `${SITE_URL}${localizedPath(path, "en")}`,
  }

  for (const loc of locales) {
    languages[getHrefLang(loc)] = `${SITE_URL}${localizedPath(path, loc)}`
  }

  return {
    title,
    description,
    alternates: {
      canonical: canonicalPath,
      languages,
    },
    openGraph: {
      title,
      description,
      url: canonicalPath,
      siteName: SITE_NAME,
      locale: getOpenGraphLocale(locale),
      type,
      images: [
        {
          url: imageUrl,
          width: 1200,
          height: 630,
          alt: title,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [imageUrl],
    },
    ...(noIndex && {
      robots: {
        index: false,
        follow: false,
      },
    }),
  }
}

export const organizationJsonLd = {
  "@context": "https://schema.org",
  "@type": "Organization",
  name: SITE_NAME,
  alternateName: "三水桐井建材",
  url: SITE_URL,
  logo: `${SITE_URL}/images/brand-kirii-logo.png`,
  email: "info@kirii.cn",
  description:
    "Professional ceiling systems and building materials supplier serving Hong Kong and China, specializing in aluminum ceiling systems and building accessories.",
  address: {
    "@type": "PostalAddress",
    streetAddress: "No. 28, Jihua 1st Road, Chancheng District",
    addressLocality: "Foshan",
    addressRegion: "Guangdong",
    postalCode: "528100",
    addressCountry: "CN",
  },
  contactPoint: {
    "@type": "ContactPoint",
    contactType: "customer service",
    email: "info@kirii.cn",
    availableLanguage: ["English", "Chinese"],
  },
}

export function createBlogPostJsonLd(post: {
  title: string
  excerpt: string
  slug: string
  date: string
  author: string
  image: string
}) {
  const imageUrl = post.image.startsWith("http") ? post.image : `${SITE_URL}${post.image}`

  return {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    headline: post.title,
    description: post.excerpt,
    url: `${SITE_URL}/blog/${post.slug}`,
    datePublished: new Date(post.date).toISOString(),
    author: {
      "@type": "Person",
      name: post.author,
    },
    publisher: {
      "@type": "Organization",
      name: SITE_NAME,
      logo: {
        "@type": "ImageObject",
        url: `${SITE_URL}/images/brand-kirii-logo.png`,
      },
    },
    image: imageUrl,
  }
}
