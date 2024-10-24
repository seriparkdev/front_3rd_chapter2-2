import { useState } from 'react';
import { Product } from '../../types.ts';
import { useProductStore } from '../stores/useProductStore.ts';

export const useEditProduct = () => {
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);

  const { updateProduct } = useProductStore();

  // 새로운 핸들러 함수 추가
  const handleProductNameUpdate = (productId: string, newName: string) => {
    if (editingProduct && editingProduct.id === productId) {
      const updatedProduct = { ...editingProduct, name: newName };
      setEditingProduct(updatedProduct);
    }
  };

  // handleEditProduct 함수 수정
  const handleEditProduct = (product: Product) => {
    setEditingProduct({ ...product });
  };

  // 수정 완료 핸들러 함수 추가
  const handleEditComplete = () => {
    if (editingProduct) {
      updateProduct(editingProduct);
      setEditingProduct(null);
    }
  };

  return {
    editingProduct,
    setEditingProduct,
    handleProductNameUpdate,
    handleEditProduct,
    handleEditComplete
  };
};
