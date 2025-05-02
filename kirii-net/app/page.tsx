import Link from "next/link"
import Image from "next/image"
import { Package, ShoppingCart, Truck, Shield, Star, ArrowRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Footer } from "@/components/footer"

export default function Home() {
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
        {/* ヒーローセクション - より視覚的に魅力的なデザイン */}
        <section className="relative w-full py-20 md:py-32 overflow-hidden bg-gradient-to-r from-gray-900 to-gray-800 text-white">
          <div className="absolute inset-0">
            <Image
              src="/images/uploaded/main-home-page.png"
              alt="メイン背景"
              fill
              style={{ opacity: 0.3 }}
              className="object-cover"
              priority
            />
            <div className="absolute inset-0 opacity-20">
              <div className="absolute inset-0 bg-[url('/placeholder.svg?height=1080&width=1920')] bg-cover bg-center" />
            </div>
          </div>
          <div className="container relative px-4 md:px-6 z-10">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
              <div className="space-y-6">
                <div className="inline-block rounded-lg bg-primary/20 px-3 py-1 text-sm text-primary-foreground backdrop-blur">
                  香港建築行業優質材料供應商
                </div>
                <h1 className="text-4xl font-bold tracking-tighter sm:text-5xl md:text-6xl">
                  為您的建築項目
                  <br />
                  提供最佳材料
                </h1>
                <p className="max-w-[600px] text-gray-300 md:text-xl">
                  KIRII NET是為香港建築行業提供高品質建材的網上商店。 輕鬆訂購您項目所需的材料。
                </p>
                <div className="flex flex-col sm:flex-row gap-4">
                  <Link href="/products">
                    <Button size="lg" className="w-full sm:w-auto">
                      瀏覽產品
                    </Button>
                  </Link>
                  <Link href="/custom">
                    <Button
                      size="lg"
                      variant="outline"
                      className="w-full sm:w-auto bg-white/10 hover:bg-white/20 text-white border-white/20"
                    >
                      定制產品諮詢
                    </Button>
                  </Link>
                </div>
                <div className="flex items-center gap-4 pt-4">
                  <div className="flex -space-x-2">
                    {[1, 2, 3, 4].map((i) => (
                      <div key={i} className="w-8 h-8 rounded-full bg-gray-300 border-2 border-white" />
                    ))}
                  </div>
                  <p className="text-sm text-gray-300">
                    <span className="font-medium">500+</span> 香港建築公司正在使用
                  </p>
                </div>
              </div>
              <div className="relative hidden md:block">
                <div className="absolute -top-12 -right-12 w-64 h-64 bg-primary/30 rounded-full blur-3xl" />
                <div className="absolute -bottom-12 -left-12 w-64 h-64 bg-blue-500/30 rounded-full blur-3xl" />
                <div className="relative bg-white/5 backdrop-blur-sm border border-white/10 p-6 rounded-2xl shadow-2xl">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="aspect-square bg-white/10 rounded-lg p-4 flex items-center justify-center">
                      <Package className="h-12 w-12 text-primary" />
                    </div>
                    <div className="aspect-square bg-white/10 rounded-lg p-4 flex items-center justify-center">
                      <Truck className="h-12 w-12 text-primary" />
                    </div>
                    <div className="aspect-square bg-white/10 rounded-lg p-4 flex items-center justify-center">
                      <Shield className="h-12 w-12 text-primary" />
                    </div>
                    <div className="aspect-square bg-white/10 rounded-lg p-4 flex items-center justify-center">
                      <Star className="h-12 w-12 text-primary" />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* 特徴セクション */}
        <section className="w-full py-16 md:py-24 bg-white">
          <div className="container px-4 md:px-6">
            <div className="flex flex-col items-center justify-center space-y-4 text-center mb-12">
              <div className="inline-block rounded-lg bg-primary/10 px-3 py-1 text-sm text-primary">
                KIRII NET的特點
              </div>
              <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl">為何選擇我們</h2>
              <p className="max-w-[700px] text-gray-500 md:text-lg">
                我們為建築行業專業人士提供最高品質的產品和卓越的服務
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <Card className="border-none shadow-lg">
                <CardHeader className="pb-2">
                  <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                    <Package className="h-6 w-6 text-primary" />
                  </div>
                  <CardTitle>優質建材</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-500">我們只提供精選的高品質建築材料，確保您項目的品質和耐久性。</p>
                </CardContent>
              </Card>
              <Card className="border-none shadow-lg">
                <CardHeader className="pb-2">
                  <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                    <Truck className="h-6 w-6 text-primary" />
                  </div>
                  <CardTitle>快速配送</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-500">我們提供香港全區快速配送服務，防止項目延誤。最快可安排次日送達。</p>
                </CardContent>
              </Card>
              <Card className="border-none shadow-lg">
                <CardHeader className="pb-2">
                  <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                    <Shield className="h-6 w-6 text-primary" />
                  </div>
                  <CardTitle>安全支付</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-500">我們採用Stripe安全支付系統，保護您的資料安全。</p>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        {/* 製品カテゴリーセクション - 視覚的に改善 */}
        <section className="w-full py-16 md:py-24 bg-gray-50">
          <div className="container px-4 md:px-6">
            <div className="flex flex-col items-center justify-center space-y-4 text-center mb-12">
              <div className="inline-block rounded-lg bg-primary/10 px-3 py-1 text-sm text-primary">產品類別</div>
              <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl">豐富的產品系列</h2>
              <p className="max-w-[700px] text-gray-500 md:text-lg">我們提供各種建材，適合各類建築項目</p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              <CategoryCard
                title="鋁複合板"
                description="Aluminum Composite Panel"
                href="/products/aluminum-composite-panel"
                imagePath="/images/metal-studs.png"
              />
              <CategoryCard
                title="鐵建築鋼材"
                description="建築用鋼材"
                href="/products/steel-materials"
                imagePath="/placeholder.svg?height=300&width=300"
              />
              <CategoryCard
                title="石膏板"
                description="一般用石膏板"
                href="/products/gypsum-board"
                imagePath="/images/uploaded/normal-board.jpg"
              />
              <CategoryCard
                title="防火石膏板"
                description="耐火性能優良的石膏板"
                href="/products/fire-resistant-board"
                imagePath="/images/uploaded/fire-resistant-board.jpg"
              />
              <CategoryCard
                title="岩棉 50mm"
                description="Rockwool 50mm"
                href="/products/rockwool-50mm"
                imagePath="/images/uploaded/rockwool-50mm.jpg"
              />
            </div>
            <div className="flex justify-center mt-10">
              <Link href="/products">
                <Button variant="outline" className="group">
                  查看所有產品
                  <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                </Button>
              </Link>
            </div>
          </div>
        </section>

        {/* お客様の声セクション - 新規追加 */}
        <section className="w-full py-16 md:py-24 bg-white">
          <div className="container px-4 md:px-6">
            <div className="flex flex-col items-center justify-center space-y-4 text-center mb-12">
              <div className="inline-block rounded-lg bg-primary/10 px-3 py-1 text-sm text-primary">客戶評價</div>
              <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl">值得信賴的合作夥伴</h2>
              <p className="max-w-[700px] text-gray-500 md:text-lg">許多建築公司選擇我們的服務</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <TestimonialCard
                quote="KIRII NET的產品質量高，交貨準時可靠。即使是大型項目，我們也可以放心下單。"
                author="陳大文"
                company="大文建築有限公司"
              />
              <TestimonialCard
                quote="他們能夠快速響應緊急訂單，幫助我們避免了工期延誤。我們將繼續使用他們的服務。"
                author="李志明"
                company="志明工程公司"
              />
              <TestimonialCard
                quote="他們對定制產品諮詢的回應非常專業，成功為我們採購了特殊尺寸的材料。"
                author="黃建國"
                company="建國建設"
              />
            </div>
          </div>
        </section>

        {/* CTAセクション - 新規追加 */}
        <section className="w-full py-16 md:py-24 bg-primary text-primary-foreground">
          <div className="container px-4 md:px-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
              <div className="space-y-4">
                <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">開始您的項目</h2>
                <p className="max-w-[600px] md:text-xl">使用高品質建材，確保您的項目成功。立即查看我們的產品。</p>
              </div>
              <div className="flex flex-col sm:flex-row gap-4 justify-center md:justify-end">
                <Link href="/products">
                  <Button size="lg" variant="secondary" className="w-full sm:w-auto">
                    瀏覽產品
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  )
}

