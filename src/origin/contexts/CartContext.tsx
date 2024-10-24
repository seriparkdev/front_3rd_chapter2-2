import { createContext, ReactNode, useContext, useState } from 'react';
import { CartItem, Coupon, Product } from '../../types.ts';
import { useCart } from '../hooks/useCart.ts';

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
  const {
    cart,
    selectedCoupon,
    addToCart,
    removeFromCart,
    updateQuantity,
    calculateTotal,
    applyCoupon
  } = useCart();

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
