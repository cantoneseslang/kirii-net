'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { ShoppingCart, User, LogOut } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { getCartItemCount } from '@/lib/cart';
import { useAuth } from '@/components/auth-provider';
import { type Customer } from '@/lib/supabase';

export function Header() {
  const [cartItemCount, setCartItemCount] = useState(0);
  const { customer, setCustomer } = useAuth();

  // カートアイテム数を取得
  useEffect(() => {
    const updateCartCount = () => {
      setCartItemCount(getCartItemCount());
    };

    updateCartCount();

    // カートの変更を監視
    const handleStorageChange = () => {
      updateCartCount();
    };

    // カスタムイベントリスナーを追加
    const handleCartUpdate = () => {
      updateCartCount();
    };

    window.addEventListener('storage', handleStorageChange);
    window.addEventListener('cartUpdated', handleCartUpdate);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('cartUpdated', handleCartUpdate);
    };
  }, []);

  // ローカルストレージから顧客情報を読み込み
  useEffect(() => {
    const savedCustomer = localStorage.getItem('kirii-customer');
    if (savedCustomer && !customer) {
      try {
        const customerData: Customer = JSON.parse(savedCustomer);
        setCustomer(customerData);
      } catch (error) {
        console.error('顧客情報の読み込みエラー:', error);
      }
    }
  }, [customer, setCustomer]);

  // ログアウト処理
  const handleLogout = () => {
    localStorage.removeItem('kirii-customer');
    setCustomer(null);
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center justify-between">
        <div className="flex items-center gap-2">
          <Link href="/" className="flex items-center pl-4">
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
                {cartItemCount}
              </span>
            </Button>
          </Link>
          
          {customer ? (
            <div className="flex items-center gap-2">
              <div className="text-sm text-muted-foreground">
                {customer.company_name}
              </div>
                             <Link href="/customer-profile">
                 <Button variant="outline" size="sm">
                   <User className="h-4 w-4 mr-1" />
                   個人資料
                 </Button>
               </Link>
                             <Button variant="outline" size="sm" onClick={handleLogout}>
                 <LogOut className="h-4 w-4 mr-1" />
                 登出
               </Button>
            </div>
          ) : (
            <Link href="/login">
              <Button>登入</Button>
            </Link>
          )}
        </div>
      </div>
    </header>
  );
} 