"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Building2, Wrench, Settings, Star, ArrowRight, CheckCircle, Users, Award } from "lucide-react"
import Link from "next/link"
import Image from "next/image"
import { SiteHeader } from "@/components/site-header"
import { SiteFooter } from "@/components/site-footer"
import { type Language, getTranslation, loadLanguage } from "@/lib/i18n"

export default function HomePage() {
  const [language, setLanguage] = useState<Language>("en")

  useEffect(() => {
    const savedLanguage = loadLanguage()
    setLanguage(savedLanguage)
  }, [])

  const t = getTranslation(language)

  return (
    <div
      className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50"
      style={{ fontFamily: "Arial, sans-serif" }}
    >
      <SiteHeader />

      {/* Hero Section */}
      <section className="relative py-20 px-4 md:px-6 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-900/90 to-blue-800/80 z-10"></div>
        <div className="absolute inset-0">
          <Image
            src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/about-kirii-01.jpg-xiKJjANxvt5rzvEWA4bxRJmmTE28jE.jpeg"
            alt="Kirii Construction Materials Building"
            fill
            className="object-cover"
            priority
          />
        </div>

        <div className="container mx-auto relative z-20 text-center text-white">
          <Badge
            className="mb-6 bg-orange-500 text-white border-orange-500"
            style={{ fontFamily: "Arial, sans-serif" }}
          >
            {t.heroSubtitle}
          </Badge>

          <h1
            className="text-4xl md:text-6xl font-bold mb-6 leading-tight whitespace-pre-line"
            style={{ fontFamily: "Arial, sans-serif" }}
          >
            {t.heroTitle}
          </h1>

          <p
            className="text-xl md:text-2xl mb-8 text-blue-100 max-w-3xl mx-auto"
            style={{ fontFamily: "Arial, sans-serif" }}
          >
            {t.heroDescription}
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button
              asChild
              size="lg"
              className="bg-orange-500 hover:bg-orange-600 text-white"
              style={{ fontFamily: "Arial, sans-serif" }}
            >
              <Link href="/contact">{t.getQuote}</Link>
            </Button>
            <Button
              asChild
              variant="outline"
              size="lg"
              className="border-white text-white hover:bg-white hover:text-blue-900 bg-transparent"
              style={{ fontFamily: "Arial, sans-serif" }}
            >
              <Link href="/projects">{t.viewProjects}</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4 md:px-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            <div>
              <div
                className="text-3xl md:text-4xl font-bold text-blue-900 mb-2"
                style={{ fontFamily: "Arial, sans-serif" }}
              >
                500+
              </div>
              <div className="text-gray-600" style={{ fontFamily: "Arial, sans-serif" }}>
                {t.projectsCompleted}
              </div>
            </div>
            <div>
              <div
                className="text-3xl md:text-4xl font-bold text-blue-900 mb-2"
                style={{ fontFamily: "Arial, sans-serif" }}
              >
                15+
              </div>
              <div className="text-gray-600" style={{ fontFamily: "Arial, sans-serif" }}>
                {t.yearsExperience}
              </div>
            </div>
            <div>
              <div
                className="text-3xl md:text-4xl font-bold text-blue-900 mb-2"
                style={{ fontFamily: "Arial, sans-serif" }}
              >
                100%
              </div>
              <div className="text-gray-600" style={{ fontFamily: "Arial, sans-serif" }}>
                {t.qualityGuarantee}
              </div>
            </div>
            <div>
              <div
                className="text-3xl md:text-4xl font-bold text-blue-900 mb-2"
                style={{ fontFamily: "Arial, sans-serif" }}
              >
                2
              </div>
              <div className="text-gray-600" style={{ fontFamily: "Arial, sans-serif" }}>
                {t.majorMarkets}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Company Overview */}
      <section className="py-20 bg-slate-50">
        <div className="container mx-auto px-4 md:px-6">
          <div className="text-center mb-16">
            <Badge className="mb-4 bg-blue-100 text-blue-900" style={{ fontFamily: "Arial, sans-serif" }}>
              {t.aboutKirii}
            </Badge>
            <h2
              className="text-3xl md:text-4xl font-bold text-gray-900 mb-4"
              style={{ fontFamily: "Arial, sans-serif" }}
            >
              {t.professionalSolutions}
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto" style={{ fontFamily: "Arial, sans-serif" }}>
              {t.aboutDescription}
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <Image
                src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/about-kirii-03.jpg-bqk0IglN5cCzEIkLBtpcQ4fXFaUB2Q.jpeg"
                alt="Kirii Reception Area"
                width={600}
                height={400}
                className="rounded-lg shadow-lg"
              />
            </div>
            <div>
              <h3 className="text-2xl font-bold text-gray-900 mb-4" style={{ fontFamily: "Arial, sans-serif" }}>
                {t.modernFacilities}
              </h3>
              <p className="text-gray-600 mb-6" style={{ fontFamily: "Arial, sans-serif" }}>
                {t.modernFacilitiesDesc}
              </p>
              <div className="space-y-3">
                <div className="flex items-center">
                  <CheckCircle className="w-5 h-5 text-green-500 mr-3" />
                  <span style={{ fontFamily: "Arial, sans-serif" }}>{t.professionalConsultation}</span>
                </div>
                <div className="flex items-center">
                  <CheckCircle className="w-5 h-5 text-green-500 mr-3" />
                  <span style={{ fontFamily: "Arial, sans-serif" }}>{t.qualityAssuranceGuarantee}</span>
                </div>
                <div className="flex items-center">
                  <CheckCircle className="w-5 h-5 text-green-500 mr-3" />
                  <span style={{ fontFamily: "Arial, sans-serif" }}>{t.technicalCompliance}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Products Section */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4 md:px-6">
          <div className="text-center mb-16">
            <Badge className="mb-4 bg-blue-100 text-blue-900" style={{ fontFamily: "Arial, sans-serif" }}>
              {t.ourProducts}
            </Badge>
            <h2
              className="text-3xl md:text-4xl font-bold text-gray-900 mb-4"
              style={{ fontFamily: "Arial, sans-serif" }}
            >
              {t.comprehensiveSolutions}
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto" style={{ fontFamily: "Arial, sans-serif" }}>
              {t.productsDescription}
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <Card className="group hover:shadow-xl transition-all duration-300 border-0 shadow-lg">
              <div className="relative h-64 overflow-hidden rounded-t-lg">
                <Image
                  src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/about-kirii-02.jpg-XCZvQJo1x0hPjG0vZ2WHz5NnUCtghm.jpeg"
                  alt="Modern Ceiling Systems"
                  fill
                  className="object-cover group-hover:scale-105 transition-transform duration-300"
                />
              </div>
              <CardContent className="p-8">
                <div className="w-16 h-16 bg-blue-100 rounded-lg flex items-center justify-center mb-6 group-hover:bg-blue-200 transition-colors">
                  <Building2 className="w-8 h-8 text-blue-600" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-4" style={{ fontFamily: "Arial, sans-serif" }}>
                  {t.ceilingSystems}
                </h3>
                <p className="text-gray-600 mb-6" style={{ fontFamily: "Arial, sans-serif" }}>
                  {t.ceilingSystemsDesc}
                </p>
                <ul className="space-y-2 mb-6">
                  <li className="flex items-center text-sm text-gray-600" style={{ fontFamily: "Arial, sans-serif" }}>
                    <CheckCircle className="w-4 h-4 text-green-500 mr-2" />
                    {t.chTypeLinearCeiling}
                  </li>
                  <li className="flex items-center text-sm text-gray-600" style={{ fontFamily: "Arial, sans-serif" }}>
                    <CheckCircle className="w-4 h-4 text-green-500 mr-2" />
                    {t.cp022ClipInSystems}
                  </li>
                  <li className="flex items-center text-sm text-gray-600" style={{ fontFamily: "Arial, sans-serif" }}>
                    <CheckCircle className="w-4 h-4 text-green-500 mr-2" />
                    {t.suspendedCeilingSolutions}
                  </li>
                </ul>
                <Button
                  asChild
                  variant="outline"
                  className="w-full group-hover:bg-blue-50 bg-transparent"
                  style={{ fontFamily: "Arial, sans-serif" }}
                >
                  <Link href="/products">
                    {t.learnMore} <ArrowRight className="w-4 h-4 ml-2" />
                  </Link>
                </Button>
              </CardContent>
            </Card>

            <Card className="group hover:shadow-xl transition-all duration-300 border-0 shadow-lg">
              <div className="relative h-64 overflow-hidden rounded-t-lg">
                <Image
                  src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/Access-hatch-01.jpg-5wN8pLbYBh5a9HKMFEvbRqwTGo4oR2.jpeg"
                  alt="Access Hatches and Building Accessories"
                  fill
                  className="object-cover group-hover:scale-105 transition-transform duration-300"
                />
              </div>
              <CardContent className="p-8">
                <div className="w-16 h-16 bg-orange-100 rounded-lg flex items-center justify-center mb-6 group-hover:bg-orange-200 transition-colors">
                  <Wrench className="w-8 h-8 text-orange-600" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-4" style={{ fontFamily: "Arial, sans-serif" }}>
                  {t.accessHatchesBuilding}
                </h3>
                <p className="text-gray-600 mb-6" style={{ fontFamily: "Arial, sans-serif" }}>
                  {t.buildingAccessoriesDesc}
                </p>
                <ul className="space-y-2 mb-6">
                  <li className="flex items-center text-sm text-gray-600" style={{ fontFamily: "Arial, sans-serif" }}>
                    <CheckCircle className="w-4 h-4 text-green-500 mr-2" />
                    {t.highQualityAccessHatches}
                  </li>
                  <li className="flex items-center text-sm text-gray-600" style={{ fontFamily: "Arial, sans-serif" }}>
                    <CheckCircle className="w-4 h-4 text-green-500 mr-2" />
                    {t.professionalMountingBrackets}
                  </li>
                  <li className="flex items-center text-sm text-gray-600" style={{ fontFamily: "Arial, sans-serif" }}>
                    <CheckCircle className="w-4 h-4 text-green-500 mr-2" />
                    {t.specializedFasteningSystems}
                  </li>
                </ul>
                <Button
                  asChild
                  variant="outline"
                  className="w-full group-hover:bg-orange-50 bg-transparent"
                  style={{ fontFamily: "Arial, sans-serif" }}
                >
                  <Link href="/products">
                    {t.learnMore} <ArrowRight className="w-4 h-4 ml-2" />
                  </Link>
                </Button>
              </CardContent>
            </Card>

            <Card className="group hover:shadow-xl transition-all duration-300 border-0 shadow-lg">
              <div className="relative h-64 overflow-hidden rounded-t-lg">
                <Image
                  src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/Accessories_001.jpg-LHv640e1ZzSCYsYx5rnUlYWaPONvNr.jpeg"
                  alt="Custom Building Solutions"
                  fill
                  className="object-cover group-hover:scale-105 transition-transform duration-300"
                />
              </div>
              <CardContent className="p-8">
                <div className="w-16 h-16 bg-green-100 rounded-lg flex items-center justify-center mb-6 group-hover:bg-green-200 transition-colors">
                  <Settings className="w-8 h-8 text-green-600" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-4" style={{ fontFamily: "Arial, sans-serif" }}>
                  {t.customBuildingSolutions}
                </h3>
                <p className="text-gray-600 mb-6" style={{ fontFamily: "Arial, sans-serif" }}>
                  {t.customSolutionsDesc}
                </p>
                <ul className="space-y-2 mb-6">
                  <li className="flex items-center text-sm text-gray-600" style={{ fontFamily: "Arial, sans-serif" }}>
                    <CheckCircle className="w-4 h-4 text-green-500 mr-2" />
                    {t.bespokeMaterialSolutions}
                  </li>
                  <li className="flex items-center text-sm text-gray-600" style={{ fontFamily: "Arial, sans-serif" }}>
                    <CheckCircle className="w-4 h-4 text-green-500 mr-2" />
                    {t.projectSpecificCustomization}
                  </li>
                  <li className="flex items-center text-sm text-gray-600" style={{ fontFamily: "Arial, sans-serif" }}>
                    <CheckCircle className="w-4 h-4 text-green-500 mr-2" />
                    {t.technicalSpecificationCompliance}
                  </li>
                </ul>
                <Button
                  asChild
                  variant="outline"
                  className="w-full group-hover:bg-green-50 bg-transparent"
                  style={{ fontFamily: "Arial, sans-serif" }}
                >
                  <Link href="/contact">
                    {t.getCustomQuote} <ArrowRight className="w-4 h-4 ml-2" />
                  </Link>
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Product Specifications */}
      <section className="py-20 bg-slate-50">
        <div className="container mx-auto px-4 md:px-6">
          <div className="text-center mb-16">
            <Badge className="mb-4 bg-orange-100 text-orange-900" style={{ fontFamily: "Arial, sans-serif" }}>
              {t.productSpecifications}
            </Badge>
            <h2
              className="text-3xl md:text-4xl font-bold text-gray-900 mb-4"
              style={{ fontFamily: "Arial, sans-serif" }}
            >
              {t.technicalDocumentation}
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto" style={{ fontFamily: "Arial, sans-serif" }}>
              {t.technicalDocumentationDesc}
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card className="group hover:shadow-xl transition-all duration-300">
              <div className="relative h-48 overflow-hidden rounded-t-lg">
                <Image
                  src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/Accessories_001.jpg-LHv640e1ZzSCYsYx5rnUlYWaPONvNr.jpeg"
                  alt="CP022 Clip-in Ceiling Accessories"
                  fill
                  className="object-cover group-hover:scale-105 transition-transform duration-300"
                />
              </div>
              <CardContent className="p-4">
                <h4 className="font-bold text-gray-900 mb-2" style={{ fontFamily: "Arial, sans-serif" }}>
                  {t.cp022ClipInSeries}
                </h4>
                <p className="text-sm text-gray-600" style={{ fontFamily: "Arial, sans-serif" }}>
                  {t.completeAccessoriesClipIn}
                </p>
              </CardContent>
            </Card>

            <Card className="group hover:shadow-xl transition-all duration-300">
              <div className="relative h-48 overflow-hidden rounded-t-lg">
                <Image
                  src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/Accessories_002.jpg-nSAhDnaBEm8TG2OxrdW5RdbU0euol8.jpeg"
                  alt="Wide Linear Ceiling Accessories"
                  fill
                  className="object-cover group-hover:scale-105 transition-transform duration-300"
                />
              </div>
              <CardContent className="p-4">
                <h4 className="font-bold text-gray-900 mb-2" style={{ fontFamily: "Arial, sans-serif" }}>
                  {t.linearCeilingSystems}
                </h4>
                <p className="text-sm text-gray-600" style={{ fontFamily: "Arial, sans-serif" }}>
                  {t.hpChCpKtAccessories}
                </p>
              </CardContent>
            </Card>

            <Card className="group hover:shadow-xl transition-all duration-300">
              <div className="relative h-48 overflow-hidden rounded-t-lg">
                <Image
                  src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/Accessories_003.jpg-83QBcj7cBf2PEWSfjaKYFi9UrHG8RZ.jpeg"
                  alt="UQ-type Baffle Ceiling Accessories"
                  fill
                  className="object-cover group-hover:scale-105 transition-transform duration-300"
                />
              </div>
              <CardContent className="p-4">
                <h4 className="font-bold text-gray-900 mb-2" style={{ fontFamily: "Arial, sans-serif" }}>
                  {t.baffleCeilingSystems}
                </h4>
                <p className="text-sm text-gray-600" style={{ fontFamily: "Arial, sans-serif" }}>
                  {t.uqTypeBaffleAngleTrimming}
                </p>
              </CardContent>
            </Card>

            <Card className="group hover:shadow-xl transition-all duration-300">
              <div className="relative h-48 overflow-hidden rounded-t-lg">
                <Image
                  src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/Accessories_004.jpg-ejpOuXwSbkLOmjJLW22GlWTxY6XPSa.jpeg"
                  alt="Building Accessories and Trimming"
                  fill
                  className="object-cover group-hover:scale-105 transition-transform duration-300"
                />
              </div>
              <CardContent className="p-4">
                <h4 className="font-bold text-gray-900 mb-2" style={{ fontFamily: "Arial, sans-serif" }}>
                  {t.accessoriesTrimming}
                </h4>
                <p className="text-sm text-gray-600" style={{ fontFamily: "Arial, sans-serif" }}>
                  {t.completeRangeBuildingAccessories}
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Services Section */}
      <section className="py-20 bg-blue-900 text-white">
        <div className="container mx-auto px-4 md:px-6">
          <div className="text-center mb-16">
            <Badge className="mb-4 bg-orange-500 text-white" style={{ fontFamily: "Arial, sans-serif" }}>
              {t.ourServices}
            </Badge>
            <h2 className="text-3xl md:text-4xl font-bold mb-4" style={{ fontFamily: "Arial, sans-serif" }}>
              {t.comprehensiveSupport}
            </h2>
            <p className="text-xl text-blue-100 max-w-2xl mx-auto" style={{ fontFamily: "Arial, sans-serif" }}>
              {t.servicesDescription}
            </p>
          </div>

          <div className="grid md:grid-cols-4 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-blue-800 rounded-lg flex items-center justify-center mx-auto mb-4">
                <Building2 className="w-8 h-8 text-orange-400" />
              </div>
              <h3 className="text-xl font-bold mb-2" style={{ fontFamily: "Arial, sans-serif" }}>
                {t.materialSupply}
              </h3>
              <p className="text-blue-100" style={{ fontFamily: "Arial, sans-serif" }}>
                {t.materialSupplyDesc}
              </p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-blue-800 rounded-lg flex items-center justify-center mx-auto mb-4">
                <Users className="w-8 h-8 text-orange-400" />
              </div>
              <h3 className="text-xl font-bold mb-2" style={{ fontFamily: "Arial, sans-serif" }}>
                {t.technicalConsultation}
              </h3>
              <p className="text-blue-100" style={{ fontFamily: "Arial, sans-serif" }}>
                {t.technicalConsultationDesc}
              </p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-blue-800 rounded-lg flex items-center justify-center mx-auto mb-4">
                <Settings className="w-8 h-8 text-orange-400" />
              </div>
              <h3 className="text-xl font-bold mb-2" style={{ fontFamily: "Arial, sans-serif" }}>
                {t.projectSupport}
              </h3>
              <p className="text-blue-100" style={{ fontFamily: "Arial, sans-serif" }}>
                {t.projectSupportDesc}
              </p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-blue-800 rounded-lg flex items-center justify-center mx-auto mb-4">
                <Award className="w-8 h-8 text-orange-400" />
              </div>
              <h3 className="text-xl font-bold mb-2" style={{ fontFamily: "Arial, sans-serif" }}>
                {t.qualityAssurance}
              </h3>
              <p className="text-blue-100" style={{ fontFamily: "Arial, sans-serif" }}>
                {t.qualityAssuranceDesc}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4 md:px-6">
          <div className="text-center mb-16">
            <Badge className="mb-4 bg-blue-100 text-blue-900" style={{ fontFamily: "Arial, sans-serif" }}>
              {t.clientTestimonials}
            </Badge>
            <h2
              className="text-3xl md:text-4xl font-bold text-gray-900 mb-4"
              style={{ fontFamily: "Arial, sans-serif" }}
            >
              {t.trustedByLeaders}
            </h2>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <Card className="border-0 shadow-lg">
              <CardContent className="p-6">
                <div className="flex items-center mb-4">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-5 h-5 text-yellow-400 fill-current" />
                  ))}
                </div>
                <p className="text-gray-600 mb-4" style={{ fontFamily: "Arial, sans-serif" }}>
                  "Kirii Construction Materials consistently delivers high-quality ceiling systems for our MTR projects.
                  Their technical expertise and reliability make them our preferred supplier."
                </p>
                <div className="flex items-center">
                  <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mr-4">
                    <Building2 className="w-6 h-6 text-blue-600" />
                  </div>
                  <div>
                    <div className="font-semibold text-gray-900" style={{ fontFamily: "Arial, sans-serif" }}>
                      MTR Corporation
                    </div>
                    <div className="text-sm text-gray-500" style={{ fontFamily: "Arial, sans-serif" }}>
                      Infrastructure Development
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-lg">
              <CardContent className="p-6">
                <div className="flex items-center mb-4">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-5 h-5 text-yellow-400 fill-current" />
                  ))}
                </div>
                <p className="text-gray-600 mb-4" style={{ fontFamily: "Arial, sans-serif" }}>
                  "Outstanding building materials and professional service. Kirii's custom solutions perfectly matched
                  our commercial project requirements with excellent quality assurance."
                </p>
                <div className="flex items-center">
                  <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center mr-4">
                    <Users className="w-6 h-6 text-orange-600" />
                  </div>
                  <div>
                    <div className="font-semibold text-gray-900" style={{ fontFamily: "Arial, sans-serif" }}>
                      Henderson Land Development
                    </div>
                    <div className="text-sm text-gray-500" style={{ fontFamily: "Arial, sans-serif" }}>
                      Commercial Development
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-lg">
              <CardContent className="p-6">
                <div className="flex items-center mb-4">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-5 h-5 text-yellow-400 fill-current" />
                  ))}
                </div>
                <p className="text-gray-600 mb-4" style={{ fontFamily: "Arial, sans-serif" }}>
                  "Reliable partner for large-scale construction projects. Their comprehensive material supply and
                  technical consultation services have been invaluable to our success."
                </p>
                <div className="flex items-center">
                  <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mr-4">
                    <Award className="w-6 h-6 text-green-600" />
                  </div>
                  <div>
                    <div className="font-semibold text-gray-900" style={{ fontFamily: "Arial, sans-serif" }}>
                      China State Construction
                    </div>
                    <div className="text-sm text-gray-500" style={{ fontFamily: "Arial, sans-serif" }}>
                      General Contractor
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-blue-900 to-blue-800 text-white">
        <div className="container mx-auto px-4 md:px-6 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-4" style={{ fontFamily: "Arial, sans-serif" }}>
            {t.readyToStart}
          </h2>
          <p className="text-xl text-blue-100 mb-8 max-w-2xl mx-auto" style={{ fontFamily: "Arial, sans-serif" }}>
            {t.ctaDescription}
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button
              asChild
              size="lg"
              className="bg-orange-500 hover:bg-orange-600 text-white"
              style={{ fontFamily: "Arial, sans-serif" }}
            >
              <Link href="/contact">{t.getFreeConsultation}</Link>
            </Button>
            <Button
              asChild
              variant="outline"
              size="lg"
              className="border-white text-white hover:bg-white hover:text-blue-900 bg-transparent"
              style={{ fontFamily: "Arial, sans-serif" }}
            >
              <Link href="/products">{t.browseProducts}</Link>
            </Button>
          </div>
        </div>
      </section>

      <SiteFooter />
    </div>
  )
}
