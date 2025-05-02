"use client"

import { useState } from "react"
import Link from "next/link"
import Image from "next/image"
import { Minus, Plus, ShoppingCart, Trash2, ExternalLink } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { useToast } from "@/components/ui/use-toast"
import { Footer } from "@/components/footer"

export default function CartPage() {
  const { toast } = useToast()
  // Sample cart items (in a real app, this would be managed with context/state management)
  const [cartItems, setCartItems] = useState([
    {
      id: "acp-001",
      title: "鋁複合板 銀色",
      price: 980,
      quantity: 2,
    },
    {
      id: "gyp-001",
      title: "石膏板 9.5mm",
      price: 95,
      quantity: 5,
    },
  ])

  const updateQuantity = (id: string, newQuantity: number) => {
    if (newQuantity < 1) return
    setCartItems((items) => items.map((item) => (item.id === id ? { ...item, quantity: newQuantity } : item)))
  }

  const removeItem = (id: string) => {
    setCartItems((items) => items.filter((item) => item.id !== id))
  }

  const subtotal = cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0)
  const shipping = subtotal > 2000 ? 0 : 200 // Free shipping over HK$2,000
  const total = subtotal + shipping

  const handleCheckout = () => {
    // 在實際應用中，這裡會重定向到 Stripe Payment Link
    // 例如: window.location.href = "https://buy.stripe.com/your-payment-link"
    toast({
      title: "正在前往付款頁面",
      description: "您將被重定向到 Stripe 安全支付頁面。",
    })
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
        <div className="container py-12">
          <h1 className="text-3xl font-bold mb-8">購物車</h1>

          {cartItems.length === 0 ? (
            <div className="text-center py-12">
              <h2 className="text-xl font-medium mb-4">購物車是空的</h2>
              <p className="text-muted-foreground mb-6">請添加產品到購物車。</p>
              <Link href="/products">
                <Button>返回產品目錄</Button>
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
              <div className="md:col-span-2">
                <Card>
                  <CardHeader>
                    <CardTitle>購物車內的產品</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>產品</TableHead>
                          <TableHead className="text-right">單價</TableHead>
                          <TableHead>數量</TableHead>
                          <TableHead className="text-right">小計</TableHead>
                          <TableHead></TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {cartItems.map((item) => (
                          <TableRow key={item.id}>
                            <TableCell className="font-medium">{item.title}</TableCell>
                            <TableCell className="text-right">HK${item.price.toLocaleString()}</TableCell>
                            <TableCell>
                              <div className="flex items-center gap-2">
                                <Button
                                  variant="outline"
                                  size="icon"
                                  className="h-8 w-8"
                                  onClick={() => updateQuantity(item.id, item.quantity - 1)}
                                >
                                  <Minus className="h-4 w-4" />
                                </Button>
                                <span className="w-8 text-center">{item.quantity}</span>
                                <Button
                                  variant="outline"
                                  size="icon"
                                  className="h-8 w-8"
                                  onClick={() => updateQuantity(item.id, item.quantity + 1)}
                                >
                                  <Plus className="h-4 w-4" />
                                </Button>
                              </div>
                            </TableCell>
                            <TableCell className="text-right">
                              HK${(item.price * item.quantity).toLocaleString()}
                            </TableCell>
                            <TableCell>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8"
                                onClick={() => removeItem(item.id)}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </CardContent>
                  <CardFooter className="flex justify-between">
                    <Link href="/products">
                      <Button variant="outline">繼續購物</Button>
                    </Link>
                  </CardFooter>
                </Card>
              </div>
              <div>
                <Card>
                  <CardHeader>
                    <CardTitle>訂單摘要</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="flex justify-between">
                        <span>小計</span>
                        <span>HK${subtotal.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>運費</span>
                        <span>{shipping === 0 ? "免費" : `HK$${shipping.toLocaleString()}`}</span>
                      </div>
                      <Separator />
                      <div className="flex justify-between font-bold">
                        <span>總計</span>
                        <span>HK${total.toLocaleString()}</span>
                      </div>
                    </div>
                  </CardContent>
                  <CardFooter className="flex flex-col gap-4">
                    <Button className="w-full" onClick={handleCheckout}>
                      前往付款
                      <ExternalLink className="ml-2 h-4 w-4" />
                    </Button>
                    <p className="text-xs text-center text-muted-foreground">
                      點擊上方按鈕將跳轉至 Stripe 安全支付頁面
                    </p>
                  </CardFooter>
                </Card>
              </div>
            </div>
          )}
        </div>
      </main>
      <Footer />
    </div>
  )
}
