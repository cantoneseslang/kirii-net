'use client';

import { useEffect, useState } from 'react';
import QRCode from 'qrcode';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { QrCode, RefreshCw } from 'lucide-react';

interface PayMeQRCodeProps {
  paymentUrl: string;
  amount: number;
  onPaymentComplete?: () => void;
  onRefresh?: () => void;
}

export function PayMeQRCode({
  paymentUrl,
  amount,
  onPaymentComplete,
  onRefresh
}: PayMeQRCodeProps) {
  const [qrCodeDataUrl, setQrCodeDataUrl] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    generateQRCode();
  }, [paymentUrl]);

  const generateQRCode = async () => {
    try {
      const dataUrl = await QRCode.toDataURL(paymentUrl, {
        width: 200,
        margin: 2,
        color: {
          dark: '#000000',
          light: '#FFFFFF'
        }
      });
      setQrCodeDataUrl(dataUrl);
    } catch (error) {
      console.error('QRコード生成エラー:', error);
    }
  };

  const handleRefresh = async () => {
    setIsLoading(true);
    if (onRefresh) {
      await onRefresh();
    }
    await generateQRCode();
    setIsLoading(false);
  };

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader className="text-center">
        <div className="flex items-center justify-center mb-2">
          <QrCode className="h-8 w-8 text-primary mr-2" />
          <CardTitle>PayMe 付款</CardTitle>
        </div>
        <CardDescription>
          請使用 PayMe 掃描以下 QR 碼完成付款
        </CardDescription>
      </CardHeader>
      <CardContent className="text-center space-y-4">
        <div className="flex justify-center">
          {qrCodeDataUrl ? (
            <img
              src={qrCodeDataUrl}
              alt="PayMe QR Code"
              className="border-2 border-gray-200 rounded-lg"
            />
          ) : (
            <div className="w-48 h-48 bg-gray-100 rounded-lg flex items-center justify-center">
              <RefreshCw className="h-8 w-8 text-gray-400 animate-spin" />
            </div>
          )}
        </div>
        
        <div className="text-lg font-semibold">
          付款金額: HK$ {amount.toLocaleString()}
        </div>
        
        <div className="text-sm text-gray-600 space-y-1">
          <p>1. 打開 PayMe 應用程式</p>
          <p>2. 點擊「掃描」功能</p>
          <p>3. 掃描上方 QR 碼</p>
          <p>4. 確認付款金額並完成付款</p>
        </div>
        
        <Button
          onClick={handleRefresh}
          disabled={isLoading}
          variant="outline"
          className="w-full"
        >
          {isLoading ? (
            <>
              <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
              重新整理中...
            </>
          ) : (
            <>
              <RefreshCw className="h-4 w-4 mr-2" />
              重新整理 QR 碼
            </>
          )}
        </Button>
      </CardContent>
    </Card>
  );
} 