'use client';

import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { PaymentMethodSelector } from '@/components/payment/PaymentMethodSelector';
import { PayMeQRCode } from '@/components/payment/PayMeQRCode';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft, CreditCard, QrCode } from 'lucide-react';
import Link from 'next/link';

export default function PaymentMethodsPage() {
  const searchParams = useSearchParams();
  const [selectedMethod, setSelectedMethod] = useState<'stripe' | 'payme'>('stripe');
  const [showPayMeQR, setShowPayMeQR] = useState(false);
  const [paymentData, setPaymentData] = useState<any>(null);
  
  // URLパラメータから金額を取得
  const total = parseInt(searchParams.get('total') || '0');
  const deliveryFee = parseInt(searchParams.get('fee') || '0');
  const deliveryOption = searchParams.get('delivery') || 'delivery';
  const discount = parseInt(searchParams.get('discount') || '0');
  const promoCode = searchParams.get('promoCode') || '';

  const paymentMethods = [
    {
      id: 'stripe' as const,
      name: '信用卡',
      description: 'Visa, Mastercard, American Express',
      icon: 'credit-card' as const,
      enabled: true
    },
    {
      id: 'payme' as const,
      name: 'PayMe',
      description: '香港最受歡迎的電子支付方式',
      icon: 'qr-code' as const,
      enabled: true
    }
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
          amount: total, // カートの実際の金額を使用
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
    // Stripe決済ページにリダイレクト（金額情報を含む）
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
              <Link href="/checkout/payment-methods" className="inline-flex items-center text-gray-600 hover:text-gray-900">
                <ArrowLeft className="h-4 w-4 mr-2" />
                返回付款方式選擇
              </Link>
            </div>
            <PayMeQRCode
              paymentUrl={paymentData.qrCodeUrl}
              amount={paymentData.amount}
              onRefresh={createPayMePayment}
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

              <div className="payment-preview">
                {selectedMethod === 'payme' && (
                  <div className="bg-blue-50 p-4 rounded-lg">
                    <div className="flex items-center mb-2">
                      <QrCode className="h-5 w-5 text-blue-600 mr-2" />
                      <h4 className="font-medium text-blue-900">PayMe 付款</h4>
                    </div>
                    <p className="text-sm text-blue-700">
                      使用 PayMe 掃描 QR 碼即可完成付款，即時到賬，無需等待
                    </p>
                  </div>
                )}

                {selectedMethod === 'stripe' && (
                  <div className="bg-green-50 p-4 rounded-lg">
                    <div className="flex items-center mb-2">
                      <CreditCard className="h-5 w-5 text-green-600 mr-2" />
                      <h4 className="font-medium text-green-900">信用卡付款</h4>
                    </div>
                    <p className="text-sm text-green-700">
                      支援 Visa、Mastercard、American Express 等主要信用卡
                    </p>
                  </div>
                )}
              </div>

              <div className="flex gap-4 pt-4">
                <Button
                  onClick={selectedMethod === 'payme' ? createPayMePayment : handleStripePayment}
                  className="flex-1"
                  size="lg"
                >
                  {selectedMethod === 'payme' ? '使用 PayMe 付款' : '使用信用卡付款'}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
} 