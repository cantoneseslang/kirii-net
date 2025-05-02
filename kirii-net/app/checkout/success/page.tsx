import Link from "next/link"
import Image from "next/image"
import { CheckCircle2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"

export default function SuccessPage() {
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
        </div>
      </header>
      <main className="flex-1 flex items-center justify-center p-4">
        <Card className="max-w-md w-full">
          <CardHeader className="text-center">
            <div className="flex justify-center mb-4">
              <CheckCircle2 className="h-16 w-16 text-green-500" />
            </div>
            <CardTitle className="text-2xl">感謝您的訂購！</CardTitle>
            <CardDescription>您的訂單已成功處理。</CardDescription>
          </CardHeader>
          <CardContent className="text-center space-y-4">
            <p>我們已發送訂單確認電郵給您。如果您沒有收到電郵，請聯絡我們。</p>
            <div className="bg-muted p-4 rounded-lg">
              <p className="font-medium">訂單編號</p>
              <p className="text-lg">#ORD-12345</p>
            </div>
            <p>我們會通過電郵通知您產品的發貨狀態。</p>
          </CardContent>
          <CardFooter className="flex flex-col gap-2">
            <Link href="/" className="w-full">
              <Button className="w-full">返回首頁</Button>
            </Link>
            <Link href="/products" className="w-full">
              <Button variant="outline" className="w-full">
                繼續購物
              </Button>
            </Link>
          </CardFooter>
        </Card>
      </main>
      <footer className="w-full border-t py-6">
        <div className="container flex flex-col items-center justify-center gap-4 md:flex-row md:justify-between">
          <p className="text-center text-sm leading-loose text-muted-foreground md:text-left">
            Copyright © Kirii (Hong Kong) Limited. All Rights Reserved.
          </p>
          <div className="flex items-center gap-4">
            <Link href="/terms" className="text-sm text-muted-foreground underline underline-offset-4">
              使用條款
            </Link>
            <Link href="/privacy" className="text-sm text-muted-foreground underline underline-offset-4">
              私隱政策
            </Link>
            <Link href="/contact" className="text-sm text-muted-foreground underline underline-offset-4">
              聯絡我們
            </Link>
          </div>
        </div>
      </footer>
    </div>
  )
}
