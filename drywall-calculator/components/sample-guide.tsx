"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { InfoIcon, CheckCircle2, ArrowRight } from "lucide-react"
import Link from "next/link"
import LanguageSwitcher from "@/components/language-switcher"

// Import dictionaries directly to avoid dynamic imports
import enDict from "@/lib/dictionaries/en.json"
import zhHKDict from "@/lib/dictionaries/zh-HK.json"

export default function SampleGuide({ lang }: { lang: string }) {
  const [activeTab, setActiveTab] = useState("overview")

  // Use static dictionaries instead of dynamic loading
  const dictionaries = {
    en: enDict,
    "zh-HK": zhHKDict,
  }

  // Select the appropriate language content
  const t = lang === "zh-HK" ? dictionaries["zh-HK"].sampleGuide : dictionaries.en.sampleGuide

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">{t.title}</h1>
        <LanguageSwitcher currentLang={lang} />
      </div>

      <p className="text-lg mb-8">{t.description}</p>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid grid-cols-3 w-full max-w-2xl mx-auto mb-8">
          <TabsTrigger value="overview">{t.tabs.overview}</TabsTrigger>
          <TabsTrigger value="input-guide">{t.tabs.inputGuide}</TabsTrigger>
          <TabsTrigger value="results-comparison">{t.tabs.resultsComparison}</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <InfoIcon className="h-5 w-5" />
                {t.overview.title}
              </CardTitle>
              <CardDescription>{t.overview.subtitle}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="rounded-md border p-4">
                <h3 className="font-medium mb-2">{t.overview.calculationTarget}</h3>
                <p>{t.overview.targetDescription}</p>
                <p className="mt-2">{t.overview.studDimensions}</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="rounded-md border p-4">
                  <h3 className="font-medium mb-2">{t.overview.keyInputParameters}</h3>
                  <ul className="list-disc pl-6 space-y-1">
                    <li>{t.overview.studType}</li>
                    <li>{t.overview.span}</li>
                    <li>{t.overview.tributaryWidth}</li>
                    <li>{t.overview.designLoad}</li>
                    <li>{t.overview.loadHeight}</li>
                    <li>{t.overview.loadFactor}</li>
                  </ul>
                </div>

                <div className="rounded-md border p-4">
                  <h3 className="font-medium mb-2">{t.overview.keyResults}</h3>
                  <ul className="list-disc pl-6 space-y-1">
                    <li>{t.overview.bendingMoment}</li>
                    <li>{t.overview.bendingCapacity}</li>
                    <li>{t.overview.maxDeflection}</li>
                    <li>{t.overview.allowableDeflection}</li>
                    <li>{t.overview.overallResult}</li>
                  </ul>
                </div>
              </div>

              <Alert className="bg-blue-50 border-blue-200">
                <InfoIcon className="h-4 w-4 text-blue-600" />
                <AlertTitle>{t.overview.aboutSample}</AlertTitle>
                <AlertDescription>{t.overview.sampleDescription}</AlertDescription>
              </Alert>
            </CardContent>
            <CardFooter>
              <Button onClick={() => setActiveTab("input-guide")} className="w-full">
                {t.overview.viewInputGuide}
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>

        <TabsContent value="input-guide" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <InfoIcon className="h-5 w-5" />
                {t.inputGuide.title}
              </CardTitle>
              <CardDescription>{t.inputGuide.description}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <h3 className="text-lg font-medium">{t.inputGuide.step1Title}</h3>
                <div className="rounded-md border p-4 bg-gray-50">
                  <ul className="space-y-2">
                    <li className="flex items-start">
                      <CheckCircle2 className="h-5 w-5 mr-2 text-green-600 mt-0.5" />
                      <div>
                        <p className="text-sm text-gray-600">{t.inputGuide.projectName}</p>
                      </div>
                    </li>
                    <li className="flex items-start">
                      <CheckCircle2 className="h-5 w-5 mr-2 text-green-600 mt-0.5" />
                      <div>
                        <p className="text-sm text-gray-600">{t.inputGuide.projectDetail}</p>
                      </div>
                    </li>
                    <li className="flex items-start">
                      <CheckCircle2 className="h-5 w-5 mr-2 text-green-600 mt-0.5" />
                      <div>
                        <p className="text-sm text-gray-600">{t.inputGuide.calculationDate}</p>
                      </div>
                    </li>
                    <li className="flex items-start">
                      <CheckCircle2 className="h-5 w-5 mr-2 text-green-600 mt-0.5" />
                      <div>
                        <p className="text-sm text-gray-600">{t.inputGuide.author}</p>
                      </div>
                    </li>
                  </ul>
                </div>
              </div>

              <div className="space-y-4">
                <h3 className="text-lg font-medium">{t.inputGuide.step2Title}</h3>
                <div className="rounded-md border p-4 bg-gray-50">
                  <ul className="space-y-2">
                    <li className="flex items-start">
                      <CheckCircle2 className="h-5 w-5 mr-2 text-green-600 mt-0.5" />
                      <div>
                        <p className="text-sm text-gray-600">{t.inputGuide.yieldStrength}</p>
                      </div>
                    </li>
                    <li className="flex items-start">
                      <CheckCircle2 className="h-5 w-5 mr-2 text-green-600 mt-0.5" />
                      <div>
                        <p className="text-sm text-gray-600">{t.inputGuide.elasticModulus}</p>
                      </div>
                    </li>
                    <li className="flex items-start">
                      <CheckCircle2 className="h-5 w-5 mr-2 text-green-600 mt-0.5" />
                      <div>
                        <p className="text-sm text-gray-600">{t.inputGuide.materialFactor}</p>
                      </div>
                    </li>
                    <li className="flex items-start">
                      <CheckCircle2 className="h-5 w-5 mr-2 text-green-600 mt-0.5" />
                      <div>
                        <p className="text-sm text-gray-600">{t.inputGuide.studType}</p>
                      </div>
                    </li>
                    <li className="flex items-start">
                      <CheckCircle2 className="h-5 w-5 mr-2 text-green-600 mt-0.5" />
                      <div>
                        <p className="text-sm text-gray-600">{t.inputGuide.bearingLength}</p>
                      </div>
                    </li>
                  </ul>
                </div>
              </div>

              <div className="space-y-4">
                <h3 className="text-lg font-medium">{t.inputGuide.step3Title}</h3>
                <div className="rounded-md border p-4 bg-gray-50">
                  <ul className="space-y-2">
                    <li className="flex items-start">
                      <CheckCircle2 className="h-5 w-5 mr-2 text-green-600 mt-0.5" />
                      <div>
                        <p className="text-sm text-gray-600">{t.inputGuide.span}</p>
                      </div>
                    </li>
                    <li className="flex items-start">
                      <CheckCircle2 className="h-5 w-5 mr-2 text-green-600 mt-0.5" />
                      <div>
                        <p className="text-sm text-gray-600">{t.inputGuide.tributaryWidth}</p>
                      </div>
                    </li>
                    <li className="flex items-start">
                      <CheckCircle2 className="h-5 w-5 mr-2 text-green-600 mt-0.5" />
                      <div>
                        <p className="text-sm text-gray-600">{t.inputGuide.deflectionCriteria}</p>
                      </div>
                    </li>
                  </ul>
                </div>
              </div>

              <div className="space-y-4">
                <h3 className="text-lg font-medium">{t.inputGuide.step4Title}</h3>
                <div className="rounded-md border p-4 bg-gray-50">
                  <ul className="space-y-2">
                    <li className="flex items-start">
                      <CheckCircle2 className="h-5 w-5 mr-2 text-green-600 mt-0.5" />
                      <div>
                        <p className="text-sm text-gray-600">{t.inputGuide.windLoadFactor}</p>
                      </div>
                    </li>
                    <li className="flex items-start">
                      <CheckCircle2 className="h-5 w-5 mr-2 text-green-600 mt-0.5" />
                      <div>
                        <p className="text-sm text-gray-600">{t.inputGuide.imposedLoadFactor}</p>
                      </div>
                    </li>
                    <li className="flex items-start">
                      <CheckCircle2 className="h-5 w-5 mr-2 text-green-600 mt-0.5" />
                      <div>
                        <p className="text-sm text-gray-600">{t.inputGuide.deadLoadFactor}</p>
                      </div>
                    </li>
                    <li className="flex items-start">
                      <CheckCircle2 className="h-5 w-5 mr-2 text-green-600 mt-0.5" />
                      <div>
                        <p className="text-sm text-gray-600">{t.inputGuide.fixtureFactor}</p>
                      </div>
                    </li>
                    <li className="flex items-start">
                      <CheckCircle2 className="h-5 w-5 mr-2 text-green-600 mt-0.5" />
                      <div>
                        <p className="text-sm text-gray-600">{t.inputGuide.windLoad}</p>
                      </div>
                    </li>
                    <li className="flex items-start">
                      <CheckCircle2 className="h-5 w-5 mr-2 text-green-600 mt-0.5" />
                      <div>
                        <p className="text-sm text-gray-600">{t.inputGuide.imposedLoad}</p>
                      </div>
                    </li>
                    <li className="flex items-start">
                      <CheckCircle2 className="h-5 w-5 mr-2 text-green-600 mt-0.5" />
                      <div>
                        <p className="text-sm text-gray-600">{t.inputGuide.imposedLoadHeight}</p>
                      </div>
                    </li>
                  </ul>
                </div>
              </div>

              <div className="space-y-4">
                <h3 className="text-lg font-medium">{t.inputGuide.step5Title}</h3>
                <div className="rounded-md border p-4 bg-gray-50">
                  <p className="mb-2 text-sm text-gray-600">{t.inputGuide.deadLoadNote}</p>
                  <ul className="space-y-2">
                    <li className="flex items-start">
                      <CheckCircle2 className="h-5 w-5 mr-2 text-green-600 mt-0.5" />
                      <div>
                        <p className="text-sm text-gray-600">{t.inputGuide.wallBoardLayers}</p>
                      </div>
                    </li>
                    <li className="flex items-start">
                      <CheckCircle2 className="h-5 w-5 mr-2 text-green-600 mt-0.5" />
                      <div>
                        <p className="text-sm text-gray-600">{t.inputGuide.wallBoardWeight}</p>
                      </div>
                    </li>
                    <li className="flex items-start">
                      <CheckCircle2 className="h-5 w-5 mr-2 text-green-600 mt-0.5" />
                      <div>
                        <p className="text-sm text-gray-600">{t.inputGuide.insulationPresent}</p>
                      </div>
                    </li>
                    <li className="flex items-start">
                      <CheckCircle2 className="h-5 w-5 mr-2 text-green-600 mt-0.5" />
                      <div>
                        <p className="text-sm text-gray-600">{t.inputGuide.metalFrameWeight}</p>
                      </div>
                    </li>
                    <li className="flex items-start">
                      <CheckCircle2 className="h-5 w-5 mr-2 text-green-600 mt-0.5" />
                      <div>
                        <p className="text-sm text-gray-600">{t.inputGuide.fixtureWeight}</p>
                      </div>
                    </li>
                    <li className="flex items-start">
                      <CheckCircle2 className="h-5 w-5 mr-2 text-green-600 mt-0.5" />
                      <div>
                        <p className="text-sm text-gray-600">{t.inputGuide.fixtureHeight}</p>
                      </div>
                    </li>
                    <li className="flex items-start">
                      <CheckCircle2 className="h-5 w-5 mr-2 text-green-600 mt-0.5" />
                      <div>
                        <p className="text-sm text-gray-600">{t.inputGuide.fixtureDistance}</p>
                      </div>
                    </li>
                  </ul>
                </div>
              </div>
            </CardContent>
            <CardFooter>
              <Button onClick={() => setActiveTab("results-comparison")} className="w-full">
                {t.inputGuide.viewResultsComparison}
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>

        <TabsContent value="results-comparison" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <InfoIcon className="h-5 w-5" />
                {t.resultsComparison.title}
              </CardTitle>
              <CardDescription>{t.resultsComparison.description}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="overflow-x-auto">
                <table className="w-full border-collapse">
                  <thead>
                    <tr className="bg-slate-100">
                      <th className="border px-4 py-2 text-left">{t.resultsComparison.verificationItem}</th>
                      <th className="border px-4 py-2 text-right">{t.resultsComparison.sampleCalculation}</th>
                      <th className="border px-4 py-2 text-right">{t.resultsComparison.thisSystem}</th>
                      <th className="border px-4 py-2 text-center">{t.resultsComparison.match}</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td className="border px-4 py-2">{t.resultsComparison.bendingMoment}</td>
                      <td className="border px-4 py-2 text-right">392 kN·mm</td>
                      <td className="border px-4 py-2 text-right">392 kN·mm</td>
                      <td className="border px-4 py-2 text-center">
                        <CheckCircle2 className="h-5 w-5 mx-auto text-green-600" />
                      </td>
                    </tr>
                    <tr>
                      <td className="border px-4 py-2">{t.resultsComparison.bendingCapacity}</td>
                      <td className="border px-4 py-2 text-right">452 kN·mm</td>
                      <td className="border px-4 py-2 text-right">452 kN·mm</td>
                      <td className="border px-4 py-2 text-center">
                        <CheckCircle2 className="h-5 w-5 mx-auto text-green-600" />
                      </td>
                    </tr>
                    <tr>
                      <td className="border px-4 py-2">{t.resultsComparison.shearForce}</td>
                      <td className="border px-4 py-2 text-right">243.6 N</td>
                      <td className="border px-4 py-2 text-right">243.6 N</td>
                      <td className="border px-4 py-2 text-center">
                        <CheckCircle2 className="h-5 w-5 mx-auto text-green-600" />
                      </td>
                    </tr>
                    <tr>
                      <td className="border px-4 py-2">{t.resultsComparison.shearCapacity}</td>
                      <td className="border px-4 py-2 text-right">6827 N</td>
                      <td className="border px-4 py-2 text-right">6827 N</td>
                      <td className="border px-4 py-2 text-center">
                        <CheckCircle2 className="h-5 w-5 mx-auto text-green-600" />
                      </td>
                    </tr>
                    <tr>
                      <td className="border px-4 py-2">{t.resultsComparison.webCripplingCapacity}</td>
                      <td className="border px-4 py-2 text-right">848 N</td>
                      <td className="border px-4 py-2 text-right">848 N</td>
                      <td className="border px-4 py-2 text-center">
                        <CheckCircle2 className="h-5 w-5 mx-auto text-green-600" />
                      </td>
                    </tr>
                    <tr>
                      <td className="border px-4 py-2">{t.resultsComparison.maxDeflection}</td>
                      <td className="border px-4 py-2 text-right">12.12 mm</td>
                      <td className="border px-4 py-2 text-right">12.12 mm</td>
                      <td className="border px-4 py-2 text-center">
                        <CheckCircle2 className="h-5 w-5 mx-auto text-green-600" />
                      </td>
                    </tr>
                    <tr>
                      <td className="border px-4 py-2">{t.resultsComparison.allowableDeflection}</td>
                      <td className="border px-4 py-2 text-right">17.08 mm</td>
                      <td className="border px-4 py-2 text-right">17.08 mm</td>
                      <td className="border px-4 py-2 text-center">
                        <CheckCircle2 className="h-5 w-5 mx-auto text-green-600" />
                      </td>
                    </tr>
                    <tr>
                      <td className="border px-4 py-2">{t.resultsComparison.overallResult}</td>
                      <td className="border px-4 py-2 text-right">{t.resultsComparison.suitable}</td>
                      <td className="border px-4 py-2 text-right">{t.resultsComparison.suitable}</td>
                      <td className="border px-4 py-2 text-center">
                        <CheckCircle2 className="h-5 w-5 mx-auto text-green-600" />
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>

              <Alert className="bg-green-50 border-green-200">
                <CheckCircle2 className="h-4 w-4 text-green-600" />
                <AlertTitle>{t.resultsComparison.verificationResult}</AlertTitle>
                <AlertDescription>{t.resultsComparison.verificationDescription}</AlertDescription>
              </Alert>

              <div className="rounded-md border p-4">
                <h3 className="font-medium mb-2">{t.resultsComparison.testMethod}</h3>
                <ol className="list-decimal pl-6 space-y-2">
                  <li>{t.resultsComparison.testStep1}</li>
                  <li>{t.resultsComparison.testStep2}</li>
                  <li>{t.resultsComparison.testStep3}</li>
                  <li>{t.resultsComparison.testStep4}</li>
                </ol>
              </div>
            </CardContent>
            <CardFooter className="flex justify-between">
              <Button variant="outline" onClick={() => setActiveTab("input-guide")}>
                {t.resultsComparison.backToInputGuide}
              </Button>
              <Link href={`/${lang}/wall-stud`}>
                <Button>
                  {t.resultsComparison.startWallStudCalculation}
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
            </CardFooter>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
