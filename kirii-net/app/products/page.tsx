import Link from "next/link"
import Image from "next/image"
import { ShoppingCart } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Footer } from "@/components/footer"

export default function ProductsPage() {
  const cartItems = [] // Replace with actual cart items if available

  return (
    <div className="flex min-h-screen flex-col">
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-16 items-center justify-between">
          <div className="flex items-center gap-2">
            <Link href="/" className="flex items-center pl-4">
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
                  {cartItems.length}
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
        <section className="w-full py-12 md:py-24 lg:py-32">
          <div className="container px-4 md:px-6">
            <div className="flex flex-col items-center justify-center space-y-4 text-center">
              <div className="space-y-2">
                <h1 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">產品目錄</h1>
                <p className="mx-auto max-w-[700px] text-muted-foreground md:text-xl">我們提供各種高品質建築材料。</p>
              </div>
            </div>
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 mt-8">
              {products.map((product) => (
                <ProductCard
                  key={product.id}
                  id={product.id}
                  title={product.title}
                  description={product.description}
                  price={product.price}
                  category={product.category}
                />
              ))}
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  )
}

function ProductCard({
  id,
  title,
  description,
  price,
  category,
}: {
  id: string
  title: string
  description: string
  price: number
  category: string
}) {
  return (
    <Card className="overflow-hidden">
      <CardContent className="p-0">
        <div className="aspect-square bg-muted" />
      </CardContent>
      <CardHeader className="p-4">
        <CardTitle>{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardFooter className="p-4 flex flex-col gap-2">
        <div className="flex items-center justify-between w-full">
          <span className="text-lg font-bold">HK${price.toLocaleString()}</span>
          <span className="text-sm text-muted-foreground">{category}</span>
        </div>
        <div className="flex gap-2 w-full">
          <Link href={`/products/${id}`} className="flex-1">
            <Button variant="outline" className="w-full">
              詳情
            </Button>
          </Link>
          <Button className="flex-1">加入購物車</Button>
        </div>
      </CardFooter>
    </Card>
  )
}

// Sample product data
const products = [
  {
    id: "acp-001",
    title: "鋁複合板 銀色",
    description: "高品質鋁複合板 3mm厚",
    price: 980,
    category: "鋁塑板",
  },
  {
    id: "acp-002",
    title: "鋁複合板 白色",
    description: "高品質鋁複合板 4mm厚",
    price: 1050,
    category: "鋁塑板",
  },
  {
    id: "steel-001",
    title: "H型鋼 100×100",
    description: "建築用H型鋼 SS400 6m",
    price: 1900,
    category: "鐵建築鋼材",
  },
  {
    id: "steel-002",
    title: "方管 50×50",
    description: "建築用方管 STKR400 6m",
    price: 680,
    category: "鐵建築鋼材",
  },
  {
    id: "gyp-001",
    title: "石膏板 9.5mm",
    description: "一般用石膏板 910×1820mm",
    price: 95,
    category: "石膏板",
  },
  {
    id: "gyp-002",
    title: "防火石膏板 12.5mm",
    description: "耐火石膏板 910×1820mm",
    price: 140,
    category: "防火石膏板",
  },
  {
    id: "ceiling-001",
    title: "鋁天花板 300×300",
    description: "輕量鋁天花板 白色",
    price: 75,
    category: "鋁輕天花材料",
  },
  {
    id: "rockwool-001",
    title: "岩棉 50mm",
    description: "防火隔熱用岩棉 910×1820mm",
    price: 180,
    category: "Rockwool防火棉",
  },
]
