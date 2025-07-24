"use client"

import { useState, useEffect } from "react"
import Image from "next/image"
import Link from "next/link"

import { SiteHeader } from "@/components/site-header"
import { SiteFooter } from "@/components/site-footer"
import { PageHeader } from "@/components/page-header"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { type Language, getTranslation, loadLanguage } from "@/lib/i18n"

export default function AboutPage() {
  const [language, setLanguage] = useState<Language>("en")

  useEffect(() => {
    const savedLanguage = loadLanguage()
    setLanguage(savedLanguage)
  }, [])

  const t = getTranslation(language)

  return (
    <div className="flex min-h-screen flex-col" style={{ fontFamily: "Arial, sans-serif" }}>
      <SiteHeader />

      <main className="flex-1">
        <PageHeader
          title={t.aboutKirii}
          highlightedText="Kirii Sanshui"
          description={t.leadingSupplier}
          backgroundImage="/images/about-kirii-01.jpg"
          badge={t.companyOverview}
        />

        {/* Company Overview Section */}
        <section className="py-24 md:py-32 relative">
          <div className="container mx-auto px-4 md:px-6 relative">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
              <div className="relative">
                <div className="relative z-10">
                  <h2
                    className="text-3xl md:text-4xl lg:text-5xl font-bold mb-6 text-slate-900 dark:text-white"
                    style={{ fontFamily: "Arial, sans-serif" }}
                  >
                    {t.buildingExcellence} <br />
                    <span className="text-blue-600">{t.since2008}</span>
                  </h2>

                  <div
                    className="space-y-4 text-slate-700 dark:text-slate-300"
                    style={{ fontFamily: "Arial, sans-serif" }}
                  >
                    <p className="text-lg">
                      {t.aboutCompanyDesc1}
                    </p>

                    <p className="text-lg">
                      {t.aboutCompanyDesc2}
                    </p>

                    <p className="text-lg">
                      {t.aboutCompanyDesc3}
                    </p>
                  </div>

                  {/* Company Statistics */}
                  <div className="mt-8 grid grid-cols-3 gap-6">
                    <div className="text-center">
                      <h3
                        className="text-3xl md:text-4xl font-bold text-blue-600"
                        style={{ fontFamily: "Arial, sans-serif" }}
                      >
                        15+
                      </h3>
                      <p
                        className="text-sm text-slate-600 dark:text-slate-400 mt-2"
                        style={{ fontFamily: "Arial, sans-serif" }}
                      >
                        {t.yearsOfExperience}
                      </p>
                    </div>

                    <div className="text-center">
                      <h3
                        className="text-3xl md:text-4xl font-bold text-blue-600"
                        style={{ fontFamily: "Arial, sans-serif" }}
                      >
                        500+
                      </h3>
                      <p
                        className="text-sm text-slate-600 dark:text-slate-400 mt-2"
                        style={{ fontFamily: "Arial, sans-serif" }}
                      >
                        {t.projectsCompleted}
                      </p>
                    </div>

                    <div className="text-center">
                      <h3
                        className="text-3xl md:text-4xl font-bold text-blue-600"
                        style={{ fontFamily: "Arial, sans-serif" }}
                      >
                        100%
                      </h3>
                      <p
                        className="text-sm text-slate-600 dark:text-slate-400 mt-2"
                        style={{ fontFamily: "Arial, sans-serif" }}
                      >
                        {t.qualityGuarantee}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="relative">
                <div className="relative h-[600px] w-full">
                  <div className="absolute top-0 right-0 w-[80%] h-[350px] rounded-2xl overflow-hidden shadow-2xl">
                    <Image
                      src="/images/about-kirii-02.jpg"
                      alt="Kirii San Shui modern conference room with ceiling systems"
                      fill
                      className="object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-900/60 to-transparent" />
                    <div className="absolute bottom-4 left-4 text-white">
                      <p className="text-sm font-medium" style={{ fontFamily: "Arial, sans-serif" }}>
                        {t.modernCeilingSystems}
                      </p>
                      <p className="text-xs opacity-80" style={{ fontFamily: "Arial, sans-serif" }}>
                        {t.professionalInstallation}
                      </p>
                    </div>
                  </div>

                  <div className="absolute bottom-0 left-0 w-[70%] h-[300px] rounded-2xl overflow-hidden shadow-2xl">
                    <Image
                      src="/images/about-kirii-03.jpg"
                      alt="Kirii San Shui company reception area"
                      fill
                      className="object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-900/60 to-transparent" />
                    <div className="absolute bottom-4 left-4 text-white">
                      <p className="text-sm font-medium" style={{ fontFamily: "Arial, sans-serif" }}>
                        {t.companyHeadquarters}
                      </p>
                      <p className="text-xs opacity-80" style={{ fontFamily: "Arial, sans-serif" }}>
                        {t.professionalServiceCenter}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Our Expertise Section */}
        <section className="py-24 md:py-32 bg-slate-100 dark:bg-slate-900/50 relative">
          <div className="absolute inset-0 bg-gradient-to-b from-transparent to-white/5 dark:to-slate-800/30" />

          <div className="container mx-auto px-4 md:px-6 relative">
            <div className="text-center max-w-3xl mx-auto mb-16">
              <Badge
                className="mb-6 bg-blue-600/20 text-blue-600 border-blue-600/30 px-4 py-1.5"
                style={{ fontFamily: "Arial, sans-serif" }}
              >
                {t.ourExpertise}
              </Badge>

              <h2
                className="text-3xl md:text-4xl lg:text-5xl font-bold mb-6 text-slate-900 dark:text-white"
                style={{ fontFamily: "Arial, sans-serif" }}
              >
                {t.specializedBuildingSolutions.split(' ').slice(0, 1).join(' ')} <span className="text-blue-600">{t.specializedBuildingSolutions.split(' ').slice(1).join(' ')}</span>
              </h2>

              <p className="text-lg text-slate-600 dark:text-slate-400" style={{ fontFamily: "Arial, sans-serif" }}>
                {t.ourExpertiseDesc}
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <Card className="bg-white/5 dark:bg-slate-800/50 backdrop-blur-sm border border-white/10 h-full">
                <CardContent className="p-8">
                  <div className="h-12 w-12 rounded-full bg-blue-600/20 flex items-center justify-center mb-6">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="24"
                      height="24"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className="text-blue-600"
                    >
                      <path d="M3 21h18" />
                      <path d="M5 21V7l8-4v18" />
                      <path d="M19 21V11l-6-4" />
                    </svg>
                  </div>
                  <h3
                    className="text-xl font-semibold mb-3 text-slate-900 dark:text-white"
                    style={{ fontFamily: "Arial, sans-serif" }}
                  >
                    {t.innovativeCeilingSystems}
                  </h3>
                  <p className="text-slate-600 dark:text-slate-400 mb-4" style={{ fontFamily: "Arial, sans-serif" }}>
                    {t.innovativeCeilingDesc}
                  </p>
                  <ul
                    className="text-sm text-slate-600 dark:text-slate-400 space-y-1"
                    style={{ fontFamily: "Arial, sans-serif" }}
                  >
                    <li>• {t.chTypeLinearCeiling}</li>
                    <li>• {t.cp022ClipinCeiling}</li>
                    <li>• {t.variousSuspendedCeiling}</li>
                  </ul>
                </CardContent>
              </Card>

              <Card className="bg-white/5 dark:bg-slate-800/50 backdrop-blur-sm border border-white/10 h-full">
                <CardContent className="p-8">
                  <div className="h-12 w-12 rounded-full bg-blue-600/20 flex items-center justify-center mb-6">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="24"
                      height="24"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className="text-blue-600"
                    >
                      <path d="M14 9V5a3 3 0 0 0-3-3l-4 9v11h11.28a2 2 0 0 0 2-1.7l1.38-9a2 2 0 0 0-2-2.3zM7 22H4a2 2 0 0 1-2-2v-7a2 2 0 0 1 2-2h3" />
                    </svg>
                  </div>
                  <h3
                    className="text-xl font-semibold mb-3 text-slate-900 dark:text-white"
                    style={{ fontFamily: "Arial, sans-serif" }}
                  >
                    {t.constructionAccessories}
                  </h3>
                  <p className="text-slate-600 dark:text-slate-400 mb-4" style={{ fontFamily: "Arial, sans-serif" }}>
                    {t.constructionAccessoriesDesc}
                  </p>
                  <ul
                    className="text-sm text-slate-600 dark:text-slate-400 space-y-1"
                    style={{ fontFamily: "Arial, sans-serif" }}
                  >
                    <li>• {t.highQualityAccessHatches}</li>
                    <li>• {t.professionalMountingBrackets}</li>
                    <li>• {t.specializedFasteningSystem}</li>
                    <li>• {t.customBuildingAccessories}</li>
                  </ul>
                </CardContent>
              </Card>

              <Card className="bg-white/5 dark:bg-slate-800/50 backdrop-blur-sm border border-white/10 h-full">
                <CardContent className="p-8">
                  <div className="h-12 w-12 rounded-full bg-blue-600/20 flex items-center justify-center mb-6">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="24"
                      height="24"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className="text-blue-600"
                    >
                      <path d="M12 3a6.364 6.364 0 0 0 9 9 9 9 0 1 1-9-9Z" />
                    </svg>
                  </div>
                  <h3
                    className="text-xl font-semibold mb-3 text-slate-900 dark:text-white"
                    style={{ fontFamily: "Arial, sans-serif" }}
                  >
                    {t.customBuildingSolutions}
                  </h3>
                  <p className="text-slate-600 dark:text-slate-400 mb-4" style={{ fontFamily: "Arial, sans-serif" }}>
                    {t.customBuildingSolutionsDesc}
                  </p>
                  <ul
                    className="text-sm text-slate-600 dark:text-slate-400 space-y-1"
                    style={{ fontFamily: "Arial, sans-serif" }}
                  >
                    <li>• {t.tailoredProjectSolutions}</li>
                    <li>• {t.technicalSpecCompliance}</li>
                    <li>• {t.commercialProjectSpecialization}</li>
                    <li>• {t.infrastructureProjectExpertise}</li>
                  </ul>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        {/* Call to Action */}
        <section className="py-24 md:py-32 bg-slate-900 text-white relative">
          <div className="absolute inset-0 bg-[url('/images/about-kirii-01.jpg')] opacity-10 bg-cover bg-center" />

          <div className="container mx-auto px-4 md:px-6 relative">
            <div className="text-center max-w-3xl mx-auto">
              <Badge
                className="mb-6 bg-blue-600/20 text-blue-600 border-blue-600/30 px-4 py-1.5"
                style={{ fontFamily: "Arial, sans-serif" }}
              >
                {t.partnerWithUs}
              </Badge>

              <h2
                className="text-3xl md:text-4xl lg:text-5xl font-bold mb-6 text-white"
                style={{ fontFamily: "Arial, sans-serif" }}
              >
                {t.readyToStartProject.split(' ').slice(0, -1).join(' ')} <span className="text-blue-600">{t.readyToStartProject.split(' ').slice(-1).join(' ')}</span>
              </h2>

              <p className="text-lg text-slate-300 mb-10" style={{ fontFamily: "Arial, sans-serif" }}>
                {t.readyToStartProjectDesc}
              </p>

              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button
                  asChild
                  className="bg-blue-600 hover:bg-blue-700 text-white text-base px-8 py-6"
                  style={{ fontFamily: "Arial, sans-serif" }}
                >
                  <Link href="/contact">{t.contactOurTeam}</Link>
                </Button>
                <Button
                  asChild
                  variant="outline"
                  className="border-white text-white hover:bg-white/10 text-base px-8 py-6 bg-transparent"
                  style={{ fontFamily: "Arial, sans-serif" }}
                >
                  <Link href="/products">{t.viewOurProducts}</Link>
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
