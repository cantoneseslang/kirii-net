"use client"

import { useState } from "react"
import Link from "next/link"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { Button } from "@/components/ui/button"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ArrowLeft, BookOpen } from "lucide-react"
import { calculateWallStud } from "@/lib/wall-stud-calculator"
import LanguageSwitcher from "@/components/language-switcher"

const formSchema = z.object({
  // Project basic info
  projectName: z.string().min(1),
  projectDetail: z.string().optional(),
  calculationDate: z.string().min(1),
  author: z.string().min(1),

  // Material properties
  yieldStrength: z.coerce.number().min(1),
  elasticModulus: z.coerce.number().min(1),
  materialFactor: z.coerce.number().min(1),

  // Component section properties
  studType: z.string().min(1),
  bearingLength: z.coerce.number().min(1),

  // Geometric configuration
  span: z.coerce.number().min(1),
  tributaryWidth: z.coerce.number().min(1),

  // Load conditions
  windLoadFactor: z.coerce.number().min(1),
  imposedLoadFactor: z.coerce.number().min(1),
  deadLoadFactor: z.coerce.number().min(1),
  fixtureFactor: z.coerce.number().min(1),

  // Wind load
  windLoad: z.coerce.number().min(0),

  // Imposed load
  imposedLoad: z.coerce.number().min(0),
  imposedLoadHeight: z.coerce.number().min(0),

  // Dead load
  wallBoardLayers: z.coerce.number().min(0),
  wallBoardWeight: z.coerce.number().min(0),
  insulationPresent: z.string(),
  insulationThickness: z.coerce.number().optional(),
  metalFrameWeight: z.coerce.number().min(0),

  // Wall fixture data
  fixtureWeight: z.coerce.number().min(0),
  fixtureHeight: z.coerce.number().min(0),
  fixtureDistance: z.coerce.number().min(0),

  // Deflection criteria
  deflectionCriteria: z.string().min(1),
  customDeflection: z.coerce.number().optional(),
})

// Stud database (in actual implementation, this would be fetched from API)
const studDatabase = [
  {
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
  },
  {
    id: "C75x45x1.0t",
    name: "C75x45x1.0t",
    webHeight: 75,
    flangeWidth: 45,
    thickness: 1.0,
    cornerRadius: 1.5,
    area: 1.95,
    momentOfInertia: 18.1,
    sectionModulus: 4.83,
    effectiveArea: 1.85,
    effectiveMomentOfInertia: 17.2,
    effectiveSectionModulus: 4.59,
  },
  {
    id: "C100x45x0.8t",
    name: "C100x45x0.8t",
    webHeight: 100,
    flangeWidth: 45,
    thickness: 0.8,
    cornerRadius: 1.5,
    area: 1.81,
    momentOfInertia: 28.3,
    sectionModulus: 5.66,
    effectiveArea: 1.68,
    effectiveMomentOfInertia: 26.9,
    effectiveSectionModulus: 5.38,
  },
]

// ダミーの計算関数（本来は使用しないが、型の互換性のため残しておく）
export function calculateWallStudDummy(values: any, stud: any) {
  return {
    bendingMoment: { value: 0, capacity: 0, ratio: 0, pass: true },
    shearForce: { value: 0, capacity: 0, ratio: 0, pass: true },
    webCrippling: { value: 0, capacity: 0, ratio: 0, pass: true },
    Factoredreactionforceoneachweb: {
      formula: "Tw × W / 2",
      substitution: "406 × 0.75 / 2 = 152 N",
      result: "Rw = 152 N",
      judgment: "Pw > Rw OK - safe from web crushing"
    },
    deflection: { value: 0, limit: 0, ratio: 0, pass: true },
    combinedAction: { value: 0, limit: 0, pass: true },
    overallResult: true,
  }
}

// 計算結果の型定義
interface WallStudResults {
  bendingMoment: {
    value: number
    capacity: number
    ratio: number
    pass: boolean
  }
  shearForce: {
    value: number
    capacity: number
    ratio: number
    pass: boolean
  }
  webCrippling: {
    value: number
    capacity: number
    ratio: number
    pass: boolean
  }
  Factoredreactionforceoneachweb?: {
    formula: string
    substitution: string
    result: string
    judgment?: string
  }
  deflection: {
    value: number
    limit: number
    ratio: number
    pass: boolean
  }
  combinedAction: {
    value: number
    limit: number
    pass: boolean
  }
  overallResult: boolean
}

