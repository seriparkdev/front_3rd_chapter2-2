import { Dispatch, SetStateAction, useState } from 'react';
import { Discount, Product } from '../../types.ts';
import { useProductStore } from '../stores/useProductStore.ts';

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
    const updatedProduct = products.find((p) => p.id === productId);
    if (updatedProduct && editingProduct) {
      const newProduct = {
        ...updatedProduct,
        discounts: [...updatedProduct.discounts, newDiscount]
      };
      updateProduct(newProduct);
      setEditingProduct(newProduct);
      setNewDiscount({ quantity: 0, rate: 0 });
    }
  };

  const handleRemoveDiscount = (productId: string, index: number) => {
    const updatedProduct = products.find((p) => p.id === productId);
    if (updatedProduct) {
      const newProduct = {
        ...updatedProduct,
        discounts: updatedProduct.discounts.filter((_, i) => i !== index)
      };
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
