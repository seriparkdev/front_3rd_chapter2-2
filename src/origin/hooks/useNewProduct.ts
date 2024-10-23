import { useState } from 'react';
import { Product } from '../../types';

const PRODUCT_INITIAL_STATE: Omit<Product, 'id'> = {
  name: '',
  price: 0,
  stock: 0,
  discounts: []
};

export const useNewProduct = () => {
  const [newProduct, setNewProduct] = useState<Omit<Product, 'id'>>(
    PRODUCT_INITIAL_STATE
  );

  const updateNewProduct = (product: Omit<Product, 'id'>) => {
    setNewProduct(product);
  };

  const initNewProduct = () => {
    setNewProduct(PRODUCT_INITIAL_STATE);
  };

  return { newProduct, updateNewProduct, initNewProduct };
};
