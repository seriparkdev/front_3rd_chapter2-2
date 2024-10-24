import { useState } from 'react';
import { Product } from '../../types';

const productInitialState: Omit<Product, 'id'> = {
  name: '',
  price: 0,
  stock: 0,
  discounts: []
};

export const useNewProduct = () => {
  const [newProduct, setNewProduct] =
    useState<Omit<Product, 'id'>>(productInitialState);

  const updateNewProduct = (product: Omit<Product, 'id'>) => {
    setNewProduct(product);
  };

  const initNewProduct = () => {
    setNewProduct(productInitialState);
  };

  return { newProduct, updateNewProduct, initNewProduct };
};
