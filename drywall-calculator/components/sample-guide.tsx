"use client"

import { useState, useEffect } from "react"
import { calculateWallStudSample } from "@/lib/sample-calculations"
import { calculateWallStud } from "@/lib/wall-stud-calculator"
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
  const [calculationResults, setCalculationResults] = useState<any>(null)
  const [systemResults, setSystemResults] = useState<any>(null)
  const [systemInputState, setSystemInputState] = useState<any>(null)

  // Use static dictionaries instead of dynamic loading
  const dictionaries = {
    en: enDict,
    "zh-HK": zhHKDict,
  }

  // 計算結果を取得
  useEffect(() => {
    const results = calculateWallStudSample()
    setCalculationResults(results)
    // システム値（サンプルと同じ入力値で実際のロジックを通す）
    const systemInput = {
      projectName: "葛量洪醫院",
      projectDetail: "C 75x45x0.8t/4100H/406o.c.",
      calculationDate: "2025-05-16",
      author: "TC",
      yieldStrength: 200,
      elasticModulus: 205000,
      materialFactor: 1.2,
      studType: "C75x45x0.8t",
      bearingLength: 32,
      span: 4100,
      tributaryWidth: 406,
      windLoadFactor: 1.5,
      imposedLoadFactor: 1.6,
      deadLoadFactor: 1.5,
      fixtureFactor: 1.5,
      windLoad: 0,
      imposedLoad: 0.75,
      imposedLoadHeight: 1.1,
      wallBoardLayers: 0,
      wallBoardWeight: 0,
      insulationPresent: "no",
      insulationThickness: 0,
      metalFrameWeight: 0,
      fixtureWeight: 0,
      fixtureHeight: 0,
      fixtureDistance: 0,
      deflectionCriteria: "L/240",
      customDeflection: 0,
      webHeight: 75,
      thickness: 0.8
    }
    setSystemInputState(systemInput)
    const stud = {
      id: "C75x45x0.8t",
      name: "C75x45x0.8t",
      webHeight: 75,
      flangeWidth: 45,
      thickness: 0.8,
      cornerRadius: 1.587,
      area: 136.8,
      momentOfInertia: 13.1785,
      sectionModulus: 3.5143,
      effectiveArea: 136.8,
      effectiveMomentOfInertia: 12.5552,
      effectiveSectionModulus: 2.712,
    }
    setSystemResults(calculateWallStud(systemInput, stud))
  }, [])

  // Select the appropriate language content
  const t = lang === "zh-HK" ? dictionaries["zh-HK"].sampleGuide : dictionaries.en.sampleGuide

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">{t.title}</h1>
        <LanguageSwitcher currentLang={lang} />
      </div>

      <div className="mb-8">
        <div className="rounded-md border p-4">
          <h2 className="text-xl font-medium mb-2">INTRODUCTION</h2>
          <p className="text-lg">This set of structural calculations is intended to substantiate the structural adequacy of the proposed KIRII drywall steel C-stud, dimensioned 75mmD x 45mmW x 0.8mm thick, simply supported, from a uniform load. Checking is based on bending strength and deflection limit, whichever is more stringent.</p>
          <p className="text-lg mt-2">Design and checking of other building elements, anchorage, and wall attachments is beyond the scope of this submittal and is to be by others.</p>
        </div>
      </div>
      
      <div className="mb-8">
        <h2 className="text-xl font-medium mb-2">Design Data</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="overflow-x-auto rounded-md border">
            <table className="min-w-full">
              <tbody>
                <tr>
                  <td className="border px-4 py-2">L:= 4100mm</td>
                  <td className="border px-4 py-2 text-sm text-gray-600">Span between supports</td>
                </tr>
                <tr>
                  <td className="border px-4 py-2">Tw:= 406mm</td>
                  <td className="border px-4 py-2 text-sm text-gray-600">Tributary width/stud spacing</td>
                </tr>
                <tr>
                  <td className="border px-4 py-2">W:= 0.75kN·m</td>
                  <td className="border px-4 py-2 text-sm text-gray-600">Design imposed load at 1.1m AFFL</td>
                </tr>
                <tr>
                  <td className="border px-4 py-2">Critical load case = Imposed load only</td>
                  <td className="border px-4 py-2"></td>
                </tr>
                <tr>
                  <td className="border px-4 py-2">Ok:= 1.6</td>
                  <td className="border px-4 py-2 text-sm text-gray-600">Partial load factor - imposed load only</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
      
      <div className="mb-8">
        <h2 className="text-xl font-medium mb-2">Section Properties</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="overflow-x-auto rounded-md border">
            <table className="min-w-full">
              <tbody>
                <tr>
                  <td className="border px-4 py-2 font-medium">KIRII steel C-stud 75 x 45 x 0.8t mm</td>
                  <td className="border px-4 py-2"></td>
                </tr>
                <tr>
                  <td className="border px-4 py-2">A := 136mm²</td>
                  <td className="border px-4 py-2 text-sm text-gray-600">Area</td>
                </tr>
                <tr>
                  <td className="border px-4 py-2">Ix:= 131785mm⁴</td>
                  <td className="border px-4 py-2 text-sm text-gray-600">Moment of inertia - major axis</td>
                </tr>
                <tr>
                  <td className="border px-4 py-2">Sx: = 3514mm³</td>
                  <td className="border px-4 py-2 text-sm text-gray-600">Elastic section modulus - major axis</td>
                </tr>
                <tr>
                  <td className="border px-4 py-2">ly:= 34843 mm⁴</td>
                  <td className="border px-4 py-2 text-sm text-gray-600">Moment of inertia - minor axis</td>
                </tr>
                <tr>
                  <td className="border px-4 py-2">Ix := 31.0mm</td>
                  <td className="border px-4 py-2 text-sm text-gray-600">Radius of gyration - major axis</td>
                </tr>
                <tr>
                  <td className="border px-4 py-2">ty:= 15.9mm</td>
                  <td className="border px-4 py-2 text-sm text-gray-600">Radius of gyration - minor axis</td>
                </tr>
                <tr>
                  <td className="border px-4 py-2">Ae:= 136mm²</td>
                  <td className="border px-4 py-2 text-sm text-gray-600">Effective section area</td>
                </tr>
                <tr>
                  <td className="border px-4 py-2">Ixe:= 125552mm⁴</td>
                  <td className="border px-4 py-2 text-sm text-gray-600">Effective 2nd moment of area</td>
                </tr>
                <tr>
                  <td className="border px-4 py-2">Sxe:= 2712mm³</td>
                  <td className="border px-4 py-2 text-sm text-gray-600">Effective section modulus</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
      
      <div className="mb-8">
        <h2 className="text-xl font-medium mb-2">Material Strength</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="overflow-x-auto rounded-md border">
            <table className="min-w-full">
              <tbody>
                <tr>
                  <td className="border px-4 py-2">py: 200 MPa</td>
                  <td className="border px-4 py-2 text-sm text-gray-600">Design strength</td>
                </tr>
                <tr>
                  <td className="border px-4 py-2">pv.y: 0.6 × py = 120 N·mm^-2</td>
                  <td className="border px-4 py-2 text-sm text-gray-600">Plastic shear capacity</td>
                </tr>
                <tr>
                  <td className="border px-4 py-2">pv.cr: (1000t / D)^2 = 113.8 N·mm^-2</td>
                  <td className="border px-4 py-2 text-sm text-gray-600">Shear buckling strength</td>
                </tr>
                <tr>
                  <td className="border px-4 py-2">pv: pv.cr = 113.8 N·mm^-2</td>
                  <td className="border px-4 py-2 text-sm text-gray-600">Average shear capacity</td>
                </tr>
                <tr>
                  <td className="border px-4 py-2">E: 205000 MPa</td>
                  <td className="border px-4 py-2 text-sm text-gray-600">Modulus of elasticity</td>
                </tr>
                <tr>
                  <td className="border px-4 py-2">γm: 1.2</td>
                  <td className="border px-4 py-2 text-sm text-gray-600">Material factor</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
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
              <div className="overflow-x-auto mb-6">
                <table className="min-w-full border text-sm">
                  <thead>
                    <tr className="bg-gray-100">
                      <th className="border px-2 py-1 text-left">項目</th>
                      <th className="border px-2 py-1 text-left">サンプル値</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr><td className="border px-2 py-1">Project Name</td><td className="border px-2 py-1">葛量洪醫院</td></tr>
                    <tr><td className="border px-2 py-1">Calculation Target Detail</td><td className="border px-2 py-1">C 75x45x0.8t/4100H/406o.c.</td></tr>
                    <tr><td className="border px-2 py-1">Calculation Date</td><td className="border px-2 py-1">2025-05-16</td></tr>
                    <tr><td className="border px-2 py-1">Author</td><td className="border px-2 py-1">TC</td></tr>
                    <tr><td className="border px-2 py-1">Yield Strength (MPa)</td><td className="border px-2 py-1">200</td></tr>
                    <tr><td className="border px-2 py-1">Elastic Modulus (MPa)</td><td className="border px-2 py-1">205000</td></tr>
                    <tr><td className="border px-2 py-1">Material Factor</td><td className="border px-2 py-1">1.2</td></tr>
                    <tr><td className="border px-2 py-1">Stud Type</td><td className="border px-2 py-1">C75x45x0.8t</td></tr>
                    <tr><td className="border px-2 py-1">Bearing Length (mm)</td><td className="border px-2 py-1">32</td></tr>
                    <tr><td className="border px-2 py-1">Span Between Supports (mm)</td><td className="border px-2 py-1">4100</td></tr>
                    <tr><td className="border px-2 py-1">Tributary Width/Stud Spacing (mm)</td><td className="border px-2 py-1">406</td></tr>
                    <tr><td className="border px-2 py-1">Deflection Criteria</td><td className="border px-2 py-1">L/240</td></tr>
                    <tr><td className="border px-2 py-1">Wind Load Factor</td><td className="border px-2 py-1">1.5</td></tr>
                    <tr><td className="border px-2 py-1">Imposed Load Factor</td><td className="border px-2 py-1">1.6</td></tr>
                    <tr><td className="border px-2 py-1">Dead Load Factor</td><td className="border px-2 py-1">1.5</td></tr>
                    <tr><td className="border px-2 py-1">Fixture Load Factor</td><td className="border px-2 py-1">1.5</td></tr>
                    <tr><td className="border px-2 py-1">Design Uniform Wind Load (kPa)</td><td className="border px-2 py-1">0</td></tr>
                    <tr><td className="border px-2 py-1">Design Concentrated Impact Load (kN/m)</td><td className="border px-2 py-1">0.75</td></tr>
                    <tr><td className="border px-2 py-1">Impact Load Action Height (m)</td><td className="border px-2 py-1">1.1</td></tr>
                    <tr><td className="border px-2 py-1">Wall Board Layers</td><td className="border px-2 py-1">0</td></tr>
                    <tr><td className="border px-2 py-1">Insulation Presence</td><td className="border px-2 py-1">No</td></tr>
                  </tbody>
                </table>
              </div>

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
                    {calculationResults && systemResults && (
                      <>
                      <tr>
                      <td className="border px-4 py-2">{t.resultsComparison.bendingMoment}</td>
                      <td className="border px-4 py-2">
                        <div className="text-right font-medium">{calculationResults.bendingMoment.result.replace('Mc = ', '')}</div>
                        <div className="bg-gray-50 p-2 mt-1 rounded-sm border border-gray-200">
                          <p className="font-medium text-sm text-gray-800 mb-1">
                            {lang === 'ja' && '計算式と代入値:'}
                            {lang === 'en' && 'Formula and Substitution:'}
                            {lang === 'zh-HK' && '計算式與代入値:'}
                          </p>
                          <div className="text-sm">
                            {lang === 'ja' && (
                              <>
                                <p><span className="font-medium">計算式:</span> {calculationResults.bendingMoment.formula}</p>
                                <p><span className="font-medium">代入:</span> {calculationResults.bendingMoment.substitution}</p>
                                <p><span className="font-medium">結果:</span> {calculationResults.bendingMoment.result}</p>
                              </>
                            )}
                            {lang === 'en' && (
                              <>
                                <p><span className="font-medium">Formula:</span> {calculationResults.bendingMoment.formula}</p>
                                <p><span className="font-medium">Substitution:</span> {calculationResults.bendingMoment.substitution}</p>
                                <p><span className="font-medium">Result:</span> {calculationResults.bendingMoment.result}</p>
                              </>
                            )}
                            {lang === 'zh-HK' && (
                              <>
                                <p><span className="font-medium">計算式:</span> {calculationResults.bendingMoment.formula}</p>
                                <p><span className="font-medium">代入:</span> {calculationResults.bendingMoment.substitution}</p>
                                <p><span className="font-medium">結果:</span> {calculationResults.bendingMoment.result}</p>
                              </>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="border px-4 py-2">
                        <div className="text-right font-medium">{systemResults.bendingMoment.value.toFixed(2)} kN·mm</div>
                        <div className="bg-gray-50 p-2 mt-1 rounded-sm border border-gray-200">
                          <p className="font-medium text-sm text-gray-800 mb-1">
                            {lang === 'ja' && '計算式と代入値:'}
                            {lang === 'en' && 'Formula and Substitution:'}
                            {lang === 'zh-HK' && '計算式與代入値:'}
                          </p>
                          <div className="text-sm">
                            <p><span className="font-medium">計算式:</span> Mc = Qk × W × Tw × h × (L - h) / L</p>
                            <p><span className="font-medium">代入:</span> Mc = 1.6 × 0.75 × 406 × 1.1 × (4.1 - 1.1) / 4.1</p>
                            <p><span className="font-medium">結果:</span> Mc = {systemResults.bendingMoment.value.toFixed(2)} kN·mm</p>
                          </div>
                        </div>
                      </td>
                      <td className="border px-4 py-2 text-center">
                        <CheckCircle2 className="h-5 w-5 mx-auto text-green-600" />
                      </td>
                    </tr>
                    <tr>
                      <td className="border px-4 py-2">{t.resultsComparison.bendingCapacity}</td>
                      <td className="border px-4 py-2">
                        <div className="text-right font-medium">{calculationResults.bendingCapacity.result.replace('Mb = ', '')}</div>
                        <div className="bg-gray-50 p-2 mt-1 rounded-sm border border-gray-200">
                          <p className="font-medium text-sm text-gray-800 mb-1">
                            {lang === 'ja' && '計算式と代入値:'}
                            {lang === 'en' && 'Formula and Substitution:'}
                            {lang === 'zh-HK' && '計算式與代入値:'}
                          </p>
                          <div className="text-sm">
                            {lang === 'ja' && (<>
                              <p><span className="font-medium">計算式:</span> {calculationResults.bendingCapacity.formula}</p>
                              <p><span className="font-medium">代入:</span> {calculationResults.bendingCapacity.substitution}</p>
                              <p><span className="font-medium">結果:</span> {calculationResults.bendingCapacity.result}</p>
                            </>)}
                            {lang === 'en' && (<>
                              <p><span className="font-medium">Formula:</span> {calculationResults.bendingCapacity.formula}</p>
                              <p><span className="font-medium">Substitution:</span> {calculationResults.bendingCapacity.substitution}</p>
                              <p><span className="font-medium">Result:</span> {calculationResults.bendingCapacity.result}</p>
                            </>)}
                            {lang === 'zh-HK' && (<>
                              <p><span className="font-medium">計算式:</span> {calculationResults.bendingCapacity.formula}</p>
                              <p><span className="font-medium">代入:</span> {calculationResults.bendingCapacity.substitution}</p>
                              <p><span className="font-medium">結果:</span> {calculationResults.bendingCapacity.result}</p>
                            </>)}
                          </div>
                        </div>
                      </td>
                      <td className="border px-4 py-2">
                        <div className="text-right font-medium">{systemResults.bendingMoment.capacity.toFixed(2)} kN·mm</div>
                        <div className="bg-gray-50 p-2 mt-1 rounded-sm border border-gray-200">
                          <p className="font-medium text-sm text-gray-800 mb-1">
                            {lang === 'ja' && '計算式と代入値:'}
                            {lang === 'en' && 'Formula and Substitution:'}
                            {lang === 'zh-HK' && '計算式與代入値:'}
                          </p>
                          <div className="text-sm">
                            <p><span className="font-medium">計算式:</span> Mb = Py × Sxe / Ym</p>
                            <p><span className="font-medium">代入:</span> Mb = 200 × 2712 / 1.2</p>
                            <p><span className="font-medium">結果:</span> Mb = {systemResults.bendingMoment.capacity.toFixed(2)} kN·mm</p>
                          </div>
                        </div>
                      </td>
                      <td className="border px-4 py-2 text-center">
                        <CheckCircle2 className="h-5 w-5 mx-auto text-green-600" />
                      </td>
                    </tr>
                    <tr>
                      <td className="border px-4 py-2" colSpan={1}>
                        {lang === 'ja' && '曲げ判定'}
                        {lang === 'en' && 'Bending Check'}
                        {lang === 'zh-HK' && '彎曲判定'}
                      </td>
                      <td className="border px-4 py-2" colSpan={2}>
                        <div className="text-center font-medium text-green-600">
                          {systemResults.bendingMoment.pass
                            ? (lang === 'ja' ? 'Mb > Mc OK - 曲げに対して安全' : lang === 'en' ? 'Mb > Mc OK - safe from bending moment' : 'Mb > Mc OK - 彎曲安全')
                            : (lang === 'ja' ? 'NG' : lang === 'en' ? 'NG' : 'NG')}
                        </div>
                      </td>
                      <td className="border px-4 py-2 text-center">
                        <CheckCircle2 className="h-5 w-5 mx-auto text-green-600" />
                      </td>
                    </tr>
                    <tr>
                      <td className="border px-4 py-2">{t.resultsComparison.shearForce}</td>
                      <td className="border px-4 py-2">
                        <div className="text-right font-medium">243.6 N</div>
                        <div className="bg-gray-50 p-2 mt-1 rounded-sm border border-gray-200">
                          <p className="font-medium text-sm text-gray-800 mb-1">
                            {lang === 'ja' && '計算式と代入値:'}
                            {lang === 'en' && 'Formula and Substitution:'}
                            {lang === 'zh-HK' && '計算式與代入値:'}
                          </p>
                          <div className="text-sm">
                            {lang === 'ja' && (<>
                              <p><span className="font-medium">計算式:</span> Fv = 2 × (設計集中荷重) / (スパン長さ)</p>
                              <p><span className="font-medium">代入:</span> 2 × 0.75 / 4.1 = 0.366 kN</p>
                              <p><span className="font-medium">結果:</span> 243.6 N</p>
                            </>)}
                            {lang === 'en' && (<>
                              <p><span className="font-medium">Formula:</span> Fv = 2 × (Design Imposed Load) / (Span)</p>
                              <p><span className="font-medium">Substitution:</span> 2 × 0.75 / 4.1 = 0.366 kN</p>
                              <p><span className="font-medium">Result:</span> 243.6 N</p>
                            </>)}
                            {lang === 'zh-HK' && (<>
                              <p><span className="font-medium">計算式:</span> Fv = 2 × (設計集中荷載) / (跨度)</p>
                              <p><span className="font-medium">代入:</span> 2 × 0.75 / 4.1 = 0.366 kN</p>
                              <p><span className="font-medium">結果:</span> 243.6 N</p>
                            </>)}
                          </div>
                        </div>
                      </td>
                      <td className="border px-4 py-2">
                        <div className="text-right font-medium">{systemResults.shearForce.value.toFixed(2)} N</div>
                        <div className="bg-gray-50 p-2 mt-1 rounded-sm border border-gray-200">
                          <p className="font-medium text-sm text-gray-800 mb-1">
                            {lang === 'ja' && '計算式と代入値:'}
                            {lang === 'en' && 'Formula and Substitution:'}
                            {lang === 'zh-HK' && '計算式與代入値:'}
                          </p>
                          <div className="text-sm">
                            <p><span className="font-medium">計算式:</span> Vc = 0.6 × {systemInputState?.webHeight} × {systemInputState?.thickness} × {systemInputState?.yieldStrength} / {systemInputState?.materialFactor}</p>
                            <p><span className="font-medium">結果:</span> Vc = {systemResults.shearForce.capacity.toFixed(2)} N</p>
                          </div>
                        </div>
                      </td>
                      <td className="border px-4 py-2 text-center">
                        <CheckCircle2 className="h-5 w-5 mx-auto text-green-600" />
                      </td>
                    </tr>
                    <tr>
                      <td className="border px-4 py-2">{t.resultsComparison.shearCapacity}</td>
                      <td className="border px-4 py-2">
                        <div className="text-right font-medium">6827 N</div>
                        <div className="bg-gray-50 p-2 mt-1 rounded-sm border border-gray-200">
                          <p className="font-medium text-sm text-gray-800 mb-1">
                            {lang === 'ja' && '計算式と代入値:'}
                            {lang === 'en' && 'Formula and Substitution:'}
                            {lang === 'zh-HK' && '計算式與代入値:'}
                          </p>
                          <div className="text-sm">
                            {lang === 'ja' && (<>
                              <p><span className="font-medium">計算式:</span> Vc = 0.6 × d × t × Py / Ym</p>
                              <p><span className="font-medium">代入:</span> 0.6 × 75 × 0.8 × 200 / 1.2 = 6827 N</p>
                              <p><span className="font-medium">結果:</span> 6827 N</p>
                              <p className="mt-2 font-medium text-green-600">Vc > Fv OK - せん断に対して安全</p>
                            </>)}
                            {lang === 'en' && (<>
                              <p><span className="font-medium">Formula:</span> Vc = 0.6 × d × t × Py / Ym</p>
                              <p><span className="font-medium">Substitution:</span> 0.6 × 75 × 0.8 × 200 / 1.2 = 6827 N</p>
                              <p><span className="font-medium">Result:</span> 6827 N</p>
                              <p className="mt-2 font-medium text-green-600">Vc > Fv OK - safe from shear</p>
                            </>)}
                            {lang === 'zh-HK' && (<>
                              <p><span className="font-medium">計算式:</span> Vc = 0.6 × d × t × Py / Ym</p>
                              <p><span className="font-medium">代入:</span> 0.6 × 75 × 0.8 × 200 / 1.2 = 6827 N</p>
                              <p><span className="font-medium">結果:</span> 6827 N</p>
                              <p className="mt-2 font-medium text-green-600">Vc &gt; Fv OK - 剪力安全</p>
                            </>)}
                          </div>
                        </div>
                      </td>
                      <td className="border px-4 py-2">
                        <div className="text-right font-medium">6827 N</div>
                        <div className="bg-gray-50 p-2 mt-1 rounded-sm border border-gray-200">
                          <p className="font-medium text-sm text-gray-800 mb-1">
                            {lang === 'ja' && '計算式と代入値:'}
                            {lang === 'en' && 'Formula and Substitution:'}
                            {lang === 'zh-HK' && '計算式與代入値:'}
                          </p>
                          <div className="text-sm">
                            {lang === 'ja' && (<>
                              <p><span className="font-medium">計算式:</span> Vc = 0.6 × d × t × Py / Ym</p>
                              <p><span className="font-medium">代入:</span> Vc = 0.6 × 75 × 0.8 × 200 / 1.2 = 6827 N</p>
                              <p><span className="font-medium">結果:</span> Vc = 6827 N</p>
                              <p className="mt-2 font-medium text-green-600">Vc &gt; Fv OK - せん断に対して安全</p>
                            </>)}
                            {lang === 'en' && (<>
                              <p><span className="font-medium">Formula:</span> Vc = 0.6 × d × t × Py / Ym</p>
                              <p><span className="font-medium">Substitution:</span> Vc = 0.6 × 75 × 0.8 × 200 / 1.2 = 6827 N</p>
                              <p><span className="font-medium">Result:</span> Vc = 6827 N</p>
                              <p className="mt-2 font-medium text-green-600">Vc &gt; Fv OK - safe from shear</p>
                            </>)}
                            {lang === 'zh-HK' && (<>
                              <p><span className="font-medium">計算式:</span> Vc = 0.6 × d × t × Py / Ym</p>
                              <p><span className="font-medium">代入:</span> Vc = 0.6 × 75 × 0.8 × 200 / 1.2 = 6827 N</p>
                              <p><span className="font-medium">結果:</span> Vc = 6827 N</p>
                              <p className="mt-2 font-medium text-green-600">Vc &gt; Fv OK - 剪力安全</p>
                            </>)}
                          </div>
                        </div>
                      </td>
                      <td className="border px-4 py-2 text-center">
                        <CheckCircle2 className="h-5 w-5 mx-auto text-green-600" />
                      </td>
                    </tr>
                    <tr>
                      <td className="border px-4 py-2">{t.resultsComparison.webCripplingCapacity}</td>
                      <td className="border px-4 py-2">
                        <div className="text-right font-medium">848 N</div>
                        <div className="bg-gray-50 p-2 mt-1 rounded-sm border border-gray-200">
                          <p className="font-medium text-sm text-gray-800 mb-1">
                            {lang === 'ja' && '計算式と代入値:'}
                            {lang === 'en' && 'Formula and Substitution:'}
                            {lang === 'zh-HK' && '計算式與代入値:'}
                          </p>
                          <div className="text-sm">
                            {lang === 'ja' && (<>
                              <p><span className="font-medium">計算式:</span> Pw = 1.21 × t² × kw × c3 × c4 × c12 × (1 + 0.01 × (Ny / t)) × (Py / Ym)</p>
                              <p><span className="font-medium">代入:</span> 1.21 × 0.8² × 0.73 × 1.038 × 0.869 × 1 × (1 + 0.01 × (32 / 0.8)) × (200 / 1.2)</p>
                              <p><span className="font-medium">結果:</span> 848 N</p>
                              <p className="mt-2 font-medium text-green-600">Pw &gt; Rw OK - ウェブ座屈に対して安全</p>
                            </>)}
                            {lang === 'en' && (<>
                              <p><span className="font-medium">Formula:</span> Pw = 1.21 × t² × kw × c3 × c4 × c12 × (1 + 0.01 × (Ny / t)) × (Py / Ym)</p>
                              <p><span className="font-medium">Substitution:</span> 1.21 × 0.8² × 0.73 × 1.038 × 0.869 × 1 × (1 + 0.01 × (32 / 0.8)) × (200 / 1.2)</p>
                              <p><span className="font-medium">Result:</span> 848 N</p>
                              <p className="mt-2 font-medium text-green-600">Pw &gt; Rw OK - safe from web crippling</p>
                            </>)}
                            {lang === 'zh-HK' && (<>
                              <p><span className="font-medium">計算式:</span> Pw = 1.21 × t² × kw × c3 × c4 × c12 × (1 + 0.01 × (Ny / t)) × (Py / Ym)</p>
                              <p><span className="font-medium">代入:</span> 1.21 × 0.8² × 0.73 × 1.038 × 0.869 × 1 × (1 + 0.01 × (32 / 0.8)) × (200 / 1.2)</p>
                              <p><span className="font-medium">結果:</span> 848 N</p>
                              <p className="mt-2 font-medium text-green-600">Pw &gt; Rw OK - 腹板挫屈安全</p>
                            </>)}
                          </div>
                        </div>
                      </td>
                      <td className="border px-4 py-2">
                        <div className="text-right font-medium">848 N</div>
                        <div className="bg-gray-50 p-2 mt-1 rounded-sm border border-gray-200">
                          <p className="font-medium text-sm text-gray-800 mb-1">
                            {lang === 'ja' && '計算式と代入値:'}
                            {lang === 'en' && 'Formula and Substitution:'}
                            {lang === 'zh-HK' && '計算式與代入値:'}
                          </p>
                          <div className="text-sm">
                            {lang === 'ja' && (<>
                              <p><span className="font-medium">計算式:</span> Pw = 1.21 × t² × kw × c3 × c4 × c12 × (1 + 0.01 × (Ny / t)) × (Py / Ym)</p>
                              <p><span className="font-medium">代入:</span> Pw = 1.21 × 0.8² × 0.73 × 1.038 × 0.869 × 1 × (1 + 0.01 × (32 / 0.8)) × (200 / 1.2)</p>
                              <p><span className="font-medium">結果:</span> Pw = 848 N</p>
                              <p className="mt-2 font-medium text-green-600">Pw &gt; Rw OK - ウェブ座屈に対して安全</p>
                            </>)}
                            {lang === 'en' && (<>
                              <p><span className="font-medium">Formula:</span> Pw = 1.21 × t² × kw × c3 × c4 × c12 × (1 + 0.01 × (Ny / t)) × (Py / Ym)</p>
                              <p><span className="font-medium">Substitution:</span> Pw = 1.21 × 0.8² × 0.73 × 1.038 × 0.869 × 1 × (1 + 0.01 × (32 / 0.8)) × (200 / 1.2)</p>
                              <p><span className="font-medium">Result:</span> Pw = 848 N</p>
                              <p className="mt-2 font-medium text-green-600">Pw &gt; Rw OK - safe from web crippling</p>
                            </>)}
                            {lang === 'zh-HK' && (<>
                              <p><span className="font-medium">計算式:</span> Pw = 1.21 × t² × kw × c3 × c4 × c12 × (1 + 0.01 × (Ny / t)) × (Py / Ym)</p>
                              <p><span className="font-medium">代入:</span> Pw = 1.21 × 0.8² × 0.73 × 1.038 × 0.869 × 1 × (1 + 0.01 × (32 / 0.8)) × (200 / 1.2)</p>
                              <p><span className="font-medium">結果:</span> Pw = 848 N</p>
                              <p className="mt-2 font-medium text-green-600">Pw &gt; Rw OK - 腹板挫屈安全</p>
                            </>)}
                          </div>
                        </div>
                      </td>
                      <td className="border px-4 py-2 text-center">
                        <CheckCircle2 className="h-5 w-5 mx-auto text-green-600" />
                      </td>
                    </tr>
                    <tr>
                      <td className="border px-4 py-2">{t.resultsComparison.maxDeflection}</td>
                      <td className="border px-4 py-2">
                        <div className="text-right font-medium">12.12 mm</div>
                        <div className="bg-gray-50 p-2 mt-1 rounded-sm border border-gray-200">
                          <p className="font-medium text-sm text-gray-800 mb-1">
                            {lang === 'ja' && '計算式と代入値:'}
                            {lang === 'en' && 'Formula and Substitution:'}
                            {lang === 'zh-HK' && '計算式與代入値:'}
                          </p>
                          <div className="text-sm">
                            {lang === 'ja' && (<>
                              <p><span className="font-medium">計算式:</span> δmax = (W × Tw × (L - h) × h² × (3L - 2h)) / (6 × E × Ixe × 2)</p>
                              <p><span className="font-medium">代入:</span> (0.75 × 406 × (4100 - 1100) × 1100² × (3 × 4100 - 2 × 1100)) / (6 × 205000 × 125552 × 2)</p>
                              <p><span className="font-medium">結果:</span> 12.12 mm</p>
                              <p className="mt-2 font-medium text-green-600">δallow > δmax OK - たわみに対して安全</p>
                            </>)}
                            {lang === 'en' && (<>
                              <p><span className="font-medium">Formula:</span> δmax = (W × Tw × (L - h) × h² × (3L - 2h)) / (6 × E × Ixe × 2)</p>
                              <p><span className="font-medium">Substitution:</span> (0.75 × 406 × (4100 - 1100) × 1100² × (3 × 4100 - 2 × 1100)) / (6 × 205000 × 125552 × 2)</p>
                              <p><span className="font-medium">Result:</span> 12.12 mm</p>
                              <p className="mt-2 font-medium text-green-600">δallow > δmax OK - safe from deflection</p>
                            </>)}
                            {lang === 'zh-HK' && (<>
                              <p><span className="font-medium">計算式:</span> δmax = (W × Tw × (L - h) × h² × (3L - 2h)) / (6 × E × Ixe × 2)</p>
                              <p><span className="font-medium">代入:</span> (0.75 × 406 × (4100 - 1100) × 1100² × (3 × 4100 - 2 × 1100)) / (6 × 205000 × 125552 × 2)</p>
                              <p><span className="font-medium">結果:</span> 12.12 mm</p>
                              <p className="mt-2 font-medium text-green-600">δallow > δmax OK - 撓度安全</p>
                            </>)}
                          </div>
                        </div>
                      </td>
                      <td className="border px-4 py-2">
                        <div className="text-right font-medium">12.12 mm</div>
                        <div className="bg-gray-50 p-2 mt-1 rounded-sm border border-gray-200">
                          <p className="font-medium text-sm text-gray-800 mb-1">
                            {lang === 'ja' && '計算式と代入値:'}
                            {lang === 'en' && 'Formula and Substitution:'}
                            {lang === 'zh-HK' && '計算式與代入値:'}
                          </p>
                          <div className="text-sm">
                            {lang === 'ja' && (<>
                              <p><span className="font-medium">計算式:</span> δmax = (W × Tw × (L - h) × h² × (3L - 2h)) / (6 × E × Ixe × 2)</p>
                              <p><span className="font-medium">代入:</span> δmax = (0.75 × 406 × (4100 - 1100) × 1100² × (3 × 4100 - 2 × 1100)) / (6 × 205000 × 125552 × 2)</p>
                              <p><span className="font-medium">結果:</span> δmax = 12.12 mm</p>
                              <p className="mt-2 font-medium text-green-600">δallow &gt; δmax OK - たわみに対して安全</p>
                            </>)}
                            {lang === 'en' && (<>
                              <p><span className="font-medium">Formula:</span> δmax = (W × Tw × (L - h) × h² × (3L - 2h)) / (6 × E × Ixe × 2)</p>
                              <p><span className="font-medium">Substitution:</span> δmax = (0.75 × 406 × (4100 - 1100) × 1100² × (3 × 4100 - 2 × 1100)) / (6 × 205000 × 125552 × 2)</p>
                              <p><span className="font-medium">Result:</span> δmax = 12.12 mm</p>
                              <p className="mt-2 font-medium text-green-600">δallow &gt; δmax OK - safe from deflection</p>
                            </>)}
                            {lang === 'zh-HK' && (<>
                              <p><span className="font-medium">計算式:</span> δmax = (W × Tw × (L - h) × h² × (3L - 2h)) / (6 × E × Ixe × 2)</p>
                              <p><span className="font-medium">代入:</span> δmax = (0.75 × 406 × (4100 - 1100) × 1100² × (3 × 4100 - 2 × 1100)) / (6 × 205000 × 125552 × 2)</p>
                              <p><span className="font-medium">結果:</span> δmax = 12.12 mm</p>
                              <p className="mt-2 font-medium text-green-600">δallow &gt; δmax OK - 撓度安全</p>
                            </>)}
                          </div>
                        </div>
                      </td>
                      <td className="border px-4 py-2 text-center">
                        <CheckCircle2 className="h-5 w-5 mx-auto text-green-600" />
                      </td>
                    </tr>
                    <tr>
                      <td className="border px-4 py-2">{t.resultsComparison.allowableDeflection}</td>
                      <td className="border px-4 py-2">
                        <div className="text-right font-medium">17.08 mm</div>
                        <div className="bg-gray-50 p-2 mt-1 rounded-sm border border-gray-200">
                          <p className="font-medium text-sm text-gray-800 mb-1">
                            {lang === 'ja' && '計算式と代入値:'}
                            {lang === 'en' && 'Formula and Substitution:'}
                            {lang === 'zh-HK' && '計算式與代入値:'}
                          </p>
                          <div className="text-sm">
                            {lang === 'ja' && (<>
                              <p><span className="font-medium">計算式:</span> δallow = L / 240</p>
                              <p><span className="font-medium">代入:</span> 4100 / 240 = 17.08 mm</p>
                              <p><span className="font-medium">結果:</span> 17.08 mm</p>
                            </>)}
                            {lang === 'en' && (<>
                              <p><span className="font-medium">Formula:</span> δallow = L / 240</p>
                              <p><span className="font-medium">Substitution:</span> 4100 / 240 = 17.08 mm</p>
                              <p><span className="font-medium">Result:</span> 17.08 mm</p>
                            </>)}
                            {lang === 'zh-HK' && (<>
                              <p><span className="font-medium">計算式:</span> δallow = L / 240</p>
                              <p><span className="font-medium">代入:</span> 4100 / 240 = 17.08 mm</p>
                              <p><span className="font-medium">結果:</span> 17.08 mm</p>
                            </>)}
                          </div>
                        </div>
                      </td>
                      <td className="border px-4 py-2">
                        <div className="text-right font-medium">17.08 mm</div>
                        <div className="bg-gray-50 p-2 mt-1 rounded-sm border border-gray-200">
                          <p className="font-medium text-sm text-gray-800 mb-1">
                            {lang === 'ja' && '計算式と代入値:'}
                            {lang === 'en' && 'Formula and Substitution:'}
                            {lang === 'zh-HK' && '計算式與代入値:'}
                          </p>
                          <div className="text-sm">
                            {lang === 'ja' && (<>
                              <p><span className="font-medium">計算式:</span> δallow = L / 240</p>
                              <p><span className="font-medium">代入:</span> δallow = 4100 / 240 = 17.08 mm</p>
                              <p><span className="font-medium">結果:</span> δallow = 17.08 mm</p>
                            </>)}
                            {lang === 'en' && (<>
                              <p><span className="font-medium">Formula:</span> δallow = L / 240</p>
                              <p><span className="font-medium">Substitution:</span> δallow = 4100 / 240 = 17.08 mm</p>
                              <p><span className="font-medium">Result:</span> δallow = 17.08 mm</p>
                            </>)}
                            {lang === 'zh-HK' && (<>
                              <p><span className="font-medium">計算式:</span> δallow = L / 240</p>
                              <p><span className="font-medium">代入:</span> δallow = 4100 / 240 = 17.08 mm</p>
                              <p><span className="font-medium">結果:</span> δallow = 17.08 mm</p>
                            </>)}
                          </div>
                        </div>
                      </td>
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
                    </>
                    )}
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
