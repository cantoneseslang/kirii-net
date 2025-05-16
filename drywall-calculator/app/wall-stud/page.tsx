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
import { calculateWallStud } from "@/components/wall-stud-calculator"
import WallStudResults from "@/components/wall-stud-results"

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
  studType: z.string().min(1, { message: "スタッドの種類を選択してください" }),
  bearingLength: z.coerce.number().min(1, { message: "支圧長さを入力してください" }),

  // 幾何学的配置
  span: z.coerce.number().min(1, { message: "支持間距離を入力してください" }),
  tributaryWidth: z.coerce.number().min(1, { message: "負担幅を入力してください" }),

  // 荷重条件
  windLoadFactor: z.coerce.number().min(1, { message: "風荷重係数を入力してください" }),
  imposedLoadFactor: z.coerce.number().min(1, { message: "積載荷重係数を入力してください" }),
  deadLoadFactor: z.coerce.number().min(1, { message: "死荷重係数を入力してください" }),
  fixtureFactor: z.coerce.number().min(1, { message: "取り付け物荷重係数を入力してください" }),

  // 風荷重
  windLoad: z.coerce.number().min(0, { message: "風荷重を入力してください" }),

  // 積載荷重
  imposedLoad: z.coerce.number().min(0, { message: "積載荷重を入力してください" }),
  imposedLoadHeight: z.coerce.number().min(0, { message: "荷重作用高さを入力してください" }),

  // 死荷重
  wallBoardLayers: z.coerce.number().min(1, { message: "壁ボードの層数を入力してください" }),
  wallBoardWeight: z.coerce.number().min(0, { message: "壁ボードの単位面積重量を入力してください" }),
  insulationPresent: z.string(),
  insulationThickness: z.coerce.number().optional(),
  metalFrameWeight: z.coerce.number().min(0, { message: "金属フレームの単位面積重量を入力してください" }),

  // 壁取り付け物データ
  fixtureWeight: z.coerce.number().min(0, { message: "取り付け物の質量を入力してください" }),
  fixtureHeight: z.coerce.number().min(0, { message: "取り付け高さを入力してください" }),
  fixtureDistance: z.coerce.number().min(0, { message: "スタッドからの水平距離を入力してください" }),

  // たわみ基準
  deflectionCriteria: z.string().min(1, { message: "たわみ基準を選択してください" }),
  customDeflection: z.coerce.number().optional(),
})