export default function WallStudCalculator({ dict, lang }: { dict: any; lang: string }) {
  const [calculationResults, setCalculationResults] = useState<WallStudResults | null>(null)

  // Get current date
  const today = new Date().toISOString().split("T")[0]

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      // Project basic info
      projectName: "",
      projectDetail: "",
      calculationDate: today,
      author: "",

      // Material properties
      yieldStrength: 200,
      elasticModulus: 205000,
      materialFactor: 1.2,

      // Component section properties
      studType: "C75x45x0.8t",
      bearingLength: 32,

      // Geometric configuration
      span: 0,
      tributaryWidth: 610,

      // Load conditions
      windLoadFactor: 1.5,
      imposedLoadFactor: 1.5,
      deadLoadFactor: 1.5,
      fixtureFactor: 1.5,

      // Wind load
      windLoad: 0.24,

      // Imposed load
      imposedLoad: 0.75,
      imposedLoadHeight: 1.1,

      // Dead load
      wallBoardLayers: 1,
      wallBoardWeight: 13.0,
      insulationPresent: "no",
      insulationThickness: 0,
      metalFrameWeight: 15,

      // Wall fixture data
      fixtureWeight: 8.0,
      fixtureHeight: 1.8,
      fixtureDistance: 600,

      // Deflection criteria
      deflectionCriteria: "L/240",
      customDeflection: 0,
    },
  })

  function onSubmit(values: z.infer<typeof formSchema>) {
    // Get the selected stud information
    const selectedStud = studDatabase.find((stud) => stud.id === values.studType)

    if (!selectedStud) {
      console.error("Selected stud not found")
      return
    }

    // Execute calculation
    const results = calculateWallStud(values, selectedStud)
    setCalculationResults(results)
  }

  // Function to load sample data
  const loadSampleData = () => {
    form.reset({
      // Project basic info
      projectName: "葛量洪醫院",
      projectDetail: "C 75x45x0.8t/4100H/406o.c.",
      calculationDate: "2025-05-16",
      author: "TC",

      // Material properties
      yieldStrength: 200,
      elasticModulus: 205000,
      materialFactor: 1.2,

      // Component section properties
      studType: "C75x45x0.8t",
      bearingLength: 32,

      // Geometric configuration
      span: 4100,
      tributaryWidth: 406,

      // Load conditions
      windLoadFactor: 1.5,
      imposedLoadFactor: 1.6, // サンプル計算書の値
      deadLoadFactor: 1.5,
      fixtureFactor: 1.5,

      // Wind load
      windLoad: 0, // サンプル計算書では風荷重を考慮していない

      // Imposed load
      imposedLoad: 0.75,
      imposedLoadHeight: 1.1,

      // Dead load
      wallBoardLayers: 0, // サンプル計算書では死荷重を考慮していない
      wallBoardWeight: 0,
      insulationPresent: "no",
      insulationThickness: 0,
      metalFrameWeight: 0,

      // Wall fixture data
      fixtureWeight: 0, // サンプル計算書では取り付け物を考慮していない
      fixtureHeight: 0,
      fixtureDistance: 0,

      // Deflection criteria
      deflectionCriteria: "L/240",
      customDeflection: 0,
    })
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <div className="flex items-center">
          <Link href={`/${lang}`} className="mr-4">
            <Button variant="outline" size="icon">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <h1 className="text-3xl font-bold">{dict.wallStud.title}</h1>
        </div>
        <div className="flex items-center gap-4">
          <Button variant="outline" onClick={loadSampleData} className="flex items-center gap-2">
            <BookOpen className="h-4 w-4" />
            サンプルデータ読込
          </Button>
          <LanguageSwitcher currentLang={lang} />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
              <Tabs defaultValue="project" className="w-full">
                <TabsList className="grid grid-cols-5 w-full">
                  <TabsTrigger value="project">{dict.wallStud.tabs.project}</TabsTrigger>
                  <TabsTrigger value="material">{dict.wallStud.tabs.material}</TabsTrigger>
                  <TabsTrigger value="geometry">{dict.wallStud.tabs.geometry}</TabsTrigger>
                  <TabsTrigger value="loads">{dict.wallStud.tabs.loads}</TabsTrigger>
                  <TabsTrigger value="fixtures">{dict.wallStud.tabs.fixtures}</TabsTrigger>
                </TabsList>

                <TabsContent value="project" className="space-y-4 mt-4">
                  <Card>
                    <CardHeader>
                      <CardTitle>{dict.wallStud.projectInfo.title}</CardTitle>
                      <CardDescription>{dict.wallStud.projectInfo.description}</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <FormField
                        control={form.control}
                        name="projectName"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>{dict.wallStud.projectInfo.projectName}</FormLabel>
                            <FormControl>
                              <Input placeholder={dict.wallStud.projectInfo.projectNamePlaceholder} {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="projectDetail"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>{dict.wallStud.projectInfo.projectDetail}</FormLabel>
                            <FormControl>
                              <Input placeholder={dict.wallStud.projectInfo.projectDetailPlaceholder} {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <FormField
                          control={form.control}
                          name="calculationDate"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>{dict.wallStud.projectInfo.calculationDate}</FormLabel>
                              <FormControl>
                                <Input type="date" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name="author"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>{dict.wallStud.projectInfo.author}</FormLabel>
                              <FormControl>
                                <Input placeholder={dict.wallStud.projectInfo.authorPlaceholder} {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>

                {/* 残りのタブコンテンツは省略 */}
              </Tabs>

              <div className="flex justify-end space-x-4">
                <Button type="submit">{dict.common.calculate}</Button>
              </div>
            </form>
          </Form>
        </div>

        <div className="lg:col-span-1">
          {calculationResults ? (
            <Card>
              <CardHeader>
                <CardTitle>{dict.wallStud.results.title}</CardTitle>
                <CardDescription>{dict.wallStud.results.description}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="rounded-md border p-4">
                  <h3 className="font-medium mb-2">{dict.wallStud.results.overallJudgment}</h3>
                  <div
                    className={`text-center p-2 rounded-md ${
                      calculationResults.overallResult ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"
                    }`}
                  >
                    {calculationResults.overallResult
                      ? dict.wallStud.results.suitable
                      : dict.wallStud.results.unsuitable}
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="grid grid-cols-3 gap-2 text-sm font-medium">
                    <div>{dict.wallStud.results.verificationItem}</div>
                    <div>{dict.wallStud.results.calculatedValueCapacity}</div>
                    <div>{dict.wallStud.results.judgment}</div>
                  </div>

                  <div className="grid grid-cols-3 gap-2 text-sm border-t pt-2">
                    <div>{dict.wallStud.results.bendingMoment}</div>
                    <div>
                      {calculationResults.bendingMoment.value.toFixed(2)} /{" "}
                      {calculationResults.bendingMoment.capacity.toFixed(2)} kN·mm
                    </div>
                    <div
                      className={`px-2 py-1 rounded text-center ${
                        calculationResults.bendingMoment.pass
                          ? "bg-green-100 text-green-800"
                          : "bg-red-100 text-red-800"
                      }`}
                    >
                      {calculationResults.bendingMoment.pass ? dict.wallStud.results.pass : dict.wallStud.results.fail}
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-2 text-sm border-t pt-2">
                    <div>{dict.wallStud.results.shearForce}</div>
                    <div>
                      {calculationResults.shearForce.value.toFixed(2)} /{" "}
                      {calculationResults.shearForce.capacity.toFixed(2)} N
                    </div>
                    <div
                      className={`px-2 py-1 rounded text-center ${
                        calculationResults.shearForce.pass ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"
                      }`}
                    >
                      {calculationResults.shearForce.pass ? dict.wallStud.results.pass : dict.wallStud.results.fail}
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-2 text-sm border-t pt-2">
                    <div>{dict.wallStud.results.webBuckling}</div>
                    <div>
                      {calculationResults.webCrippling.value.toFixed(2)} /{" "}
                      {calculationResults.webCrippling.capacity.toFixed(2)} N
                    </div>
                    <div
                      className={`px-2 py-1 rounded text-center ${
                        calculationResults.webCrippling.pass ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"
                      }`}
                    >
                      {calculationResults.webCrippling.pass ? dict.wallStud.results.pass : dict.wallStud.results.fail}
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-2 text-sm border-t pt-2">
                    <div>{dict.wallStud.results.deflection}</div>
                    <div>
                      {calculationResults.deflection.value.toFixed(2)} /{" "}
                      {calculationResults.deflection.limit.toFixed(2)} mm
                    </div>
                    <div
                      className={`px-2 py-1 rounded text-center ${
                        calculationResults.deflection.pass ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"
                      }`}
                    >
                      {calculationResults.deflection.pass ? dict.wallStud.results.pass : dict.wallStud.results.fail}
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-2 text-sm border-t pt-2">
                    <div>{dict.wallStud.results.combinedAction}</div>
                    <div>
                      {calculationResults.combinedAction.value.toFixed(2)} /{" "}
                      {calculationResults.combinedAction.limit.toFixed(2)}
                    </div>
                    <div
                      className={`px-2 py-1 rounded text-center ${
                        calculationResults.combinedAction.pass
                          ? "bg-green-100 text-green-800"
                          : "bg-red-100 text-red-800"
                      }`}
                    >
                      {calculationResults.combinedAction.pass ? dict.wallStud.results.pass : dict.wallStud.results.fail}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardHeader>
                <CardTitle>{dict.wallStud.results.title}</CardTitle>
                <CardDescription>{dict.wallStud.results.description}</CardDescription>
              </CardHeader>
              <CardContent className="h-64 flex items-center justify-center">
                <p className="text-muted-foreground text-center">{dict.wallStud.results.waitingMessage}</p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  )
}
