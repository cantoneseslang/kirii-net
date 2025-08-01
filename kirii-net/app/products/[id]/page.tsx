"use client"

import { useState, useEffect } from "react"
import { use } from "react"
import Link from "next/link"
import Image from "next/image"
import { Minus, Plus, ShoppingCart } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Header } from "@/components/header"
import { addToCart, getCartItemCount } from "@/lib/cart"
import { toast } from "sonner"

export default function ProductPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const [quantity, setQuantity] = useState(1)
  const [cartItemCount, setCartItemCount] = useState(0)

  // カートアイテム数を更新
  const updateCartCount = () => {
    setCartItemCount(getCartItemCount());
  };

  // 商品をカートに追加
  const handleAddToCart = () => {
    const product = products.find((p) => p.id === id);
    if (product) {
      addToCart(product, quantity);
      updateCartCount();
      toast.success(`${product.title} × ${quantity} 已加入購物車`);
      
      // カート数を強制的に更新
      setTimeout(() => {
        updateCartCount();
      }, 100);
    }
  };

  // 初期化時にカート数を取得
  useEffect(() => {
    updateCartCount();
  }, []);

  // カート数の更新を定期的にチェック
  useEffect(() => {
    const interval = setInterval(() => {
      updateCartCount();
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  // Find product by ID (in a real app, this would be fetched from an API)
  const product = products.find((p) => p.id === id) || {
    id: "not-found",
    title: "找不到產品",
    description: "指定的產品不存在或已被刪除。",
    price: 0,
    category: "",
    weight: 0,
    details: "",
    specs: [],
  }

  const incrementQuantity = () => setQuantity((q) => q + 1)
  const decrementQuantity = () => setQuantity((q) => Math.max(1, q - 1))

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto">
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
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium">類別:</span>
                  <span className="text-sm text-muted-foreground">{product.category}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium">重量:</span>
                  <span className="text-sm text-muted-foreground">{product.weight}kg</span>
                </div>
              </div>
              
              {/* 数量選択セクション */}
              <div className="flex items-center gap-4 my-4">
                <span className="text-sm font-medium">數量:</span>
                <div className="flex items-center gap-2">
                  <Button variant="outline" size="icon" onClick={decrementQuantity}>
                    <Minus className="h-4 w-4" />
                  </Button>
                  <input
                    type="number"
                    min="1"
                    value={quantity}
                    onChange={(e) => {
                      const value = parseInt(e.target.value) || 1;
                      setQuantity(Math.max(1, value));
                    }}
                    className="w-16 text-center border rounded-md px-2 py-1 text-sm"
                  />
                  <Button variant="outline" size="icon" onClick={incrementQuantity}>
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
              </div>
              
              {/* アクションボタン */}
              <div className="flex gap-2">
                <Button 
                  variant="outline" 
                  className="flex-1"
                  onClick={() => {
                    // 詳細タブを表示
                    const detailsTab = document.querySelector('[data-value="details"]') as HTMLElement;
                    if (detailsTab) {
                      detailsTab.click();
                    }
                  }}
                >
                  詳細
                </Button>
                <Button className="flex-1" onClick={handleAddToCart}>
                  加入購物車
                </Button>
              </div>
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
    weight: 3.2,
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
    weight: 4.1,
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
    weight: 45.2,
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
    id: "steel-002",
    title: "方管 50×50",
    description: "建築用方管 STKR400 6m",
    price: 680,
    category: "鐵建築鋼材",
    weight: 12.8,
    details:
      "方管是截面為正方形的鋼管。具有高強度和剛性，廣泛用於建築結構、機械設備和家具製造。STKR400是一般結構用鋼管的規格。",
    specs: [
      { name: "尺寸", value: "50×50mm" },
      { name: "長度", value: "6m" },
      { name: "規格", value: "STKR400" },
      { name: "厚度", value: "3mm" },
      { name: "重量", value: "約12.8kg/支" },
    ],
  },
  {
    id: "gyp-001",
    title: "石膏板 9.5mm",
    description: "一般用石膏板 910×1820mm",
    price: 95,
    category: "石膏板",
    weight: 8.5,
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
    weight: 11.2,
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
    weight: 0.8,
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
    weight: 2.1,
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
