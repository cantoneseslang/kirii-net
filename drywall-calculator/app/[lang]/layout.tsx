import type React from "react"
import "@/app/globals.css"
import { Inter } from "next/font/google"
import { ThemeProvider } from "@/components/theme-provider"
import { i18n } from "@/lib/i18n-config"
import Image from "next/image"
import Link from "next/link"

const inter = Inter({ subsets: ["latin"] })

export async function generateStaticParams() {
  return i18n.locales.map((locale) => ({ lang: locale }))
}

interface RootLayoutProps {
  children: React.ReactNode
  params: { lang: string }
}

export default async function RootLayout(props: RootLayoutProps) {
  // Extract the lang from props to avoid direct params.lang access
  const { children, params } = props;
  // Store the lang in a separate variable
  const lang = String(params?.lang || 'en');
  
  return (
    <html lang={lang}>
      <body className={inter.className}>
        <ThemeProvider attribute="class" defaultTheme="light" enableSystem>
          <main>
            {children}
            <footer style={{textAlign: 'center', color: '#888', fontSize: '14px', marginTop: '48px', marginBottom: '16px'}}>
              Copyright © Kirii (Hong Kong) Limited. All Rights Reserved.
            </footer>
          </main>
        </ThemeProvider>
      </body>
    </html>
  )
}