// スタッドデータベース（実際の実装ではAPIから取得）
const studDatabase = [
  {
    id: "C75x45x0.8t",
    name: "C75x45x0.8t",
    webHeight: 75,
    flangeWidth: 45,
    thickness: 0.8,
    cornerRadius: 1.5,
    area: 1.56,
    momentOfInertia: 14.5,
    sectionModulus: 3.87,
    effectiveArea: 1.45,
    effectiveMomentOfInertia: 13.8,
    effectiveSectionModulus: 3.68,
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

export default function WallStudCalculator() {
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
      materialFactor: 1.2,

      // 部材の断面特性
      studType: "C75x45x0.8t",
      bearingLength: 32,

      // 幾何学的配置
      span: 0,
      tributaryWidth: 610,

      // 荷重条件
      windLoadFactor: 1.5,
      imposedLoadFactor: 1.5,
      deadLoadFactor: 1.5,
      fixtureFactor: 1.5,

      // 風荷重
      windLoad: 0.24,

      // 積載荷重
      imposedLoad: 0.75,
      imposedLoadHeight: 1.1,

      // 死荷重
      wallBoardLayers: 1,
      wallBoardWeight: 13.0,
      insulationPresent: "no",
      insulationThickness: 0,
      metalFrameWeight: 15,

      // 壁取り付け物データ
      fixtureWeight: 8.0,
      fixtureHeight: 1.8,
      fixtureDistance: 600,

      // たわみ基準
      deflectionCriteria: "L/240",
      customDeflection: 0,
    },
  })

  function onSubmit(values: z.infer<typeof formSchema>) {
    // 選択されたスタッドの情報を取得
    const selectedStud = studDatabase.find((stud) => stud.id === values.studType)

    if (!selectedStud) {
      console.error("選択されたスタッドが見つかりません")
      return
    }

    // 計算を実行
    const results = calculateWallStud(values, selectedStud)
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
        <h1 className="text-3xl font-bold">壁スタッド構造計算</h1>
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
                  <TabsTrigger value="fixtures">取り付け物</TabsTrigger>
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
                              <Input placeholder="例: 3階間仕切り壁" {...field} />
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
                      <CardDescription>スタッドの材料特性を入力してください</CardDescription>
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
                        name="studType"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>スタッドの種類</FormLabel>
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="スタッドを選択" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                {studDatabase.map((stud) => (
                                  <SelectItem key={stud.id} value={stud.id}>
                                    {stud.name}
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
                        name="bearingLength"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>支圧長さ (mm)</FormLabel>
                            <FormControl>
                              <Input type="number" {...field} />
                            </FormControl>
                            <FormDescription>Nb</FormDescription>
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
                      <CardDescription>スタッドの設置条件を入力してください</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <FormField
                          control={form.control}
                          name="span"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>支持間距離 (mm)</FormLabel>
                              <FormControl>
                                <Input type="number" {...field} />
                              </FormControl>
                              <FormDescription>L</FormDescription>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name="tributaryWidth"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>負担幅/スタッド間隔 (mm)</FormLabel>
                              <FormControl>
                                <Input type="number" {...field} />
                              </FormControl>
                              <FormDescription>TW</FormDescription>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>

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

                <TabsContent value="loads" className="space-y-4 mt-4">
                  <Card>
                    <CardHeader>
                      <CardTitle>荷重条件</CardTitle>
                      <CardDescription>荷重条件を入力してください</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
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
                          name="imposedLoadFactor"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>積載荷重係数</FormLabel>
                              <FormControl>
                                <Input type="number" step="0.1" {...field} />
                              </FormControl>
                              <FormDescription>γQ</FormDescription>
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
                          name="fixtureFactor"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>取付物荷重係数</FormLabel>
                              <FormControl>
                                <Input type="number" step="0.1" {...field} />
                              </FormControl>
                              <FormDescription>γf</FormDescription>
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

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <FormField
                          control={form.control}
                          name="imposedLoad"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>設計集中衝撃荷重 (kN/m)</FormLabel>
                              <FormControl>
                                <Input type="number" step="0.01" {...field} />
                              </FormControl>
                              <FormDescription>W</FormDescription>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name="imposedLoadHeight"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>衝撃荷重作用高さ (m)</FormLabel>
                              <FormControl>
                                <Input type="number" step="0.1" {...field} />
                              </FormControl>
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
                            name="wallBoardLayers"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>壁ボードの層数</FormLabel>
                                <FormControl>
                                  <Input type="number" {...field} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />

                          <FormField
                            control={form.control}
                            name="wallBoardWeight"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>壁ボードの単位面積重量 (kgf/m²)</FormLabel>
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

                <TabsContent value="fixtures" className="space-y-4 mt-4">
                  <Card>
                    <CardHeader>
                      <CardTitle>壁取り付け物データ</CardTitle>
                      <CardDescription>壁に取り付ける物の情報を入力してください</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <FormField
                        control={form.control}
                        name="fixtureWeight"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>質量 (kgf)</FormLabel>
                            <FormControl>
                              <Input type="number" step="0.1" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <FormField
                          control={form.control}
                          name="fixtureHeight"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>取り付け高さ (m)</FormLabel>
                              <FormControl>
                                <Input type="number" step="0.1" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name="fixtureDistance"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>スタッドからの水平距離 (mm)</FormLabel>
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
            <WallStudResults results={calculationResults} />
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
