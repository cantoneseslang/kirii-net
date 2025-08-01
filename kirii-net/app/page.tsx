"use client"

import Link from "next/link"
import Image from "next/image"
import { ShoppingCart } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Footer } from "@/components/footer"
import { Header } from "@/components/header"

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main className="flex-1">
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
          <div className="relative z-10 container px-4 md:px-6">
            <div className="flex flex-col items-center justify-center space-y-4 text-center">
              <div className="space-y-2">
                <h1 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl lg:text-6xl">
                  香港建築材料專家
                </h1>
                <p className="mx-auto max-w-[700px] text-gray-300 md:text-xl">
                  為香港建築行業提供高品質建築材料的網上商店。我們提供各種建築材料，包括鋁複合板、石膏板、鐵建築鋼材等。
                </p>
              </div>
              <div className="space-x-4">
                <Link href="/products">
                  <Button size="lg" className="bg-white text-gray-900 hover:bg-gray-100">
                    瀏覽產品
                  </Button>
                </Link>
                <Link href="/custom">
                  <Button size="lg" className="bg-white text-gray-900 hover:bg-gray-100">
                    定制產品
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </section>
        <section className="w-full py-12 md:py-24 lg:py-32">
          <div className="container px-4 md:px-6">
            <div className="flex flex-col items-center justify-center space-y-4 text-center">
              <div className="space-y-2">
                <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">產品類別</h2>
                <p className="mx-auto max-w-[700px] text-muted-foreground md:text-xl">
                  我們提供各種高品質建築材料，滿足您的不同需求。
                </p>
              </div>
            </div>
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 mt-8">
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
              <CategoryCard
                title="鋁天花材料"
                description="Aluminum Ceiling Materials"
                href="/products/aluminum-ceiling"
                imagePath="/placeholder.svg?height=300&width=300"
              />
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
    <Link href={href}>
      <Card className="overflow-hidden hover:shadow-lg transition-shadow">
        <CardContent className="p-0">
          <div className="aspect-square bg-muted">
            <Image
              src={imagePath}
              alt={title}
              width={300}
              height={300}
              className="w-full h-full object-cover"
            />
          </div>
        </CardContent>
        <CardHeader className="p-4">
          <CardTitle>{title}</CardTitle>
          <CardDescription>{description}</CardDescription>
        </CardHeader>
      </Card>
    </Link>
  )
}
