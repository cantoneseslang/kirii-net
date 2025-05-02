"use client"

import type React from "react"

import { useState } from "react"
import Link from "next/link"
import Image from "next/image"
import { Mail, Lock, ShoppingCart, AlertTriangle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { useAuth } from "@/components/auth-provider"
import { useRouter } from "next/navigation"
import { useToast } from "@/components/ui/use-toast"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Footer } from "@/components/footer"

export default function LoginPage() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [rememberMe, setRememberMe] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const { signIn, signUp, isSupabaseAvailable } = useAuth()
  const router = useRouter()
  const { toast } = useToast()

  // ログインボタンを押したときに顧客登録ページに遷移する
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()

    // 顧客登録ページに遷移
    router.push("/customer-registration")
  }

  // 登録ボタンを押したときも顧客登録ページに遷移する
  const handleRegister = async () => {
    router.push("/customer-registration")
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
      <main className="flex-1 flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="space-y-1">
            <CardTitle className="text-2xl text-center">登入</CardTitle>
            <CardDescription className="text-center">請輸入您的帳戶資料登入</CardDescription>
          </CardHeader>

          {!isSupabaseAvailable && (
            <div className="px-6 pb-2">
              <Alert variant="destructive">
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription>
                  預覽模式：認證功能目前不可用。請設置 Supabase 環境變量以啟用完整功能。
                </AlertDescription>
              </Alert>
            </div>
          )}

          <form onSubmit={handleLogin}>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">電郵地址</Label>
                <div className="flex">
                  <Mail className="mr-2 h-4 w-4 opacity-50 mt-3" />
                  <Input
                    id="email"
                    type="email"
                    placeholder="example@company.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>
              </div>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="password">密碼</Label>
                  <Link href="/forgot-password" className="text-sm text-primary hover:underline">
                    忘記密碼？
                  </Link>
                </div>
                <div className="flex">
                  <Lock className="mr-2 h-4 w-4 opacity-50 mt-3" />
                  <Input
                    id="password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="remember"
                  checked={rememberMe}
                  onCheckedChange={(checked) => setRememberMe(checked === true)}
                />
                <Label htmlFor="remember" className="text-sm">
                  記住登入資料
                </Label>
              </div>
            </CardContent>
            <CardFooter className="flex flex-col">
              <Button className="w-full" type="submit">
                {isLoading ? "處理中..." : "登入"}
              </Button>
              <p className="mt-4 text-center text-sm text-muted-foreground">
                還沒有帳戶？
                <Button variant="link" className="p-0 h-auto font-normal" onClick={handleRegister} type="button">
                  立即註冊
                </Button>
              </p>
            </CardFooter>
          </form>
        </Card>
      </main>
      <Footer />
    </div>
  )
}
