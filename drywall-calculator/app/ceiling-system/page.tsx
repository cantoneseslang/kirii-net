"use client"

import { useState } from "react"
import Link from "next/link"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { Button } from "@/components/ui/button"
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { ArrowLeft, Calculator, FileText, Save } from "lucide-react"
import { calculateCeilingSystem } from "@/components/ceiling-system-calculator"
import CeilingSystemResults from "@/components/ceiling-system-results"

const formSchema = z.object({
  // プロジェクト基本情報
  projectName: z.string().min(1, { message: "案件名を入力してください" }),
  projectDetail: z.string().optional(),
  calculationDate: z.string().min(1, { message: "計算日を入力してください" }),
  author: z.string().min(1, { message: "作成者を入力してください" }),

  // 材料特性
  yieldStrength: z.coerce.number().min(1, { message: "降伏強度を入力してください" }),
  elasticModulus: z.coerce.number().min(1, { message: "弾性係数を入力してください" }),
  materialFactor: z.coerce.number().min(1, { message: "材料係数を入力してください" }),

  // 部材の断面特性
  runnerType: z.string().min(1, { message: "ランナーの種類を選択してください" }),
  hangerType: z.string().min(1, { message: "ハンガーの種類を選択してください" }),
  anchorType: z.string().min(1, { message: "アンカーの種類を選択してください" }),

  // 幾何学的配置
  runnerSpan: z.coerce.number().min(1, { message: "ランナー支持間距離を入力してください" }),
  hangerSpacing: z.coerce.number().min(1, { message: "ハンガー間隔を入力してください" }),
  runnerSpacing: z.coerce.number().min(1, { message: "ランナー間隔を入力してください" }),

  // 荷重条件
  windLoadFactor: z.coerce.number().min(1, { message: "風荷重係数を入力してください" }),
  deadLoadFactor: z.coerce.number().min(1, { message: "死荷重係数を入力してください" }),
  installationFactor: z.coerce.number().min(1, { message: "施工荷重係数を入力してください" }),

  // 風荷重
  windLoad: z.coerce.number().min(0, { message: "風荷重を入力してください" }),

  // 死荷重
  ceilingBoardLayers: z.coerce.number().min(1, { message: "天井ボードの層数を入力してください" }),
  ceilingBoardWeight: z.coerce.number().min(0, { message: "天井ボードの単位面積重量を入力してください" }),
  insulationPresent: z.string(),
  insulationThickness: z.coerce.number().optional(),
  metalFrameWeight: z.coerce.number().min(0, { message: "金属フレームの単位面積重量を入力してください" }),

  // たわみ基準
  deflectionCriteria: z.string().min(1, { message: "たわみ基準を選択してください" }),
  customDeflection: z.coerce.number().optional(),
})

// ランナーデータベース（実際の実装ではAPIから取得）
const runnerDatabase = [
  {
    id: "FRC38x12x0.8t",
    name: "FRCメインランナー 38x12x0.8t",
    webHeight: 38,
    flangeWidth: 12,
    thickness: 0.8,
    cornerRadius: 1.5,
    area: 0.86,
    momentOfInertia: 1.95,
    sectionModulus: 1.03,
    effectiveArea: 0.82,
    effectiveMomentOfInertia: 1.85,
    effectiveSectionModulus: 0.98,
  },
  {
    id: "RRC19x40x0.6t",
    name: "RRCランナー 19x40x0.6t",
    webHeight: 19,
    flangeWidth: 40,
    thickness: 0.6,
    cornerRadius: 1.5,
    area: 0.72,
    momentOfInertia: 0.43,
    sectionModulus: 0.45,
    effectiveArea: 0.68,
    effectiveMomentOfInertia: 0.41,
    effectiveSectionModulus: 0.43,
  },
]

