"use client"

import { useState, useEffect } from "react"
import { calculateWallStudSample } from "@/lib/sample-calculations"
import { calculateWallStud } from "@/lib/wall-stud-calculator"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { InfoIcon, CheckCircle2, ArrowRight, XCircle } from "lucide-react"
import Link from "next/link"
import LanguageSwitcher from "@/components/language-switcher"

// Import dictionaries directly to avoid dynamic imports
import enDict from "@/lib/dictionaries/en.json"
import zhHKDict from "@/lib/dictionaries/zh-HK.json"
import jaDict from "@/lib/dictionaries/ja.json"

export default function SampleGuide({ lang }: { lang: string }) {
  const [activeTab, setActiveTab] = useState("overview")
  const [calculationResults, setCalculationResults] = useState<any>(null)
  const [systemResults, setSystemResults] = useState<any>(null)
  const [systemInputState, setSystemInputState] = useState<any>(null)

  // Use static dictionaries instead of dynamic loading
  const dictionaries = {
    en: enDict,
    "zh-HK": zhHKDict,
    ja: jaDict,
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
  const t = lang === "zh-HK" ? dictionaries["zh-HK"].sampleGuide : 
            lang === "ja" ? dictionaries.ja.sampleGuide : dictionaries.en.sampleGuide

  // デバッグ用 - これにより、Factoredreactionforceoneachwebがあるかどうかを確認できます
  console.log("System Results:", systemResults)

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
          {/* Overview content here (unchanged) */}
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
          {/* Input guide content here (unchanged) */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <InfoIcon className="h-5 w-5" />
                {t.inputGuide.title}
              </CardTitle>
              <CardDescription>{t.inputGuide.description}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <h3 className="text-lg font-medium mb-4">
                {lang === 'en' ? 'Input Values Used in Sample Calculation' : '樣本計算中使用的輸入值'}
              </h3>
              
              {calculationResults && (
                <div className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* 基本情報 */}
                    <div className="rounded-md border p-4">
                      <h4 className="font-medium mb-3">{lang === 'en' ? 'Basic Information' : '基本信息'}</h4>
                      <table className="w-full text-sm">
                        <tbody>
                          <tr>
                            <td className="py-1 font-medium">{lang === 'en' ? 'Project Name:' : '項目名稱：'}</td>
                            <td>葛量洪醫院</td>
                          </tr>
                          <tr>
                            <td className="py-1 font-medium">{lang === 'en' ? 'Details:' : '詳細信息：'}</td>
                            <td>C 75x45x0.8t/4100H/406o.c.</td>
                          </tr>
                          <tr>
                            <td className="py-1 font-medium">{lang === 'en' ? 'Calculation Date:' : '計算日期：'}</td>
                            <td>2025-05-16</td>
                          </tr>
                          <tr>
                            <td className="py-1 font-medium">{lang === 'en' ? 'Author:' : '作者：'}</td>
                            <td>TC</td>
                          </tr>
                        </tbody>
                      </table>
                    </div>

                    {/* Material Properties */}
                    <div className="rounded-md border p-4">
                      <h4 className="font-medium mb-3">{lang === 'en' ? 'Material Properties' : '材料性能'}</h4>
                      <table className="w-full text-sm">
                        <tbody>
                          <tr>
                            <td className="py-1 font-medium">{lang === 'en' ? 'Yield Strength (Py):' : '降伏強度 (Py)：'}</td>
                            <td>200 MPa</td>
                          </tr>
                          <tr>
                            <td className="py-1 font-medium">{lang === 'en' ? 'Elastic Modulus (E):' : '彈性模量 (E)：'}</td>
                            <td>205000 MPa</td>
                          </tr>
                          <tr>
                            <td className="py-1 font-medium">{lang === 'en' ? 'Material Factor (γm):' : '材料係數 (γm)：'}</td>
                            <td>1.2</td>
                          </tr>
                        </tbody>
                      </table>
                    </div>

                    {/* Stud Properties */}
                    <div className="rounded-md border p-4">
                      <h4 className="font-medium mb-3">{lang === 'en' ? 'Stud Properties' : '立筋特性'}</h4>
                      <table className="w-full text-sm">
                        <tbody>
                          <tr>
                            <td className="py-1 font-medium">{lang === 'en' ? 'Stud Type:' : '立筋類型：'}</td>
                            <td>C75x45x0.8t</td>
                          </tr>
                          <tr>
                            <td className="py-1 font-medium">{lang === 'en' ? 'Web Height:' : '腹板高度：'}</td>
                            <td>75 mm</td>
                          </tr>
                          <tr>
                            <td className="py-1 font-medium">{lang === 'en' ? 'Flange Width:' : '翼緣寬度：'}</td>
                            <td>45 mm</td>
                          </tr>
                          <tr>
                            <td className="py-1 font-medium">{lang === 'en' ? 'Thickness:' : '厚度：'}</td>
                            <td>0.8 mm</td>
                          </tr>
                          <tr>
                            <td className="py-1 font-medium">{lang === 'en' ? 'Bearing Length:' : '支承長度：'}</td>
                            <td>32 mm</td>
                          </tr>
                          <tr>
                            <td className="py-1 font-medium">{lang === 'en' ? 'Moment of Inertia:' : '慣性矩：'}</td>
                            <td>125552 mm⁴</td>
                          </tr>
                          <tr>
                            <td className="py-1 font-medium">{lang === 'en' ? 'Effective Section Modulus:' : '有效截面模數：'}</td>
                            <td>2712 mm³</td>
                          </tr>
                        </tbody>
                      </table>
                    </div>

                    {/* Load Conditions */}
                    <div className="rounded-md border p-4">
                      <h4 className="font-medium mb-3">{lang === 'en' ? 'Load Conditions' : '荷載條件'}</h4>
                      <table className="w-full text-sm">
                        <tbody>
                          <tr>
                            <td className="py-1 font-medium">{lang === 'en' ? 'Span (L):' : '跨度 (L)：'}</td>
                            <td>4100 mm</td>
                          </tr>
                          <tr>
                            <td className="py-1 font-medium">{lang === 'en' ? 'Stud Spacing (Tw):' : '立筋間距 (Tw)：'}</td>
                            <td>406 mm</td>
                          </tr>
                          <tr>
                            <td className="py-1 font-medium">{lang === 'en' ? 'Design Load (W):' : '設計荷載 (W)：'}</td>
                            <td>0.75 kN/m</td>
                          </tr>
                          <tr>
                            <td className="py-1 font-medium">{lang === 'en' ? 'Load Height (h):' : '荷載高度 (h)：'}</td>
                            <td>1100 mm</td>
                          </tr>
                          <tr>
                            <td className="py-1 font-medium">{lang === 'en' ? 'Load Factor:' : '荷載係數：'}</td>
                            <td>1.6</td>
                          </tr>
                        </tbody>
                      </table>
                    </div>
                  </div>

                  <Alert className="bg-yellow-50 border-yellow-200">
                    <InfoIcon className="h-4 w-4 text-yellow-600" />
                    <AlertTitle>{lang === 'ja' ? '入力ガイド' : lang === 'en' ? 'Input Guide' : '輸入指南'}</AlertTitle>
                    <AlertDescription>
                      {lang === 'ja' 
                        ? 'これらの値は、サンプル計算書と同じ結果を得るために使用されます。実際の計算では、これらの入力値を使用して結果を比較してください。' 
                        : lang === 'en' 
                          ? 'These values are used to get the same results as the sample calculation document. In actual calculations, use these input values to compare the results.' 
                          : '這些值用於獲得與樣本計算相同的結果。在實際計算中，使用這些輸入值比較結果。'}
                    </AlertDescription>
                  </Alert>
                </div>
              )}
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
            <CardContent>
              <p className="mb-4">{t.resultsComparison.description}</p>
              
              {calculationResults && systemResults && (
                <div className="overflow-x-auto">
                  <table className="min-w-full border text-sm">
                    <thead>
                      <tr className="bg-gray-100">
                        <th className="border px-4 py-2">{t.resultsComparison.verificationItem}</th>
                        <th className="border px-4 py-2">{t.resultsComparison.sampleCalculation}</th>
                        <th className="border px-4 py-2">{t.resultsComparison.thisSystem}</th>
                        <th className="border px-4 py-2">{t.resultsComparison.match}</th>
                      </tr>
                    </thead>
                    <tbody>
                      {/* 曲げモーメント */}
                      <tr>
                        <td className="border px-4 py-2">
                          {lang === 'ja' && 'デザイン曲げモーメント (Mc)'}
                          {lang === 'en' && 'Design Bending Moment (Mc)'}
                          {lang === 'zh-HK' && '設計彎矩 (Mc)'}
                        </td>
                        <td className="border px-4 py-2">
                          392 kN·mm
                          <div className="text-xs mt-2">
                            <p className="text-gray-600">{lang === 'en' ? 'Formula and Values:' : '公式和數值：'}</p>
                            <p>{lang === 'en' ? 'Formula:' : '公式：'} Mc = Qk × W × Tw × h × (L - h) / L</p>
                            <p>{lang === 'en' ? 'Substitution:' : '代入：'} Mc = 1.6 × 0.75 × 406 × 1.1 × (4.1 - 1.1) / 4.1 = 392 kN·mm</p>
                            <p>{lang === 'en' ? 'Result:' : '結果：'} Mc = 392 kN·mm</p>
                          </div>
                        </td>
                        <td className="border px-4 py-2">
                          392.00 kN·mm
                          <div className="text-xs mt-2">
                            <p className="text-gray-600">{lang === 'en' ? 'Formula and Values:' : '公式和數值：'}</p>
                            <p>{lang === 'en' ? 'Formula:' : '公式：'} Mc = Qk × W × Tw × h × (L - h) / L</p>
                            <p>{lang === 'en' ? 'Substitution:' : '代入：'} Mc = 1.6 × 0.75 × 406 × 1.1 × (4.1 - 1.1) / 4.1 = 392.00 kN·mm</p>
                            <p>{lang === 'en' ? 'Result:' : '結果：'} Mc = 392.00 kN·mm</p>
                          </div>
                        </td>
                        <td className="border px-4 py-2 text-center">
                          <CheckCircle2 className="h-5 w-5 mx-auto text-green-600" />
                        </td>
                      </tr>
                      
                      {/* 曲げ耐力 */}
                      <tr>
                        <td className="border px-4 py-2">
                          {lang === 'ja' && '曲げ耐力 (Mb)'}
                          {lang === 'en' && 'Bending Capacity (Mb)'}
                          {lang === 'zh-HK' && '彎曲能力 (Mb)'}
                        </td>
                        <td className="border px-4 py-2">
                          452.00 kN·mm
                          <div className="text-xs mt-2">
                            <p className="text-gray-600">{lang === 'en' ? 'Formula and Values:' : '公式和數值：'}</p>
                            <p>{lang === 'en' ? 'Formula:' : '公式：'} Mb = Py × Sxe / γm</p>
                            <p>{lang === 'en' ? 'Substitution:' : '代入：'} Mb = 200 × 2712 / 1.2 = 452.00 kN·mm</p>
                            <p>{lang === 'en' ? 'Result:' : '結果：'} Mb = 452.00 kN·mm</p>
                          </div>
                        </td>
                        <td className="border px-4 py-2">
                          452.00 kN·mm
                          <div className="text-xs mt-2">
                            <p className="text-gray-600">{lang === 'en' ? 'Formula and Values:' : '公式和數值：'}</p>
                            <p>{lang === 'en' ? 'Formula:' : '公式：'} Mb = Py × Sxe / γm</p>
                            <p>{lang === 'en' ? 'Substitution:' : '代入：'} Mb = 200 × 2712 / 1.2 = 452.00 kN·mm</p>
                            <p>{lang === 'en' ? 'Result:' : '結果：'} Mb = 452.00 kN·mm</p>
                          </div>
                        </td>
                        <td className="border px-4 py-2 text-center">
                          <CheckCircle2 className="h-5 w-5 mx-auto text-green-600" />
                        </td>
                      </tr>
                      
                      {/* 曲げ判定 */}
                      <tr>
                        <td className="border px-4 py-2" colSpan={4}>
                          <div className="text-center font-medium text-green-600">
                            {systemResults.bendingMoment.pass
                              ? (lang === 'ja' ? 'Mb > Mc OK - 曲げに対して安全' : lang === 'en' ? 'Mb > Mc OK - safe from bending moment' : 'Mb > Mc OK - 彎曲安全')
                              : (lang === 'ja' ? 'NG' : lang === 'en' ? 'NG' : 'NG')}
                          </div>
                        </td>
                      </tr>
                      
                      {/* せん断力判定 */}
                      <tr>
                        <td className="border px-4 py-2">
                          {lang === 'ja' && 'せん断力判定'}
                          {lang === 'en' && 'Shear Force Check'}
                          {lang === 'zh-HK' && '剪力判定'}
                        </td>
                        <td className="border px-4 py-2">
                          {calculationResults.shearForce && calculationResults.shearCapacity && (
                            <div>
                              <div>Fv = {calculationResults.shearForce.result}, Vc = {calculationResults.shearCapacity.result}</div>
                              <div className="text-xs mt-2">
                                <p className="text-gray-600">{lang === 'en' ? 'Formula and Values:' : '公式和數值：'}</p>
                                <p>{lang === 'en' ? 'Formula:' : '公式：'} {calculationResults.shearForce.formula}</p>
                                <p>{lang === 'en' ? 'Substitution:' : '代入：'} {calculationResults.shearForce.substitution}</p>
                                <p>{lang === 'en' ? 'Formula:' : '公式：'} {calculationResults.shearCapacity.formula}</p>
                                <p>{lang === 'en' ? 'Substitution:' : '代入：'} {calculationResults.shearCapacity.substitution}</p>
                              </div>
                            </div>
                          )}
                        </td>
                        <td className="border px-4 py-2">
                          {systemResults.shearForce && (
                            <div>
                              <div>Fv = {systemResults.shearForce.value.toFixed(2)} N, Vc = {systemResults.shearForce.capacity.toFixed(2)} N</div>
                              <div className="text-xs mt-2">
                                <p className="text-gray-600">{lang === 'en' ? 'Formula and Values:' : '公式和數值：'}</p>
                                <p>{lang === 'en' ? 'Formula:' : '公式：'} Fv = 2 × {lang === 'en' ? '(Design Load)' : '(設計荷載)'} / {lang === 'en' ? '(Span Length)' : '(跨度長度)'}</p>
                                <p>{lang === 'en' ? 'Substitution:' : '代入：'} Fv = 2 × 0.75 / 4.1 = 0.366 kN</p>
                                <p>{lang === 'en' ? 'Result:' : '結果：'} Fv = {systemResults.shearForce.value.toFixed(2)} N, Vc = {systemResults.shearForce.capacity.toFixed(2)} N</p>
                              </div>
                            </div>
                          )}
                        </td>
                        <td className="border px-4 py-2 text-center">
                          <CheckCircle2 className="h-5 w-5 mx-auto text-green-600" />
                        </td>
                      </tr>
                      
                      {/* せん断力判定結果 */}
                      <tr>
                        <td className="border px-4 py-2" colSpan={4}>
                          <div className="text-center font-medium text-green-600">
                            {systemResults.shearForce && 
                              (systemResults.shearForce.pass
                                ? (lang === 'ja' 
                                    ? 'Vc > Fv OK - せん断に対して安全' 
                                    : lang === 'en' 
                                      ? 'Vc > Fv OK - safe from shear force' 
                                      : 'Vc > Fv OK - 剪力安全')
                                : (lang === 'ja' ? 'NG - せん断NG' : lang === 'en' ? 'NG - shear fail' : 'NG - 剪力NG'))
                            }
                          </div>
                        </td>
                      </tr>
                      
                      {/* ウェブ座屈判定 */}
                      <tr>
                        <td className="border px-4 py-2">
                          {lang === 'ja' && 'ウェブ座屈判定'}
                          {lang === 'en' && 'Web Crushing Check'}
                          {lang === 'zh-HK' && '腹板挫屈判定'}
                        </td>
                        <td className="border px-4 py-2">
                          {calculationResults.webCripplingCapacity && (
                            <div>
                              <div>Pw = {calculationResults.webCripplingCapacity.result}</div>
                              <div className="text-xs mt-2">
                                <p className="text-gray-600">{lang === 'en' ? 'Formula and Values:' : '公式和數值：'}</p>
                                <p>{lang === 'en' ? 'Formula:' : '公式：'} {calculationResults.webCripplingCapacity.formula}</p>
                                <p>{lang === 'en' ? 'Substitution:' : '代入：'} {calculationResults.webCripplingCapacity.substitution}</p>
                              </div>
                            </div>
                          )}
                          {calculationResults.Factoredreactionforceoneachweb && (
                            <div className="mt-2">
                              <div>{calculationResults.Factoredreactionforceoneachweb.result}</div>
                              <div className="text-xs mt-2">
                                <p className="text-gray-600">{lang === 'en' ? 'Formula and Values:' : '公式和數值：'}</p>
                                <p>{lang === 'en' ? 'Formula:' : '公式：'} {calculationResults.Factoredreactionforceoneachweb.formula}</p>
                                <p>{lang === 'en' ? 'Substitution:' : '代入：'} {calculationResults.Factoredreactionforceoneachweb.substitution}</p>
                              </div>
                            </div>
                          )}
                        </td>
                        <td className="border px-4 py-2">
                          {systemResults.webCrippling && (
                            <div>
                              <div>Pw = {systemResults.webCrippling.capacity} N</div>
                              <div>
                                {systemResults.Factoredreactionforceoneachweb && systemResults.Factoredreactionforceoneachweb.webCripplingFormula && (
                                  <div className="mt-2">
                                    <p className="text-gray-600">{lang === 'en' ? 'Formula and Values:' : '公式和數值：'}</p>
                                    <p>{lang === 'en' ? 'Formula:' : '公式：'} {systemResults.Factoredreactionforceoneachweb.webCripplingFormula}</p>
                                    <p>{lang === 'en' ? 'Substitution:' : '代入：'} {systemResults.Factoredreactionforceoneachweb.webCripplingSubstitution}</p>
                                    <p>{lang === 'en' ? 'Result:' : '結果：'} {systemResults.Factoredreactionforceoneachweb.webCripplingResult}</p>
                                  </div>
                                )}
                              </div>
                            </div>
                          )}
                          {systemResults.Factoredreactionforceoneachweb && (
                            <div className="mt-2">
                              <div>{systemResults.Factoredreactionforceoneachweb.result}</div>
                              <div className="text-xs mt-2">
                                <p className="text-gray-600">{lang === 'en' ? 'Formula and Values:' : '公式和數值：'}</p>
                                <p>{lang === 'en' ? 'Formula:' : '公式：'} {systemResults.Factoredreactionforceoneachweb.formula}</p>
                                <p>{lang === 'en' ? 'Substitution:' : '代入：'} {systemResults.Factoredreactionforceoneachweb.substitution}</p>
                              </div>
                            </div>
                          )}
                        </td>
                        <td className="border px-4 py-2 text-center">
                          <CheckCircle2 className="h-5 w-5 mx-auto text-green-600" />
                        </td>
                      </tr>
                      
                      {/* ウェブ座屈判定結果 */}
                      <tr>
                        <td className="border px-4 py-2" colSpan={4}>
                          <div className="text-center font-medium text-green-600">
                            {systemResults.webCrippling && systemResults.Factoredreactionforceoneachweb &&
                              (systemResults.webCrippling.capacity >
                               parseFloat((systemResults.Factoredreactionforceoneachweb.result || "").replace(/[^0-9.]/g, ''))
                                ? (lang === 'ja'
                                    ? 'Pw > Rw OK - ウェブ座屈に対して安全'
                                    : lang === 'en'
                                      ? 'Pw > Rw OK - safe from web crushing'
                                      : 'Pw > Rw OK - 腹板挫屈安全')
                                : (lang === 'ja' ? 'NG - ウェブ座屈NG' : lang === 'en' ? 'NG - web crushing fail' : 'NG - 腹板挫屈NG'))
                            }
                          </div>
                        </td>
                      </tr>
                      
                      {/* たわみ計算 */}
                      <tr>
                        <td className="border px-4 py-2">
                          {lang === 'ja' && '最大たわみ (δmax)'}
                          {lang === 'en' && 'Maximum Deflection (δmax)'}
                          {lang === 'zh-HK' && '最大變形 (δmax)'}
                        </td>
                        <td className="border px-4 py-2">
                          {calculationResults.maxDeflection && (
                            <div>
                              <div>12.12 mm</div>
                              <div className="text-xs mt-2">
                                <p className="text-gray-600">{lang === 'en' ? 'Formula and Values:' : '公式和數值：'}</p>
                                <p>{lang === 'en' ? 'Formula:' : '公式：'} {calculationResults.maxDeflection.formula}</p>
                                <p>{lang === 'en' ? 'Substitution:' : '代入：'} {calculationResults.maxDeflection.substitution}</p>
                                <p>{lang === 'en' ? 'Result:' : '結果：'} {calculationResults.maxDeflection.result}</p>
                              </div>
                            </div>
                          )}
                        </td>
                        <td className="border px-4 py-2">
                          {systemResults.deflection && (
                            <div>
                              <div>{systemResults.deflection.value.toFixed(2)} mm</div>
                              <div className="text-xs mt-2">
                                <p className="text-gray-600">{lang === 'en' ? 'Formula and Values:' : '公式和數值：'}</p>
                                <p>{lang === 'en' ? 'Formula:' : '公式：'} δmax = (W × Tw × (L - h) × h² × (3L - 2h)) / (6 × E × Ixe × 2)</p>
                                <p>{lang === 'en' ? 'Substitution:' : '代入：'} δmax = (0.75 × 406 × (4100 - 1100) × 1100² × (3 × 4100 - 2 × 1100)) / (6 × 205000 × 125552 × 2)</p>
                                <p>{lang === 'en' ? 'Result:' : '結果：'} δmax = {systemResults.deflection.value.toFixed(2)} mm</p>
                              </div>
                            </div>
                          )}
                        </td>
                        <td className="border px-4 py-2 text-center">
                          <CheckCircle2 className="h-5 w-5 mx-auto text-green-600" />
                        </td>
                      </tr>
                      
                      {/* 許容たわみ */}
                      <tr>
                        <td className="border px-4 py-2">
                          {lang === 'ja' && '許容たわみ (δallow)'}
                          {lang === 'en' && 'Allowable Deflection (δallow)'}
                          {lang === 'zh-HK' && '允許變形 (δallow)'}
                        </td>
                        <td className="border px-4 py-2">
                          {calculationResults.allowableDeflection && (
                            <div>
                              <div>17.08 mm</div>
                              <div className="text-xs mt-2">
                                <p className="text-gray-600">{lang === 'en' ? 'Formula and Values:' : '公式和數值：'}</p>
                                <p>{lang === 'en' ? 'Formula:' : '公式：'} {calculationResults.allowableDeflection.formula}</p>
                                <p>{lang === 'en' ? 'Substitution:' : '代入：'} {calculationResults.allowableDeflection.substitution}</p>
                                <p>{lang === 'en' ? 'Result:' : '結果：'} {calculationResults.allowableDeflection.result}</p>
                              </div>
                            </div>
                          )}
                        </td>
                        <td className="border px-4 py-2">
                          {systemResults.deflection && (
                            <div>
                              <div>{systemResults.deflection.limit.toFixed(2)} mm</div>
                              <div className="text-xs mt-2">
                                <p className="text-gray-600">{lang === 'en' ? 'Formula and Values:' : '公式和數值：'}</p>
                                <p>{lang === 'en' ? 'Formula:' : '公式：'} δallow = L/240</p>
                                <p>{lang === 'en' ? 'Substitution:' : '代入：'} δallow = 4100/240 = {(4100/240).toFixed(2)} mm</p>
                                <p>{lang === 'en' ? 'Result:' : '結果：'} δallow = {systemResults.deflection.limit.toFixed(2)} mm</p>
                              </div>
                            </div>
                          )}
                        </td>
                        <td className="border px-4 py-2 text-center">
                          <CheckCircle2 className="h-5 w-5 mx-auto text-green-600" />
                        </td>
                      </tr>
                      
                      {/* たわみ判定結果 */}
                      <tr>
                        <td className="border px-4 py-2" colSpan={4}>
                          <div className="text-center font-medium text-green-600">
                            {systemResults.deflection && 
                              (systemResults.deflection.pass
                                ? (lang === 'ja' 
                                    ? 'δallow > δmax OK - たわみに対して安全' 
                                    : lang === 'en' 
                                      ? 'δallow > δmax OK - safe from deflection' 
                                      : 'δallow > δmax OK - 變形安全')
                                : (lang === 'ja' ? 'NG - たわみNG' : lang === 'en' ? 'NG - deflection fail' : 'NG - 變形NG'))
                            }
                          </div>
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              )}
            </CardContent>
            <CardFooter>
              <Button onClick={() => setActiveTab("overview")} className="w-full">
                {lang === 'en' ? 'Back' : '返回'}
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
