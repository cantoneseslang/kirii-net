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
                <img src="/kirii-logo.png" alt="KIRII ロゴ" width={120} height={40} style={{objectFit: 'contain', display: 'block'}} />
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