function CategoryCard({
  title,
  description,
  href,
  imagePath,
}: {
  title: string
  description: string
  href: string
  imagePath: string
}) {
  return (
    <Link href={href} className="group">
      <Card className="overflow-hidden border-none shadow-lg transition-all duration-200 hover:shadow-xl">
        <div className="aspect-square relative overflow-hidden">
          <Image
            src={imagePath || "/placeholder.svg"}
            alt={title}
            fill
            className="object-cover transition-transform duration-300 group-hover:scale-105"
          />
        </div>
        <CardHeader className="p-4">
          <CardTitle className="text-lg">{title}</CardTitle>
          <CardDescription>{description}</CardDescription>
        </CardHeader>
      </Card>
    </Link>
  )
}

function TestimonialCard({
  quote,
  author,
  company,
}: {
  quote: string
  author: string
  company: string
}) {
  return (
    <Card className="border-none shadow-lg">
      <CardContent className="pt-6">
        <div className="mb-4">
          {[1, 2, 3, 4, 5].map((i) => (
            <Star key={i} className="inline-block h-5 w-5 fill-primary text-primary" />
          ))}
        </div>
        <p className="mb-4 text-gray-600">{quote}</p>
        <div className="flex items-center gap-4">
          <div className="h-10 w-10 rounded-full bg-gray-200" />
          <div>
            <p className="font-medium">{author}</p>
            <p className="text-sm text-gray-500">{company}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
