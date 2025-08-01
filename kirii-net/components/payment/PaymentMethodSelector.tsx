'use client';

import { useState } from 'react';
import { CreditCard, QrCode } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

interface PaymentMethod {
  id: 'stripe' | 'payme';
  name: string;
  description: string;
  icon: 'credit-card' | 'qr-code';
  enabled: boolean;
}

interface PaymentMethodSelectorProps {
  selectedMethod: 'stripe' | 'payme';
  onMethodChange: (method: 'stripe' | 'payme') => void;
  methods: PaymentMethod[];
}

export function PaymentMethodSelector({
  selectedMethod,
  onMethodChange,
  methods
}: PaymentMethodSelectorProps) {
  const getIcon = (icon: string) => {
    switch (icon) {
      case 'credit-card':
        return <CreditCard className="h-6 w-6" />;
      case 'qr-code':
        return <QrCode className="h-6 w-6" />;
      default:
        return null;
    }
  };

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-medium">選擇付款方式</h3>
      <div className="grid gap-4">
        {methods.map((method) => (
          <Card
            key={method.id}
            className={`cursor-pointer transition-all ${
              selectedMethod === method.id
                ? 'border-primary bg-primary/5'
                : 'hover:border-gray-300'
            } ${!method.enabled ? 'opacity-50 cursor-not-allowed' : ''}`}
            onClick={() => method.enabled && onMethodChange(method.id)}
          >
            <CardHeader className="pb-3">
              <div className="flex items-center space-x-3">
                <div className="flex-shrink-0">
                  {getIcon(method.icon)}
                </div>
                <div className="flex-1">
                  <CardTitle className="text-base">{method.name}</CardTitle>
                  <CardDescription>{method.description}</CardDescription>
                </div>
                <div className="flex-shrink-0">
                  <div
                    className={`w-4 h-4 rounded-full border-2 ${
                      selectedMethod === method.id
                        ? 'border-primary bg-primary'
                        : 'border-gray-300'
                    }`}
                  />
                </div>
              </div>
            </CardHeader>
          </Card>
        ))}
      </div>
    </div>
  );
} 