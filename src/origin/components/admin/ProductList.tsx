import { useState } from 'react';
import { useProductStore } from '../../stores/useProductStore.ts';
import ProductEditForm from './ProductEditForm.tsx';
import { useEditingProductContext } from '../../contexts/EditingProductContext.tsx';
import ProductDetail from './ProductDetail.tsx';

export default function ProductList() {
  const [openProductIds, setOpenProductIds] = useState<Set<string>>(new Set());
  const { editingProduct } = useEditingProductContext();

  const { products } = useProductStore();

  const toggleProductAccordion = (productId: string) => {
    setOpenProductIds((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(productId)) {
        newSet.delete(productId);
      } else {
        newSet.add(productId);
      }
      return newSet;
    });
  };

  return (
    <div className="space-y-2">
      {products.map((product, index) => (
        <div
          key={product.id}
          data-testid={`product-${index + 1}`}
          className="bg-white p-4 rounded shadow"
        >
          <button
            data-testid="toggle-button"
            onClick={() => toggleProductAccordion(product.id)}
            className="w-full text-left font-semibold"
          >
            {product.name} - {product.price}원 (재고: {product.stock})
          </button>
          {openProductIds.has(product.id) && (
            <div className="mt-2">
              {editingProduct && editingProduct.id === product.id ? (
                <ProductEditForm product={product} />
              ) : (
                <ProductDetail product={product} />
              )}
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
