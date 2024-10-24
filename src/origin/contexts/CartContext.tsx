import { createContext, ReactNode, useContext, useState } from 'react';
import { CartItem, Coupon, Product } from '../../types.ts';
import {
  calculateCartTotal,
  getRemainingStock,
  updateCartItemQuantity
} from '../hooks/utils/cartUtils.ts';

interface CartProviderProps {
  children: ReactNode;
}

interface CartContextType {
  cart: CartItem[];
  selectedCoupon: Coupon | null;
  addToCart: (product: Product) => void;
  removeFromCart: (productId: string) => void;
  updateQuantity: (productId: string, newQuantity: number) => void;
  calculateTotal: () => {
    totalDiscount: number;
    totalAfterDiscount: number;
    totalBeforeDiscount: number;
  };
  applyCoupon: (coupon: Coupon) => void;
}

const CartContext = createContext<CartContextType | null>(null);

export const CartProvider = ({ children }: CartProviderProps) => {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [selectedCoupon, setSelectedCoupon] = useState<Coupon | null>(null);

  const addToCart = (product: Product) => {
    const remainingStock = getRemainingStock(cart, product);
    if (remainingStock <= 0) return;

    setCart((prevCart) => {
      const existingItem = prevCart.find(
        (item) => item.product.id === product.id
      );
      if (existingItem) {
        return prevCart.map((item) =>
          item.product.id === product.id
            ? { ...item, quantity: Math.min(item.quantity + 1, product.stock) }
            : item
        );
      }
      return [...prevCart, { product, quantity: 1 }];
    });
  };

  const removeFromCart = (productId: string) => {
    setCart((prevCart) =>
      prevCart.filter((item) => item.product.id !== productId)
    );
  };

  const updateQuantity = (productId: string, newQuantity: number) => {
    setCart((prevCart) =>
      updateCartItemQuantity(prevCart, productId, newQuantity)
    );
  };

  const applyCoupon = (coupon: Coupon) => {
    setSelectedCoupon(coupon);
  };

  const calculateTotal = () => calculateCartTotal(cart, selectedCoupon);

  const contextValue = {
    cart,
    selectedCoupon,
    addToCart,
    removeFromCart,
    updateQuantity,
    calculateTotal,
    applyCoupon
  };

  return (
    <CartContext.Provider value={contextValue}>{children}</CartContext.Provider>
  );
};

export const useCartContext = () => {
  const context = useContext(CartContext);
  if (!context)
    throw new Error('useCartContext must be used within a CartProvider');

  return context;
};
