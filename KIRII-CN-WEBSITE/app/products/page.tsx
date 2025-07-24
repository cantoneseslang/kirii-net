"use client"

import { useState } from "react"
import Image from "next/image"
import Link from "next/link"
import {
  ArrowRight,
  CheckCircle,
  Star,
  Award,
  Phone,
  Calculator,
  Building,
  Wrench,
  FileText,
  Target,
  Download,
  Mail,
} from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { SiteHeader } from "@/components/site-header"
import { SiteFooter } from "@/components/site-footer"
import { type Language, getTranslation, loadLanguage } from "@/lib/i18n"
import { useEffect } from "react"

export default function ProductsPage() {
  const [selectedCategory, setSelectedCategory] = useState("All")
  const [language, setLanguage] = useState<Language>("en")

  useEffect(() => {
    const savedLanguage = loadLanguage()
    setLanguage(savedLanguage)
  }, [])

  const t = getTranslation(language)

  const categories = [
    t.all,
    t.linearSystems,
    t.clipinSystems,
    t.wideLinearSystems,
    t.hookonSystems,
    t.layinSystems,
    t.specialized,
  ]

  const ceilingSystemsData = [
    {
      id: "ch-type-linear",
      title: t.chTypeLinearCeiling,
      subtitle: t.modernLinearDesign,
      description: t.modernLinearDesignDesc,
      image: "/images/CH-type_Linear_Ceiling_Series_RGB_10.jpg",
      features: [
        t.sleekLinearDesign,
        t.easyInstallation,
        t.versatileApplications,
        t.customizableLengths,
        t.highQualityMaterials,
      ],
      applications: [t.officeBuildings, t.retailSpaces, t.publicAreas, t.commercialCenters],
      category: t.linearSystems,
    },
    {
      id: "cp022-cp030-clip-in",
      title: t.cp022ClipinCeilingTitle,
      subtitle: t.easyInstallClipinSolutions,
      description: t.efficientClipinDesc,
      image: "/images/CP022_Clip-in_Ceiling_RGB_07.jpg",
      features: [
        t.quickInstallation,
        t.maintenanceAccess,
        t.professionalFinish,
        t.fireRatedOptions,
        t.costEffective,
      ],
      applications: [
        t.commercialBuildings,
        t.healthcareFacilitiesApp,
        t.educationalInstitutionsApp,
        t.retailEnvironments,
      ],
      category: t.clipinSystems,
    },
    {
      id: "cr-type-wide-linear",
      title: t.crTypeWideCeiling,
      subtitle: t.wideLinearDesignLargeSpaces,
      description: t.wideLinearDesignDesc,
      image: "/images/CR-type_Wide_Linear_Ceiling_Series_RGB_06.jpg",
      features: [
        t.wideLinearPanels,
        t.architecturalAppeal,
        t.structuralIntegrity,
        "Acoustic Options: Sound absorption capabilities available",
      ],
      applications: [t.largeCommercialSpaces, t.conventionCenters, t.airportTerminals, t.shoppingMalls],
      category: t.wideLinearSystems,
    },
    {
      id: "hp-type-hook-on",
      title: t.hpTypeHookOnCeiling,
      subtitle: t.flexibleHookonInstallation,
      description: t.flexibleHookonDesc,
      image: "/images/HP-type_Hook-on_Ceiling_Series_RGB_02.jpg",
      features: [
        t.hookonSystem,
        t.maintenanceAccess,
        t.designFlexibility + ": Various panel configurations",
        "Professional Grade: Commercial and industrial applications",
      ],
      applications: [t.industrialFacilities, t.warehouses, t.manufacturingPlants, t.serviceCenters],
      category: t.hookonSystems,
    },
    {
      id: "kt-type-lay-in",
      title: t.ktTypeLayinCeiling,
      subtitle: t.traditionalLayinGrid,
      description: t.traditionalLayinDesc,
      image: "/images/KT-type_Lay-in_Ceiling_Series_RGB_03.jpg",
      features: [
        t.standardGridSystem,
        t.easyAccess,
        t.versatileIntegration,
        t.costEffective,
      ],
      applications: [t.officeBuildings, t.schools, t.hospitals, t.governmentBuildings],
      category: t.layinSystems,
    },
  ]

  const specializedSystemsData = [
    {
      id: "tg-type-tartan",
      title: t.tgTypeTartanGrid,
      subtitle: t.decorativeGridPattern,
      description: t.uniqueTartanGrid,
      image: "/images/TG-type_Tartan_Grid_Ceiling_Series_RGB_01.jpg",
      category: t.specialized,
    },
    {
      id: "uo-type-baffle",
      title: t.uoBaffleCeiling,
      subtitle: t.linearBaffleDesign,
      description: t.linearBaffleDesc,
      image: "/images/UO-type_Baffle_Ceiling_Series_RGB_03.jpg",
      category: t.specialized,
    },
    {
      id: "wg-type-wide-grid",
      title: t.wgWideGridCeiling,
      subtitle: t.wideGridConfiguration,
      description: t.wideGridDesc,
      image: "/images/WG-type_Wide_Grid_Ceiling_Series_RGB_09.jpg",
      category: t.specialized,
    },
  ]

  const buildingAccessoriesData = [
    {
      id: "access-hatches",
      title: t.accessHatches,
      subtitle: t.secureAccessSolutions,
      description: t.accessHatchesDesc,
      image:
        "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/Access-hatch-01.jpg-5wN8pLbYBh5a9HKMFEvbRqwTGo4oR2.jpeg",
      features: [
        t.highQualityAccess,
        t.fireRatedOptionsFeature,
        t.customSizes,
      ],
    },
    {
      id: "mounting-systems",
      title: t.mountingFasteningSystems,
      subtitle: t.professionalHardwareSolutions,
      description: t.mountingSystemsDesc,
      image:
        "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/Accessories_001.jpg-LHv640e1ZzSCYsYx5rnUlYWaPONvNr.jpeg",
      features: [
        t.professionalHardware,
        t.specializedComponents,
        t.qualityMaterials,
      ],
    },
  ]

  const filteredSystems =
    selectedCategory === "All"
      ? ceilingSystemsData
      : ceilingSystemsData.filter((system) => system.category === selectedCategory)

  return (
    <div className="min-h-screen bg-white" style={{ fontFamily: "Arial, sans-serif" }}>
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
            {t.comprehensiveBuildingSolutions}
          </Badge>

          <h1 className="text-4xl md:text-6xl font-bold mb-6 leading-tight" style={{ fontFamily: "Arial, sans-serif" }}>
            {t.kiriiProducts}
          </h1>

          <p
            className="text-xl md:text-2xl mb-8 text-blue-100 max-w-3xl mx-auto"
            style={{ fontFamily: "Arial, sans-serif" }}
          >
            {t.productsPageDesc}
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button
              asChild
              size="lg"
              className="bg-orange-500 hover:bg-orange-600 text-white"
              style={{ fontFamily: "Arial, sans-serif" }}
            >
              <Link href="#ceiling-systems">{t.viewProducts}</Link>
            </Button>
            <Button
              asChild
              variant="outline"
              size="lg"
              className="border-white text-white hover:bg-white hover:text-blue-900 bg-transparent"
              style={{ fontFamily: "Arial, sans-serif" }}
            >
              <Link href="#contact">{t.getQuote}</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Product Categories Overview */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4 md:px-6">
          <div className="text-center mb-16">
            <h2
              className="text-3xl md:text-4xl font-bold text-gray-900 mb-4"
              style={{ fontFamily: "Arial, sans-serif" }}
            >
              {t.productCategoriesOverview}
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto" style={{ fontFamily: "Arial, sans-serif" }}>
              {t.kiriiSpecializesDesc}
            </p>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-16">
            <div className="text-center">
              <div className="w-16 h-16 mx-auto mb-4 bg-blue-50 rounded-full flex items-center justify-center">
                <Award className="w-8 h-8 text-blue-600" />
              </div>
              <div
                className="text-3xl md:text-4xl font-bold text-gray-900 mb-2"
                style={{ fontFamily: "Arial, sans-serif" }}
              >
                15+
              </div>
              <div className="text-gray-600" style={{ fontFamily: "Arial, sans-serif" }}>
                {t.yearsExperience}
              </div>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 mx-auto mb-4 bg-orange-50 rounded-full flex items-center justify-center">
                <CheckCircle className="w-8 h-8 text-orange-600" />
              </div>
              <div
                className="text-3xl md:text-4xl font-bold text-gray-900 mb-2"
                style={{ fontFamily: "Arial, sans-serif" }}
              >
                500+
              </div>
              <div className="text-gray-600" style={{ fontFamily: "Arial, sans-serif" }}>
                {t.projectsCompleted}
              </div>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 mx-auto mb-4 bg-green-50 rounded-full flex items-center justify-center">
                <Star className="w-8 h-8 text-green-600" />
              </div>
              <div
                className="text-3xl md:text-4xl font-bold text-gray-900 mb-2"
                style={{ fontFamily: "Arial, sans-serif" }}
              >
                100%
              </div>
              <div className="text-gray-600" style={{ fontFamily: "Arial, sans-serif" }}>
                {t.qualityGuarantee}
              </div>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 mx-auto mb-4 bg-purple-50 rounded-full flex items-center justify-center">
                <Building className="w-8 h-8 text-purple-600" />
              </div>
              <div
                className="text-3xl md:text-4xl font-bold text-gray-900 mb-2"
                style={{ fontFamily: "Arial, sans-serif" }}
              >
                50+
              </div>
              <div className="text-gray-600" style={{ fontFamily: "Arial, sans-serif" }}>
                {t.productLines}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Main Product Sections */}
      <section id="ceiling-systems" className="py-20 bg-gray-50">
        <div className="container mx-auto px-4 md:px-6">
          <Tabs defaultValue="ceiling-systems" className="w-full">
            <TabsList className="grid w-full grid-cols-3 mb-12">
              <TabsTrigger
                value="ceiling-systems"
                className="flex items-center gap-2"
                style={{ fontFamily: "Arial, sans-serif" }}
              >
                <Building className="w-5 h-5" />
                {t.ceilingSystems}
              </TabsTrigger>
              <TabsTrigger
                value="building-accessories"
                className="flex items-center gap-2"
                style={{ fontFamily: "Arial, sans-serif" }}
              >
                <Wrench className="w-5 h-5" />
                {t.buildingAccessories}
              </TabsTrigger>
              <TabsTrigger
                value="technical-specs"
                className="flex items-center gap-2"
                style={{ fontFamily: "Arial, sans-serif" }}
              >
                <FileText className="w-5 h-5" />
                {t.technicalSpecifications}
              </TabsTrigger>
            </TabsList>

            {/* Ceiling Systems Tab */}
            <TabsContent value="ceiling-systems" className="space-y-12">
              <div className="text-center mb-12">
                <h3 className="text-3xl font-bold text-gray-900 mb-4" style={{ fontFamily: "Arial, sans-serif" }}>
                  🏗️ {t.ceilingSystems}
                </h3>
                <p className="text-lg text-gray-600 max-w-2xl mx-auto" style={{ fontFamily: "Arial, sans-serif" }}>
                  {t.comprehensiveCeilingSystemsDesc}
                </p>
              </div>

              {/* Category Filter */}
              <div className="flex flex-wrap justify-center gap-4 mb-12">
                {categories.map((category) => (
                  <Button
                    key={category}
                    variant={selectedCategory === category ? "default" : "outline"}
                    onClick={() => setSelectedCategory(category)}
                    className={`px-6 py-2 rounded-full transition-all duration-300 ${
                      selectedCategory === category
                        ? "bg-blue-600 text-white hover:bg-blue-700"
                        : "bg-white text-gray-600 hover:bg-gray-100 border-gray-300"
                    }`}
                    style={{ fontFamily: "Arial, sans-serif" }}
                  >
                    {category}
                  </Button>
                ))}
              </div>

              {/* Main Ceiling Systems Grid */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-16">
                {filteredSystems.map((system, index) => (
                  <Card
                    key={system.id}
                    className="overflow-hidden shadow-lg hover:shadow-xl transition-shadow duration-300 h-full"
                  >
                    <div className="relative h-64">
                      <Image
                        src={system.image || "/placeholder.svg"}
                        alt={system.title}
                        fill
                        className="object-cover"
                      />
                      <div className="absolute top-4 left-4">
                        <Badge className="bg-blue-600 text-white" style={{ fontFamily: "Arial, sans-serif" }}>
                          {system.category}
                        </Badge>
                      </div>
                    </div>

                    <CardHeader>
                      <CardTitle className="text-2xl font-bold" style={{ fontFamily: "Arial, sans-serif" }}>
                        {system.title}
                      </CardTitle>
                      <CardDescription
                        className="text-blue-600 font-medium"
                        style={{ fontFamily: "Arial, sans-serif" }}
                      >
                        {system.subtitle}
                      </CardDescription>
                    </CardHeader>

                    <CardContent className="space-y-6">
                      <p className="text-gray-600 leading-relaxed" style={{ fontFamily: "Arial, sans-serif" }}>
                        {system.description}
                      </p>

                      <div>
                        <h4 className="font-semibold text-gray-900 mb-3" style={{ fontFamily: "Arial, sans-serif" }}>
                          {t.keyFeatures}
                        </h4>
                        <div className="space-y-2">
                          {system.features.slice(0, 3).map((feature, idx) => (
                            <div key={idx} className="flex items-start gap-2">
                              <CheckCircle className="w-4 h-4 text-green-600 flex-shrink-0 mt-0.5" />
                              <span className="text-sm text-gray-700" style={{ fontFamily: "Arial, sans-serif" }}>
                                {feature}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>

                      <div>
                        <h4 className="font-semibold text-gray-900 mb-3" style={{ fontFamily: "Arial, sans-serif" }}>
                          {t.applications}
                        </h4>
                        <div className="flex flex-wrap gap-2">
                          {system.applications.map((app, idx) => (
                            <Badge key={idx} variant="secondary" style={{ fontFamily: "Arial, sans-serif" }}>
                              {app}
                            </Badge>
                          ))}
                        </div>
                      </div>

                      <div className="pt-4 border-t border-gray-100">
                        <Button
                          className="w-full bg-blue-600 hover:bg-blue-700 text-white"
                          style={{ fontFamily: "Arial, sans-serif" }}
                        >
                          {t.viewDetails}
                          <ArrowRight className="ml-2 h-4 w-4" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>

              {/* Specialized Systems */}
              <div className="mt-16">
                <h3
                  className="text-2xl font-bold text-gray-900 mb-8 text-center"
                  style={{ fontFamily: "Arial, sans-serif" }}
                >
                  {t.specializedCeilingSystems}
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {specializedSystemsData.map((system, index) => (
                    <Card
                      key={system.id}
                      className="overflow-hidden shadow-md hover:shadow-lg transition-shadow duration-300"
                    >
                      <div className="relative h-48">
                        <Image
                          src={system.image || "/placeholder.svg"}
                          alt={system.title}
                          fill
                          className="object-cover"
                        />
                      </div>
                      <CardHeader>
                        <CardTitle className="text-lg font-bold" style={{ fontFamily: "Arial, sans-serif" }}>
                          {system.title}
                        </CardTitle>
                        <CardDescription style={{ fontFamily: "Arial, sans-serif" }}>{system.subtitle}</CardDescription>
                      </CardHeader>
                      <CardContent>
                        <p className="text-sm text-gray-600 mb-4" style={{ fontFamily: "Arial, sans-serif" }}>
                          {system.description}
                        </p>
                        <Button
                          variant="outline"
                          className="w-full bg-transparent"
                          style={{ fontFamily: "Arial, sans-serif" }}
                        >
                          {t.learnMore}
                        </Button>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>

              {/* Specialized Applications */}
              <div className="mt-16">
                <h3
                  className="text-2xl font-bold text-gray-900 mb-8 text-center"
                  style={{ fontFamily: "Arial, sans-serif" }}
                >
                  {t.specializedApplications}
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <Card className="overflow-hidden shadow-md hover:shadow-lg transition-shadow duration-300">
                    <div className="relative h-48">
                      <Image
                        src="/placeholder.svg?height=300&width=500&text=Corridor+Ceiling+Series"
                        alt="Corridor Ceiling Series"
                        fill
                        className="object-cover"
                      />
                    </div>
                    <CardHeader>
                      <CardTitle className="text-xl font-bold" style={{ fontFamily: "Arial, sans-serif" }}>
                        {t.corridorCeilingSeries}
                      </CardTitle>
                      <CardDescription style={{ fontFamily: "Arial, sans-serif" }}>
                        {t.corridorCeilingSpecialized}
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <p className="text-gray-600 mb-4" style={{ fontFamily: "Arial, sans-serif" }}>
                        {t.corridorCeilingDesc}
                      </p>
                      <Button
                        variant="outline"
                        className="w-full bg-transparent"
                        style={{ fontFamily: "Arial, sans-serif" }}
                      >
                        {t.viewSpecifications}
                      </Button>
                    </CardContent>
                  </Card>

                  <Card className="overflow-hidden shadow-md hover:shadow-lg transition-shadow duration-300">
                    <div className="relative h-48">
                      <Image
                        src="/placeholder.svg?height=300&width=500&text=Home+Ceiling+Series"
                        alt="Home Ceiling Series"
                        fill
                        className="object-cover"
                      />
                    </div>
                    <CardHeader>
                      <CardTitle className="text-xl font-bold" style={{ fontFamily: "Arial, sans-serif" }}>
                        {t.homeCeilingSeries}
                      </CardTitle>
                      <CardDescription style={{ fontFamily: "Arial, sans-serif" }}>
                        {t.homeCeilingResidential}
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <p className="text-gray-600 mb-4" style={{ fontFamily: "Arial, sans-serif" }}>
                        {t.homeCeilingDesc}
                      </p>
                      <Button
                        variant="outline"
                        className="w-full bg-transparent"
                        style={{ fontFamily: "Arial, sans-serif" }}
                      >
                        {t.viewSpecifications}
                      </Button>
                    </CardContent>
                  </Card>
                </div>
              </div>
            </TabsContent>

            {/* Building Accessories Tab */}
            <TabsContent value="building-accessories" className="space-y-12">
              <div className="text-center mb-12">
                <h3 className="text-3xl font-bold text-gray-900 mb-4" style={{ fontFamily: "Arial, sans-serif" }}>
                  🔧 {t.buildingAccessories}
                </h3>
                <p className="text-lg text-gray-600 max-w-2xl mx-auto" style={{ fontFamily: "Arial, sans-serif" }}>
                  {t.constructionAccessoriesDesc}
                </p>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-16">
                {buildingAccessoriesData.map((accessory, index) => (
                  <Card
                    key={accessory.id}
                    className="overflow-hidden shadow-lg hover:shadow-xl transition-shadow duration-300 h-full"
                  >
                    <div className="relative h-64">
                      <Image
                        src={accessory.image || "/placeholder.svg"}
                        alt={accessory.title}
                        fill
                        className="object-cover"
                      />
                    </div>
                    <CardHeader>
                      <CardTitle className="text-2xl font-bold" style={{ fontFamily: "Arial, sans-serif" }}>
                        {accessory.title}
                      </CardTitle>
                      <CardDescription
                        className="text-blue-600 font-medium"
                        style={{ fontFamily: "Arial, sans-serif" }}
                      >
                        {accessory.subtitle}
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                      <p className="text-gray-600 leading-relaxed" style={{ fontFamily: "Arial, sans-serif" }}>
                        {accessory.description}
                      </p>
                      <div>
                        <h4 className="font-semibold text-gray-900 mb-3" style={{ fontFamily: "Arial, sans-serif" }}>
                          Features:
                        </h4>
                        <div className="space-y-2">
                          {accessory.features.map((feature, idx) => (
                            <div key={idx} className="flex items-start gap-2">
                              <CheckCircle className="w-4 h-4 text-green-600 flex-shrink-0 mt-0.5" />
                              <span className="text-sm text-gray-700" style={{ fontFamily: "Arial, sans-serif" }}>
                                {feature}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                      <Button
                        className="w-full bg-blue-600 hover:bg-blue-700 text-white"
                        style={{ fontFamily: "Arial, sans-serif" }}
                      >
                        {t.requestQuote}
                        <ArrowRight className="ml-2 h-4 w-4" />
                      </Button>
                    </CardContent>
                  </Card>
                ))}
              </div>

              {/* Accessories Collection */}
              <div className="mt-16">
                <h3
                  className="text-2xl font-bold text-gray-900 mb-8 text-center"
                  style={{ fontFamily: "Arial, sans-serif" }}
                >
                  {t.accessoriesCollection}
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                  [
                    {
                      title: t.cp022ClipinAccessories,
                      image:
                        "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/Accessories_001.jpg-LHv640e1ZzSCYsYx5rnUlYWaPONvNr.jpeg",
                      description: t.cp022AccessoriesDesc,
                    },
                    {
                      title: t.linearCeilingAccessories,
                      image:
                        "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/Accessories_002.jpg-nSAhDnaBEm8TG2OxrdW5RdbU0euol8.jpeg",
                      description: t.linearAccessoriesDesc,
                    },
                    {
                      title: t.baffleCeilingAccessories,
                      image:
                        "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/Accessories_003.jpg-83QBcj7cBf2PEWSfjaKYFi9UrHG8RZ.jpeg",
                      description: t.baffleAccessoriesDesc,
                    },
                    {
                      title: t.generalAccessories,
                      image:
                        "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/Accessories_004.jpg-ejpOuXwSbkLOmjJLW22GlWTxY6XPSa.jpeg",
                      description: t.generalAccessoriesDesc,
                    },
                  ].map((item, index) => (
                    <Card
                      key={index}
                      className="overflow-hidden shadow-md hover:shadow-lg transition-shadow duration-300"
                    >
                      <div className="relative h-48">
                        <Image src={item.image || "/placeholder.svg"} alt={item.title} fill className="object-cover" />
                      </div>
                      <CardHeader>
                        <CardTitle className="text-lg font-bold" style={{ fontFamily: "Arial, sans-serif" }}>
                          {item.title}
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <p className="text-sm text-gray-600 mb-4" style={{ fontFamily: "Arial, sans-serif" }}>
                          {item.description}
                        </p>
                        <Button
                          variant="outline"
                          className="w-full bg-transparent"
                          style={{ fontFamily: "Arial, sans-serif" }}
                        >
                          {t.viewDetails}
                        </Button>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            </TabsContent>

            {/* Technical Specifications Tab */}
            <TabsContent value="technical-specs" className="space-y-12">
              <div className="text-center mb-12">
                <h3 className="text-3xl font-bold text-gray-900 mb-4" style={{ fontFamily: "Arial, sans-serif" }}>
                  📐 {t.technicalDocumentationTitle}
                </h3>
                <p className="text-lg text-gray-600 max-w-2xl mx-auto" style={{ fontFamily: "Arial, sans-serif" }}>
                  {t.technicalDocumentationFullDesc}
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-16">
                {[
                  {
                    title: "Acoustic Ceiling Specifications",
                    description: "Detailed acoustic performance data and installation specifications",
                    image: "/placeholder.svg?height=300&width=400&text=Acoustic+Drawings",
                  },
                  {
                    title: "Structural Load Calculations",
                    description: "Load-bearing capacity and structural integrity specifications",
                    image: "/placeholder.svg?height=300&width=400&text=Structural+Specs",
                  },
                  {
                    title: "Installation Guidelines",
                    description: "Step-by-step installation procedures and safety requirements",
                    image: "/placeholder.svg?height=300&width=400&text=Installation+Guide",
                  },
                  {
                    title: "Fire Safety Ratings",
                    description: "Fire resistance ratings and safety compliance documentation",
                    image: "/placeholder.svg?height=300&width=400&text=Fire+Safety",
                  },
                  {
                    title: "Material Specifications",
                    description: "Detailed material properties and quality standards",
                    image: "/placeholder.svg?height=300&width=400&text=Material+Specs",
                  },
                  {
                    title: "Maintenance Procedures",
                    description: "Long-term maintenance guidelines and service requirements",
                    image: "/placeholder.svg?height=300&width=400&text=Maintenance+Guide",
                  },
                ].map((spec, index) => (
                  <Card
                    key={index}
                    className="overflow-hidden shadow-md hover:shadow-lg transition-shadow duration-300"
                  >
                    <div className="relative h-48">
                      <Image src={spec.image || "/placeholder.svg"} alt={spec.title} fill className="object-cover" />
                    </div>
                    <CardHeader>
                      <CardTitle className="text-lg font-bold" style={{ fontFamily: "Arial, sans-serif" }}>
                        {spec.title}
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-gray-600 mb-4" style={{ fontFamily: "Arial, sans-serif" }}>
                        {spec.description}
                      </p>
                      <Button
                        variant="outline"
                        className="w-full bg-transparent"
                        style={{ fontFamily: "Arial, sans-serif" }}
                      >
                        <Download className="mr-2 h-4 w-4" />
                        Download PDF
                      </Button>
                    </CardContent>
                  </Card>
                ))}
              </div>

              {/* Technical Features */}
              <div className="bg-white p-8 rounded-lg shadow-lg">
                <h4 className="text-xl font-bold text-gray-900 mb-6" style={{ fontFamily: "Arial, sans-serif" }}>
                  Technical Features
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div>
                    <h5 className="font-semibold text-gray-900 mb-3" style={{ fontFamily: "Arial, sans-serif" }}>
                      Material Properties
                    </h5>
                    <ul className="space-y-2 text-sm text-gray-700" style={{ fontFamily: "Arial, sans-serif" }}>
                      <li>• Aluminum Alloys: Grade specifications and treatment processes</li>
                      <li>• Steel Components: Galvanization and coating standards</li>
                      <li>• Fire Resistance: Tested fire ratings and safety compliance</li>
                      <li>• Corrosion Resistance: Environmental durability testing</li>
                    </ul>
                  </div>
                  <div>
                    <h5 className="font-semibold text-gray-900 mb-3" style={{ fontFamily: "Arial, sans-serif" }}>
                      Performance Standards
                    </h5>
                    <ul className="space-y-2 text-sm text-gray-700" style={{ fontFamily: "Arial, sans-serif" }}>
                      <li>• Structural Integrity: Load-bearing capacity testing</li>
                      <li>• Weather Resistance: Environmental exposure testing</li>
                      <li>• Acoustic Performance: Sound transmission class ratings</li>
                      <li>• Thermal Properties: Insulation and expansion characteristics</li>
                    </ul>
                  </div>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </section>

      {/* Applications Section */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4 md:px-6">
          <div className="text-center mb-16">
            <h2
              className="text-3xl md:text-4xl font-bold text-gray-900 mb-4"
              style={{ fontFamily: "Arial, sans-serif" }}
            >
              🎯 {t.diverseApplications}
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto" style={{ fontFamily: "Arial, sans-serif" }}>
              {t.diverseApplicationsDesc}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
            <Card className="p-8 shadow-lg">
              <CardHeader>
                <CardTitle
                  className="text-2xl font-bold text-gray-900 mb-4"
                  style={{ fontFamily: "Arial, sans-serif" }}
                >
                  {t.commercialProjects}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {[
                  `${t.officeBuildings}：${t.officeBuildingsDesc}`,
                  `${t.retailSpaces}：${t.retailSpacesDesc}`,
                  `${t.healthcareFacilitiesApp}：${t.healthcareFacilitiesDesc}`,
                  `${t.educationalInstitutionsApp}：${t.educationalInstitutionsDesc}`,
                ].map((item, index) => (
                  <div key={index} className="flex items-start gap-3">
                    <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                    <span className="text-gray-700" style={{ fontFamily: "Arial, sans-serif" }}>
                      {item}
                    </span>
                  </div>
                ))}
              </CardContent>
            </Card>

            <Card className="p-8 shadow-lg">
              <CardHeader>
                <CardTitle
                  className="text-2xl font-bold text-gray-900 mb-4"
                  style={{ fontFamily: "Arial, sans-serif" }}
                >
                  {t.infrastructureProjects}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {[
                  `${t.transportationHubs}：${t.transportationHubsDesc}`,
                  `${t.publicBuildings}：${t.publicBuildingsDesc}`,
                  `${t.culturalCenters}：${t.culturalCentersDesc}`,
                  `${t.mixedUseDevelopments}：${t.mixedUseDevelopmentsDesc}`,
                ].map((item, index) => (
                  <div key={index} className="flex items-start gap-3">
                    <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                    <span className="text-gray-700" style={{ fontFamily: "Arial, sans-serif" }}>
                      {item}
                    </span>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Product Advantages */}
      <section className="py-20 bg-gray-50">
        <div className="container mx-auto px-4 md:px-6">
          <div className="text-center mb-16">
            <h2
              className="text-3xl md:text-4xl font-bold text-gray-900 mb-4"
              style={{ fontFamily: "Arial, sans-serif" }}
            >
              🏆 {t.productAdvantages}
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                title: t.qualityAssurance,
                icon: Award,
                items: [
                  t.premiumMaterials,
                  t.rigorousTesting,
                  t.internationalStandards,
                  t.professionalInstallation,
                ],
              },
              {
                title: t.designFlexibility,
                icon: Target,
                items: [
                  t.customizationOptions,
                  t.colorVariations,
                  t.sizeAdaptability,
                  t.integrationCapability,
                ],
              },
              {
                title: t.performanceBenefits,
                icon: CheckCircle,
                items: [
                  t.durability,
                  t.fireSafety,
                  t.acousticControl,
                  t.easyMaintenance,
                ],
              },
            ].map((advantage, index) => (
              <Card key={advantage.title} className="p-6 shadow-lg h-full">
                <CardHeader className="text-center">
                  <div className="w-16 h-16 mx-auto mb-4 bg-blue-50 rounded-full flex items-center justify-center">
                    <advantage.icon className="w-8 h-8 text-blue-600" />
                  </div>
                  <CardTitle className="text-xl font-bold" style={{ fontFamily: "Arial, sans-serif" }}>
                    {advantage.title}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {advantage.items.map((item, idx) => (
                    <div key={idx} className="flex items-start gap-2">
                      <CheckCircle className="w-4 h-4 text-green-600 flex-shrink-0 mt-0.5" />
                      <span className="text-sm text-gray-700" style={{ fontFamily: "Arial, sans-serif" }}>
                        {item}
                      </span>
                    </div>
                  ))}
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section id="contact" className="py-20 bg-blue-600">
        <div className="container mx-auto px-4 md:px-6">
          <div className="text-center text-white">
            <h2 className="text-3xl md:text-4xl font-bold mb-6" style={{ fontFamily: "Arial, sans-serif" }}>
              📞 {t.productInquiries}
            </h2>
            <p className="text-xl mb-8 max-w-2xl mx-auto" style={{ fontFamily: "Arial, sans-serif" }}>
              {t.productInquiriesDesc}
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-8">
              <Button
                className="bg-white text-blue-600 hover:bg-gray-100 px-8 py-3 text-lg"
                style={{ fontFamily: "Arial, sans-serif" }}
              >
                <Phone className="mr-2 h-5 w-5" />
                {t.contactProductDept}
              </Button>
              <Button
                className="bg-transparent border-2 border-white text-white hover:bg-white hover:text-blue-600 px-8 py-3 text-lg"
                style={{ fontFamily: "Arial, sans-serif" }}
              >
                <Calculator className="mr-2 h-5 w-5" />
                {t.requestTechnicalSpecs}
              </Button>
            </div>
            <div className="text-center">
              <div className="flex items-center justify-center gap-2 mb-2">
                <Mail className="h-5 w-5" />
                <span className="text-lg" style={{ fontFamily: "Arial, sans-serif" }}>
                  info@kirii.cn
                </span>
              </div>
              <p className="text-sm opacity-75" style={{ fontFamily: "Arial, sans-serif" }}>
                {t.technicalSpecsAvailable} | {t.customSolutions} | {t.professionalInstallationSupport}
              </p>
            </div>
          </div>
        </div>
      </section>

      <SiteFooter />
    </div>
  )
}
