"use client"

import { useState } from "react"
import Link from "next/link"
import Image from "next/image"
import { Minus, Plus, ShoppingCart, ArrowLeft } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Separator } from "@/components/ui/separator"
import { Table, TableBody, TableCell, TableRow } from "@/components/ui/table"
import { Footer } from "@/components/footer"

export default function MetalStudDetailPage() {
  const [quantity, setQuantity] = useState(1)

  const product = {
    id: "ms-001",
    title: "C型金屬龍骨 75×45mm",
    description: "鍍鋅鋼C型龍骨，尺寸75×45mm，厚度0.6mm，適用於隔牆和天花板框架。",
    price: 45,
    category: "金屬龍骨",
    details:
      "C型金屬龍骨是建築工程中常用的結構支撐材料，由高品質鍍鋅鋼製成，具有優良的強度和耐腐蝕性。適用於各種輕鋼架構建築，如隔牆、天花板和外牆系統。我們的C型龍骨符合國際建築標準，確保您的建築項目安全可靠。",
    specs: [
      { name: "型號", value: "MS-C75" },
      { name: "尺寸", value: "75×45mm" },
      { name: "厚度", value: "0.6mm" },
      { name: "材質", value: "鍍鋅鋼" },
      { name: "表面處理", value: "熱浸鍍鋅" },
      { name: "長度", value: "3m/支" },
      { name: "包裝", value: "20支/捆" },
      { name: "適用場景", value: "隔牆、天花板框架" },
      { name: "防火等級", value: "A級不燃材料" },
    ],
    applications: ["輕鋼架牆體系統", "天花板懸吊系統", "外牆支撐系統", "裝飾性隔斷", "設備安裝支架"],
    installation: [
      "使用自攻螺絲固定在U型龍骨上",
      "標準間距為400mm或600mm",
      "確保垂直安裝以保證牆體強度",
      "使用水平儀確保安裝平直",
      "根據設計要求可雙層交叉安裝增強強度",
    ],
  }

  const incrementQuantity = () => setQuantity((q) => q + 1)
  const decrementQuantity = () => setQuantity((q) => Math.max(1, q - 1))

  return (
    <div className="flex min-h-screen flex-col">
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-16 items-center justify-between">
          <div className="flex items-center gap-2">
            <Link href="/" className="flex items-center">
              <Image src="/images/kirii-new-logo.png" alt="KIRII" width={120} height={48} className="h-10 w-auto" />
            </Link>
          </div>
          <nav className="hidden md:flex items-center gap-6">
            <Link href="/" className="text-sm font-medium">
              首頁
            </Link>
            <Link href="/products" className="text-sm font-medium">
              產品目錄
            </Link>
            <Link href="/custom" className="text-sm font-medium">
              定制產品
            </Link>
            <Link href="/about" className="text-sm font-medium">
              關於我們
            </Link>
          </nav>
          <div className="flex items-center gap-4">
            <Link href="/cart">
              <Button variant="outline" size="icon" className="relative">
                <ShoppingCart className="h-5 w-5" />
                <span className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-primary text-xs text-primary-foreground">
                  0
                </span>
              </Button>
            </Link>
            <Link href="/login">
              <Button>登入</Button>
            </Link>
          </div>
        </div>
      </header>
      <main className="flex-1">
        <div className="container py-12">
          <div className="flex items-center gap-2 mb-8">
            <Link
              href="/products/aluminum-composite-panel"
              className="flex items-center text-sm text-muted-foreground hover:text-primary"
            >
              <ArrowLeft className="mr-1 h-4 w-4" />
              返回產品列表
            </Link>
          </div>

          <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
            <div className="aspect-square bg-muted rounded-lg overflow-hidden relative">
              <Image
                src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/a7bcac83-2ca6-409d-95d1-519e7c0be080.JPG-cvtHlR1ce3ZTkWjVShJJFoxVUYOEt5.jpeg"
                alt={product.title}
                fill
                className="object-cover"
              />
            </div>
            <div className="flex flex-col gap-4">
              <div>
                <h1 className="text-3xl font-bold">{product.title}</h1>
                <p className="text-muted-foreground mt-2">{product.description}</p>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-2xl font-bold">HK${product.price.toLocaleString()}</span>
                <span className="text-sm text-muted-foreground">/ 支</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium">類別:</span>
                <span className="text-sm text-muted-foreground">{product.category}</span>
              </div>
              <Separator />
              <div className="flex items-center gap-4 my-4">
                <span className="text-sm font-medium">數量:</span>
                <div className="flex items-center gap-2">
                  <Button variant="outline" size="icon" onClick={decrementQuantity}>
                    <Minus className="h-4 w-4" />
                  </Button>
                  <span className="w-8 text-center">{quantity}</span>
                  <Button variant="outline" size="icon" onClick={incrementQuantity}>
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
                <span className="text-sm text-muted-foreground">
                  (可購買整捆: 20支/捆 HK${(product.price * 20).toLocaleString()})
                </span>
              </div>
              <div className="flex gap-4">
                <Button size="lg" className="flex-1">
                  加入購物車
                </Button>
                <Button size="lg" variant="outline" className="flex-1">
                  立即購買
                </Button>
              </div>
              <Tabs defaultValue="details" className="mt-6">
                <TabsList className="grid w-full grid-cols-3">
                  <TabsTrigger value="details">產品詳情</TabsTrigger>
                  <TabsTrigger value="specs">規格</TabsTrigger>
                  <TabsTrigger value="installation">安裝指南</TabsTrigger>
                </TabsList>
                <TabsContent value="details" className="mt-4">
                  <Card>
                    <CardContent className="pt-6">
                      <p className="mb-4">{product.details}</p>
                      <h3 className="font-medium mb-2">應用場景：</h3>
                      <ul className="list-disc pl-5 space-y-1">
                        {product.applications.map((app, index) => (
                          <li key={index}>{app}</li>
                        ))}
                      </ul>
                    </CardContent>
                  </Card>
                </TabsContent>
                <TabsContent value="specs" className="mt-4">
                  <Card>
                    <CardContent className="pt-6">
                      <Table>
                        <TableBody>
                          {product.specs.map((spec, index) => (
                            <TableRow key={index}>
                              <TableCell className="font-medium">{spec.name}</TableCell>
                              <TableCell>{spec.value}</TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </CardContent>
                  </Card>
                </TabsContent>
                <TabsContent value="installation" className="mt-4">
                  <Card>
                    <CardContent className="pt-6">
                      <h3 className="font-medium mb-2">安裝步驟：</h3>
                      <ol className="list-decimal pl-5 space-y-2">
                        {product.installation.map((step, index) => (
                          <li key={index}>{step}</li>
                        ))}
                      </ol>
                      <div className="mt-4 p-4 bg-muted rounded-lg">
                        <p className="text-sm">
                          注意：安裝時請遵循當地建築法規和安全標準。建議由專業人員進行安裝以確保結構安全。
                        </p>
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>
              </Tabs>
            </div>
          </div>

          <Separator className="my-12" />

          <h2 className="text-2xl font-bold mb-6">相關產品</h2>
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
            <Card className="overflow-hidden">
              <div className="aspect-video relative">
                <Image
                  src="/placeholder.svg?height=400&width=600"
                  alt="U型金屬龍骨 50×40mm"
                  fill
                  className="object-cover"
                />
              </div>
              <CardContent className="p-4">
                <h3 className="font-medium mb-2">U型金屬龍骨 50×40mm</h3>
                <p className="text-sm text-muted-foreground mb-4">鍍鋅鋼U型龍骨，適用於天花板框架。</p>
                <div className="flex items-center justify-between">
                  <span className="font-bold">HK$35</span>
                  <Button size="sm">加入購物車</Button>
                </div>
              </CardContent>
            </Card>
            <Card className="overflow-hidden">
              <div className="aspect-video relative">
                <Image
                  src="/placeholder.svg?height=400&width=600"
                  alt="C型金屬龍骨 100×50mm"
                  fill
                  className="object-cover"
                />
              </div>
              <CardContent className="p-4">
                <h3 className="font-medium mb-2">C型金屬龍骨 100×50mm</h3>
                <p className="text-sm text-muted-foreground mb-4">鍍鋅鋼C型龍骨，適用於隔牆和天花板框架。</p>
                <div className="flex items-center justify-between">
                  <span className="font-bold">HK$58</span>
                  <Button size="sm">加入購物車</Button>
                </div>
              </CardContent>
            </Card>
            <Card className="overflow-hidden">
              <div className="aspect-video relative">
                <Image
                  src="/placeholder.svg?height=400&width=600"
                  alt="石膏板螺絲 25mm"
                  fill
                  className="object-cover"
                />
              </div>
              <CardContent className="p-4">
                <h3 className="font-medium mb-2">石膏板螺絲 25mm</h3>
                <p className="text-sm text-muted-foreground mb-4">自攻螺絲，用於固定石膏板到金屬龍骨。</p>
                <div className="flex items-center justify-between">
                  <span className="font-bold">HK$45</span>
                  <Button size="sm">加入購物車</Button>
                </div>
              </CardContent>
            </Card>
            <Card className="overflow-hidden">
              <div className="aspect-video relative">
                <Image src="/placeholder.svg?height=400&width=600" alt="石膏板 9.5mm" fill className="object-cover" />
              </div>
              <CardContent className="p-4">
                <h3 className="font-medium mb-2">石膏板 9.5mm</h3>
                <p className="text-sm text-muted-foreground mb-4">標準石膏板，適用於室內牆壁和天花板。</p>
                <div className="flex items-center justify-between">
                  <span className="font-bold">HK$95</span>
                  <Button size="sm">加入購物車</Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  )
}
