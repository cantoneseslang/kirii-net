"use client"

import type React from "react"

import { useState } from "react"
import Link from "next/link"
import Image from "next/image"
import { Check, MapPin, User, Building, Phone, Info, ShoppingCart, ArrowRight, ArrowLeft } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Separator } from "@/components/ui/separator"
import { GoogleMap } from "@/components/google-map"
import { useRouter } from "next/navigation"
import { useToast } from "@/components/ui/use-toast"
import { Footer } from "@/components/footer"

export default function CustomerRegistrationPage() {
  const router = useRouter()
  const { toast } = useToast()

  const [formStep, setFormStep] = useState(0)
  const [selectedLocation, setSelectedLocation] = useState<{ lat: number; lng: number } | null>(null)
  const [locationType, setLocationType] = useState("address")

  // 公司資料
  const [companyName, setCompanyName] = useState("")
  const [companyId, setCompanyId] = useState("")
  const [contactName, setContactName] = useState("")
  const [contactPhone, setContactPhone] = useState("")
  const [companyAddress, setCompanyAddress] = useState("")

  // 送貨地址資料
  const [deliveryAddress, setDeliveryAddress] = useState("")
  const [deliveryAddressDetail, setDeliveryAddressDetail] = useState("")
  const [locationDescription, setLocationDescription] = useState("")
  const [recipientName, setRecipientName] = useState("")
  const [recipientPhone, setRecipientPhone] = useState("")
  const [deliveryNotes, setDeliveryNotes] = useState("")

  const nextStep = () => {
    setFormStep((prev) => prev + 1)
    window.scrollTo(0, 0)
  }

  const prevStep = () => {
    setFormStep((prev) => Math.max(0, prev - 1))
    window.scrollTo(0, 0)
  }

  const handleMapClick = (lat: number, lng: number) => {
    setSelectedLocation({ lat, lng })
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    // 顯示成功訊息
    toast({
      title: "登記成功",
      description: "您的顧客資料已成功登記。",
    })

    // 模擬提交後重定向到首頁
    setTimeout(() => {
      router.push("/")
    }, 2000)
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
      <main className="flex-1 bg-gray-50">
        <div className="container py-12">
          <div className="mx-auto max-w-4xl">
            {/* 標題部分 */}
            <div className="mb-10 text-center">
              <h1 className="text-3xl font-bold mb-2">顧客資料登記</h1>
              <p className="text-gray-500 max-w-2xl mx-auto">
                登記您的資料，享受更便捷的購物體驗。預先登記送貨地址資料，可使訂購過程更加順暢。
              </p>
            </div>

            {/* 進度指示器 */}
            <div className="mb-10">
              <div className="flex justify-between items-center">
                <div
                  className={`flex flex-col items-center ${formStep >= 0 ? "text-primary" : "text-muted-foreground"}`}
                >
                  <div
                    className={`w-12 h-12 rounded-full flex items-center justify-center border-2 ${formStep >= 0 ? "border-primary bg-primary text-primary-foreground" : "border-muted-foreground"}`}
                  >
                    {formStep > 0 ? <Check className="h-6 w-6" /> : "1"}
                  </div>
                  <span className="text-sm mt-2 font-medium">基本資料</span>
                </div>
                <div className="flex-1 h-1 bg-gray-200 mx-2 relative">
                  <div
                    className="absolute top-0 left-0 h-full bg-primary transition-all duration-300"
                    style={{ width: formStep >= 1 ? "100%" : "0%" }}
                  />
                </div>
                <div
                  className={`flex flex-col items-center ${formStep >= 1 ? "text-primary" : "text-muted-foreground"}`}
                >
                  <div
                    className={`w-12 h-12 rounded-full flex items-center justify-center border-2 ${formStep >= 1 ? "border-primary bg-primary text-primary-foreground" : "border-muted-foreground"}`}
                  >
                    {formStep > 1 ? <Check className="h-6 w-6" /> : "2"}
                  </div>
                  <span className="text-sm mt-2 font-medium">送貨地址</span>
                </div>
                <div className="flex-1 h-1 bg-gray-200 mx-2 relative">
                  <div
                    className="absolute top-0 left-0 h-full bg-primary transition-all duration-300"
                    style={{ width: formStep >= 2 ? "100%" : "0%" }}
                  />
                </div>
                <div
                  className={`flex flex-col items-center ${formStep >= 2 ? "text-primary" : "text-muted-foreground"}`}
                >
                  <div
                    className={`w-12 h-12 rounded-full flex items-center justify-center border-2 ${formStep >= 2 ? "border-primary bg-primary text-primary-foreground" : "border-muted-foreground"}`}
                  >
                    {formStep > 2 ? <Check className="h-6 w-6" /> : "3"}
                  </div>
                  <span className="text-sm mt-2 font-medium">確認</span>
                </div>
              </div>
            </div>

            <form onSubmit={handleSubmit}>
              {formStep === 0 && (
                <Card className="border-none shadow-xl">
                  <CardHeader className="bg-gradient-to-r from-primary/10 to-primary/5 pb-6">
                    <CardTitle className="text-xl">基本資料</CardTitle>
                    <CardDescription>請輸入公司資料。</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6 pt-6">
                    <div className="space-y-4">
                      <h3 className="text-lg font-medium flex items-center">
                        <Building className="mr-2 h-5 w-5 text-primary" />
                        公司資料
                      </h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                          <Label htmlFor="company-name" className="text-sm font-medium">
                            公司名稱 (中文或英文)
                          </Label>
                          <div className="relative">
                            <Input
                              id="company-name"
                              placeholder="XX有限公司 / XX Company Limited"
                              value={companyName}
                              onChange={(e) => setCompanyName(e.target.value)}
                              className="pl-10"
                              required
                            />
                            <Building className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                          </div>
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="company-id" className="text-sm font-medium">
                            商業登記號碼 (選填)
                          </Label>
                          <Input
                            id="company-id"
                            placeholder="1234567890"
                            value={companyId}
                            onChange={(e) => setCompanyId(e.target.value)}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="contact-name" className="text-sm font-medium">
                            聯絡人姓名
                          </Label>
                          <div className="relative">
                            <Input
                              id="contact-name"
                              placeholder="陳大文"
                              value={contactName}
                              onChange={(e) => setContactName(e.target.value)}
                              className="pl-10"
                              required
                            />
                            <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                          </div>
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="contact-phone" className="text-sm font-medium">
                            聯絡人電話
                          </Label>
                          <div className="relative">
                            <Input
                              id="contact-phone"
                              type="tel"
                              placeholder="9123 4567"
                              value={contactPhone}
                              onChange={(e) => setContactPhone(e.target.value)}
                              className="pl-10"
                              required
                            />
                            <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                          </div>
                        </div>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="company-address" className="text-sm font-medium">
                          公司地址
                        </Label>
                        <div className="relative">
                          <Input
                            id="company-address"
                            placeholder="香港九龍觀塘區XX街123號"
                            value={companyAddress}
                            onChange={(e) => setCompanyAddress(e.target.value)}
                            className="pl-10"
                            required
                          />
                          <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                        </div>
                      </div>
                    </div>
                  </CardContent>
                  <CardFooter className="flex justify-end bg-gray-50 px-6 py-4 rounded-b-lg">
                    <Button type="button" onClick={nextStep} className="group">
                      下一步
                      <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                    </Button>
                  </CardFooter>
                </Card>
              )}

              {formStep === 1 && (
                <Card className="border-none shadow-xl">
                  <CardHeader className="bg-gradient-to-r from-primary/10 to-primary/5 pb-6">
                    <CardTitle className="text-xl">送貨地址</CardTitle>
                    <CardDescription>請輸入工地或送貨地址資料。</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6 pt-6">
                    <div className="space-y-4">
                      <h3 className="text-lg font-medium flex items-center">
                        <MapPin className="mr-2 h-5 w-5 text-primary" />
                        指定送貨地址方式
                      </h3>
                      <div className="bg-gray-50 p-4 rounded-lg">
                        <RadioGroup
                          value={locationType}
                          onValueChange={setLocationType}
                          className="flex flex-col space-y-3"
                        >
                          <div className="flex items-center space-x-3 bg-white p-3 rounded-lg border border-gray-200 shadow-sm">
                            <RadioGroupItem value="address" id="address" className="text-primary" />
                            <Label htmlFor="address" className="font-medium cursor-pointer">
                              使用地址
                            </Label>
                          </div>
                          <div className="flex items-center space-x-3 bg-white p-3 rounded-lg border border-gray-200 shadow-sm">
                            <RadioGroupItem value="map" id="map" className="text-primary" />
                            <Label htmlFor="map" className="font-medium cursor-pointer">
                              在地圖上選擇位置（適用於工地或地圖未更新的位置）
                            </Label>
                          </div>
                        </RadioGroup>
                      </div>
                    </div>

                    {locationType === "address" ? (
                      <div className="space-y-4 bg-white p-6 rounded-lg border border-gray-100 shadow-sm">
                        <h4 className="font-medium">地址資料</h4>
                        <div className="space-y-2">
                          <Label htmlFor="delivery-address" className="text-sm font-medium">
                            送貨地址
                          </Label>
                          <div className="relative">
                            <Input
                              id="delivery-address"
                              placeholder="香港九龍觀塘區XX街123號"
                              value={deliveryAddress}
                              onChange={(e) => setDeliveryAddress(e.target.value)}
                              className="pl-10"
                              required
                            />
                            <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                          </div>
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="delivery-address-detail" className="text-sm font-medium">
                            詳細地址（大廈名稱、樓層等）
                          </Label>
                          <Input
                            id="delivery-address-detail"
                            placeholder="XX大廈 3樓"
                            value={deliveryAddressDetail}
                            onChange={(e) => setDeliveryAddressDetail(e.target.value)}
                          />
                        </div>
                      </div>
                    ) : (
                      <div className="space-y-4 bg-white p-6 rounded-lg border border-gray-100 shadow-sm">
                        <h4 className="font-medium">地圖位置</h4>
                        <Label className="text-sm font-medium">請在地圖上選擇位置</Label>
                        <div className="h-[400px] w-full rounded-lg border border-gray-200 overflow-hidden shadow-sm">
                          <GoogleMap onLocationSelect={handleMapClick} selectedLocation={selectedLocation} />
                        </div>
                        {selectedLocation && (
                          <div className="text-sm bg-primary/10 p-3 rounded-lg">
                            <p className="font-medium">
                              已選位置: 緯度 {selectedLocation.lat.toFixed(6)}, 經度 {selectedLocation.lng.toFixed(6)}
                            </p>
                          </div>
                        )}
                        <div className="space-y-2">
                          <Label htmlFor="location-description" className="text-sm font-medium">
                            位置描述（附近標誌性建築或特徵）
                          </Label>
                          <Textarea
                            id="location-description"
                            placeholder="例：XX大廈對面，藍色屋頂的建築工地"
                            rows={3}
                            value={locationDescription}
                            onChange={(e) => setLocationDescription(e.target.value)}
                            className="resize-none"
                          />
                        </div>
                      </div>
                    )}

                    <Separator />

                    <div className="space-y-4">
                      <h3 className="text-lg font-medium flex items-center">
                        <User className="mr-2 h-5 w-5 text-primary" />
                        收貨人資料
                      </h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                          <Label htmlFor="recipient-name" className="text-sm font-medium">
                            收貨人姓名
                          </Label>
                          <div className="relative">
                            <Input
                              id="recipient-name"
                              placeholder="工地負責人姓名"
                              value={recipientName}
                              onChange={(e) => setRecipientName(e.target.value)}
                              className="pl-10"
                              required
                            />
                            <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                          </div>
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="recipient-phone" className="text-sm font-medium">
                            收貨人電話
                          </Label>
                          <div className="relative">
                            <Input
                              id="recipient-phone"
                              type="tel"
                              placeholder="9123 4567"
                              value={recipientPhone}
                              onChange={(e) => setRecipientPhone(e.target.value)}
                              className="pl-10"
                              required
                            />
                            <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="delivery-notes" className="text-sm font-medium">
                        送貨注意事項
                      </Label>
                      <div className="relative">
                        <Textarea
                          id="delivery-notes"
                          placeholder="例：大型貨車無法進入，請使用小型車輛送貨。希望上午送達。"
                          rows={4}
                          value={deliveryNotes}
                          onChange={(e) => setDeliveryNotes(e.target.value)}
                          className="pl-10 resize-none"
                        />
                        <Info className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                      </div>
                    </div>
                  </CardContent>
                  <CardFooter className="flex justify-between bg-gray-50 px-6 py-4 rounded-b-lg">
                    <Button type="button" variant="outline" onClick={prevStep} className="group">
                      <ArrowLeft className="mr-2 h-4 w-4 transition-transform group-hover:-translate-x-1" />
                      返回
                    </Button>
                    <Button type="button" onClick={nextStep} className="group">
                      下一步
                      <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                    </Button>
                  </CardFooter>
                </Card>
              )}

              {formStep === 2 && (
                <Card className="border-none shadow-xl">
                  <CardHeader className="bg-gradient-to-r from-primary/10 to-primary/5 pb-6">
                    <CardTitle className="text-xl">確認資料</CardTitle>
                    <CardDescription>請確認以下資料，如無問題請按「提交登記」按鈕。</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6 pt-6">
                    <div className="space-y-4">
                      <h3 className="text-lg font-medium flex items-center">
                        <Building className="mr-2 h-5 w-5 text-primary" />
                        基本資料
                      </h3>
                      <div className="bg-gray-50 p-6 rounded-lg">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          <div>
                            <p className="text-sm text-gray-500">公司名稱</p>
                            <p className="font-medium">{companyName || "未填寫"}</p>
                          </div>
                          <div>
                            <p className="text-sm text-gray-500">商業登記號碼</p>
                            <p className="font-medium">{companyId || "未填寫"}</p>
                          </div>
                          <div>
                            <p className="text-sm text-gray-500">聯絡人姓名</p>
                            <p className="font-medium">{contactName || "未填寫"}</p>
                          </div>
                          <div>
                            <p className="text-sm text-gray-500">聯絡人電話</p>
                            <p className="font-medium">{contactPhone || "未填寫"}</p>
                          </div>
                        </div>
                        <div className="mt-4">
                          <p className="text-sm text-gray-500">公司地址</p>
                          <p className="font-medium">{companyAddress || "未填寫"}</p>
                        </div>
                      </div>
                    </div>

                    <Separator />

                    <div className="space-y-4">
                      <h3 className="text-lg font-medium flex items-center">
                        <MapPin className="mr-2 h-5 w-5 text-primary" />
                        送貨地址
                      </h3>
                      <div className="bg-gray-50 p-6 rounded-lg">
                        {locationType === "address" ? (
                          <div>
                            <p className="text-sm text-gray-500">送貨地址</p>
                            <p className="font-medium">
                              {deliveryAddress} {deliveryAddressDetail}
                            </p>
                          </div>
                        ) : (
                          <div className="space-y-4">
                            <div>
                              <p className="text-sm text-gray-500">地圖位置</p>
                              {selectedLocation ? (
                                <p className="font-medium">
                                  緯度: {selectedLocation.lat.toFixed(6)}, 經度: {selectedLocation.lng.toFixed(6)}
                                </p>
                              ) : (
                                <p className="text-red-500">未選擇位置</p>
                              )}
                            </div>
                            <div>
                              <p className="text-sm text-gray-500">位置描述</p>
                              <p className="font-medium">{locationDescription || "未填寫"}</p>
                            </div>
                          </div>
                        )}

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4">
                          <div>
                            <p className="text-sm text-gray-500">收貨人姓名</p>
                            <p className="font-medium">{recipientName || "未填寫"}</p>
                          </div>
                          <div>
                            <p className="text-sm text-gray-500">收貨人電話</p>
                            <p className="font-medium">{recipientPhone || "未填寫"}</p>
                          </div>
                        </div>

                        <div className="mt-4">
                          <p className="text-sm text-gray-500">送貨注意事項</p>
                          <p className="font-medium">{deliveryNotes || "未填寫"}</p>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                  <CardFooter className="flex justify-between bg-gray-50 px-6 py-4 rounded-b-lg">
                    <Button type="button" variant="outline" onClick={prevStep} className="group">
                      <ArrowLeft className="mr-2 h-4 w-4 transition-transform group-hover:-translate-x-1" />
                      返回
                    </Button>
                    <Button type="submit" className="bg-green-600 hover:bg-green-700">
                      提交登記
                    </Button>
                  </CardFooter>
                </Card>
              )}
            </form>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  )
}
