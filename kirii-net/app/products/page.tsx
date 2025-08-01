'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Header } from '@/components/header';
import { addToCart, getCartItemCount } from '@/lib/cart';
import { toast } from 'sonner';
import { Minus, Plus } from 'lucide-react';

function ProductCard({
  id,
  title,
  description,
  price,
  category,
  weight,
  onAddToCart,
}: {
  id: string
  title: string
  description: string
  price: number
  category: string
  weight: number
  onAddToCart: (quantity: number) => void
}) {
  const [quantity, setQuantity] = useState(1);

  const incrementQuantity = () => setQuantity((q) => q + 1);
  const decrementQuantity = () => setQuantity((q) => Math.max(1, q - 1));

  return (
    <Card className="overflow-hidden">
      <CardContent className="p-0">
        <div className="aspect-square bg-muted" />
      </CardContent>
      <CardHeader className="p-4">
        <CardTitle>{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardFooter className="p-4 flex flex-col gap-2">
        <div className="flex items-center justify-between w-full">
          <span className="text-lg font-bold">HK${price.toLocaleString()}</span>
          <div className="text-right">
            <span className="text-sm text-muted-foreground block">{category}</span>
            <span className="text-xs text-gray-500">重量: {weight}kg</span>
          </div>
        </div>
        
        {/* 数量選択 */}
        <div className="flex items-center gap-2 w-full">
          <span className="text-sm font-medium">數量:</span>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="icon" onClick={decrementQuantity}>
              <Minus className="h-4 w-4" />
            </Button>
            <input
              type="number"
              min="1"
              value={quantity}
              onChange={(e) => {
                const value = parseInt(e.target.value) || 1;
                setQuantity(Math.max(1, value));
              }}
              className="w-16 text-center border rounded-md px-2 py-1 text-sm"
            />
            <Button variant="outline" size="icon" onClick={incrementQuantity}>
              <Plus className="h-4 w-4" />
            </Button>
          </div>
        </div>
        
        <div className="flex gap-2 w-full">
          <Link href={`/products/${id}`} className="flex-1">
            <Button variant="outline" className="w-full">
              詳情
            </Button>
          </Link>
          <Button className="flex-1" onClick={() => onAddToCart(quantity)}>
            加入購物車
          </Button>
        </div>
      </CardFooter>
    </Card>
  )
}

// Sample product data
const products = [
  {
    id: "acp-001",
    title: "鋁複合板 銀色",
    description: "高品質鋁複合板 3mm厚",
    price: 980,
    category: "鋁塑板",
    weight: 3.2,
  },
  {
    id: "acp-002",
    title: "鋁複合板 白色",
    description: "高品質鋁複合板 4mm厚",
    price: 1050,
    category: "鋁塑板",
    weight: 4.1,
  },
  {
    id: "steel-001",
    title: "H型鋼 100×100",
    description: "建築用H型鋼 SS400 6m",
    price: 1900,
    category: "鐵建築鋼材",
    weight: 45.2,
  },
  {
    id: "steel-002",
    title: "方管 50×50",
    description: "建築用方管 STKR400 6m",
    price: 680,
    category: "鐵建築鋼材",
    weight: 12.8,
  },
  {
    id: "gyp-001",
    title: "石膏板 9.5mm",
    description: "一般用石膏板 910×1820mm",
    price: 95,
    category: "石膏板",
    weight: 8.5,
  },
  {
    id: "gyp-002",
    title: "防火石膏板 12.5mm",
    description: "耐火石膏板 910×1820mm",
    price: 140,
    category: "防火石膏板",
    weight: 11.2,
  },
  {
    id: "ceiling-001",
    title: "鋁天花板 300×300",
    description: "輕量鋁天花板 白色",
    price: 75,
    category: "鋁輕天花材料",
    weight: 0.8,
  },
  {
    id: "rockwool-001",
    title: "岩棉 50mm",
    description: "防火隔熱用岩棉 910×1820mm",
    price: 180,
    category: "Rockwool防火棉",
    weight: 2.1,
  },
]

export default function ProductsPage() {
  const [cartItemCount, setCartItemCount] = useState(0);

  // カートアイテム数を更新
  const updateCartCount = () => {
    setCartItemCount(getCartItemCount());
  };

  // 商品をカートに追加
  const handleAddToCart = (product: typeof products[0], quantity: number) => {
    addToCart(product, quantity);
    updateCartCount();
    toast.success(`${product.title} × ${quantity} 已加入購物車`);
  };

  // 初期化時にカート数を取得
  useEffect(() => {
    updateCartCount();
  }, []);

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container mx-auto px-4 py-8">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold mb-2">產品目錄</h1>
          <p className="text-muted-foreground">我們提供各種高品質建築材料。</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {products.map((product) => (
            <ProductCard
              key={product.id}
              id={product.id}
              title={product.title}
              description={product.description}
              price={product.price}
              category={product.category}
              weight={product.weight}
              onAddToCart={(quantity) => handleAddToCart(product, quantity)}
            />
          ))}
        </div>
      </main>
    </div>
  )
}
