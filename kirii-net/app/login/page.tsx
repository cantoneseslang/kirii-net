"use client"

import { useState } from "react"
import Link from "next/link"
import { Mail, Lock, AlertTriangle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { useAuth } from "@/components/auth-provider"
import { useRouter } from "next/navigation"
import { useToast } from "@/components/ui/use-toast"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Header } from "@/components/header"
import { getCustomerByEmail } from "@/lib/supabase"

export default function LoginPage() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [rememberMe, setRememberMe] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const { isSupabaseAvailable, setCustomer } = useAuth()
  const router = useRouter()
  const { toast } = useToast()

  // 顧客情報でログイン
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      // メールアドレスで顧客情報を検索
      const customer = await getCustomerByEmail(email)
      
      if (customer) {
        // 顧客情報をローカルストレージに保存
        localStorage.setItem('kirii-customer', JSON.stringify(customer))
        setCustomer(customer)
        
                 toast({
           title: "登入成功",
           description: `歡迎 ${customer.company_name}！`,
         })

        // ホームページにリダイレクト
        setTimeout(() => {
          router.push("/")
        }, 1000)
      } else {
                 toast({
           title: "登入失敗",
           description: "此電郵地址未登記。",
           variant: "destructive",
         })
      }
    } catch (error) {
      console.error('ログインエラー:', error)
             toast({
         title: "登入失敗",
         description: "登入時發生錯誤。",
         variant: "destructive",
       })
    } finally {
      setIsLoading(false)
    }
  }

  // 登録ボタンを押したときも顧客登録ページに遷移する
  const handleRegister = async () => {
    router.push("/customer-registration")
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
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
                                 <Button className="w-full" type="submit" disabled={isLoading}>
                     {isLoading ? "登入中..." : "顧客登入"}
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
    </div>
  )
}
