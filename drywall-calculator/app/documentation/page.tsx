import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ArrowLeft, BookOpen, Calculator, Info } from "lucide-react"

export default function Documentation() {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex items-center mb-8">
        <Link href="/" className="mr-4">
          <Button variant="outline" size="icon">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <h1 className="text-3xl font-bold">システムドキュメント</h1>
      </div>

      <Tabs defaultValue="overview" className="w-full">
        <TabsList className="grid grid-cols-4 w-full max-w-3xl mx-auto mb-8">
          <TabsTrigger value="overview">概要</TabsTrigger>
          <TabsTrigger value="wall-stud">壁スタッド</TabsTrigger>
          <TabsTrigger value="ceiling">天井システム</TabsTrigger>
          <TabsTrigger value="reference">参考資料</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Info className="h-5 w-5" />
                システム概要
              </CardTitle>
              <CardDescription>乾式壁間仕切りシステム構造計算システムの概要</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <h3 className="text-lg font-medium">目的</h3>
              <p>
                本システムは、KIRII乾式壁用スチールC型スタッドおよび天井吊り下げシステムの構造的適合性を精確に検証するウェブベースのツールです。
                設計プロセスを効率化し、設計の安全性と法規準拠を確保することを目的としています。
              </p>

              <h3 className="text-lg font-medium">主な機能</h3>
              <ul className="list-disc pl-6 space-y-2">
                <li>壁スタッド計算モジュール: C型およびCT型スチールスタッドの構造計算</li>
                <li>天井吊り下げシステム計算モジュール: ランナーおよび吊りハンガーの構造計算</li>
                <li>詳細なPDFレポート生成機能</li>
                <li>部材データベース参照機能</li>
              </ul>

              <h3 className="text-lg font-medium">計算対象</h3>
              <ul className="list-disc pl-6 space-y-2">
                <li>壁スタッド: KIRII製のC型およびCT型スチールスタッド</li>
                <li>
                  天井吊り下げシステム:
                  KIRII製ランナー（FRCメインランナー、RRCランナー）およびM12ねじ込み棒（吊りハンガー）、Hilti
                  HST3ウェッジアンカー
                </li>
              </ul>

              <h3 className="text-lg font-medium">構造チェック項目</h3>
              <ul className="list-disc pl-6 space-y-2">
                <li>共通: 曲げ強度、せん断強度、ウェブ座屈、たわみ限界</li>
                <li>壁スタッド: 曲げと圧縮の複合作用</li>
                <li>天井吊り下げシステム: ハンガー引張力、アンカー引張抵抗</li>
              </ul>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="wall-stud" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calculator className="h-5 w-5" />
                壁スタッド計算モジュール
              </CardTitle>
              <CardDescription>壁スタッド計算モジュールの使用方法と計算内容</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <h3 className="text-lg font-medium">入力項目</h3>
              <ul className="list-disc pl-6 space-y-2">
                <li>プロジェクト基本情報: 案件名、計算対象詳細、計算日、作成者</li>
                <li>材料特性: 降伏強度、弾性係数、材料係数</li>
                <li>部材の断面特性: スタッドの種類、支圧長さ</li>
                <li>幾何学的配置: 支持間距離、負担幅/スタッド間隔</li>
                <li>荷重条件: 風荷重、積載荷重、死荷重、壁取り付け物による荷重</li>
                <li>たわみ基準: L/240, L/360, またはカスタム値</li>
              </ul>

              <h3 className="text-lg font-medium">計算内容</h3>
              <ul className="list-disc pl-6 space-y-2">
                <li>曲げモーメント: 風荷重、積載荷重、壁取り付け物による曲げモーメントの合計と曲げ耐力の比較</li>
                <li>せん断力: 風荷重によるせん断力とせん断耐力の比較</li>
                <li>ウェブ座屈: せん断力とウェブ座屈耐力の比較</li>
                <li>たわみ: 風荷重によるたわみと許容たわみの比較</li>
                <li>複合作用: 曲げと圧縮の複合作用比率と限界値の比較</li>
              </ul>

              <h3 className="text-lg font-medium">計算式の概要</h3>
              <p>
                本システムでは、「2007 North American Specification
                LRFD」などの設計コードに基づいた計算式を使用しています。
                詳細な計算式については、PDFレポートに記載されます。
              </p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="ceiling" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calculator className="h-5 w-5" />
                天井吊り下げシステム計算モジュール
              </CardTitle>
              <CardDescription>天井吊り下げシステム計算モジュールの使用方法と計算内容</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <h3 className="text-lg font-medium">入力項目</h3>
              <ul className="list-disc pl-6 space-y-2">
                <li>プロジェクト基本情報: 案件名、計算対象詳細、計算日、作成者</li>
                <li>材料特性: 降伏強度、弾性係数、材料係数</li>
                <li>部材の断面特性: ランナーの種類、ハンガーの種類、アンカーの種類</li>
                <li>幾何学的配置: ランナー支持間距離、ハンガー間隔、ランナー間隔</li>
                <li>荷重条件: 風荷重、死荷重</li>
                <li>たわみ基準: L/240, L/360, またはカスタム値</li>
              </ul>

              <h3 className="text-lg font-medium">計算内容</h3>
              <ul className="list-disc pl-6 space-y-2">
                <li>ランナー曲げ: 風荷重と死荷重による曲げモーメントとランナーの曲げ耐力の比較</li>
                <li>ランナーせん断: 風荷重と死荷重によるせん断力とランナーのせん断耐力の比較</li>
                <li>ランナーたわみ: 風荷重と死荷重によるたわみと許容たわみの比較</li>
                <li>ハンガー引張: ハンガーに作用する引張力とハンガーの引張耐力の比較</li>
                <li>アンカー引張: アンカーに作用する引張力とアンカーの引張耐力の比較</li>
              </ul>

              <h3 className="text-lg font-medium">計算式の概要</h3>
              <p>
                本システムでは、「2007 North American Specification
                LRFD」などの設計コードに基づいた計算式を使用しています。
                詳細な計算式については、PDFレポートに記載されます。
              </p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="reference" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BookOpen className="h-5 w-5" />
                参考資料
              </CardTitle>
              <CardDescription>計算に使用される参考資料と設計コード</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <h3 className="text-lg font-medium">設計コード</h3>
              <ul className="list-disc pl-6 space-y-2">
                <li>2007 North American Specification LRFD (Load and Resistance Factor Design)</li>
                <li>日本建築学会「鋼構造設計規準」</li>
                <li>建築基準法・同施行令</li>
              </ul>

              <h3 className="text-lg font-medium">製品データ</h3>
              <ul className="list-disc pl-6 space-y-2">
                <li>KIRII製品カタログ: C型スタッド、CT型スタッド、FRCメインランナー、RRCランナーの断面特性</li>
                <li>Hilti製品データシート: HST3ウェッジアンカーの性能値</li>
              </ul>

              <h3 className="text-lg font-medium">技術資料</h3>
              <ul className="list-disc pl-6 space-y-2">
                <li>軽量鉄骨下地工事技術指針・同解説（一般社団法人 日本建築学会）</li>
                <li>建築工事標準仕様書・同解説 JASS 26 内装工事（一般社団法人 日本建築学会）</li>
              </ul>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <div className="mt-8 text-center">
        <Link href="/">
          <Button variant="outline" className="gap-2">
            <ArrowLeft className="h-4 w-4" />
            トップページに戻る
          </Button>
        </Link>
      </div>
    </div>
  )
}