// ハンガーデータベース
const hangerDatabase = [
  {
    id: "M8",
    name: "M8ねじ込み棒",
    diameter: 8,
    area: 36.6,
    tensileStrength: 400,
  },
  {
    id: "M10",
    name: "M10ねじ込み棒",
    diameter: 10,
    area: 58.0,
    tensileStrength: 400,
  },
  {
    id: "M12",
    name: "M12ねじ込み棒",
    diameter: 12,
    area: 84.3,
    tensileStrength: 400,
  },
]

// アンカーデータベース
const anchorDatabase = [
  {
    id: "HST3-M8",
    name: "Hilti HST3-M8",
    diameter: 8,
    characteristicResistance: 9.3,
    designResistance: 6.2,
    recommendedLoad: 4.4,
  },
  {
    id: "HST3-M10",
    name: "Hilti HST3-M10",
    diameter: 10,
    characteristicResistance: 16.8,
    designResistance: 11.2,
    recommendedLoad: 8.0,
  },
  {
    id: "HST3-M12",
    name: "Hilti HST3-M12",
    diameter: 12,
    characteristicResistance: 24.7,
    designResistance: 16.5,
    recommendedLoad: 11.8,
  },
]

export default function CeilingSystemCalculator() {
  const [calculationResults, setCalculationResults] = useState(null)

  // 現在の日付を取得
  const today = new Date().toISOString().split("T")[0]

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      // プロジェクト基本情報
      projectName: "",
      projectDetail: "",
      calculationDate: today,
      author: "",

      // 材料特性
      yieldStrength: 200,
      elasticModulus: 205000,
      materialFactor: 1.4,

      // 部材の断面特性
      runnerType: "FRC38x12x0.8t",
      hangerType: "M12",
      anchorType: "HST3-M12",

      // 幾何学的配置
      runnerSpan: 0,
      hangerSpacing: 920,
      runnerSpacing: 610,

      // 荷重条件
      windLoadFactor: 1.5,
      deadLoadFactor: 1.5,
      installationFactor: 1.4,

      // 風荷重
      windLoad: 0.24,

      // 死荷重
      ceilingBoardLayers: 1,
      ceilingBoardWeight: 9.5,
      insulationPresent: "no",
      insulationThickness: 0,
      metalFrameWeight: 3.0,

      // たわみ基準
      deflectionCriteria: "L/240",
      customDeflection: 0,
    },
  })

  function onSubmit(values: z.infer<typeof formSchema>) {
    // 選択された部材の情報を取得
    const selectedRunner = runnerDatabase.find((runner) => runner.id === values.runnerType)
    const selectedHanger = hangerDatabase.find((hanger) => hanger.id === values.hangerType)
    const selectedAnchor = anchorDatabase.find((anchor) => anchor.id === values.anchorType)

    if (!selectedRunner || !selectedHanger || !selectedAnchor) {
      console.error("選択された部材が見つかりません")
      return
    }

    // 計算を実行
    const results = calculateCeilingSystem(values, selectedRunner, selectedHanger, selectedAnchor)
    setCalculationResults(results)
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex items-center mb-8">
        <Link href="/" className="mr-4">
          <Button variant="outline" size="icon">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <h1 className="text-3xl font-bold">天井吊り下げシステム構造計算</h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
              <Tabs defaultValue="project" className="w-full">
                <TabsList className="grid grid-cols-5 w-full">
                  <TabsTrigger value="project">基本情報</TabsTrigger>
                  <TabsTrigger value="material">材料特性</TabsTrigger>
                  <TabsTrigger value="geometry">幾何学的配置</TabsTrigger>
                  <TabsTrigger value="loads">荷重条件</TabsTrigger>
                  <TabsTrigger value="deflection">たわみ基準</TabsTrigger>
                </TabsList>

                <TabsContent value="project" className="space-y-4 mt-4">
                  <Card>
                    <CardHeader>
                      <CardTitle>プロジェクト基本情報</CardTitle>
                      <CardDescription>計算対象のプロジェクト情報を入力してください</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <FormField
                        control={form.control}
                        name="projectName"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>案件名</FormLabel>
                            <FormControl>
                              <Input placeholder="例: ○○ビル改修工事" {...field} />
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
                            <FormLabel>計算対象詳細</FormLabel>
                            <FormControl>
                              <Input placeholder="例: 3階天井" {...field} />
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
                              <FormLabel>計算日</FormLabel>
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
                              <FormLabel>作成者</FormLabel>
                              <FormControl>
                                <Input placeholder="氏名" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>

                <TabsContent value="material" className="space-y-4 mt-4">
                  <Card>
                    <CardHeader>
                      <CardTitle>材料特性</CardTitle>
                      <CardDescription>部材の材料特性を入力してください</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <FormField
                          control={form.control}
                          name="yieldStrength"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>降伏強度 (MPa)</FormLabel>
                              <FormControl>
                                <Input type="number" {...field} />
                              </FormControl>
                              <FormDescription>Py</FormDescription>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name="elasticModulus"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>弾性係数 (MPa)</FormLabel>
                              <FormControl>
                                <Input type="number" {...field} />
                              </FormControl>
                              <FormDescription>E</FormDescription>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name="materialFactor"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>材料係数</FormLabel>
                              <FormControl>
                                <Input type="number" step="0.1" {...field} />
                              </FormControl>
                              <FormDescription>γm</FormDescription>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>

                      <Separator className="my-4" />

                      <FormField
                        control={form.control}
                        name="runnerType"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>ランナーの種類</FormLabel>
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="ランナーを選択" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                {runnerDatabase.map((runner) => (
                                  <SelectItem key={runner.id} value={runner.id}>
                                    {runner.name}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="hangerType"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>ハンガーの種類</FormLabel>
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="ハンガーを選択" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                {hangerDatabase.map((hanger) => (
                                  <SelectItem key={hanger.id} value={hanger.id}>
                                    {hanger.name}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="anchorType"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>アンカーの種類</FormLabel>
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="アンカーを選択" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                {anchorDatabase.map((anchor) => (
                                  <SelectItem key={anchor.id} value={anchor.id}>
                                    {anchor.name}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </CardContent>
                  </Card>
                </TabsContent>

                <TabsContent value="geometry" className="space-y-4 mt-4">
                  <Card>
                    <CardHeader>
                      <CardTitle>幾何学的配置</CardTitle>
                      <CardDescription>天井システムの設置条件を入力してください</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <FormField
                        control={form.control}
                        name="runnerSpan"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>ランナー支持間距離 (mm)</FormLabel>
                            <FormControl>
                              <Input type="number" {...field} />
                            </FormControl>
                            <FormDescription>L</FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <FormField
                          control={form.control}
                          name="hangerSpacing"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>ハンガー間隔 (mm)</FormLabel>
                              <FormControl>
                                <Input type="number" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name="runnerSpacing"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>ランナー間隔 (mm)</FormLabel>
                              <FormControl>
                                <Input type="number" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>

                <TabsContent value="loads" className="space-y-4 mt-4">
                  <Card>
                    <CardHeader>
                      <CardTitle>荷重条件</CardTitle>
                      <CardDescription>荷重条件を入力してください</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <FormField
                          control={form.control}
                          name="windLoadFactor"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>風荷重係数</FormLabel>
                              <FormControl>
                                <Input type="number" step="0.1" {...field} />
                              </FormControl>
                              <FormDescription>γW</FormDescription>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name="deadLoadFactor"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>死荷重係数</FormLabel>
                              <FormControl>
                                <Input type="number" step="0.1" {...field} />
                              </FormControl>
                              <FormDescription>γD</FormDescription>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name="installationFactor"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>施工荷重係数</FormLabel>
                              <FormControl>
                                <Input type="number" step="0.1" {...field} />
                              </FormControl>
                              <FormDescription>γI</FormDescription>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>

                      <Separator className="my-4" />

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <FormField
                          control={form.control}
                          name="windLoad"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>設計等分布風荷重 (kPa)</FormLabel>
                              <FormControl>
                                <Input type="number" step="0.01" {...field} />
                              </FormControl>
                              <FormDescription>ω</FormDescription>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>

                      <Separator className="my-4" />

                      <div className="space-y-4">
                        <h3 className="text-sm font-medium">死荷重</h3>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <FormField
                            control={form.control}
                            name="ceilingBoardLayers"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>天井ボードの層数</FormLabel>
                                <FormControl>
                                  <Input type="number" {...field} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />

                          <FormField
                            control={form.control}
                            name="ceilingBoardWeight"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>天井ボードの単位面積重量 (kgf/m²)</FormLabel>
                                <FormControl>
                                  <Input type="number" step="0.1" {...field} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </div>

                        <FormField
                          control={form.control}
                          name="insulationPresent"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>断熱材の有無</FormLabel>
                              <Select onValueChange={field.onChange} defaultValue={field.value}>
                                <FormControl>
                                  <SelectTrigger>
                                    <SelectValue placeholder="断熱材の有無を選択" />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                  <SelectItem value="no">なし</SelectItem>
                                  <SelectItem value="yes">あり</SelectItem>
                                </SelectContent>
                              </Select>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        {form.watch("insulationPresent") === "yes" && (
                          <FormField
                            control={form.control}
                            name="insulationThickness"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>断熱材の厚さ (mm)</FormLabel>
                                <FormControl>
                                  <Input type="number" {...field} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        )}

                        <FormField
                          control={form.control}
                          name="metalFrameWeight"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>金属フレームの単位面積重量 (kgf/m²)</FormLabel>
                              <FormControl>
                                <Input type="number" step="0.1" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>

                <TabsContent value="deflection" className="space-y-4 mt-4">
                  <Card>
                    <CardHeader>
                      <CardTitle>たわみ基準</CardTitle>
                      <CardDescription>許容たわみの基準を選択してください</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <FormField
                        control={form.control}
                        name="deflectionCriteria"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>たわみ基準</FormLabel>
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="たわみ基準を選択" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                <SelectItem value="L/240">L/240</SelectItem>
                                <SelectItem value="L/360">L/360</SelectItem>
                                <SelectItem value="custom">カスタム</SelectItem>
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      {form.watch("deflectionCriteria") === "custom" && (
                        <FormField
                          control={form.control}
                          name="customDeflection"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>カスタムたわみ基準 (L/n)</FormLabel>
                              <FormControl>
                                <Input type="number" {...field} />
                              </FormControl>
                              <FormDescription>nの値を入力</FormDescription>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      )}
                    </CardContent>
                  </Card>
                </TabsContent>
              </Tabs>

              <div className="flex justify-end space-x-4">
                <Button type="button" variant="outline">
                  <Save className="mr-2 h-4 w-4" />
                  保存
                </Button>
                <Button type="submit">
                  <Calculator className="mr-2 h-4 w-4" />
                  計算実行
                </Button>
              </div>
            </form>
          </Form>
        </div>

        <div className="lg:col-span-1">
          {calculationResults ? (
            <CeilingSystemResults results={calculationResults} />
          ) : (
            <Card>
              <CardHeader>
                <CardTitle>計算結果</CardTitle>
                <CardDescription>計算を実行すると結果がここに表示されます</CardDescription>
              </CardHeader>
              <CardContent className="h-64 flex items-center justify-center">
                <p className="text-muted-foreground text-center">
                  左側のフォームに必要な情報を入力し、「計算実行」ボタンをクリックしてください
                </p>
              </CardContent>
              <CardFooter className="flex justify-center">
                <Button variant="outline" disabled>
                  <FileText className="mr-2 h-4 w-4" />
                  レポート生成
                </Button>
              </CardFooter>
            </Card>
          )}
        </div>
      </div>
    </div>
  )
}
