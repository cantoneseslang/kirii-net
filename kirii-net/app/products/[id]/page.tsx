"use client"

import { useState } from "react"
import Link from "next/link"
import Image from "next/image"
import { Minus, Plus, ShoppingCart } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Footer } from "@/components/footer"

export default function ProductPage({ params }: { params: { id: string } }) {
  const [quantity, setQuantity] = useState(1)

  // Find product by ID (in a real app, this would be fetched from an API)
  const product = products.find((p) => p.id === params.id) || {
    id: "not-found",
    title: "找不到產品",
    description: "指定的產品不存在或已被刪除。",
    price: 0,
    category: "",
    details: "",
    specs: [],
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
          <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
            <div className="aspect-square bg-muted rounded-lg"></div>
            <div className="flex flex-col gap-4">
              <div>
                <h1 className="text-3xl font-bold">{product.title}</h1>
                <p className="text-muted-foreground">{product.description}</p>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-2xl font-bold">HK${product.price.toLocaleString()}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium">類別:</span>
                <span className="text-sm text-muted-foreground">{product.category}</span>
              </div>
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
              </div>
              <Button size="lg" className="w-full">
                加入購物車
              </Button>
              <Tabs defaultValue="details" className="mt-6">
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="details">產品詳情</TabsTrigger>
                  <TabsTrigger value="specs">規格</TabsTrigger>
                </TabsList>
                <TabsContent value="details" className="mt-4">
                  <Card>
                    <CardContent className="pt-6">
                      <p>{product.details || "暫無詳細資料。"}</p>
                    </CardContent>
                  </Card>
                </TabsContent>
                <TabsContent value="specs" className="mt-4">
                  <Card>
                    <CardContent className="pt-6">
                      {product.specs && product.specs.length > 0 ? (
                        <ul className="space-y-2">
                          {product.specs.map((spec, index) => (
                            <li key={index} className="flex justify-between">
                              <span className="font-medium">{spec.name}</span>
                              <span>{spec.value}</span>
                            </li>
                          ))}
                        </ul>
                      ) : (
                        <p>暫無規格資料。</p>
                      )}
                    </CardContent>
                  </Card>
                </TabsContent>
              </Tabs>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  )
}

// Sample product data with additional details
const products = [
  {
    id: "acp-001",
    title: "鋁複合板 銀色",
    description: "高品質鋁複合板 3mm厚",
    price: 980,
    category: "鋁塑板",
    details:
      "鋁複合板（Aluminum Composite Panel）是由兩層鋁板中間夾著聚乙烯樹脂的複合材料。輕巧易於加工，具有優良的耐候性和耐久性。廣泛用於外牆、招牌和室內裝飾。",
    specs: [
      { name: "厚度", value: "3mm" },
      { name: "尺寸", value: "1220×2440mm" },
      { name: "顏色", value: "銀色" },
      { name: "材質", value: "鋁/聚乙烯" },
      { name: "重量", value: "約4.5kg/㎡" },
    ],
  },
  {
    id: "acp-002",
    title: "鋁複合板 白色",
    description: "高品質鋁複合板 4mm厚",
    price: 1050,
    category: "鋁塑板",
    details:
      "鋁複合板（Aluminum Composite Panel）是由兩層鋁板中間夾著聚乙烯樹脂的複合材料。輕巧易於加工，具有優良的耐候性和耐久性。廣泛用於外牆、招牌和室內裝飾。",
    specs: [
      { name: "厚度", value: "4mm" },
      { name: "尺寸", value: "1220×2440mm" },
      { name: "顏色", value: "白色" },
      { name: "材質", value: "鋁/聚乙烯" },
      { name: "重量", value: "約5.5kg/㎡" },
    ],
  },
  {
    id: "steel-001",
    title: "H型鋼 100×100",
    description: "建築用H型鋼 SS400 6m",
    price: 1900,
    category: "鐵建築鋼材",
    details:
      "H型鋼是截面為H形的結構用鋼材。用作柱和樑，具有高強度和剛性。SS400是一般結構用軋製鋼材的規格，廣泛用於建築和土木工程。",
    specs: [
      { name: "尺寸", value: "H100×100" },
      { name: "長度", value: "6m" },
      { name: "規格", value: "SS400" },
      { name: "翼緣厚度", value: "6mm" },
      { name: "腹板厚度", value: "6mm" },
    ],
  },
  {
    id: "gyp-001",
    title: "石膏板 9.5mm",
    description: "一般用石膏板 910×1820mm",
    price: 95,
    category: "石膏板",
    details:
      "石膏板是以石膏為芯材，表面和背面覆蓋紙張的建材。具有防火性能，廣泛用作牆壁和天花板的基層材料。施工性良好，性價比高。",
    specs: [
      { name: "厚度", value: "9.5mm" },
      { name: "尺寸", value: "910×1820mm" },
      { name: "重量", value: "約7.5kg/塊" },
      { name: "用途", value: "室內牆壁和天花板" },
    ],
  },
  {
    id: "gyp-002",
    title: "防火石膏板 12.5mm",
    description: "耐火石膏板 910×1820mm",
    price: 140,
    category: "防火石膏板",
    details:
      "防火石膏板比普通石膏板具有更高的耐火性能。石膏芯中添加了玻璃纖維等材料，延長了火災時的耐火時間。用於建築法規規定的防火分區。",
    specs: [
      { name: "厚度", value: "12.5mm" },
      { name: "尺寸", value: "910×1820mm" },
      { name: "重量", value: "約10kg/塊" },
      { name: "耐火性能", value: "1小時" },
      { name: "用途", value: "防火分區和逃生通道" },
    ],
  },
  {
    id: "ceiling-001",
    title: "鋁天花板 300×300",
    description: "輕量鋁天花板 白色",
    price: 75,
    category: "鋁輕天花材料",
    details:
      "鋁製輕量天花板材料兼具耐久性和美觀。輕巧易於安裝，具有防潮和耐腐蝕性。廣泛用於辦公室、商場和公共設施的天花板。",
    specs: [
      { name: "尺寸", value: "300×300mm" },
      { name: "厚度", value: "0.6mm" },
      { name: "顏色", value: "白色" },
      { name: "材質", value: "鋁" },
      { name: "重量", value: "約0.5kg/塊" },
    ],
  },
  {
    id: "rockwool-001",
    title: "岩棉 50mm",
    description: "防火隔熱用岩棉 910×1820mm",
    price: 180,
    category: "Rockwool防火棉",
    details:
      "岩棉是將玄武岩等岩石在高溫下熔融，製成纖維狀的隔熱材料。具有優良的防火性能和隔熱性能，被認證為不燃材料。廣泛用於建築物的防火分區和隔熱材料。",
    specs: [
      { name: "厚度", value: "50mm" },
      { name: "尺寸", value: "910×1820mm" },
      { name: "密度", value: "40kg/m³" },
      { name: "熱傳導率", value: "0.038W/m·K" },
      { name: "不燃性能", value: "不燃材料" },
    ],
  },
]
