'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Trash2, Minus, Plus } from 'lucide-react';
import { Header } from '@/components/header';
import { getCart, removeFromCart, updateCartItemQuantity, getCartTotal, getCartTotalWeight } from '@/lib/cart';
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

export default function CartPage() {
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [total, setTotal] = useState(0);
  const [totalWeight, setTotalWeight] = useState(0);

  // カート情報を更新
  const updateCart = () => {
    const items = getCart();
    setCartItems(items);
    setTotal(getCartTotal());
    setTotalWeight(getCartTotalWeight());
  };

  // 商品数量を更新
  const handleQuantityChange = (productId: string, newQuantity: number) => {
    updateCartItemQuantity(productId, newQuantity);
    updateCart();
    toast.success('購物車已更新');
  };

  // 商品を削除
  const handleRemoveItem = (productId: string) => {
    removeFromCart(productId);
    updateCart();
    toast.success('商品已從購物車移除');
  };

  // チェックアウト
  const handleCheckout = () => {
    if (cartItems.length === 0) {
      toast.error('購物車是空的');
      return;
    }
    // デリバリー確認ページにリダイレクト
    window.location.href = '/checkout/delivery';
  };

  // 初期化時にカート情報を取得
  useEffect(() => {
    updateCart();
  }, []);

  if (cartItems.length === 0) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <main className="container mx-auto px-4 py-8">
          <div className="max-w-2xl mx-auto text-center">
            <h1 className="text-3xl font-bold mb-4">購物車</h1>
            <p className="text-muted-foreground mb-8">您的購物車是空的</p>
            <Link href="/products">
              <Button>繼續購物</Button>
            </Link>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-3xl font-bold mb-8">購物車</h1>
          
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* 商品リスト */}
            <div className="lg:col-span-2">
              <Card>
                <CardHeader>
                  <CardTitle>商品清單</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {cartItems.map((item) => (
                    <div key={item.id} className="flex items-center gap-4 p-4 border rounded-lg">
                      <div className="flex-1">
                        <h3 className="font-medium">{item.title}</h3>
                        <p className="text-sm text-muted-foreground">{item.description}</p>
                        <div className="flex items-center gap-4 mt-2 text-sm text-gray-600">
                          <span>重量: {item.weight}kg</span>
                          <span>單價: HK${item.price.toLocaleString()}</span>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        <Button
                          variant="outline"
                          size="icon"
                          onClick={() => handleQuantityChange(item.id, item.quantity - 1)}
                          disabled={item.quantity <= 1}
                        >
                          <Minus className="h-4 w-4" />
                        </Button>
                        <input
                          type="number"
                          min="1"
                          value={item.quantity}
                          onChange={(e) => {
                            const value = parseInt(e.target.value) || 1;
                            handleQuantityChange(item.id, Math.max(1, value));
                          }}
                          className="w-16 text-center border rounded-md px-2 py-1 text-sm"
                        />
                        <Button
                          variant="outline"
                          size="icon"
                          onClick={() => handleQuantityChange(item.id, item.quantity + 1)}
                        >
                          <Plus className="h-4 w-4" />
                        </Button>
                      </div>
                      
                      <div className="text-right">
                        <div className="font-medium">HK${(item.price * item.quantity).toLocaleString()}</div>
                        <div className="text-sm text-gray-500">重量: {(item.weight * item.quantity).toFixed(1)}kg</div>
                      </div>
                      
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={() => handleRemoveItem(item.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </CardContent>
              </Card>
            </div>

            {/* 訂單摘要 */}
            <div>
              <Card>
                <CardHeader>
                  <CardTitle>訂單摘要</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span>商品總額</span>
                      <span>HK${total.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between text-sm text-gray-600">
                      <span>總重量</span>
                      <span>{totalWeight.toFixed(1)}kg</span>
                    </div>
                    <Separator />
                    <div className="flex justify-between font-bold text-lg">
                      <span>總計</span>
                      <span>HK${total.toLocaleString()}</span>
                    </div>
                  </div>
                  
                  <Button onClick={handleCheckout} className="w-full" size="lg">
                    前往付款
                  </Button>
                  
                  <Link href="/products">
                    <Button variant="outline" className="w-full">
                      繼續購物
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
