"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Check, MapPin, User, Building, Phone, Info, ArrowRight, ArrowLeft, Mail, Save } from "lucide-react"
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
import { Header } from "@/components/header"
import { updateCustomer, type Customer } from "@/lib/supabase"
import { useAuth } from "@/components/auth-provider"

export default function CustomerProfilePage() {
  const router = useRouter()
  const { toast } = useToast()
  const { customer, setCustomer } = useAuth()

  const [isLoading, setIsLoading] = useState(false)
  const [selectedLocation, setSelectedLocation] = useState<{ lat: number; lng: number } | null>(null)
  const [locationType, setLocationType] = useState("address")

  // 基本資料
  const [email, setEmail] = useState("")
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

  // 顧客情報をフォームに読み込み
  useEffect(() => {
    if (customer) {
      setEmail(customer.email || "")
      setCompanyName(customer.company_name || "")
      setCompanyId(customer.company_id || "")
      setContactName(customer.contact_name || "")
      setContactPhone(customer.contact_phone || "")
      setCompanyAddress(customer.company_address || "")
      setDeliveryAddress(customer.delivery_address || "")
      setDeliveryAddressDetail(customer.delivery_address_detail || "")
      setLocationDescription(customer.location_description || "")
      setRecipientName(customer.recipient_name || "")
      setRecipientPhone(customer.recipient_phone || "")
      setDeliveryNotes(customer.delivery_notes || "")
      setLocationType(customer.location_type || "address")
      
      if (customer.location_lat && customer.location_lng) {
        setSelectedLocation({
          lat: customer.location_lat,
          lng: customer.location_lng
        })
      }
    }
  }, [customer])

  // ログインしていない場合はリダイレクト
  useEffect(() => {
    if (!customer) {
      router.push("/login")
    }
  }, [customer, router])

  const handleMapClick = (lat: number, lng: number) => {
    setSelectedLocation({ lat, lng })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
             if (!customer?.id) {
         throw new Error('找不到顧客資料')
       }

      // 顧客データを準備
      const customerData: Partial<Customer> = {
        email,
        company_name: companyName,
        company_id: companyId || undefined,
        contact_name: contactName,
        contact_phone: contactPhone,
        company_address: companyAddress,
        delivery_address: deliveryAddress || undefined,
        delivery_address_detail: deliveryAddressDetail || undefined,
        location_description: locationDescription || undefined,
        recipient_name: recipientName || undefined,
        recipient_phone: recipientPhone || undefined,
        delivery_notes: deliveryNotes || undefined,
        location_lat: selectedLocation?.lat,
        location_lng: selectedLocation?.lng,
        location_type: locationType as 'address' | 'map',
      }

      // データベースに更新
      const result = await updateCustomer(customer.id, customerData)
      
      if (result.success && result.data) {
        // ローカルストレージとコンテキストを更新
        localStorage.setItem('kirii-customer', JSON.stringify(result.data))
        setCustomer(result.data)
        
                 toast({
           title: "更新成功",
           description: "顧客資料已成功更新。",
         })
             } else {
         throw new Error('更新失敗')
       }
     } catch (error) {
       console.error('更新錯誤:', error)
       toast({
         title: "更新失敗",
         description: "顧客資料更新失敗，請重試。",
         variant: "destructive",
       })
    } finally {
      setIsLoading(false)
    }
  }

  if (!customer) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <main className="container mx-auto px-4 py-8">
                   <div className="text-center">
           <p>需要登入。</p>
           <Link href="/login">
             <Button className="mt-4">前往登入頁面</Button>
           </Link>
         </div>
        </main>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
                     <div className="mb-6">
             <Link href="/" className="inline-flex items-center text-gray-600 hover:text-gray-900">
               <ArrowLeft className="h-4 w-4 mr-2" />
               返回首頁
             </Link>
           </div>

                     <div className="mb-8 text-center">
             <h1 className="text-3xl font-bold mb-2">顧客資料編輯</h1>
             <p className="text-muted-foreground">
               編輯已登記的顧客資料。
             </p>
           </div>

          <form onSubmit={handleSubmit}>
            <Card className="border-none shadow-xl">
              <CardHeader className="bg-gradient-to-r from-primary/10 to-primary/5 pb-6">
                               <CardTitle className="text-xl">基本資料</CardTitle>
               <CardDescription>請編輯顧客的基本資料。</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6 pt-6">
                <div className="space-y-4">
                  <h3 className="text-lg font-medium flex items-center">
                    <Building className="mr-2 h-5 w-5 text-primary" />
                    基本資料
                  </h3>
                  <div className="space-y-4">
                                             <div className="space-y-2">
                           <Label htmlFor="email" className="text-sm font-medium">
                             電郵地址
                           </Label>
                           <div className="relative">
                             <Input
                               id="email"
                               type="email"
                               placeholder="example@company.com"
                               value={email}
                               onChange={(e) => setEmail(e.target.value)}
                               className="pl-10"
                               required
                             />
                             <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                           </div>
                         </div>
                  </div>
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

                <Separator />

                <div className="space-y-4">
                  <h3 className="text-lg font-medium flex items-center">
                    <MapPin className="mr-2 h-5 w-5 text-primary" />
                    送貨地址
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
                </div>
              </CardContent>
              <CardFooter className="flex justify-end bg-gray-50 px-6 py-4 rounded-b-lg">
                                 <Button type="submit" className="bg-green-600 hover:bg-green-700" disabled={isLoading}>
                   <Save className="mr-2 h-4 w-4" />
                   {isLoading ? "更新中..." : "儲存更新"}
                 </Button>
              </CardFooter>
            </Card>
          </form>
        </div>
      </main>
    </div>
  )
} 