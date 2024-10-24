import { Discount, Product } from '../../../types.ts';

export const findProductById = (products: Product[], productId: string) => {
  return products.find((p) => p.id === productId);
};

export const addDiscountToProduct = (
  product: Product,
  newDiscount: Discount
): Product => {
  return {
    ...product,
    discounts: [...product.discounts, newDiscount]
  };
};

export const removeDiscountFromProduct = (
  product: Product,
  indexToRemove: number
): Product => {
  return {
    ...product,
    discounts: product.discounts.filter((_, i) => i !== indexToRemove)
  };
};
