import type React from "react"
import "@/app/globals.css"
import { Inter } from "next/font/google"
import { ThemeProvider } from "@/components/theme-provider"
import { i18n } from "@/lib/i18n-config"

const inter = Inter({ subsets: ["latin"] })

export async function generateStaticParams() {
  return i18n.locales.map((locale) => ({ lang: locale }))
}

export default function RootLayout({
  children,
  params,
}: {
  children: React.ReactNode
  params: { lang: string }
}) {
  return (
    <html lang={params.lang}>
      <body className={inter.className}>
        <ThemeProvider attribute="class" defaultTheme="light" enableSystem>
          <main>
            <div style={{ display: 'flex', alignItems: 'center', padding: '16px 0 16px 16px' }}>
              <a href={`/${params.lang}`} style={{ display: 'inline-block' }}>
                <svg width="120" height="40" viewBox="0 0 240 80" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <rect width="80" height="80" rx="16" fill="#B7D6F6"/>
                  <rect x="16" y="16" width="48" height="48" rx="8" fill="#fff"/>
                  <rect x="32" y="32" width="16" height="16" rx="4" fill="#4A90E2"/>
                  <text x="90" y="55" font-family="Arial, Helvetica, sans-serif" font-size="32" fill="#222">KIRII</text>
                </svg>
              </a>
            </div>
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
