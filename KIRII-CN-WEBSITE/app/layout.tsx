import type React from "react"
import "@/app/globals.css"
import { Inter, Playfair_Display } from "next/font/google"
import { ThemeProvider } from "@/components/theme-provider"

// Initialize the fonts
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

export const metadata = {
  title: "Kirii Construction Materials | Professional Ceiling Systems & Building Materials",
  description:
    "Kirii Construction Materials (三水桐井) is a leading provider of professional ceiling systems and building materials in Hong Kong and China, specializing in aluminum ceiling systems, building accessories, and custom construction solutions.",
  keywords:
    "ceiling systems, aluminum ceiling, building materials, construction materials, Hong Kong, China, Foshan, building accessories, commercial ceiling, residential ceiling, MTR projects",
  generator: "Next.js",
  openGraph: {
    title: "Kirii Construction Materials | Professional Ceiling Systems & Building Materials",
    description: "Leading provider of professional ceiling systems and building materials in Hong Kong and China",
    url: "https://kirii.cn",
    siteName: "Kirii Construction Materials",
    locale: "en_US",
    type: "website",
    images: [
      {
        url: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/about-kirii-01.jpg-xiKJjANxvt5rzvEWA4bxRJmmTE28jE.jpeg",
        width: 1200,
        height: 630,
        alt: "Kirii Construction Materials Building",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Kirii Construction Materials | Professional Ceiling Systems & Building Materials",
    description: "Leading provider of professional ceiling systems and building materials in Hong Kong and China",
    images: ["https://hebbkx1anhila5yf.public.blob.vercel-storage.com/about-kirii-01.jpg-xiKJjANxvt5rzvEWA4bxRJmmTE28jE.jpeg"],
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
        <ThemeProvider attribute="class" defaultTheme="light" enableSystem disableTransitionOnChange>
          {children}
        </ThemeProvider>
      </body>
    </html>
  )
}
