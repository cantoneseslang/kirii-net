import Link from "next/link"
import Image from "next/image"
import { ShoppingCart, ArrowLeft } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Footer } from "@/components/footer"

export default function AluminumCompositePanelPage() {
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
            <Link href="/products" className="flex items-center text-sm text-muted-foreground hover:text-primary">
              <ArrowLeft className="mr-1 h-4 w-4" />
              返回產品目錄
            </Link>
          </div>

          <h1 className="text-3xl font-bold mb-8">鋁複合板產品系列</h1>

          <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3 mb-12">
            {aluminumCompositePanels.map((product) => (
              <Card key={product.id} className="overflow-hidden">
                <div className="aspect-video relative">
                  <Image
                    src={product.image || "/placeholder.svg?height=400&width=600"}
                    alt={product.title}
                    fill
                    className="object-cover"
                  />
                </div>
                <CardHeader className="p-4">
                  <CardTitle className="text-lg">{product.title}</CardTitle>
                </CardHeader>
                <CardContent className="p-4 pt-0 space-y-4">
                  <p className="text-sm text-muted-foreground">{product.description}</p>
                  <div className="flex items-center justify-between">
                    <span className="text-lg font-bold">HK${product.price.toLocaleString()}</span>
                    <div className="flex gap-2">
                      <Link href={`/products/${product.id}`}>
                        <Button variant="outline" size="sm">
                          詳情
                        </Button>
                      </Link>
                      <Button size="sm">加入購物車</Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          <Separator className="my-12" />

          <h2 className="text-2xl font-bold mb-6">金屬支架和龍骨系列</h2>
          <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3 mb-12">
            {metalStuds.map((product) => (
              <Card key={product.id} className="overflow-hidden">
                <div className="aspect-video relative">
                  <Image
                    src={product.image || "/placeholder.svg?height=400&width=600"}
                    alt={product.title}
                    fill
                    className="object-cover"
                  />
                </div>
                <CardHeader className="p-4">
                  <CardTitle className="text-lg">{product.title}</CardTitle>
                </CardHeader>
                <CardContent className="p-4 pt-0 space-y-4">
                  <p className="text-sm text-muted-foreground">{product.description}</p>
                  <div className="flex items-center justify-between">
                    <span className="text-lg font-bold">HK${product.price.toLocaleString()}</span>
                    <div className="flex gap-2">
                      <Link href={`/products/${product.id}`}>
                        <Button variant="outline" size="sm">
                          詳情
                        </Button>
                      </Link>
                      <Button size="sm">加入購物車</Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          <Separator className="my-12" />

          <h2 className="text-2xl font-bold mb-6">產品規格表</h2>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>產品類型</TableHead>
                  <TableHead>型號</TableHead>
                  <TableHead>尺寸</TableHead>
                  <TableHead>厚度</TableHead>
                  <TableHead>材質</TableHead>
                  <TableHead>適用場景</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                <TableRow>
                  <TableCell className="font-medium">鋁複合板</TableCell>
                  <TableCell>ACP-S3</TableCell>
                  <TableCell>1220×2440mm</TableCell>
                  <TableCell>3mm</TableCell>
                  <TableCell>鋁/聚乙烯</TableCell>
                  <TableCell>外牆、招牌</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell className="font-medium">鋁複合板</TableCell>
                  <TableCell>ACP-W4</TableCell>
                  <TableCell>1220×2440mm</TableCell>
                  <TableCell>4mm</TableCell>
                  <TableCell>鋁/聚乙烯</TableCell>
                  <TableCell>外牆、招牌</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell className="font-medium">金屬龍骨</TableCell>
                  <TableCell>MS-C75</TableCell>
                  <TableCell>75×45mm</TableCell>
                  <TableCell>0.6mm</TableCell>
                  <TableCell>鍍鋅鋼</TableCell>
                  <TableCell>牆身、天花</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell className="font-medium">金屬龍骨</TableCell>
                  <TableCell>MS-C100</TableCell>
                  <TableCell>100×50mm</TableCell>
                  <TableCell>0.8mm</TableCell>
                  <TableCell>鍍鋅鋼</TableCell>
                  <TableCell>牆身、天花</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell className="font-medium">金屬龍骨</TableCell>
                  <TableCell>MS-U50</TableCell>
                  <TableCell>50×40mm</TableCell>
                  <TableCell>0.5mm</TableCell>
                  <TableCell>鍍鋅鋼</TableCell>
                  <TableCell>天花</TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  )
}

// 鋁複合板產品數據
const aluminumCompositePanels = [
  {
    id: "acp-001",
    title: "鋁複合板 銀色 3mm",
    description: "高品質鋁複合板，銀色表面，厚度3mm，適用於外牆裝飾和招牌製作。",
    price: 980,
    image: "/placeholder.svg?height=400&width=600",
  },
  {
    id: "acp-002",
    title: "鋁複合板 白色 4mm",
    description: "高品質鋁複合板，白色表面，厚度4mm，適用於外牆裝飾和招牌製作。",
    price: 1050,
    image: "/placeholder.svg?height=400&width=600",
  },
  {
    id: "acp-003",
    title: "鋁複合板 黑色 3mm",
    description: "高品質鋁複合板，黑色表面，厚度3mm，適用於外牆裝飾和招牌製作。",
    price: 980,
    image: "/placeholder.svg?height=400&width=600",
  },
  {
    id: "acp-004",
    title: "鋁複合板 紅色 4mm",
    description: "高品質鋁複合板，紅色表面，厚度4mm，適用於外牆裝飾和招牌製作。",
    price: 1080,
    image: "/placeholder.svg?height=400&width=600",
  },
  {
    id: "acp-005",
    title: "鋁複合板 藍色 3mm",
    description: "高品質鋁複合板，藍色表面，厚度3mm，適用於外牆裝飾和招牌製作。",
    price: 980,
    image: "/placeholder.svg?height=400&width=600",
  },
  {
    id: "acp-006",
    title: "鋁複合板 金色 4mm",
    description: "高品質鋁複合板，金色表面，厚度4mm，適用於高級外牆裝飾和招牌製作。",
    price: 1150,
    image: "/placeholder.svg?height=400&width=600",
  },
]

// 金屬龍骨產品數據
const metalStuds = [
  {
    id: "ms-001",
    title: "C型金屬龍骨 75×45mm",
    description: "鍍鋅鋼C型龍骨，尺寸75×45mm，厚度0.6mm，適用於隔牆和天花板框架。",
    price: 45,
    image:
      "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/a7bcac83-2ca6-409d-95d1-519e7c0be080.JPG-cvtHlR1ce3ZTkWjVShJJFoxVUYOEt5.jpeg",
  },
  {
    id: "ms-002",
    title: "C型金屬龍骨 100×50mm",
    description: "鍍鋅鋼C型龍骨，尺寸100×50mm，厚度0.8mm，適用於隔牆和天花板框架。",
    price: 58,
    image: "/placeholder.svg?height=400&width=600",
  },
  {
    id: "ms-003",
    title: "U型金屬龍骨 50×40mm",
    description: "鍍鋅鋼U型龍骨，尺寸50×40mm，厚度0.5mm，適用於天花板框架。",
    price: 35,
    image: "/placeholder.svg?height=400&width=600",
  },
]
