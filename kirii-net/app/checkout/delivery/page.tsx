'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Input } from '@/components/ui/input';
import { ArrowLeft, Truck, Package, Tag } from 'lucide-react';
import Link from 'next/link';
import { getCart } from '@/lib/cart';
import { toast } from 'sonner';

interface CartItem {
  id: string;
  title: string;
  description: string;
  price: number;
  category: string;
  weight: number;
  quantity: number;
}

export default function DeliveryPage() {
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [deliveryOption, setDeliveryOption] = useState<'delivery' | 'pickup'>('delivery');
  const [deliveryFee, setDeliveryFee] = useState(200);
  const [promoCode, setPromoCode] = useState('');
  const [appliedPromoCode, setAppliedPromoCode] = useState('');
  const [discountAmount, setDiscountAmount] = useState(0);

  // カートアイテムを取得
  useEffect(() => {
    const items = getCart();
    setCartItems(items);
  }, []);

  const subtotal = cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const totalWeight = cartItems.reduce((sum, item) => sum + (item.weight * item.quantity), 0);
  const shipping = deliveryOption === 'delivery' ? deliveryFee : 0;
  const discount = discountAmount;
  const total = subtotal + shipping - discount;

  // プロモーションコードを適用
  const applyPromoCode = () => {
    if (!promoCode.trim()) {
      toast.error('請輸入促銷代碼');
      return;
    }

    if (promoCode.toUpperCase() === 'VIP123') {
      const discount = Math.round(subtotal * 0.05); // 5%割引
      setDiscountAmount(discount);
      setAppliedPromoCode(promoCode.toUpperCase());
      setPromoCode('');
      toast.success(`促銷代碼 ${promoCode.toUpperCase()} 已應用，獲得 5% 折扣！`);
    } else {
      toast.error('無效的促銷代碼');
    }
  };

  // プロモーションコードを削除
  const removePromoCode = () => {
    setDiscountAmount(0);
    setAppliedPromoCode('');
    toast.success('促銷代碼已移除');
  };

  const handleContinue = () => {
    // 決済方式選択ページにリダイレクト（デリバリー情報を含む）
    const deliveryData = {
      option: deliveryOption,
      fee: shipping,
      total: total
    };

    // URLパラメータとして渡す（実際のアプリでは状態管理を使用）
    const params = new URLSearchParams({
      delivery: deliveryOption,
      fee: shipping.toString(),
      total: total.toString(),
      discount: discount.toString(),
      promoCode: appliedPromoCode
    });

    window.location.href = `/checkout/payment-methods?${params.toString()}`;
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto">
          <div className="mb-6">
            <Link href="/cart" className="inline-flex items-center text-gray-600 hover:text-gray-900">
              <ArrowLeft className="h-4 w-4 mr-2" />
              返回購物車
            </Link>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* デリバリー選択 */}
            <div className="lg:col-span-2">
              <Card>
                <CardHeader>
                  <CardTitle className="text-2xl">配送方式</CardTitle>
                  <CardDescription>
                    請選擇您偏好的配送方式
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <RadioGroup value={deliveryOption} onValueChange={(value: 'delivery' | 'pickup') => setDeliveryOption(value)}>
                    <div className="flex items-center space-x-2 border rounded-lg p-4 hover:bg-gray-50">
                      <RadioGroupItem value="delivery" id="delivery" />
                      <Label htmlFor="delivery" className="flex-1 cursor-pointer">
                        <div className="flex items-center">
                          <Truck className="h-5 w-5 mr-3 text-blue-600" />
                          <div>
                            <div className="font-medium">配送到府</div>
                            <div className="text-sm text-gray-500">專業配送服務，安全可靠</div>
                          </div>
                        </div>
                      </Label>
                      <div className="text-right">
                        <div className="font-medium">HK${deliveryFee.toLocaleString()}</div>
                        <div className="text-sm text-gray-500">運費</div>
                      </div>
                    </div>

                    <div className="flex items-center space-x-2 border rounded-lg p-4 hover:bg-gray-50">
                      <RadioGroupItem value="pickup" id="pickup" />
                      <Label htmlFor="pickup" className="flex-1 cursor-pointer">
                        <div className="flex items-center">
                          <Package className="h-5 w-5 mr-3 text-green-600" />
                          <div>
                            <div className="font-medium">自取</div>
                            <div className="text-sm text-gray-500">到店自取，節省運費</div>
                          </div>
                        </div>
                      </Label>
                      <div className="text-right">
                        <div className="font-medium text-green-600">免費</div>
                        <div className="text-sm text-gray-500">無運費</div>
                      </div>
                    </div>
                  </RadioGroup>

                  {deliveryOption === 'delivery' && (
                    <div className="bg-blue-50 p-4 rounded-lg">
                      <h4 className="font-medium text-blue-900 mb-2">配送資訊</h4>
                      <ul className="text-sm text-blue-700 space-y-1">
                        <li>• 配送時間：1-3個工作日</li>
                        <li>• 配送範圍：香港全境</li>
                        <li>• 配送時間：上午9:00-下午6:00</li>
                        <li>• 需要簽收確認</li>
                        <li>• 訂單總重量：{totalWeight.toFixed(1)}kg</li>
                        <li>• 最大積載重量：500kg（標準配送車）</li>
                        {totalWeight > 500 && (
                          <li className="text-red-600 font-medium">⚠️ 重量超過標準配送車限制，需要特殊配送安排</li>
                        )}
                      </ul>
                    </div>
                  )}

                  {deliveryOption === 'pickup' && (
                    <div className="bg-green-50 p-4 rounded-lg">
                      <h4 className="font-medium text-green-900 mb-2">自取資訊</h4>
                      <ul className="text-sm text-green-700 space-y-1">
                        <li>• 營業時間：週一至週五 9:00-18:00</li>
                        <li>• 地址：香港大埔大埔工業村大富街9號</li>
                        <li>• 電話：+852 2797 2026</li>
                        <li>• 電郵：info@kirii-net.com</li>
                        <li>• 請攜帶訂單確認信</li>
                        <li>• 免費停車場提供</li>
                      </ul>
                      <div className="mt-4">
                        <h5 className="font-medium text-green-900 mb-2">地圖位置</h5>
                        <div className="w-full h-48 rounded-lg overflow-hidden">
                          <iframe
                            src={`https://www.google.com/maps/embed/v1/place?key=${process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY}&q=香港大埔大埔工業村大富街9號&zoom=16`}
                            width="100%"
                            height="100%"
                            style={{ border: 0 }}
                            allowFullScreen
                            loading="lazy"
                            referrerPolicy="no-referrer-when-downgrade"
                            title="KIRII NET 公司位置"
                          ></iframe>
                        </div>
                        <div className="mt-2">
                          <a
                            href="https://maps.app.goo.gl/MAGBKugTmKtyNQRB9"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-sm text-blue-600 hover:text-blue-800 underline flex items-center"
                          >
                            <svg className="w-4 h-4 mr-1" viewBox="0 0 24 24" fill="currentColor">
                              <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/>
                            </svg>
                            在 Google 地圖中查看完整位置 →
                          </a>
                        </div>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* 訂單摘要 */}
            <div>
              <Card>
                <CardHeader>
                  <CardTitle>訂單摘要</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {/* 商品リスト */}
                    <div className="space-y-2">
                      {cartItems.map((item) => (
                        <div key={item.id} className="flex justify-between text-sm">
                          <span>{item.title} × {item.quantity}</span>
                          <span>HK${(item.price * item.quantity).toLocaleString()}</span>
                        </div>
                      ))}
                    </div>

                    <Separator />

                    {/* プロモーションコード */}
                    <div className="space-y-2">
                      {!appliedPromoCode ? (
                        <div className="flex gap-2">
                          <Input
                            placeholder="促銷代碼"
                            value={promoCode}
                            onChange={(e) => setPromoCode(e.target.value)}
                            className="flex-1"
                          />
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={applyPromoCode}
                            className="flex items-center gap-1"
                          >
                            <Tag className="h-4 w-4" />
                            應用
                          </Button>
                        </div>
                      ) : (
                        <div className="flex items-center justify-between bg-green-50 p-2 rounded">
                          <span className="text-sm text-green-700">
                            促銷代碼: {appliedPromoCode}
                          </span>
                          <Button 
                            variant="ghost" 
                            size="sm"
                            onClick={removePromoCode}
                            className="text-red-600 hover:text-red-700"
                          >
                            移除
                          </Button>
                        </div>
                      )}
                    </div>

                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span>小計</span>
                        <span>HK${subtotal.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>運費</span>
                        <span>{shipping === 0 ? "免費" : `HK$${shipping.toLocaleString()}`}</span>
                      </div>
                      {discount > 0 && (
                        <div className="flex justify-between text-green-600">
                          <span>折扣</span>
                          <span>-HK${discount.toLocaleString()}</span>
                        </div>
                      )}
                      <Separator />
                      <div className="flex justify-between font-bold text-lg">
                        <span>總計</span>
                        <span>HK${total.toLocaleString()}</span>
                      </div>
                    </div>
                  </div>
                </CardContent>
                <CardContent>
                  <Button
                    onClick={handleContinue}
                    className="w-full"
                    size="lg"
                  >
                    繼續到付款
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 