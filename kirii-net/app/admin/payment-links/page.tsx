"use client"

import Link from "next/link"
import Image from "next/image"
import { ArrowRight, ExternalLink, QrCode, Copy, LinkIcon } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"

export default function PaymentLinksPage() {
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
            <Link href="/admin" className="text-sm font-medium">
              管理面板
            </Link>
            <Link href="/admin/products" className="text-sm font-medium">
              產品管理
            </Link>
            <Link href="/admin/orders" className="text-sm font-medium">
              訂單管理
            </Link>
            <Link href="/admin/payment-links" className="text-sm font-medium">
              付款連結
            </Link>
          </nav>
          <div className="flex items-center gap-4">
            <Button>登出</Button>
          </div>
        </div>
      </header>
      <main className="flex-1">
        <div className="container py-12">
          <h1 className="text-3xl font-bold mb-8">Stripe 付款連結管理</h1>

          <Alert className="mb-8">
            <AlertTitle>使用 Stripe Payment Links 簡化付款流程</AlertTitle>
            <AlertDescription>
              Stripe Payment Links 是一種簡單的方式，讓客戶可以在線上向您付款。您只需創建一個連結，就可以與所有人分享。
            </AlertDescription>
          </Alert>

          <Tabs defaultValue="create" className="w-full">
            <TabsList className="grid w-full grid-cols-3 mb-8">
              <TabsTrigger value="create">創建付款連結</TabsTrigger>
              <TabsTrigger value="manage">管理付款連結</TabsTrigger>
              <TabsTrigger value="integrate">整合到網站</TabsTrigger>
            </TabsList>
            <TabsContent value="create">
              <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
                <Card>
                  <CardHeader>
                    <CardTitle>創建產品或訂閱的付款連結</CardTitle>
                    <CardDescription>適合電子商務或 SaaS，您以固定價格銷售產品。</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <ol className="list-decimal pl-5 space-y-2">
                      <li>在 Stripe 儀表板中，打開 Payment Links 頁面並點擊「+New」。</li>
                      <li>選擇現有產品或點擊「+Add a new product」。</li>
                      <li>如果您添加新產品，填寫產品詳情並點擊「Add product」。</li>
                      <li>點擊「Create link」。</li>
                    </ol>
                  </CardContent>
                  <CardFooter>
                    <a
                      href="https://dashboard.stripe.com/payment-links/create/standard-pricing"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-full"
                    >
                      <Button className="w-full">
                        前往 Stripe 創建付款連結
                        <ExternalLink className="ml-2 h-4 w-4" />
                      </Button>
                    </a>
                  </CardFooter>
                </Card>
                <Card>
                  <CardHeader>
                    <CardTitle>創建客戶自選金額的付款連結</CardTitle>
                    <CardDescription>適合捐款、小費或自由定價模式。</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <ol className="list-decimal pl-5 space-y-2">
                      <li>在 Stripe 儀表板中，打開 Payment Links 頁面並點擊「New」。</li>
                      <li>填寫付款詳情。</li>
                      <li>（可選）設置預設金額。</li>
                      <li>（可選）設置最低和最高付款金額。</li>
                      <li>點擊「Create link」。</li>
                    </ol>
                  </CardContent>
                  <CardFooter>
                    <a
                      href="https://dashboard.stripe.com/payment-links/create/customer-chooses-pricing"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-full"
                    >
                      <Button className="w-full">
                        前往 Stripe 創建自選金額連結
                        <ExternalLink className="ml-2 h-4 w-4" />
                      </Button>
                    </a>
                  </CardFooter>
                </Card>
              </div>
            </TabsContent>
            <TabsContent value="manage">
              <Card>
                <CardHeader>
                  <CardTitle>管理您的付款連結</CardTitle>
                  <CardDescription>查看、編輯和停用您的付款連結。</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p>在 Stripe 儀表板中，您可以：</p>
                  <ul className="list-disc pl-5 space-y-2">
                    <li>查看所有付款連結及其狀態</li>
                    <li>複製連結以分享</li>
                    <li>生成 QR 碼</li>
                    <li>創建購買按鈕</li>
                    <li>停用不再需要的連結</li>
                  </ul>
                  <div className="flex flex-col gap-4 mt-6">
                    <div className="flex items-center gap-4">
                      <Copy className="h-5 w-5 text-muted-foreground" />
                      <div>
                        <p className="font-medium">複製連結</p>
                        <p className="text-sm text-muted-foreground">點擊現有連結旁邊的複製圖標</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <QrCode className="h-5 w-5 text-muted-foreground" />
                      <div>
                        <p className="font-medium">生成 QR 碼</p>
                        <p className="text-sm text-muted-foreground">選擇連結並點擊「QR code」</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <LinkIcon className="h-5 w-5 text-muted-foreground" />
                      <div>
                        <p className="font-medium">停用連結</p>
                        <p className="text-sm text-muted-foreground">點擊連結旁邊的「⋯」菜單，然後選擇「Deactivate」</p>
                      </div>
                    </div>
                  </div>
                </CardContent>
                <CardFooter>
                  <a
                    href="https://dashboard.stripe.com/payment-links"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full"
                  >
                    <Button className="w-full">
                      管理付款連結
                      <ExternalLink className="ml-2 h-4 w-4" />
                    </Button>
                  </a>
                </CardFooter>
              </Card>
            </TabsContent>
            <TabsContent value="integrate">
              <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
                <Card>
                  <CardHeader>
                    <CardTitle>分享付款連結</CardTitle>
                    <CardDescription>將您的付款連結分享到各種平台。</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <p>您可以在以下地方分享您的付款連結：</p>
                    <ul className="list-disc pl-5 space-y-2">
                      <li>電子郵件</li>
                      <li>短信</li>
                      <li>社交媒體平台</li>
                      <li>您的網站</li>
                      <li>印刷材料（通過 QR 碼）</li>
                    </ul>
                    <p className="mt-4">
                      要獲取您的付款連結，請前往 Stripe 儀表板的 Payment Links 頁面，點擊現有連結旁邊的複製圖標。
                    </p>
                  </CardContent>
                  <CardFooter>
                    <a
                      href="https://dashboard.stripe.com/payment-links"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-full"
                    >
                      <Button className="w-full">
                        獲取付款連結
                        <ExternalLink className="ml-2 h-4 w-4" />
                      </Button>
                    </a>
                  </CardFooter>
                </Card>
                <Card>
                  <CardHeader>
                    <CardTitle>嵌入購買按鈕</CardTitle>
                    <CardDescription>將付款連結轉換為可嵌入的購買按鈕。</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <p>將付款連結轉換為嵌入式購買按鈕的步驟：</p>
                    <ol className="list-decimal pl-5 space-y-2">
                      <li>在 Payment Links 頁面選擇現有連結</li>
                      <li>點擊「Buy button」</li>
                      <li>複製代碼</li>
                      <li>將代碼粘貼到您的網站</li>
                    </ol>
                    <div className="bg-muted p-4 rounded-lg mt-4">
                      <p className="font-mono text-sm">
                        &lt;stripe-buy-button
                        <br />
                        &nbsp;&nbsp;buy-button-id="buy_btn_YOUR_ID"
                        <br />
                        &nbsp;&nbsp;publishable-key="pk_YOUR_KEY"
                        <br />
                        &gt;
                        <br />
                        &lt;/stripe-buy-button&gt;
                      </p>
                    </div>
                  </CardContent>
                  <CardFooter>
                    <a
                      href="https://docs.stripe.com/payment-links/buy-button"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-full"
                    >
                      <Button className="w-full">
                        了解更多關於購買按鈕
                        <ExternalLink className="ml-2 h-4 w-4" />
                      </Button>
                    </a>
                  </CardFooter>
                </Card>
              </div>
            </TabsContent>
          </Tabs>

          <div className="mt-12">
            <h2 className="text-2xl font-bold mb-4">整合到 KIRII NET 網站</h2>
            <p className="mb-6">要將 Stripe Payment Links 整合到您的 KIRII NET 網站，請按照以下步驟操作：</p>
            <ol className="list-decimal pl-5 space-y-4">
              <li>
                <p className="font-medium">創建產品付款連結</p>
                <p className="text-muted-foreground">在 Stripe 儀表板中為您的每個產品或產品組合創建付款連結。</p>
              </li>
              <li>
                <p className="font-medium">獲取付款連結 URL</p>
                <p className="text-muted-foreground">複製您創建的付款連結 URL。</p>
              </li>
              <li>
                <p className="font-medium">更新購物車結帳按鈕</p>
                <p className="text-muted-foreground">將購物車頁面的「結帳」按鈕更新為指向您的 Stripe 付款連結。</p>
                <div className="bg-muted p-4 rounded-lg mt-2">
                  <p className="font-mono text-sm">
                    &lt;Button onClick=&#123;() =&gt; window.location.href =
                    "https://buy.stripe.com/YOUR_LINK"&#125;&gt;
                    <br />
                    &nbsp;&nbsp;前往付款
                    <br />
                    &lt;/Button&gt;
                  </p>
                </div>
              </li>
            </ol>
            <div className="mt-8">
              <Link href="/admin">
                <Button variant="outline" className="flex items-center gap-2">
                  返回管理面板
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
            </div>
          </div>
        </div>
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
