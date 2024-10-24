import { Dispatch, SetStateAction, useState } from 'react';
import { Discount, Product } from '../../types.ts';
import { useProductStore } from '../stores/useProductStore.ts';
import {
  addDiscountToProduct,
  findProductById,
  removeDiscountFromProduct
} from './utils/productUtils.ts';

interface Props {
  editingProduct: Product | null;
  setEditingProduct: Dispatch<SetStateAction<Product | null>>;
  updateProduct: (updatedProduct: Product) => void;
}

export const useDiscount = ({
  editingProduct,
  setEditingProduct,
  updateProduct
}: Props) => {
  const { products } = useProductStore();
  const [newDiscount, setNewDiscount] = useState<Discount>({
    quantity: 0,
    rate: 0
  });

  const handleAddDiscount = (productId: string) => {
    const updatedProduct = findProductById(products, productId);
    if (updatedProduct && editingProduct) {
      const newProduct = addDiscountToProduct(updatedProduct, newDiscount);
      updateProduct(newProduct);
      setEditingProduct(newProduct);
      setNewDiscount({ quantity: 0, rate: 0 });
    }
  };

  const handleRemoveDiscount = (productId: string, index: number) => {
    const updatedProduct = findProductById(products, productId);
    if (updatedProduct) {
      const newProduct = removeDiscountFromProduct(updatedProduct, index);
      updateProduct(newProduct);
      setEditingProduct(newProduct);
    }
  };

  return {
    newDiscount,
    setNewDiscount,
    handleAddDiscount,
    handleRemoveDiscount
  };
};
