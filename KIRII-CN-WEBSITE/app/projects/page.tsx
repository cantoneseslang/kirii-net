"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import Image from "next/image"

import { SiteHeader } from "@/components/site-header"
import { SiteFooter } from "@/components/site-footer"
import { PageHeader } from "@/components/page-header"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Train, Building2, Home, Palette, Phone, Mail } from "lucide-react"
import { type Language, getTranslation, loadLanguage } from "@/lib/i18n"

export default function ProjectsPage() {
  const [language, setLanguage] = useState<Language>("en")

  useEffect(() => {
    const savedLanguage = loadLanguage()
    setLanguage(savedLanguage)
  }, [])

  const t = getTranslation(language)
  return (
    <div className="flex min-h-screen flex-col">
      <SiteHeader />

      <main className="flex-1">
        <PageHeader
          title={t.ourProjectPortfolio}
          highlightedText={t.projectPortfolio}
          description={t.projectsPageDesc}
          backgroundImage="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/IMG_5549.jpg-8fCDDY84kB6sdgcjm8e0Tvfsm2YUOB.jpeg"
          badge={t.projectCategories}
        />

        <section className="py-20 bg-white dark:bg-slate-900">
          <div className="container px-4 md:px-6">
            <Tabs defaultValue="mtr" className="w-full">
              <div className="flex justify-center mb-12">
                <TabsList className="bg-white/10 dark:bg-slate-800/50 backdrop-blur-sm border border-white/10 p-1">
                  <TabsTrigger
                    value="mtr"
                    className="data-[state=active]:bg-gold-500 data-[state=active]:text-slate-900"
                  >
                    <Train className="w-4 h-4 mr-2" />
                    {t.mtrProjects}
                  </TabsTrigger>
                  <TabsTrigger
                    value="healthcare"
                    className="data-[state=active]:bg-gold-500 data-[state=active]:text-slate-900"
                  >
                    <Building2 className="w-4 h-4 mr-2" />
                    {t.healthcare}
                  </TabsTrigger>
                  <TabsTrigger
                    value="commercial"
                    className="data-[state=active]:bg-gold-500 data-[state=active]:text-slate-900"
                  >
                    <Building2 className="w-4 h-4 mr-2" />
                    {t.commercial}
                  </TabsTrigger>
                  <TabsTrigger
                    value="residential"
                    className="data-[state=active]:bg-gold-500 data-[state=active]:text-slate-900"
                  >
                    <Home className="w-4 h-4 mr-2" />
                    {t.residential}
                  </TabsTrigger>
                  <TabsTrigger
                    value="cultural"
                    className="data-[state=active]:bg-gold-500 data-[state=active]:text-slate-900"
                  >
                    <Palette className="w-4 h-4 mr-2" />
                    {t.cultural}
                  </TabsTrigger>
                </TabsList>
              </div>

              {/* MTR Projects Tab */}
              <TabsContent value="mtr" className="mt-0">
                <div className="mb-12">
                  <h2 className="text-3xl font-bold mb-4 text-slate-900 dark:text-white">
                    🚇 {t.mtrProjectsTitle}
                  </h2>
                  <p className="text-lg text-slate-600 dark:text-slate-300 mb-8">
                    {t.infrastructureExcellence}
                  </p>
                </div>

                {/* Featured MTR Stations */}
                <div className="space-y-16">
                  {/* Admiralty MTR Station */}
                  <Card className="overflow-hidden border-0 bg-white/5 dark:bg-slate-800/50 backdrop-blur-sm border border-white/10">
                    <CardContent className="p-8">
                      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                        <div>
                          <Badge className="bg-gold-500 text-slate-900 mb-4">{t.featuredStation}</Badge>
                          <h3 className="text-2xl font-bold mb-4 text-slate-900 dark:text-white">
                            1. {t.admiraltyStation}
                          </h3>
                          <div className="space-y-4 text-slate-600 dark:text-slate-300">
                            <div>
                              {t.admiraltyLocation}
                            </div>
                            <div>
                              {t.admiraltyApplication}
                            </div>
                            <div>
                              {t.admiraltyFeatures}
                            </div>
                            <div>
                              {t.admiraltyScope}
                            </div>
                          </div>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                          <div className="relative h-48">
                            <Image
                              src="/images/Admiralty-MTR-Station-01.jpg"
                              alt="Admiralty MTR Station 01"
                              fill
                              className="object-cover rounded-lg"
                            />
                          </div>
                          <div className="relative h-48">
                            <Image
                              src="/images/Admiralty-MTR-Station-02.jpg"
                              alt="Admiralty MTR Station 02"
                              fill
                              className="object-cover rounded-lg"
                            />
                          </div>
                          <div className="relative h-48">
                            <Image
                              src="/images/Admiralty-MTR-Station-03.jpg"
                              alt="Admiralty MTR Station 03"
                              fill
                              className="object-cover rounded-lg"
                            />
                          </div>
                          <div className="relative h-48">
                            <Image
                              src="/images/Admiralty-MTR-Station-04.jpg"
                              alt="Admiralty MTR Station 04"
                              fill
                              className="object-cover rounded-lg"
                            />
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Che Kung Temple MTR Station */}
                  <Card className="overflow-hidden border-0 bg-white/5 dark:bg-slate-800/50 backdrop-blur-sm border border-white/10">
                    <CardContent className="p-8">
                      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                        <div>
                          <h3 className="text-2xl font-bold mb-4 text-slate-900 dark:text-white">
                            2. {t.cheKungTempleStation}
                          </h3>
                          <div className="space-y-4 text-slate-600 dark:text-slate-300">
                            <div>
                              {t.cheKungLocation}
                            </div>
                            <div>
                              {t.cheKungSpecialization}
                            </div>
                            <div>
                              {t.cheKungDesign}
                            </div>
                          </div>
                        </div>
                        <div className="grid grid-cols-3 gap-4">
                          <div className="relative h-32">
                            <Image
                              src="/images/Che-Kung-Temple-MTR-Station-01.jpg"
                              alt="Che Kung Temple MTR Station 01"
                              fill
                              className="object-cover rounded-lg"
                            />
                          </div>
                          <div className="relative h-32">
                            <Image
                              src="/images/Che-Kung-Temple-MTR-Station-02.jpg"
                              alt="Che Kung Temple MTR Station 02"
                              fill
                              className="object-cover rounded-lg"
                            />
                          </div>
                          <div className="relative h-32">
                            <Image
                              src="/images/Che-Kung-Temple-MTR-Station-03.jpg"
                              alt="Che Kung Temple MTR Station 03"
                              fill
                              className="object-cover rounded-lg"
                            />
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Hong Kong MTR Station */}
                  <Card className="overflow-hidden border-0 bg-white/5 dark:bg-slate-800/50 backdrop-blur-sm border border-white/10">
                    <CardContent className="p-8">
                      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                        <div>
                          <h3 className="text-2xl font-bold mb-4 text-slate-900 dark:text-white">
                            3. {t.hongKongStation}
                          </h3>
                          <div className="space-y-4 text-slate-600 dark:text-slate-300">
                            <div>
                              {t.hongKongLocation}
                            </div>
                            <div>
                              {t.hongKongFeatures}
                            </div>
                            <div>
                              {t.hongKongApplication}
                            </div>
                          </div>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                          <div className="relative h-48">
                            <Image
                              src="/images/Hong-Kong-MTR-Station-01.jpg"
                              alt="Hong Kong MTR Station 01"
                              fill
                              className="object-cover rounded-lg"
                            />
                          </div>
                          <div className="relative h-48">
                            <Image
                              src="/images/Hong-Kong-MTR-Station-02.jpg"
                              alt="Hong Kong MTR Station 02"
                              fill
                              className="object-cover rounded-lg"
                            />
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Additional MTR Projects */}
                  <div>
                    <h3 className="text-2xl font-bold mb-8 text-slate-900 dark:text-white">
                      4. {t.additionalMtrProjects}
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                      {/* Heng Fa Chuen */}
                      <Card className="overflow-hidden border-0 bg-white/5 dark:bg-slate-800/50 backdrop-blur-sm border border-white/10">
                        <div className="relative h-48">
                          <Image
                            src="/images/Heng-Fa-Cheun-MTR-Station-01.jpg"
                            alt="Heng Fa Chuen MTR Station"
                            fill
                            className="object-cover"
                          />
                        </div>
                        <CardContent className="p-4">
                          <h4 className="font-bold text-slate-900 dark:text-white">
                            {t.hengFaChuen}
                          </h4>
                        </CardContent>
                      </Card>

                      {/* Jordan */}
                      <Card className="overflow-hidden border-0 bg-white/5 dark:bg-slate-800/50 backdrop-blur-sm border border-white/10">
                        <div className="relative h-48">
                          <Image
                            src="/images/Jordan-MTR-Station-01.jpg"
                            alt="Jordan MTR Station"
                            fill
                            className="object-cover"
                          />
                        </div>
                        <CardContent className="p-4">
                          <h4 className="font-bold text-slate-900 dark:text-white">{t.jordan}</h4>
                        </CardContent>
                      </Card>

                      {/* Kwai Fong */}
                      <Card className="overflow-hidden border-0 bg-white/5 dark:bg-slate-800/50 backdrop-blur-sm border border-white/10">
                        <div className="relative h-48">
                          <Image
                            src="/images/Kwai-Fong-MTR-Station-01.jpg"
                            alt="Kwai Fong MTR Station"
                            fill
                            className="object-cover"
                          />
                        </div>
                        <CardContent className="p-4">
                          <h4 className="font-bold text-slate-900 dark:text-white">{t.kwaiFong}</h4>
                        </CardContent>
                      </Card>

                      {/* Kwai Hing */}
                      <Card className="overflow-hidden border-0 bg-white/5 dark:bg-slate-800/50 backdrop-blur-sm border border-white/10">
                        <div className="relative h-48">
                          <Image
                            src="/images/Kwai-Hing-MTR-Station-01.jpg"
                            alt="Kwai Hing MTR Station"
                            fill
                            className="object-cover"
                          />
                        </div>
                        <CardContent className="p-4">
                          <h4 className="font-bold text-slate-900 dark:text-white">{t.kwaiHing}</h4>
                        </CardContent>
                      </Card>

                      {/* Lam Tin */}
                      <Card className="overflow-hidden border-0 bg-white/5 dark:bg-slate-800/50 backdrop-blur-sm border border-white/10">
                        <div className="relative h-48">
                          <Image
                            src="/images/Lam-Tin-MTR-Station-01.jpg"
                            alt="Lam Tin MTR Station"
                            fill
                            className="object-cover"
                          />
                        </div>
                        <CardContent className="p-4">
                          <h4 className="font-bold text-slate-900 dark:text-white">{t.lamTin}</h4>
                        </CardContent>
                      </Card>

                      {/* Sha Tin Wai */}
                      <Card className="overflow-hidden border-0 bg-white/5 dark:bg-slate-800/50 backdrop-blur-sm border border-white/10">
                        <div className="relative h-48">
                          <Image
                            src="/images/Sha-Tin-Wai-MTR-Station-01.jpg"
                            alt="Sha Tin Wai MTR Station"
                            fill
                            className="object-cover"
                          />
                        </div>
                        <CardContent className="p-4">
                          <h4 className="font-bold text-slate-900 dark:text-white">
                            {t.shaTinWai}
                          </h4>
                        </CardContent>
                      </Card>

                      {/* Sheung Wan */}
                      <Card className="overflow-hidden border-0 bg-white/5 dark:bg-slate-800/50 backdrop-blur-sm border border-white/10">
                        <div className="relative h-48">
                          <Image
                            src="/images/Sheung-Wan-MTR-Station-01.jpg"
                            alt="Sheung Wan MTR Station"
                            fill
                            className="object-cover"
                          />
                        </div>
                        <CardContent className="p-4">
                          <h4 className="font-bold text-slate-900 dark:text-white">{t.sheungWan}</h4>
                        </CardContent>
                      </Card>
                    </div>
                  </div>
                </div>
              </TabsContent>

              {/* Healthcare Tab */}
              <TabsContent value="healthcare" className="mt-0">
                <div className="mb-12">
                  <h2 className="text-3xl font-bold mb-4 text-slate-900 dark:text-white">
                    🏥 {t.publicFacilitiesHealthcare}
                  </h2>
                  <p className="text-lg text-slate-600 dark:text-slate-300 mb-8">{t.hospitalProjects}</p>
                </div>

                <div className="space-y-16">
                  {/* Eastern Hospital */}
                  <Card className="overflow-hidden border-0 bg-white/5 dark:bg-slate-800/50 backdrop-blur-sm border border-white/10">
                    <CardContent className="p-8">
                      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                        <div>
                          <Badge className="bg-gold-500 text-slate-900 mb-4">{t.majorHospital}</Badge>
                          <h3 className="text-2xl font-bold mb-4 text-slate-900 dark:text-white">
                            1. {t.easternHospitalFull}
                          </h3>
                          <div className="space-y-4 text-slate-600 dark:text-slate-300">
                            <div>
                              <strong>{t.type}:</strong> {t.majorPublicHospitalFacility}
                            </div>
                            <div>
                              <strong>{t.application}:</strong> {t.hygienicCeilingSystems}
                            </div>
                            <div>
                              <strong>{t.features}:</strong> {t.easyCleanSurfaces}
                            </div>
                            <div>
                              <strong>{t.compliance}:</strong> {t.healthcareFacilityStandards}
                            </div>
                            <div>
                              <strong>{t.scope}:</strong> {t.multipleWards}
                            </div>
                          </div>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                          <div className="relative h-48">
                            <Image
                              src="/images/Eastern-Hospital_01.jpg"
                              alt="Eastern Hospital 01"
                              fill
                              className="object-cover rounded-lg"
                            />
                          </div>
                          <div className="relative h-48">
                            <Image
                              src="/images/Eastern-Hospital_02.jpg"
                              alt="Eastern Hospital 02"
                              fill
                              className="object-cover rounded-lg"
                            />
                          </div>
                          <div className="relative h-48">
                            <Image
                              src="/images/Eastern-Hospital_03.jpg"
                              alt="Eastern Hospital 03"
                              fill
                              className="object-cover rounded-lg"
                            />
                          </div>
                          <div className="relative h-48">
                            <Image
                              src="/images/Eastern-Hospital_04.jpg"
                              alt="Eastern Hospital 04"
                              fill
                              className="object-cover rounded-lg"
                            />
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Yan Chai Hospital */}
                  <Card className="overflow-hidden border-0 bg-white/5 dark:bg-slate-800/50 backdrop-blur-sm border border-white/10">
                    <CardContent className="p-8">
                      <div className="mb-8">
                        <h3 className="text-2xl font-bold mb-4 text-slate-900 dark:text-white">
                          2. {t.yanChaiHospitalFull}
                        </h3>
                        <div className="space-y-4 text-slate-600 dark:text-slate-300">
                          <div>
                            <strong>{t.type}:</strong> {t.hospitalExpansionProject}
                          </div>
                          <div>
                            <strong>{t.specialization}:</strong> {t.medicalGradeCeiling}
                          </div>
                          <div>
                            <strong>{t.features}:</strong> {t.infectionControlCompliance}
                          </div>
                          <div>
                            <strong>{t.application}:</strong> {t.patientAreasMedical}
                          </div>
                        </div>
                      </div>
                      <div className="grid grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                        {Array.from({ length: 9 }, (_, i) => (
                          <div key={i} className="relative h-32">
                            <Image
                              src={`/images/yan-chai-hospital-blockc-0${i + 1}.jpg`}
                              alt={`Yan Chai Hospital Block C ${i + 1}`}
                              fill
                              className="object-cover rounded-lg"
                            />
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>

              {/* Commercial Tab */}
              <TabsContent value="commercial" className="mt-0">
                <div className="mb-12">
                  <h2 className="text-3xl font-bold mb-4 text-slate-900 dark:text-white">🏢 {t.commercialDevelopmentsTitle}</h2>
                  <p className="text-lg text-slate-600 dark:text-slate-300 mb-8">{t.mixedUseDevelopments}</p>
                </div>

                <div className="space-y-16">
                  {/* Grand Promenade */}
                  <Card className="overflow-hidden border-0 bg-white/5 dark:bg-slate-800/50 backdrop-blur-sm border border-white/10">
                    <CardContent className="p-8">
                      <div className="mb-8">
                        <Badge className="bg-gold-500 text-slate-900 mb-4">{t.megaDevelopment}</Badge>
                        <h3 className="text-2xl font-bold mb-4 text-slate-900 dark:text-white">
                          1. {t.grandPromenadeFull}
                        </h3>
                        <div className="space-y-4 text-slate-600 dark:text-slate-300">
                          <div>
                            <strong>{t.type}:</strong> {t.largeDevelopment}
                          </div>
                          <div>
                            <strong>{t.location}:</strong> Sai Wan Ho, Hong Kong
                          </div>
                          <div>
                            <strong>{t.application}:</strong> {t.commercialResidentialCeiling}
                          </div>
                          <div>
                            <strong>{t.features}:</strong> {t.diverseCeilingSolutions}
                          </div>
                          <div>
                            <strong>{t.scope}:</strong> {t.shoppingMallResidentialOffice}
                          </div>
                        </div>
                      </div>
                      <div className="grid grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
                        {Array.from({ length: 11 }, (_, i) => (
                          <div key={i} className="relative h-32">
                            <Image
                              src={`/images/Grand-Promenade-${String(i + 1).padStart(2, "0")}.jpg`}
                              alt={`Grand Promenade ${i + 1}`}
                              fill
                              className="object-cover rounded-lg"
                            />
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>

                  {/* Science Park */}
                  <Card className="overflow-hidden border-0 bg-white/5 dark:bg-slate-800/50 backdrop-blur-sm border border-white/10">
                    <CardContent className="p-8">
                      <div className="mb-8">
                        <h3 className="text-2xl font-bold mb-4 text-slate-900 dark:text-white">
                          2. {t.scienceParkName}
                        </h3>
                        <div className="space-y-4 text-slate-600 dark:text-slate-300">
                          <div>
                            <strong>{t.type}:</strong> {t.technologyResearchFacility}
                          </div>
                          <div>
                            <strong>{t.location}:</strong> Hong Kong Science Park
                          </div>
                          <div>
                            <strong>{t.application}:</strong> {t.highTechFacilityCeiling}
                          </div>
                          <div>
                            <strong>{t.features}:</strong> {t.cleanRoomCompatible}
                          </div>
                          <div>
                            <strong>{t.scope}:</strong> {t.researchLabsOfficeCommon}
                          </div>
                        </div>
                      </div>
                      <div className="grid grid-cols-3 md:grid-cols-4 lg:grid-cols-7 gap-4">
                        {Array.from({ length: 7 }, (_, i) => (
                          <div key={i} className="relative h-32">
                            <Image
                              src={`/images/Science-Park-${String(i + 1).padStart(2, "0")}.jpg`}
                              alt={`Science Park ${i + 1}`}
                              fill
                              className="object-cover rounded-lg"
                            />
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>

              {/* Residential Tab */}
              <TabsContent value="residential" className="mt-0">
                <div className="mb-12">
                  <h2 className="text-3xl font-bold mb-4 text-slate-900 dark:text-white">🏠 {t.residentialDevelopments}</h2>
                  <p className="text-lg text-slate-600 dark:text-slate-300 mb-8">{t.highEndResidentialDevelopment}</p>
                </div>

                <div className="space-y-16">
                  {/* Florient Rise */}
                  <Card className="overflow-hidden border-0 bg-white/5 dark:bg-slate-800/50 backdrop-blur-sm border border-white/10">
                    <CardContent className="p-8">
                      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                        <div>
                          <Badge className="bg-gold-500 text-slate-900 mb-4">{t.luxuryDevelopment}</Badge>
                          <h3 className="text-2xl font-bold mb-4 text-slate-900 dark:text-white">
                            {t.florientRiseFull}
                          </h3>
                          <div className="space-y-4 text-slate-600 dark:text-slate-300">
                            <div>
                              <strong>{t.type}:</strong> {t.luxuryResidentialDevelopment}
                            </div>
                            <div>
                              <strong>{t.application}:</strong> {t.premiumCeilingSolutions}
                            </div>
                            <div>
                              <strong>{t.features}:</strong> {t.aestheticAcousticComfort}
                            </div>
                            <div>
                              <strong>{t.scope}:</strong> {t.apartmentUnitsCommonLobby}
                            </div>
                            <div>
                              <strong>{t.design}:</strong> {t.modernElegantCeiling}
                            </div>
                          </div>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                          <div className="relative h-48">
                            <Image
                              src="/images/Florient-Rise-01.jpg"
                              alt="Florient Rise 01"
                              fill
                              className="object-cover rounded-lg"
                            />
                          </div>
                          <div className="relative h-48">
                            <Image
                              src="/images/Florient-Rise-02.jpg"
                              alt="Florient Rise 02"
                              fill
                              className="object-cover rounded-lg"
                            />
                          </div>
                          <div className="relative h-48">
                            <Image
                              src="/images/Florient-Rise-03.jpg"
                              alt="Florient Rise 03"
                              fill
                              className="object-cover rounded-lg"
                            />
                          </div>
                          <div className="relative h-48">
                            <Image
                              src="/images/Florient-Rise-04.jpg"
                              alt="Florient Rise 04"
                              fill
                              className="object-cover rounded-lg"
                            />
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>

              {/* Cultural Tab */}
              <TabsContent value="cultural" className="mt-0">
                <div className="mb-12">
                  <h2 className="text-3xl font-bold mb-4 text-slate-900 dark:text-white">
                    🎭 {t.culturalPublicBuildings}
                  </h2>
                  <p className="text-lg text-slate-600 dark:text-slate-300 mb-8">{t.culturalCenters}</p>
                </div>

                <div className="space-y-16">
                  {/* Wuzhou Culture Art Centre */}
                  <Card className="overflow-hidden border-0 bg-white/5 dark:bg-slate-800/50 backdrop-blur-sm border border-white/10">
                    <CardContent className="p-8">
                      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                        <div>
                          <Badge className="bg-gold-500 text-slate-900 mb-4">{t.culturalFacility}</Badge>
                          <h3 className="text-2xl font-bold mb-4 text-slate-900 dark:text-white">
                            {t.wuzhouCultureArtCentreFull}
                          </h3>
                          <div className="space-y-4 text-slate-600 dark:text-slate-300">
                            <div>
                              <strong>{t.type}:</strong> {t.culturalArtsFacility}
                            </div>
                            <div>
                              <strong>{t.location}:</strong> Wuzhou, China
                            </div>
                            <div>
                              <strong>{t.application}:</strong> {t.acousticCeilingPerformance}
                            </div>
                            <div>
                              <strong>{t.features}:</strong> {t.soundManagementAesthetic}
                            </div>
                            <div>
                              <strong>{t.scope}:</strong> {t.performanceHallsExhibition}
                            </div>
                          </div>
                        </div>
                        <div className="grid grid-cols-3 gap-4">
                          <div className="relative h-32">
                            <Image
                              src="/images/Wuzhou-Culture-Art-Centre-01.jpg"
                              alt="Wuzhou Culture Art Centre 01"
                              fill
                              className="object-cover rounded-lg"
                            />
                          </div>
                          <div className="relative h-32">
                            <Image
                              src="/images/Wuzhou-Culture-Art-Centre-02.jpg"
                              alt="Wuzhou Culture Art Centre 02"
                              fill
                              className="object-cover rounded-lg"
                            />
                          </div>
                          <div className="relative h-32">
                            <Image
                              src="/images/Wuzhou-Culture-Art-Centre-03.jpg"
                              alt="Wuzhou Culture Art Centre 03"
                              fill
                              className="object-cover rounded-lg"
                            />
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>
            </Tabs>
          </div>
        </section>

        {/* Project Category Summary */}
        <section className="py-20 bg-slate-50 dark:bg-slate-800/30">
          <div className="container px-4 md:px-6">
            <div className="max-w-4xl mx-auto">
              <h2 className="text-3xl font-bold mb-12 text-center text-slate-900 dark:text-white">
                📊 {t.projectCategorySummary}
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                <Card className="border-0 bg-white/5 dark:bg-slate-800/50 backdrop-blur-sm border border-white/10">
                  <CardContent className="p-6">
                    <div className="flex items-center mb-4">
                      <Train className="w-8 h-8 text-gold-500 mr-3" />
                      <h3 className="text-xl font-bold text-slate-900 dark:text-white">{t.mtrInfrastructure}</h3>
                    </div>
                    <div className="space-y-2 text-sm text-slate-600 dark:text-slate-300">
                      <div>
                        <strong>{t.scope}:</strong> 12+ {t.stations}
                      </div>
                      <div>
                        <strong>{t.network}:</strong> {t.hongKongMassTransitRailway}
                      </div>
                      <div>
                        <strong>{t.features}:</strong> {t.fireRatedDurableLowMaintenance}
                      </div>
                      <div>
                        <strong>{t.coverage}:</strong> {t.centralKowloonNewTerritories}
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="border-0 bg-white/5 dark:bg-slate-800/50 backdrop-blur-sm border border-white/10">
                  <CardContent className="p-6">
                    <div className="flex items-center mb-4">
                      <Building2 className="w-8 h-8 text-gold-500 mr-3" />
                      <h3 className="text-xl font-bold text-slate-900 dark:text-white">{t.publicHealthcare}</h3>
                    </div>
                    <div className="space-y-2 text-sm text-slate-600 dark:text-slate-300">
                      <div>
                        <strong>{t.projects}:</strong> 2 {t.majorHospitals}
                      </div>
                      <div>
                        {t.easternHospital}
                      </div>
                      <div>
                        {t.yanChaiHospital}
                      </div>
                      <div>
                        <strong>{t.features}:</strong> {t.hygienicAntimicrobialSystems}
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="border-0 bg-white/5 dark:bg-slate-800/50 backdrop-blur-sm border border-white/10">
                  <CardContent className="p-6">
                    <div className="flex items-center mb-4">
                      <Building2 className="w-8 h-8 text-gold-500 mr-3" />
                      <h3 className="text-xl font-bold text-slate-900 dark:text-white">{t.commercialDevelopments}</h3>
                    </div>
                    <div className="space-y-2 text-sm text-slate-600 dark:text-slate-300">
                      <div>
                        <strong>{t.projects}:</strong> 2 {t.majorDevelopments}
                      </div>
                      <div>
                        {t.grandPromenadeDesc}
                      </div>
                      <div>
                        {t.scienceParkDesc}
                      </div>
                      <div>
                        <strong>{t.scope}:</strong> {t.retailOfficeResearchAreas}
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="border-0 bg-white/5 dark:bg-slate-800/50 backdrop-blur-sm border border-white/10">
                  <CardContent className="p-6">
                    <div className="flex items-center mb-4">
                      <Home className="w-8 h-8 text-gold-500 mr-3" />
                      <h3 className="text-xl font-bold text-slate-900 dark:text-white">{t.residentialProjects}</h3>
                    </div>
                    <div className="space-y-2 text-sm text-slate-600 dark:text-slate-300">
                      <div>
                        <strong>{t.projects}:</strong> 1 {t.luxuryDevelopment}
                      </div>
                      <div>
                        {t.florientRiseDesc}
                      </div>
                      <div>
                        <strong>{t.features}:</strong> {t.premiumAestheticAcousticSolutions}
                      </div>
                      <div>
                        <strong>{t.application}:</strong> {t.privateUnitsCommonAreas}
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="border-0 bg-white/5 dark:bg-slate-800/50 backdrop-blur-sm border border-white/10">
                  <CardContent className="p-6">
                    <div className="flex items-center mb-4">
                      <Palette className="w-8 h-8 text-gold-500 mr-3" />
                      <h3 className="text-xl font-bold text-slate-900 dark:text-white">{t.culturalFacilities}</h3>
                    </div>
                    <div className="space-y-2 text-sm text-slate-600 dark:text-slate-300">
                      <div>
                        <strong>{t.projects}:</strong> 1 {t.artsCenter}
                      </div>
                      <div>
                        {t.wuzhouCultureArtCentreDesc}
                      </div>
                      <div>
                        <strong>{t.features}:</strong> {t.acousticOptimizedCeilingSystems}
                      </div>
                      <div>
                        <strong>{t.application}:</strong> {t.performanceHallsCulturalSpaces}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </section>

        {/* Sector Expertise */}
        <section className="py-20 bg-white dark:bg-slate-900">
          <div className="container px-4 md:px-6">
            <div className="max-w-4xl mx-auto">
              <h2 className="text-3xl font-bold mb-12 text-center text-slate-900 dark:text-white">
                🎯 {t.sectorExpertise}
              </h2>

              <div className="space-y-8">
                <Card className="border-0 bg-white/5 dark:bg-slate-800/50 backdrop-blur-sm border border-white/10">
                  <CardContent className="p-6">
                    <h3 className="text-xl font-bold mb-4 text-slate-900 dark:text-white">
                      {t.transportationInfrastructure}
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-slate-600 dark:text-slate-300">
                      <div>
                        <strong>{t.expertise}:</strong> {t.mtrStationsAcrossHongKong}
                      </div>
                      <div>
                        <strong>{t.specialization}:</strong> {t.highTrafficSafetyCritical}
                      </div>
                      <div>
                        <strong>{t.standards}:</strong> {t.fireSafetyDurabilityAccessibility}
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="border-0 bg-white/5 dark:bg-slate-800/50 backdrop-blur-sm border border-white/10">
                  <CardContent className="p-6">
                    <h3 className="text-xl font-bold mb-4 text-slate-900 dark:text-white">{t.healthcareFacilities}</h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-slate-600 dark:text-slate-300">
                      <div>
                        <strong>{t.experience}:</strong> {t.majorHospitalProjects}
                      </div>
                      <div>
                        <strong>{t.specialization}:</strong> {t.infectionControlEasyMaintenance}
                      </div>
                      <div>
                        <strong>{t.standards}:</strong> {t.medicalFacilityRegulationsHygiene}
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="border-0 bg-white/5 dark:bg-slate-800/50 backdrop-blur-sm border border-white/10">
                  <CardContent className="p-6">
                    <h3 className="text-xl font-bold mb-4 text-slate-900 dark:text-white">{t.commercialMixedUse}</h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-slate-600 dark:text-slate-300">
                      <div>
                        <strong>{t.portfolio}:</strong> {t.largeScaleDevelopments}
                      </div>
                      <div>
                        <strong>{t.versatility}:</strong> {t.retailOfficeResidentialIntegration}
                      </div>
                      <div>
                        <strong>{t.standards}:</strong> {t.buildingCodesAestheticRequirements}
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="border-0 bg-white/5 dark:bg-slate-800/50 backdrop-blur-sm border border-white/10">
                  <CardContent className="p-6">
                    <h3 className="text-xl font-bold mb-4 text-slate-900 dark:text-white">
                      {t.culturalPublicBuildings}
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-slate-600 dark:text-slate-300">
                      <div>
                        <strong>{t.capability}:</strong> {t.performanceVenuesPublicSpaces}
                      </div>
                      <div>
                        <strong>{t.specialization}:</strong> {t.acousticPerformanceArchitecturalAppeal}
                      </div>
                      <div>
                        <strong>{t.standards}:</strong> {t.culturalFacilityRequirementsAccessibility}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </section>

        {/* Project Inquiries */}
        <section className="py-20 bg-slate-900 text-white">
          <div className="container px-4 md:px-6">
            <div className="max-w-3xl mx-auto text-center">
              <h2 className="text-3xl font-bold mb-4">📞 {t.projectInquiries}</h2>
              <p className="text-lg text-slate-300 mb-8">{t.forProjectSpecific}</p>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
                <Card className="border-0 bg-white/10 backdrop-blur-sm">
                  <CardContent className="p-6 text-center">
                    <Mail className="w-8 h-8 text-gold-500 mx-auto mb-4" />
                    <h3 className="text-xl font-bold mb-2">{t.projectDevelopmentTeam}</h3>
                    <p className="text-slate-300 mb-4">info@kirii.cn</p>
                    <div className="text-sm text-slate-400 space-y-1">
                      <div>{t.portfolioDesc}</div>
                      <div>{t.references}</div>
                      <div>{t.consultation}</div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="border-0 bg-white/10 backdrop-blur-sm">
                  <CardContent className="p-6 text-center">
                    <Phone className="w-8 h-8 text-gold-500 mx-auto mb-4" />
                    <h3 className="text-xl font-bold mb-2">{t.directContact}</h3>
                    <p className="text-slate-300 mb-4">(86)757-8782-6438</p>
                    <div className="text-sm text-slate-400 space-y-1">
                      <div>{t.technicalSupport}</div>
                      <div>{t.projectPlanning}</div>
                      <div>{t.customSolutionsDesc}</div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button asChild className="bg-gold-500 hover:bg-gold-600 text-slate-900 text-base px-8 py-6">
                  <Link href="/contact">{t.requestProjectConsultation}</Link>
                </Button>
                <Button
                  asChild
                  variant="outline"
                  className="border-white text-white hover:bg-white/10 text-base px-8 py-6 bg-transparent"
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
