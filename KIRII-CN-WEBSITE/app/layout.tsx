import type React from "react"
import type { Metadata } from "next"
import "@/app/globals.css"
import { Inter, Playfair_Display } from "next/font/google"
import { ThemeProvider } from "@/components/theme-provider"
import { JsonLd } from "@/components/json-ld"
import { DEFAULT_OG_IMAGE, SITE_NAME, SITE_URL, organizationJsonLd } from "@/lib/seo"

const inter = Inter({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-inter",
})

const playfair = Playfair_Display({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-playfair",
})

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: "Professional Ceiling Systems & Building Materials",
    template: `%s | ${SITE_NAME}`,
  },
  description:
    "Kirii Construction Materials (三水桐井) is a leading provider of professional ceiling systems and building materials in Hong Kong and China, specializing in aluminum ceiling systems, building accessories, and custom construction solutions.",
  keywords: [
    "ceiling systems",
    "aluminum ceiling",
    "building materials",
    "construction materials",
    "Hong Kong",
    "China",
    "Foshan",
    "building accessories",
    "commercial ceiling",
    "residential ceiling",
    "MTR projects",
  ],
  openGraph: {
    title: `${SITE_NAME} | Professional Ceiling Systems & Building Materials`,
    description:
      "Leading provider of professional ceiling systems and building materials in Hong Kong and China.",
    url: "/",
    siteName: SITE_NAME,
    locale: "en_US",
    type: "website",
    images: [
      {
        url: DEFAULT_OG_IMAGE,
        width: 1200,
        height: 630,
        alt: "Kirii Construction Materials Building",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: `${SITE_NAME} | Professional Ceiling Systems & Building Materials`,
    description:
      "Leading provider of professional ceiling systems and building materials in Hong Kong and China.",
    images: [DEFAULT_OG_IMAGE],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
    },
  },
  verification: {
    google: "google5b93654b2ac7fe65",
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" suppressHydrationWarning className={`${inter.variable} ${playfair.variable}`}>
      <head>
        <link rel="icon" href="/favicon.ico" sizes="any" />
        <script async src="https://www.googletagmanager.com/gtag/js?id=G-LKW86VJECG"></script>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              window.dataLayer = window.dataLayer || [];
              function gtag(){dataLayer.push(arguments);}
              gtag('js', new Date());
              gtag('config', 'G-LKW86VJECG');
            `,
          }}
        />
      </head>
      <body>
        <JsonLd data={organizationJsonLd} />
        <ThemeProvider attribute="class" defaultTheme="light" enableSystem disableTransitionOnChange>
          {children}
        </ThemeProvider>
      </body>
    </html>
  )
}
