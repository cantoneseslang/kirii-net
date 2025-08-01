"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import Image from "next/image"
import { CreditCard, ShoppingCart, Truck, Calendar, Clock } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Separator } from "@/components/ui/separator"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

export default function CheckoutPage() {
  const [paymentMethod, setPaymentMethod] = useState("credit-card")
  const [deliveryMethod, setDeliveryMethod] = useState("standard")
  const [deliveryQuote, setDeliveryQuote] = useState(null)
  const [loading, setLoading] = useState(false)
  const [currentTab, setCurrentTab] = useState("shipping")

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

  // デリバリー見積もりを取得
  const getDeliveryQuote = async (deliveryData) => {
    setLoading(true)
    try {
      const response = await fetch('http://localhost:3000/api/delivery/quote', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          customerName: deliveryData.customerName,
          customerPhone: deliveryData.customerPhone,
          deliveryAddress: deliveryData.deliveryAddress,
          deliveryDate: deliveryData.deliveryDate,
          deliveryTime: deliveryData.deliveryTime,
          orderItems: cartSummary.items,
          orderTotal: cartSummary.subtotal
        })
      })
      
      const result = await response.json()
      if (result.success) {
        setDeliveryQuote(result.data)
      } else {
        console.error('デリバリー見積もり取得エラー:', result.error)
      }
    } catch (error) {
      console.error('デリバリー見積もり取得エラー:', error)
    } finally {
      setLoading(false)
    }
  }

  // デリバリー方法が変更された時の処理
  const handleDeliveryMethodChange = (method) => {
    setDeliveryMethod(method)
    if (method === "lalamove") {
      // デリバリー情報が入力済みの場合、見積もりを取得
      const formData = getFormData()
      if (formData.deliveryAddress && formData.deliveryDate && formData.deliveryTime) {
        getDeliveryQuote(formData)
      }
    }
  }

  // フォームデータを取得
  const getFormData = () => {
    return {
      customerName: document.getElementById('customer-name')?.value || '',
      customerPhone: document.getElementById('phone')?.value || '',
      deliveryAddress: document.getElementById('address')?.value || '',
      deliveryDate: document.getElementById('delivery-date')?.value || '',
      deliveryTime: document.getElementById('delivery-time')?.value || ''
    }
  }

  // デリバリー情報が入力された時の処理
  const handleDeliveryInfoChange = () => {
    if (deliveryMethod === "lalamove") {
      const formData = getFormData()
      if (formData.deliveryAddress && formData.deliveryDate && formData.deliveryTime) {
        getDeliveryQuote(formData)
      }
    }
  }

  // 統合決済処理
  const handleConfirmOrder = async () => {
    if (deliveryMethod === "lalamove" && !deliveryQuote) {
      alert("請先取得配送報價")
      return
    }

    setLoading(true)
    try {
      // 1. 商品注文を処理（Stripe決済）
      const orderData = {
        items: cartSummary.items,
        customerInfo: {
          name: document.getElementById('customer-name')?.value || '',
          email: document.getElementById('email')?.value || '',
          phone: document.getElementById('phone')?.value || '',
          address: document.getElementById('address')?.value || '',
          district: document.getElementById('district')?.value || ''
        },
        deliveryMethod: deliveryMethod,
        deliveryQuote: deliveryQuote,
        totalAmount: deliveryMethod === "lalamove" && deliveryQuote 
          ? deliveryQuote.totalWithDelivery 
          : cartSummary.total
      }

      // 2. デリバリー注文を作成（Lalamove API）
      if (deliveryMethod === "lalamove" && deliveryQuote) {
        const deliveryResponse = await fetch('http://localhost:3000/api/delivery/order', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            quotationId: deliveryQuote.quotationId,
            customerName: orderData.customerInfo.name,
            customerPhone: orderData.customerInfo.phone,
            orderItems: cartSummary.items,
            orderTotal: cartSummary.subtotal,
            deliveryFee: deliveryQuote.deliveryFee,
            totalWithDelivery: deliveryQuote.totalWithDelivery
          })
        })

        const deliveryResult = await deliveryResponse.json()
        if (!deliveryResult.success) {
          throw new Error('デリバリー注文の作成に失敗しました')
        }

        // デリバリー注文IDを保存
        orderData.deliveryOrderId = deliveryResult.data.deliveryOrderId
      }

      // 3. Stripe決済を実行
      const paymentResponse = await fetch('/api/create-payment-intent', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          amount: orderData.totalAmount,
          currency: 'hkd',
          metadata: {
            orderType: 'product_with_delivery',
            deliveryMethod: deliveryMethod,
            deliveryOrderId: orderData.deliveryOrderId || ''
          }
        })
      })

      const paymentResult = await paymentResponse.json()
      if (!paymentResult.success) {
        throw new Error('決済の作成に失敗しました')
      }

      // 4. 成功時の処理
      console.log('注文完了:', {
        orderData,
        paymentIntentId: paymentResult.paymentIntentId,
        deliveryOrderId: orderData.deliveryOrderId
      })

      // 成功ページにリダイレクト
      window.location.href = `/checkout/success?orderId=${paymentResult.paymentIntentId}&deliveryOrderId=${orderData.deliveryOrderId || ''}`

    } catch (error) {
      console.error('注文処理エラー:', error)
      alert('注文処理に失敗しました。もう一度お試しください。')
    } finally {
      setLoading(false)
    }
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
              <Tabs value={currentTab} onValueChange={setCurrentTab} className="w-full">
                <TabsList className="grid w-full grid-cols-4">
                  <TabsTrigger value="shipping">送貨資料</TabsTrigger>
                  <TabsTrigger value="delivery">配送方式</TabsTrigger>
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
                        <Label htmlFor="customer-name">客戶姓名</Label>
                        <Input id="customer-name" placeholder="陳大文" onChange={handleDeliveryInfoChange} />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="email">電郵地址</Label>
                        <Input id="email" type="email" placeholder="example@example.com" />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="phone">電話號碼</Label>
                        <Input id="phone" type="tel" placeholder="9123 4567" onChange={handleDeliveryInfoChange} />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="district">地區</Label>
                        <Input id="district" placeholder="觀塘" />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="address">詳細地址</Label>
                        <Input id="address" placeholder="觀塘道123號XX大廈10樓A室" onChange={handleDeliveryInfoChange} />
                      </div>
                    </CardContent>
                    <CardFooter>
                      <Button className="ml-auto" onClick={() => setCurrentTab("delivery")}>下一步</Button>
                    </CardFooter>
                  </Card>
                </TabsContent>

                <TabsContent value="delivery">
                  <Card>
                    <CardHeader>
                      <CardTitle>配送方式</CardTitle>
                      <CardDescription>請選擇您的配送方式。</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                      <RadioGroup value={deliveryMethod} onValueChange={handleDeliveryMethodChange} className="space-y-4">
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="standard" id="standard" />
                          <Label htmlFor="standard" className="flex items-center gap-2">
                            <Truck className="h-4 w-4" />
                            標準配送 (3-5個工作天)
                          </Label>
                        </div>
                        
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="lalamove" id="lalamove" />
                          <Label htmlFor="lalamove" className="flex items-center gap-2">
                            <Truck className="h-4 w-4" />
                            貨拉拉即時配送 (30-60分鐘)
                          </Label>
                        </div>
                      </RadioGroup>

                      {deliveryMethod === "lalamove" && (
                        <div className="pl-6 space-y-4 border-l-2 border-primary">
                          <div className="space-y-2">
                            <Label htmlFor="delivery-date">配送日期</Label>
                            <Input 
                              id="delivery-date" 
                              type="date" 
                              min={new Date().toISOString().split('T')[0]}
                              onChange={handleDeliveryInfoChange}
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="delivery-time">配送時間</Label>
                            <Select onValueChange={handleDeliveryInfoChange}>
                              <SelectTrigger>
                                <SelectValue placeholder="選擇時間" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="09:00">09:00</SelectItem>
                                <SelectItem value="10:00">10:00</SelectItem>
                                <SelectItem value="11:00">11:00</SelectItem>
                                <SelectItem value="12:00">12:00</SelectItem>
                                <SelectItem value="13:00">13:00</SelectItem>
                                <SelectItem value="14:00">14:00</SelectItem>
                                <SelectItem value="15:00">15:00</SelectItem>
                                <SelectItem value="16:00">16:00</SelectItem>
                                <SelectItem value="17:00">17:00</SelectItem>
                                <SelectItem value="18:00">18:00</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>

                          {loading && (
                            <div className="text-center py-4">
                              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
                              <p className="mt-2 text-sm text-muted-foreground">正在取得配送報價...</p>
                            </div>
                          )}

                          {deliveryQuote && (
                            <div className="bg-muted p-4 rounded-lg">
                              <h4 className="font-medium mb-2">配送報價</h4>
                              <div className="space-y-1 text-sm">
                                <div className="flex justify-between">
                                  <span>配送費用:</span>
                                  <span>HK${deliveryQuote.deliveryFee}</span>
                                </div>
                                <div className="flex justify-between">
                                  <span>預計時間:</span>
                                  <span>{deliveryQuote.estimatedTime}</span>
                                </div>
                                <div className="flex justify-between">
                                  <span>配送距離:</span>
                                  <span>{deliveryQuote.distance}</span>
                                </div>
                                <div className="flex justify-between font-medium">
                                  <span>總計:</span>
                                  <span>HK${deliveryQuote.totalWithDelivery}</span>
                                </div>
                              </div>
                            </div>
                          )}
                        </div>
                      )}
                    </CardContent>
                    <CardFooter className="flex justify-between">
                      <Button variant="outline" onClick={() => setCurrentTab("shipping")}>返回</Button>
                      <Button onClick={() => setCurrentTab("payment")}>下一步</Button>
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
                      <Button variant="outline" onClick={() => setCurrentTab("delivery")}>返回</Button>
                      <Button onClick={() => setCurrentTab("confirm")}>下一步</Button>
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
                        <h3 className="font-medium mb-2">配送方式</h3>
                        <p>{deliveryMethod === "lalamove" ? "貨拉拉即時配送" : "標準配送"}</p>
                        {deliveryMethod === "lalamove" && deliveryQuote && (
                          <div className="mt-2 text-sm text-muted-foreground">
                            <p>配送費用: HK${deliveryQuote.deliveryFee}</p>
                            <p>預計時間: {deliveryQuote.estimatedTime}</p>
                          </div>
                        )}
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
                          <span>配送費用</span>
                          <span>
                            {deliveryMethod === "lalamove" && deliveryQuote 
                              ? `HK$${deliveryQuote.deliveryFee}` 
                              : "免費"
                            }
                          </span>
                        </div>
                        <Separator />
                        <div className="flex justify-between font-bold">
                          <span>總計</span>
                          <span>
                            HK${deliveryMethod === "lalamove" && deliveryQuote 
                              ? deliveryQuote.totalWithDelivery.toLocaleString() 
                              : cartSummary.total.toLocaleString()
                            }
                          </span>
                        </div>
                      </div>
                    </CardContent>
                    <CardFooter className="flex justify-between">
                      <Button variant="outline" onClick={() => setCurrentTab("payment")}>返回</Button>
                      <Button onClick={handleConfirmOrder}>確認訂單</Button>
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
                      <span>配送費用</span>
                      <span>
                        {deliveryMethod === "lalamove" && deliveryQuote 
                          ? `HK$${deliveryQuote.deliveryFee}` 
                          : "免費"
                        }
                      </span>
                    </div>
                    <Separator />
                    <div className="flex justify-between font-bold">
                      <span>總計</span>
                      <span>
                        HK${deliveryMethod === "lalamove" && deliveryQuote 
                          ? deliveryQuote.totalWithDelivery.toLocaleString() 
                          : cartSummary.total.toLocaleString()
                        }
                      </span>
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
