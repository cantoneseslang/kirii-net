export interface CartItem {
  id: string;
  title: string;
  description: string;
  price: number;
  category: string;
  weight: number;
  quantity: number;
}

export interface Product {
  id: string;
  title: string;
  description: string;
  price: number;
  category: string;
  weight: number;
}

// カートの取得
export const getCart = (): CartItem[] => {
  if (typeof window === 'undefined') return [];
  
  try {
    const cart = localStorage.getItem('kirii-cart');
    return cart ? JSON.parse(cart) : [];
  } catch (error) {
    console.error('カートの取得エラー:', error);
    return [];
  }
};

// カートの保存
export const saveCart = (cart: CartItem[]): void => {
  if (typeof window === 'undefined') return;
  
  try {
    localStorage.setItem('kirii-cart', JSON.stringify(cart));
    // カスタムイベントを発火
    window.dispatchEvent(new Event('cartUpdated'));
  } catch (error) {
    console.error('カートの保存エラー:', error);
  }
};

// 商品をカートに追加
export const addToCart = (product: Product, quantity: number = 1): void => {
  const cart = getCart();
  const existingItem = cart.find(item => item.id === product.id);
  
  if (existingItem) {
    existingItem.quantity += quantity;
  } else {
    cart.push({
      ...product,
      quantity
    });
  }
  
  saveCart(cart);
};

// カートから商品を削除
export const removeFromCart = (productId: string): void => {
  const cart = getCart();
  const updatedCart = cart.filter(item => item.id !== productId);
  saveCart(updatedCart);
};

// カート内の商品数量を更新
export const updateCartItemQuantity = (productId: string, quantity: number): void => {
  const cart = getCart();
  const item = cart.find(item => item.id === productId);
  
  if (item) {
    if (quantity <= 0) {
      removeFromCart(productId);
    } else {
      item.quantity = quantity;
      saveCart(cart);
    }
  }
};

// カートの総重量を計算
export const getCartTotalWeight = (): number => {
  const cart = getCart();
  return cart.reduce((total, item) => total + (item.weight * item.quantity), 0);
};

// カートの総額を計算
export const getCartTotal = (): number => {
  const cart = getCart();
  return cart.reduce((total, item) => total + (item.price * item.quantity), 0);
};

// カート内の商品数を取得
export const getCartItemCount = (): number => {
  const cart = getCart();
  return cart.reduce((count, item) => count + item.quantity, 0);
}; 