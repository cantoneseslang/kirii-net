'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { PaymentMethodSelector } from '@/components/payment/PaymentMethodSelector';
import { PayMeQRCode } from '@/components/payment/PayMeQRCode';

function PaymentMethodsContent() {
  const searchParams = useSearchParams();
  const [selectedMethod, setSelectedMethod] = useState<'stripe' | 'payme'>('stripe');
  const [showPayMeQR, setShowPayMeQR] = useState(false);
  const [paymentData, setPaymentData] = useState<any>(null);

  // URLパラメータから金額、配送、割引情報を取得
  const total = parseInt(searchParams.get('total') || '0');
  const deliveryFee = parseInt(searchParams.get('fee') || '0');
  const deliveryOption = searchParams.get('delivery') || 'delivery';
  const discount = parseInt(searchParams.get('discount') || '0');
  const promoCode = searchParams.get('promoCode') || '';

  const paymentMethods = [
    {
      id: 'stripe',
      name: '信用卡付款',
      description: '使用Visa、Mastercard、American Express等信用卡',
      icon: '💳',
      popular: true,
    },
    {
      id: 'payme',
      name: 'PayMe',
      description: '使用PayMe應用程式掃描QR碼付款',
      icon: '📱',
      popular: false,
    },
  ];

  const handleMethodSelect = (method: 'stripe' | 'payme') => {
    setSelectedMethod(method);
    if (method === 'payme') {
      createPayMePayment();
    }
  };

  const createPayMePayment = async () => {
    try {
      const response = await fetch('/api/payme/create-payment', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          amount: total,
          currency: 'HKD',
          reference: `order_${Date.now()}`,
          description: `KIRII商品配送 - ${deliveryOption === 'delivery' ? '配送到府' : '自取'}`,
          customerPhone: '+85291234567'
        })
      });

      const data = await response.json();
      if (data.success) {
        setPaymentData(data);
        setShowPayMeQR(true);
      }
    } catch (error) {
      console.error('PayMe決済作成エラー:', error);
    }
  };

  const handleStripePayment = () => {
    const params = new URLSearchParams({
      total: total.toString(),
      delivery: deliveryOption,
      fee: deliveryFee.toString()
    });
    window.location.href = `/checkout?${params.toString()}`;
  };

  if (showPayMeQR && paymentData) {
    return (
      <div className="min-h-screen bg-gray-50 py-12">
        <div className="container mx-auto px-4">
          <div className="max-w-2xl mx-auto">
            <div className="mb-6">
              <Button
                variant="outline"
                onClick={() => setShowPayMeQR(false)}
                className="inline-flex items-center"
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                返回付款方式選擇
              </Button>
            </div>

            <PayMeQRCode
              paymentData={paymentData}
              amount={total}
              onPaymentComplete={() => {
                // 決済完了後の処理
                window.location.href = '/';
              }}
            />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="container mx-auto px-4">
        <div className="max-w-2xl mx-auto">
          <div className="mb-6">
            <Link href="/checkout/delivery" className="inline-flex items-center text-gray-600 hover:text-gray-900">
              <ArrowLeft className="h-4 w-4 mr-2" />
              返回配送方式
            </Link>
          </div>

          <Card>
            <CardHeader>
              <CardTitle className="text-2xl">選擇付款方式</CardTitle>
              <CardDescription>
                請選擇您偏好的付款方式完成訂單
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* 金額表示 */}
              <div className="bg-gray-50 p-4 rounded-lg">
                <div className="flex justify-between items-center">
                  <span className="font-medium">付款金額</span>
                  <span className="text-2xl font-bold">HK${total.toLocaleString()}</span>
                </div>
                {deliveryOption === 'delivery' && (
                  <div className="text-sm text-gray-600 mt-1">
                    包含運費 HK${deliveryFee.toLocaleString()}
                  </div>
                )}
                {discount > 0 && (
                  <div className="text-sm text-green-600 mt-1">
                    已應用促銷代碼 {promoCode}，節省 HK${discount.toLocaleString()}
                  </div>
                )}
              </div>

              <PaymentMethodSelector
                selectedMethod={selectedMethod}
                onMethodChange={handleMethodSelect}
                methods={paymentMethods}
              />

              {selectedMethod === 'stripe' && (
                <Button onClick={handleStripePayment} className="w-full" size="lg">
                  使用信用卡付款
                </Button>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

export default function PaymentMethodsPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <PaymentMethodsContent />
    </Suspense>
  );
} 