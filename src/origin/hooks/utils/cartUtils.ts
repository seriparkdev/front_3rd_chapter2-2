import { CartItem, Coupon, Product } from '../../../types.ts';

export const calculateItemTotal = (item: CartItem) => {
  return item.product.price * item.quantity * (1 - getApplicableDiscount(item));
};

export const getMaxDiscount = (
  discounts: { quantity: number; rate: number }[]
) => {
  return discounts.reduce((max, discount) => Math.max(max, discount.rate), 0);
};

export const getApplicableDiscount = (item: CartItem) => {
  const filteredDiscounts = item.product.discounts.filter(
    (discount) => discount.quantity <= item.quantity
  );

  const discount = getMaxDiscount(filteredDiscounts);

  return discount;
};

const calculateCouponDiscount = (selectedCoupon: Coupon, total: number) => {
  if (selectedCoupon.discountType === 'amount') {
    return total - selectedCoupon.discountValue;
  } else if (selectedCoupon.discountType === 'percentage') {
    return total - total * (selectedCoupon.discountValue / 100);
  } else {
    return 0;
  }
};

export const calculateCartTotal = (
  cart: CartItem[],
  selectedCoupon: Coupon | null
) => {
  const totalBeforeDiscount = cart.reduce(
    (price, item) => price + item.product.price * item.quantity,
    0
  );

  const appliedDiscountRateTotal = cart.reduce(
    (price, item) => price + calculateItemTotal(item),
    0
  );

  const totalAfterDiscount = selectedCoupon
    ? calculateCouponDiscount(selectedCoupon, appliedDiscountRateTotal)
    : appliedDiscountRateTotal;

  const totalDiscount = totalBeforeDiscount - totalAfterDiscount;

  return {
    totalBeforeDiscount,
    totalAfterDiscount,
    totalDiscount
  };
};

export const updateCartItemQuantity = (
  cart: CartItem[],
  productId: string,
  newQuantity: number
): CartItem[] => {
  if (newQuantity > 0) {
    return cart.map((item) =>
      item.product.id === productId
        ? {
            ...item,
            quantity:
              item.product.stock < newQuantity
                ? item.product.stock
                : newQuantity
          }
        : item
    );
  } else {
    return cart.filter((item) => item.product.id !== productId);
  }
};

export const getRemainingStock = (cart: CartItem[], product: Product) => {
  const cartItem = cart.find((item) => item.product.id === product.id);
  return product.stock - (cartItem?.quantity || 0);
};
