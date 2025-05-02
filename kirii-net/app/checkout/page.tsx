"use client"

import { useState } from "react"
import Link from "next/link"
import Image from "next/image"
import { CreditCard, ShoppingCart } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Separator } from "@/components/ui/separator"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

export default function CheckoutPage() {
  const [paymentMethod, setPaymentMethod] = useState("credit-card")

  // Sample cart summary (in a real app, this would be fetched from state/context)
  const cartSummary = {
    items: [
      { id: "acp-001", title: "鋁複合板 銀色", price: 980, quantity: 2 },
      { id: "gyp-001", title: "石膏板 9.5mm", price: 95, quantity: 5 },
    ],
    subtotal: 2435,
    shipping: 0,
    total: 2435,
  }

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
                  {cartSummary.items.length}
                </span>
              </Button>
            </Link>
            <Button>登入</Button>
          </div>
        </div>
      </header>
      <main className="flex-1">
        <div className="container py-12">
          <h1 className="text-3xl font-bold mb-8">結帳</h1>

          <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
            <div className="md:col-span-2">
              <Tabs defaultValue="shipping" className="w-full">
                <TabsList className="grid w-full grid-cols-3">
                  <TabsTrigger value="shipping">送貨資料</TabsTrigger>
                  <TabsTrigger value="payment">付款方式</TabsTrigger>
                  <TabsTrigger value="confirm">確認</TabsTrigger>
                </TabsList>
                <TabsContent value="shipping">
                  <Card>
                    <CardHeader>
                      <CardTitle>送貨資料</CardTitle>
                      <CardDescription>請輸入您的送貨資料。</CardDescription>
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
                        <Label htmlFor="district">地區</Label>
                        <Input id="district" placeholder="觀塘" />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="address">詳細地址</Label>
                        <Input id="address" placeholder="觀塘道123號XX大廈10樓A室" />
                      </div>
                    </CardContent>
                    <CardFooter>
                      <Button className="ml-auto">下一步</Button>
                    </CardFooter>
                  </Card>
                </TabsContent>
                <TabsContent value="payment">
                  <Card>
                    <CardHeader>
                      <CardTitle>付款方式</CardTitle>
                      <CardDescription>請選擇您的付款方式。</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <RadioGroup value={paymentMethod} onValueChange={setPaymentMethod} className="space-y-4">
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="credit-card" id="credit-card" />
                          <Label htmlFor="credit-card" className="flex items-center gap-2">
                            <CreditCard className="h-4 w-4" />
                            信用卡
                          </Label>
                        </div>
                        <div className={paymentMethod === "credit-card" ? "pl-6 space-y-4" : "hidden"}>
                          <div className="space-y-2">
                            <Label htmlFor="card-number">卡號</Label>
                            <Input id="card-number" placeholder="1234 5678 9012 3456" />
                          </div>
                          <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                              <Label htmlFor="expiry">有效期</Label>
                              <Input id="expiry" placeholder="MM/YY" />
                            </div>
                            <div className="space-y-2">
                              <Label htmlFor="cvc">安全碼</Label>
                              <Input id="cvc" placeholder="123" />
                            </div>
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="name-on-card">持卡人姓名</Label>
                            <Input id="name-on-card" placeholder="CHAN TAI MAN" />
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="bank-transfer" id="bank-transfer" />
                          <Label htmlFor="bank-transfer">銀行轉賬</Label>
                        </div>
                      </RadioGroup>
                    </CardContent>
                    <CardFooter className="flex justify-between">
                      <Button variant="outline">返回</Button>
                      <Button>下一步</Button>
                    </CardFooter>
                  </Card>
                </TabsContent>
                <TabsContent value="confirm">
                  <Card>
                    <CardHeader>
                      <CardTitle>確認訂單</CardTitle>
                      <CardDescription>請確認您的訂單資料。</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                      <div>
                        <h3 className="font-medium mb-2">訂購產品</h3>
                        <ul className="space-y-2">
                          {cartSummary.items.map((item) => (
                            <li key={item.id} className="flex justify-between">
                              <span>
                                {item.title} × {item.quantity}
                              </span>
                              <span>HK${(item.price * item.quantity).toLocaleString()}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                      <Separator />
                      <div>
                        <h3 className="font-medium mb-2">送貨地址</h3>
                        <p>陳大文</p>
                        <p>觀塘道123號XX大廈10樓A室</p>
                        <p>觀塘</p>
                        <p>9123 4567</p>
                      </div>
                      <Separator />
                      <div>
                        <h3 className="font-medium mb-2">付款方式</h3>
                        <p>信用卡 (尾號: 3456)</p>
                      </div>
                      <Separator />
                      <div className="space-y-2">
                        <div className="flex justify-between">
                          <span>小計</span>
                          <span>HK${cartSummary.subtotal.toLocaleString()}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>運費</span>
                          <span>
                            {cartSummary.shipping === 0 ? "免費" : `HK$${cartSummary.shipping.toLocaleString()}`}
                          </span>
                        </div>
                        <Separator />
                        <div className="flex justify-between font-bold">
                          <span>總計</span>
                          <span>HK${cartSummary.total.toLocaleString()}</span>
                        </div>
                      </div>
                    </CardContent>
                    <CardFooter className="flex justify-between">
                      <Button variant="outline">返回</Button>
                      <Button>確認訂單</Button>
                    </CardFooter>
                  </Card>
                </TabsContent>
              </Tabs>
            </div>
            <div>
              <Card>
                <CardHeader>
                  <CardTitle>訂單摘要</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {cartSummary.items.map((item) => (
                      <div key={item.id} className="flex justify-between">
                        <span>
                          {item.title} × {item.quantity}
                        </span>
                        <span>HK${(item.price * item.quantity).toLocaleString()}</span>
                      </div>
                    ))}
                    <Separator />
                    <div className="flex justify-between">
                      <span>小計</span>
                      <span>HK${cartSummary.subtotal.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>運費</span>
                      <span>{cartSummary.shipping === 0 ? "免費" : `HK$${cartSummary.shipping.toLocaleString()}`}</span>
                    </div>
                    <Separator />
                    <div className="flex justify-between font-bold">
                      <span>總計</span>
                      <span>HK${cartSummary.total.toLocaleString()}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
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
