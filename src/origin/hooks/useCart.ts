import { useState } from 'react';
import { CartItem, Coupon, Product } from '../../types.ts';
import {
  addItemToCart,
  calculateCartTotal,
  getRemainingStock,
  removeItemFromCart,
  updateCartItemQuantity
} from './utils/cartUtils.ts';

export const useCart = () => {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [selectedCoupon, setSelectedCoupon] = useState<Coupon | null>(null);

  const addToCart = (product: Product) => {
    const remainingStock = getRemainingStock(cart, product);
    if (remainingStock <= 0) return;

    setCart((prevCart) => addItemToCart(prevCart, product));
  };

  const removeFromCart = (productId: string) => {
    setCart((prevCart) => removeItemFromCart(prevCart, productId));
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

  return {
    cart,
    selectedCoupon,
    addToCart,
    removeFromCart,
    updateQuantity,
    calculateTotal,
    applyCoupon
  };
};
