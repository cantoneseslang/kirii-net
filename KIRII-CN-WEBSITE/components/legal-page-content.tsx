import type { Language } from "@/lib/i18n"
import { getLegalDocument, getLegalLastUpdatedLabel, type LegalPageKey } from "@/lib/legal-content"
import { SiteHeader } from "@/components/site-header"
import { SiteFooter } from "@/components/site-footer"

type LegalPageContentProps = {
  page: LegalPageKey
  language: Language
}

export function LegalPageContent({ page, language }: LegalPageContentProps) {
  const document = getLegalDocument(page, language)
  const lastUpdatedLabel = getLegalLastUpdatedLabel(language)

  return (
    <div className="flex min-h-screen flex-col">
      <SiteHeader />

      <main className="flex-1 bg-slate-50">
        <section className="py-16 md:py-24">
          <div className="container mx-auto px-4 md:px-6 max-w-3xl">
            <h1 className="text-3xl md:text-5xl font-bold text-slate-900 mb-4">{document.title}</h1>
            <p className="text-sm text-slate-500 mb-8">
              {lastUpdatedLabel}: {document.lastUpdated}
            </p>
            <p className="text-lg text-slate-700 mb-10 leading-relaxed">{document.intro}</p>

            <div className="space-y-8">
              {document.sections.map((section) => (
                <section key={section.heading}>
                  <h2 className="text-xl md:text-2xl font-semibold text-slate-900 mb-3">{section.heading}</h2>
                  <div className="space-y-3 text-slate-700 leading-relaxed">
                    {section.paragraphs.map((paragraph) => (
                      <p key={paragraph}>{paragraph}</p>
                    ))}
                  </div>
                </section>
              ))}
            </div>
          </div>
        </section>
      </main>

      <SiteFooter />
    </div>
  )
}
