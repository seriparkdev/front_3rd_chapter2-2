import { CartItem, Coupon } from '../../../types';

export const calculateItemTotal = (item: CartItem) => {
  return (
    item.product.price * item.quantity * (1 - getMaxApplicableDiscount(item))
  );
};

export const getMaxApplicableDiscount = (item: CartItem) => {
  const filteredDiscounts = item.product.discounts.filter(
    (discount) => discount.quantity <= item.quantity
  );

  const discount = filteredDiscounts.reduce(
    (max, discount) => Math.max(max, discount.rate),
    0
  );

  return discount;
};

export const calculateCartTotal = (
  cart: CartItem[],
  selectedCoupon: Coupon | null
) => {
  return {
    totalBeforeDiscount: 0,
    totalAfterDiscount: 0,
    totalDiscount: 0
  };
};

export const updateCartItemQuantity = (
  cart: CartItem[],
  productId: string,
  newQuantity: number
): CartItem[] => {
  return [];
};
