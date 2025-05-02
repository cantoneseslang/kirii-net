import Link from "next/link"
import Image from "next/image"
import { ShoppingCart } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Footer } from "@/components/footer"

export default function CustomPage() {
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
        <section className="w-full py-12 md:py-24 lg:py-32 bg-muted">
          <div className="container px-4 md:px-6">
            <div className="flex flex-col items-center justify-center space-y-4 text-center">
              <div className="space-y-2">
                <h1 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">定制建材</h1>
                <p className="mx-auto max-w-[700px] text-muted-foreground md:text-xl">
                  我們提供符合您需求的特殊尺寸和規格的建材。
                </p>
              </div>
            </div>
          </div>
        </section>
        <section className="w-full py-12 md:py-24 lg:py-32">
          <div className="container px-4 md:px-6">
            <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
              <div>
                <h2 className="text-2xl font-bold mb-4">關於定制建材</h2>
                <p className="mb-4">我們提供定制建材服務，適用於標準尺寸無法滿足的特殊項目或需要特殊規格的情況。</p>
                <p className="mb-4">我們可以定制以下建材：</p>
                <ul className="list-disc pl-6 mb-6 space-y-2">
                  <li>特殊尺寸的鋁複合板</li>
                  <li>特殊顏色的石膏板</li>
                  <li>特殊形狀的鐵建築鋼材</li>
                  <li>特殊規格的鋁天花材料</li>
                  <li>特殊密度的Rockwool防火棉</li>
                </ul>
                <p className="mb-4">我們將為您的項目提供最適合的建材解決方案。請告訴我們您的詳細需求。</p>
                <p>定制產品將在報價後進行製作並交付。有關交貨時間和規格的詳情，請通過諮詢表格聯繫我們。</p>
              </div>
              <div>
                <Card>
                  <CardHeader>
                    <CardTitle>定制諮詢表格</CardTitle>
                    <CardDescription>請告訴我們您需要的建材詳情。</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="first-name">姓氏</Label>
                        <Input id="first-name" placeholder="陳" />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="last-name">名字</Label>
                        <Input id="last-name" placeholder="大文" />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="email">電郵地址</Label>
                      <Input id="email" type="email" placeholder="example@example.com" />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="phone">電話號碼</Label>
                      <Input id="phone" type="tel" placeholder="9123 4567" />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="material-type">建材類型</Label>
                      <Input id="material-type" placeholder="例：鋁複合板、石膏板等" />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="dimensions">所需尺寸</Label>
                      <Input id="dimensions" placeholder="例：寬×高×厚" />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="quantity">所需數量</Label>
                      <Input id="quantity" type="number" placeholder="例：10" />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="details">詳細規格和要求</Label>
                      <Textarea id="details" placeholder="如有特殊規格或要求，請在此說明。" rows={4} />
                    </div>
                  </CardContent>
                  <CardFooter>
                    <Button className="w-full">提交諮詢</Button>
                  </CardFooter>
                </Card>
              </div>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  )
}
